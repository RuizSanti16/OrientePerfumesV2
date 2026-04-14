<?php
/* =============================================================
   api/inventario.php — CRUD para tbl_inventario

   Columnas reales:
     id_inventario (PK), id_producto (FK), stock, ubicacion
============================================================= */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once '../configuracion/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        /* ── LISTAR inventario con nombre del producto ───── */
        case 'GET':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("
                    SELECT i.*, p.nombre AS nombre_producto, p.marca, p.precio
                    FROM tbl_inventario i
                    LEFT JOIN tbl_productos p ON i.id_producto = p.id_producto
                    WHERE i.id_inventario = :id
                ");
                $stmt->execute([':id' => $id]);
                echo json_encode(['ok' => true, 'data' => $stmt->fetch()]);
            } else {
                $stmt = $pdo->query("
                    SELECT i.*, p.nombre AS nombre_producto, p.marca, p.precio
                    FROM tbl_inventario i
                    LEFT JOIN tbl_productos p ON i.id_producto = p.id_producto
                    ORDER BY i.id_inventario DESC
                ");
                echo json_encode(['ok' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        /* ── CREAR registro de inventario ───────────────── */
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id_producto'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'id_producto es requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO tbl_inventario (id_producto, stock, ubicacion)
                VALUES (:id_producto, :stock, :ubicacion)
            ");
            $stmt->execute([
                ':id_producto' => $b['id_producto'] ?? null,
                ':stock'       => $b['stock']       ?? 0,
                ':ubicacion'   => $b['ubicacion']   ?? ''
            ]);

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Registro de inventario creado',
                'id'      => $pdo->lastInsertId()
            ]);
            break;

        /* ── ACTUALIZAR stock y ubicación ───────────────── */
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id_inventario'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE tbl_inventario SET
                    stock     = :stock,
                    ubicacion = :ubicacion
                WHERE id_inventario = :id
            ");
            $stmt->execute([
                ':stock'     => $b['stock']     ?? 0,
                ':ubicacion' => $b['ubicacion'] ?? '',
                ':id'        => $b['id_inventario']
            ]);

            echo json_encode(['ok' => true, 'mensaje' => 'Inventario actualizado']);
            break;

        /* ── ELIMINAR ───────────────────────────────────── */
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM tbl_inventario WHERE id_inventario = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Registro eliminado']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>