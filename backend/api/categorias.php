<?php
/* =============================================================
   api/categorias.php — CRUD para tbl_categorias
   Columnas: id_categoria, nombre, descripcion
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
                $s = $pdo->prepare("SELECT * FROM tbl_categorias WHERE id_categoria = :id");
                $s->execute([':id' => $id]);
                echo json_encode(['ok' => true, 'data' => $s->fetch()]);
            } else {
                $s = $pdo->query("SELECT * FROM tbl_categorias ORDER BY nombre");
                echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            }
            break;

        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['nombre'])) { echo json_encode(['ok'=>false,'mensaje'=>'Nombre requerido']); exit; }
            $s = $pdo->prepare("INSERT INTO tbl_categorias (nombre, descripcion) VALUES (:nombre, :descripcion)");
            $s->execute([':nombre' => $b['nombre'], ':descripcion' => $b['descripcion'] ?? '']);
            echo json_encode(['ok' => true, 'mensaje' => 'Categoría creada', 'id' => $pdo->lastInsertId()]);
            break;

        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_categoria'])) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); exit; }
            $s = $pdo->prepare("UPDATE tbl_categorias SET nombre=:nombre, descripcion=:descripcion WHERE id_categoria=:id");
            $s->execute([':nombre' => $b['nombre'], ':descripcion' => $b['descripcion'] ?? '', ':id' => $b['id_categoria']]);
            echo json_encode(['ok' => true, 'mensaje' => 'Categoría actualizada']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); exit; }
            $pdo->prepare("DELETE FROM tbl_categorias WHERE id_categoria = :id")->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Categoría eliminada']);
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