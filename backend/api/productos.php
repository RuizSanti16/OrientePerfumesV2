<?php
/* =============================================================
   api/productos.php — CRUD para tbl_productos
   Columnas: id_producto, marca, nombre, precio,
             id_categoria, descripcion, imagen, presentaciones
============================================================= */
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

require_once '../configuracion/Conexion.php';

/* Tienda cerrada al publico: responde 503 a quien no traiga sesion
   de administrador. La comprobacion va aqui, en el servidor, porque
   un aviso puesto solo en React no impediria pedir los datos
   directamente a este endpoint. */
require_once __DIR__ . "/../configuracion/mantenimiento.php";
bloquearSiMantenimiento($pdo);

require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

/* GET es público (catálogo); escrituras requieren admin */
if ($method !== 'GET' && $method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

try {
    switch ($method) {

        case 'GET':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $s = $pdo->prepare("
                    SELECT p.*, c.nombre AS nombre_categoria
                    FROM tbl_productos p
                    LEFT JOIN tbl_categorias c ON p.id_categoria = c.id_categoria
                    WHERE p.id_producto = :id
                ");
                $s->execute([':id' => $id]);
                $row = $s->fetch();
                // Decode presentaciones JSON
                if ($row && $row['presentaciones']) {
                    $row['presentaciones'] = json_decode($row['presentaciones'], true) ?: [];
                } else if ($row) {
                    $row['presentaciones'] = [];
                }
                echo json_encode(['ok' => true, 'data' => $row]);
            } else {
                $s = $pdo->query("
                    SELECT p.*, c.nombre AS nombre_categoria
                    FROM tbl_productos p
                    LEFT JOIN tbl_categorias c ON p.id_categoria = c.id_categoria
                    ORDER BY p.id_producto DESC
                ");
                $rows = $s->fetchAll();
                // Decode presentaciones for each product
                foreach ($rows as &$row) {
                    if ($row['presentaciones']) {
                        $row['presentaciones'] = json_decode($row['presentaciones'], true) ?: [];
                    } else {
                        $row['presentaciones'] = [];
                    }
                }
                echo json_encode(['ok' => true, 'data' => $rows]);
            }
            break;

        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['nombre'])) { echo json_encode(['ok'=>false,'mensaje'=>'Nombre requerido']); exit; }

            // Encode presentaciones as JSON
            $presentaciones = '';
            if (!empty($b['presentaciones']) && is_array($b['presentaciones'])) {
                $presentaciones = json_encode($b['presentaciones']);
            }

            /* El producto y su registro de inventario se crean juntos.

               Antes solo se insertaba el producto, y nacia sin fila en
               tbl_inventario: no aparecia en la pantalla de Inventario,
               el aviso de stock bajo lo ignoraba, y al vender una unidad
               el descuento de stock no encontraba que actualizar, de
               modo que no fallaba pero tampoco hacia nada. Habia que
               crear el registro a mano por cada producto.

               Van en una transaccion para que no quede un producto sin
               inventario si algo falla a mitad. */
            $pdo->beginTransaction();

            $s = $pdo->prepare("
                INSERT INTO tbl_productos (nombre, marca, precio, id_categoria, descripcion, imagen, presentaciones)
                VALUES (:nombre, :marca, :precio, :id_categoria, :descripcion, :imagen, :presentaciones)
            ");
            $s->execute([
                ':nombre'         => $b['nombre']        ?? '',
                ':marca'          => $b['marca']         ?? '',
                ':precio'         => $b['precio']        ?? 0,
                ':id_categoria'   => $b['id_categoria']  ?? null,
                ':descripcion'    => $b['descripcion']   ?? '',
                ':imagen'         => $b['imagen']        ?? '',
                ':presentaciones' => $presentaciones
            ]);
            $idNuevo = $pdo->lastInsertId();

            /* Stock inicial: el que venga del formulario, o 0. Nace con
               existencias en cero, no invisible, que es la diferencia
               importante: cero se puede corregir desde Inventario, la
               ausencia de fila no se ve por ningun lado. */
            $stockInicial = isset($b['stock']) ? max(0, (int) $b['stock']) : 0;

            $pdo->prepare("
                INSERT INTO tbl_inventario (id_producto, stock, ubicacion)
                VALUES (:id, :stock, :ubicacion)
            ")->execute([
                ':id'        => $idNuevo,
                ':stock'     => $stockInicial,
                ':ubicacion' => $b['ubicacion'] ?? '',
            ]);

            $pdo->commit();

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Producto creado',
                'id'      => $idNuevo,
                'stock'   => $stockInicial,
            ]);
            break;

        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_producto'])) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); exit; }

            $presentaciones = '';
            if (!empty($b['presentaciones']) && is_array($b['presentaciones'])) {
                $presentaciones = json_encode($b['presentaciones']);
            }

            $s = $pdo->prepare("
                UPDATE tbl_productos SET
                    nombre         = :nombre,
                    marca          = :marca,
                    precio         = :precio,
                    id_categoria   = :id_categoria,
                    descripcion    = :descripcion,
                    imagen         = :imagen,
                    presentaciones = :presentaciones
                WHERE id_producto = :id
            ");
            $s->execute([
                ':nombre'         => $b['nombre']        ?? '',
                ':marca'          => $b['marca']         ?? '',
                ':precio'         => $b['precio']        ?? 0,
                ':id_categoria'   => $b['id_categoria']  ?? null,
                ':descripcion'    => $b['descripcion']   ?? '',
                ':imagen'         => $b['imagen']        ?? '',
                ':presentaciones' => $presentaciones,
                ':id'             => $b['id_producto']
            ]);
            echo json_encode(['ok' => true, 'mensaje' => 'Producto actualizado']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); exit; }
            $pdo->prepare("DELETE FROM tbl_productos WHERE id_producto = :id")->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Producto eliminado']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    }
} catch (PDOException $e) {
    /* Sin este rollBack, un fallo entre el alta del producto y la de su
       inventario dejaria la transaccion abierta. */
    if ($pdo->inTransaction()) $pdo->rollBack();

    /* El mensaje de PDO se enviaba tal cual al cliente, y lleva el
       nombre de la base y de las tablas: cualquiera que provocara un
       error los leia. Ya se vio en produccion, con un
       "Table 'uXXXXXXXX_orientperfums.tbl_productos' doesn't exist"
       visible desde el navegador. Ahora el detalle va al log y solo se
       muestra con APP_DEBUG activado. */
    error_log('[OrientPerfumes] Error en productos: ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok'      => false,
        'mensaje' => envOr('APP_DEBUG', '0') === '1'
            ? $e->getMessage()
            : 'No se pudo completar la operacion.',
    ]);
}
require_once '../configuracion/CerrarConexion.php';
?>