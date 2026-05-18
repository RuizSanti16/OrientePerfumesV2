<?php
/* =============================================================
   api/compras.php — CRUD para tbl_compras

   Columnas reales:
     id_compra (PK), fecha, id_proovedor (FK), total
============================================================= */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

try {
    switch ($method) {

        /* ── LISTAR compras con nombre del proveedor ────── */
        case 'GET':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("
                    SELECT c.*, p.nombre AS nombre_proveedor, p.correo, p.telefono
                    FROM tbl_compras c
                    LEFT JOIN tbl_proovedores p ON c.id_proovedor = p.id_proovedor
                    WHERE c.id_compra = :id
                ");
                $stmt->execute([':id' => $id]);
                echo json_encode(['ok' => true, 'data' => $stmt->fetch()]);
            } else {
                $stmt = $pdo->query("
                    SELECT c.*, p.nombre AS nombre_proveedor
                    FROM tbl_compras c
                    LEFT JOIN tbl_proovedores p ON c.id_proovedor = p.id_proovedor
                    ORDER BY c.id_compra DESC
                ");
                echo json_encode(['ok' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        /* ── CREAR compra ───────────────────────────────── */
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id_proovedor'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'id_proovedor es requerido']);
                exit;
            }
            if (empty($b['total'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'total es requerido']);
                exit;
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
                INSERT INTO tbl_compras (id_proovedor, total, fecha)
                VALUES (:id_proovedor, :total, CURDATE())
            ");
            $stmt->execute([
                ':id_proovedor' => $b['id_proovedor'],
                ':total'        => $b['total']
            ]);
            $idCompra = $pdo->lastInsertId();

            // Insertar detalle si viene (actualiza stock del inventario)
            if (!empty($b['detalle']) && is_array($b['detalle'])) {
                try {
                    $stmtDet = $pdo->prepare("
                        INSERT INTO tbl_detalle_compra (id_compra, id_producto, cantidad, precio_unitario)
                        VALUES (:id_compra, :id_producto, :cantidad, :precio)
                    ");
                    foreach ($b['detalle'] as $linea) {
                        $stmtDet->execute([
                            ':id_compra'   => $idCompra,
                            ':id_producto' => $linea['id_producto']     ?? null,
                            ':cantidad'    => $linea['cantidad']        ?? 1,
                            ':precio'      => $linea['precio_unitario'] ?? 0
                        ]);

                        // Sumar stock al inventario
                        $pdo->prepare("
                            UPDATE tbl_inventario
                            SET stock = stock + :cant
                            WHERE id_producto = :id_prod
                        ")->execute([
                            ':cant'    => $linea['cantidad']    ?? 1,
                            ':id_prod' => $linea['id_producto'] ?? null
                        ]);
                    }
                } catch (PDOException $ignored) {
                    // Si tbl_detalle_compra aún no tiene esas columnas, continuar
                }
            }

            $pdo->commit();
            echo json_encode(['ok' => true, 'mensaje' => 'Compra registrada', 'id' => $idCompra]);
            break;

        /* ── ELIMINAR compra ────────────────────────────── */
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM tbl_detalle_compra WHERE id_compra = :id")->execute([':id' => $id]);
            $pdo->prepare("DELETE FROM tbl_compras WHERE id_compra = :id")->execute([':id' => $id]);
            $pdo->commit();
            echo json_encode(['ok' => true, 'mensaje' => 'Compra eliminada']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>