<?php
/* =============================================================
   api/productos.php — CRUD para tbl_productos

   Columnas reales:
     id_producto (PK), id_inventario (FK), marca, nombre, precio
============================================================= */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once '../configuracion/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        /* ── LISTAR todos los productos ─────────────────── */
        case 'GET':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM tbl_productos WHERE id_producto = :id");
                $stmt->execute([':id' => $id]);
                $producto = $stmt->fetch();
                echo json_encode(['ok' => true, 'data' => $producto]);
            } else {
                $stmt = $pdo->query("SELECT * FROM tbl_productos ORDER BY id_producto DESC");
                echo json_encode(['ok' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        /* ── CREAR producto ─────────────────────────────── */
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['nombre'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'El nombre es requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO tbl_productos (nombre, marca, precio, id_inventario)
                VALUES (:nombre, :marca, :precio, :id_inventario)
            ");
            $stmt->execute([
                ':nombre'       => $b['nombre']       ?? '',
                ':marca'        => $b['marca']        ?? '',
                ':precio'       => $b['precio']       ?? 0,
                ':id_inventario'=> $b['id_inventario']?? null
            ]);

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Producto creado exitosamente',
                'id'      => $pdo->lastInsertId()
            ]);
            break;

        /* ── ACTUALIZAR producto ────────────────────────── */
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id_producto'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE tbl_productos SET
                    nombre        = :nombre,
                    marca         = :marca,
                    precio        = :precio,
                    id_inventario = :id_inventario
                WHERE id_producto = :id
            ");
            $stmt->execute([
                ':nombre'        => $b['nombre']        ?? '',
                ':marca'         => $b['marca']         ?? '',
                ':precio'        => $b['precio']        ?? 0,
                ':id_inventario' => $b['id_inventario'] ?? null,
                ':id'            => $b['id_producto']
            ]);

            echo json_encode(['ok' => true, 'mensaje' => 'Producto actualizado']);
            break;

        /* ── ELIMINAR producto ──────────────────────────── */
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM tbl_productos WHERE id_producto = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Producto eliminado']);
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