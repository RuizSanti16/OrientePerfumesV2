<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET' && $method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

try {
    switch ($method) {
        case 'GET':
            $s = $pdo->query("SELECT * FROM tbl_marcas ORDER BY nombre ASC");
            echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            break;
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['nombre'])) { echo json_encode(['ok'=>false,'mensaje'=>'Nombre requerido']); break; }
            $s = $pdo->prepare("INSERT INTO tbl_marcas (nombre, descripcion, pais_origen) VALUES (:n,:d,:p)");
            $s->execute([':n'=>$b['nombre'],':d'=>$b['descripcion']??'',':p'=>$b['pais_origen']??'']);
            echo json_encode(['ok'=>true,'id'=>$pdo->lastInsertId(),'mensaje'=>'Marca creada']);
            break;
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_marca'])) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $s = $pdo->prepare("UPDATE tbl_marcas SET nombre=:n, descripcion=:d, pais_origen=:p WHERE id_marca=:id");
            $s->execute([':n'=>$b['nombre'],':d'=>$b['descripcion']??'',':p'=>$b['pais_origen']??'',':id'=>$b['id_marca']]);
            echo json_encode(['ok'=>true,'mensaje'=>'Marca actualizada']);
            break;
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $pdo->prepare("DELETE FROM tbl_marcas WHERE id_marca=:id")->execute([':id'=>$id]);
            echo json_encode(['ok'=>true,'mensaje'=>'Marca eliminada']);
            break;
        default:
            http_response_code(405);
            echo json_encode(['ok'=>false,'mensaje'=>'Método no permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'mensaje'=>$e->getMessage()]);
}
require_once '../configuracion/CerrarConexion.php';
?>