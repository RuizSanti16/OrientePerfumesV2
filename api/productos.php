<?php
/* =============================================================
    api/productos.php — CRUD para tbl_productos

    Columnas: id_producto, marca, nombre, precio,
            id_categoria (FK), descripcion
============================================================= */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once '../configuracion/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

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
                echo json_encode(['ok' => true, 'data' => $s->fetch()]);
            } else {
                $s = $pdo->query("
                    SELECT p.*, c.nombre AS nombre_categoria
                    FROM tbl_productos p
                    LEFT JOIN tbl_categorias c ON p.id_categoria = c.id_categoria
                    ORDER BY p.id_producto DESC
                ");
                echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            }
            break;

        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['nombre'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'Nombre requerido']);
                exit;
            }
            $s = $pdo->prepare("
                INSERT INTO tbl_productos (nombre, marca, precio, id_categoria, descripcion)
                VALUES (:nombre, :marca, :precio, :id_categoria, :descripcion)
            ");
            $s->execute([
                ':nombre'       => $b['nombre']       ?? '',
                ':marca'        => $b['marca']        ?? '',
                ':precio'       => $b['precio']       ?? 0,
                ':id_categoria' => $b['id_categoria'] ?? null,
                ':descripcion'  => $b['descripcion']  ?? ''
            ]);
            echo json_encode(['ok' => true, 'mensaje' => 'Producto creado', 'id' => $pdo->lastInsertId()]);
            break;

        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_producto'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $s = $pdo->prepare("
                UPDATE tbl_productos SET
                    nombre       = :nombre,
                    marca        = :marca,
                    precio       = :precio,
                    id_categoria = :id_categoria,
                    descripcion  = :descripcion
                WHERE id_producto = :id
            ");
            $s->execute([
                ':nombre'       => $b['nombre']       ?? '',
                ':marca'        => $b['marca']        ?? '',
                ':precio'       => $b['precio']       ?? 0,
                ':id_categoria' => $b['id_categoria'] ?? null,
                ':descripcion'  => $b['descripcion']  ?? '',
                ':id'           => $b['id_producto']
            ]);
            echo json_encode(['ok' => true, 'mensaje' => 'Producto actualizado']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $pdo->prepare("DELETE FROM tbl_productos WHERE id_producto = :id")->execute([':id' => $id]);
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
