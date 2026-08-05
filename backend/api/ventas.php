<?php
/* =============================================================
   api/ventas.php — CRUD para tbl_ventas

   Columnas tbl_ventas:
     id_venta (PK), fecha, id_cliente (FK), total

   Columnas tbl_detalle_venta: (pendiente confirmar)
     se asume: id_detalle_venta, id_venta, id_producto, cantidad, precio_unitario
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

try {
    switch ($method) {

        /* ── LISTAR ventas ──────────────────────────────── */
        case 'GET':
            $id = $_GET['id'] ?? null;
            if ($id) {
                // Una venta específica con datos del cliente
                $stmt = $pdo->prepare("
                    SELECT v.*, c.nombre AS nombre_cliente, c.correo
                    FROM tbl_ventas v
                    LEFT JOIN tbl_clientes c ON v.id_cliente = c.id_cliente
                    WHERE v.id_venta = :id
                ");
                $stmt->execute([':id' => $id]);
                $venta = $stmt->fetch();

                // Detalle de la venta
                try {
                    $det = $pdo->prepare("
                        SELECT d.*, p.nombre, p.marca
                        FROM tbl_detalle_venta d
                        LEFT JOIN tbl_productos p ON d.id_producto = p.id_producto
                        WHERE d.id_venta = :id
                    ");
                    $det->execute([':id' => $id]);
                    $venta['detalle'] = $det->fetchAll();
                } catch (PDOException $e) {
                    $venta['detalle'] = [];
                }

                echo json_encode(['ok' => true, 'data' => $venta]);
            } else {
                // Todas las ventas con nombre del cliente
                $stmt = $pdo->query("
                    SELECT v.*, c.nombre AS nombre_cliente
                    FROM tbl_ventas v
                    LEFT JOIN tbl_clientes c ON v.id_cliente = c.id_cliente
                    ORDER BY v.id_venta DESC
                ");
                echo json_encode(['ok' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        /* ── CREAR venta ────────────────────────────────── */
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id_cliente'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'id_cliente es requerido']);
                exit;
            }
            if (empty($b['total'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'total es requerido']);
                exit;
            }

            $pdo->beginTransaction();

            // Insertar venta
            $stmt = $pdo->prepare("
                INSERT INTO tbl_ventas (id_cliente, total, fecha)
                VALUES (:id_cliente, :total, CURDATE())
            ");
            $stmt->execute([
                ':id_cliente' => $b['id_cliente'],
                ':total'      => $b['total']
            ]);
            $idVenta = $pdo->lastInsertId();

            // Insertar en tbl_ventas_clientes (tabla relacional)
            $stmtVC = $pdo->prepare("
                INSERT INTO tbl_ventas_clientes (id_venta, id_cliente, total, fecha)
                VALUES (:id_venta, :id_cliente, :total, CURDATE())
            ");
            $stmtVC->execute([
                ':id_venta'   => $idVenta,
                ':id_cliente' => $b['id_cliente'],
                ':total'      => $b['total']
            ]);

            // Insertar detalle si viene
            if (!empty($b['detalle']) && is_array($b['detalle'])) {
                /* La columna se llama `precio`, no `precio_unitario`. El
                   nombre equivocado hacía fallar el INSERT siempre, y el
                   catch que lo envolvía se tragaba el error: la venta se
                   confirmaba sin líneas y sin descontar stock. Sin catch,
                   el error sube al manejador de abajo, que deshace la
                   transacción y avisa. */
                $stmtDet = $pdo->prepare("
                    INSERT INTO tbl_detalle_venta (id_venta, id_producto, cantidad, precio)
                    VALUES (:id_venta, :id_producto, :cantidad, :precio)
                ");
                $stmtStock = $pdo->prepare("
                    UPDATE tbl_inventario
                    SET stock = stock - :cant
                    WHERE id_producto = :id_prod
                ");
                foreach ($b['detalle'] as $linea) {
                    $stmtDet->execute([
                        ':id_venta'    => $idVenta,
                        ':id_producto' => $linea['id_producto']     ?? null,
                        ':cantidad'    => $linea['cantidad']        ?? 1,
                        ':precio'      => $linea['precio_unitario'] ?? 0
                    ]);

                    // Descontar stock del inventario
                    $stmtStock->execute([
                        ':cant'    => $linea['cantidad']    ?? 1,
                        ':id_prod' => $linea['id_producto'] ?? null
                    ]);
                }
            }

            $pdo->commit();
            echo json_encode(['ok' => true, 'mensaje' => 'Venta registrada', 'id' => $idVenta]);
            break;

        /* ── ELIMINAR venta ─────────────────────────────── */
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $pdo->beginTransaction();
            // Eliminar de tabla relacional primero
            $pdo->prepare("DELETE FROM tbl_ventas_clientes WHERE id_venta = :id")->execute([':id' => $id]);
            // Eliminar venta
            $pdo->prepare("DELETE FROM tbl_ventas WHERE id_venta = :id")->execute([':id' => $id]);
            $pdo->commit();
            echo json_encode(['ok' => true, 'mensaje' => 'Venta eliminada']);
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