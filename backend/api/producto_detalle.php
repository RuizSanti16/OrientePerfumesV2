<?php
/* =============================================================
   api/producto_detalle.php
   GET  ?id=X  → info completa del producto
   POST → guardar detalle completo (admin)
============================================================= */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET' && $method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

/* Auto-migración: añadir id_referencia si no existe */
try {
    $pdo->query("SELECT id_referencia FROM tbl_producto_dupes LIMIT 1");
} catch (PDOException $e) {
    $pdo->exec("ALTER TABLE tbl_producto_dupes ADD COLUMN id_referencia INT NULL DEFAULT NULL");
}

try {
    switch ($method) {

        case 'GET':
            $id = intval($_GET['id'] ?? 0);
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }

            /* Producto base */
            $s = $pdo->prepare("
                SELECT p.*, c.nombre AS nombre_categoria
                FROM tbl_productos p
                LEFT JOIN tbl_categorias c ON p.id_categoria = c.id_categoria
                WHERE p.id_producto = :id
            ");
            $s->execute([':id' => $id]);
            $producto = $s->fetch();
            if (!$producto) { echo json_encode(['ok'=>false,'mensaje'=>'Producto no encontrado']); break; }

            /* Presentaciones */
            $producto['presentaciones'] = $producto['presentaciones']
                ? json_decode($producto['presentaciones'], true) ?: []
                : [];

            /* Imágenes adicionales */
            $s = $pdo->prepare("SELECT * FROM tbl_producto_imagenes WHERE id_producto=:id ORDER BY orden ASC");
            $s->execute([':id' => $id]);
            $producto['imagenes'] = $s->fetchAll();

            /* Notas */
            $s = $pdo->prepare("SELECT * FROM tbl_producto_notas WHERE id_producto=:id ORDER BY tipo, id ASC");
            $s->execute([':id' => $id]);
            $notas = $s->fetchAll();
            $producto['notas'] = [
                'salida'   => array_values(array_filter($notas, fn($n) => $n['tipo']==='salida')),
                'corazon'  => array_values(array_filter($notas, fn($n) => $n['tipo']==='corazon')),
                'fondo'    => array_values(array_filter($notas, fn($n) => $n['tipo']==='fondo')),
            ];

            /* Dupes — incluye ref_id: id_referencia explícita o búsqueda automática por nombre */
            $s = $pdo->prepare("
                SELECT d.*,
                       COALESCE(
                           d.id_referencia,
                           (SELECT p2.id_producto FROM tbl_productos p2
                            WHERE LOWER(TRIM(p2.nombre)) = LOWER(TRIM(d.nombre))
                            LIMIT 1)
                       ) AS ref_id
                FROM tbl_producto_dupes d
                WHERE d.id_producto = :id
                ORDER BY d.id ASC
            ");
            $s->execute([':id' => $id]);
            $producto['dupes'] = $s->fetchAll();

            /* Ratings */
            $s = $pdo->prepare("SELECT * FROM tbl_producto_ratings WHERE id_producto=:id ORDER BY fecha DESC");
            $s->execute([':id' => $id]);
            $ratings = $s->fetchAll();
            $producto['ratings'] = $ratings;
            $producto['rating_promedio'] = count($ratings)
                ? round(array_sum(array_column($ratings,'estrellas')) / count($ratings), 1)
                : 0;

            /* Stock actual (público: solo el número, sin info sensible) */
            try {
                $s = $pdo->prepare("
                    SELECT stock_actual FROM tbl_inventario
                    WHERE id_producto = :id
                    LIMIT 1
                ");
                $s->execute([':id' => $id]);
                $inv = $s->fetch();
                $producto['stock_actual'] = $inv ? (int)$inv['stock_actual'] : null;
            } catch (PDOException $e) {
                $producto['stock_actual'] = null;
            }

            echo json_encode(['ok'=>true,'data'=>$producto]);
            break;

        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            $id = intval($b['id_producto'] ?? 0);
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }

            $pdo->beginTransaction();

            /* Actualizar descripción del producto base */
            if (isset($b['descripcion'])) {
                $pdo->prepare("UPDATE tbl_productos SET descripcion=:d WHERE id_producto=:id")
                    ->execute([':d'=>$b['descripcion'],':id'=>$id]);
            }

            /* Imágenes adicionales */
            if (isset($b['imagenes'])) {
                $pdo->prepare("DELETE FROM tbl_producto_imagenes WHERE id_producto=:id")->execute([':id'=>$id]);
                $si = $pdo->prepare("INSERT INTO tbl_producto_imagenes (id_producto,imagen,orden) VALUES (:id,:img,:orden)");
                foreach ($b['imagenes'] as $orden => $img) {
                    if ($img) $si->execute([':id'=>$id,':img'=>$img,':orden'=>$orden]);
                }
            }

            /* Notas */
            if (isset($b['notas'])) {
                $pdo->prepare("DELETE FROM tbl_producto_notas WHERE id_producto=:id")->execute([':id'=>$id]);
                $sn = $pdo->prepare("INSERT INTO tbl_producto_notas (id_producto,tipo,nota) VALUES (:id,:tipo,:nota)");
                foreach (['salida','corazon','fondo'] as $tipo) {
                    foreach (($b['notas'][$tipo] ?? []) as $nota) {
                        if (trim($nota)) $sn->execute([':id'=>$id,':tipo'=>$tipo,':nota'=>trim($nota)]);
                    }
                }
            }

            /* Dupes */
            if (isset($b['dupes'])) {
                $pdo->prepare("DELETE FROM tbl_producto_dupes WHERE id_producto=:id")->execute([':id'=>$id]);
                $sd = $pdo->prepare("INSERT INTO tbl_producto_dupes (id_producto,nombre,marca,imagen,id_referencia) VALUES (:id,:n,:m,:img,:ref)");
                foreach ($b['dupes'] as $dupe) {
                    if (!empty($dupe['nombre'])) {
                        $ref = !empty($dupe['id_referencia']) ? intval($dupe['id_referencia']) : null;
                        $sd->execute([':id'=>$id,':n'=>$dupe['nombre'],':m'=>$dupe['marca']??'',':img'=>$dupe['imagen']??'',':ref'=>$ref]);
                    }
                }
            }

            $pdo->commit();
            echo json_encode(['ok'=>true,'mensaje'=>'Detalle guardado correctamente']);
            break;

        case 'DELETE':
            /* Eliminar rating */
            $id = intval($_GET['rating_id'] ?? 0);
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $pdo->prepare("DELETE FROM tbl_producto_ratings WHERE id=:id")->execute([':id'=>$id]);
            echo json_encode(['ok'=>true,'mensaje'=>'Calificación eliminada']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok'=>false,'mensaje'=>'Método no permitido']);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok'=>false,'mensaje'=>$e->getMessage()]);
}
require_once '../configuracion/CerrarConexion.php';
?>