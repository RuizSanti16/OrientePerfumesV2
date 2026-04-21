<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
require_once '../configuracion/Conexion.php';
$method = $_SERVER['REQUEST_METHOD'];
try {
    switch ($method) {
        case 'GET':
            $s = $pdo->query("SELECT * FROM tbl_proovedores ORDER BY nombre ASC");
            echo json_encode(['ok'=>true,'data'=>$s->fetchAll()]);
            break;
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['nombre'])) { echo json_encode(['ok'=>false,'mensaje'=>'Nombre requerido']); break; }
            $s = $pdo->prepare("INSERT INTO tbl_proovedores (nombre, contacto, correo, telefono) VALUES (:n,:c,:e,:t)");
            $s->execute([':n'=>$b['nombre'],':c'=>$b['contacto']??'',':e'=>$b['correo']??'',':t'=>$b['telefono']??'']);
            echo json_encode(['ok'=>true,'id'=>$pdo->lastInsertId(),'mensaje'=>'Proveedor creado']);
            break;
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_proovedor'])) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $s = $pdo->prepare("UPDATE tbl_proovedores SET nombre=:n, contacto=:c, correo=:e, telefono=:t WHERE id_proovedor=:id");
            $s->execute([':n'=>$b['nombre'],':c'=>$b['contacto']??'',':e'=>$b['correo']??'',':t'=>$b['telefono']??'',':id'=>$b['id_proovedor']]);
            echo json_encode(['ok'=>true,'mensaje'=>'Proveedor actualizado']);
            break;
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $pdo->prepare("DELETE FROM tbl_proovedores WHERE id_proovedor=:id")->execute([':id'=>$id]);
            echo json_encode(['ok'=>true,'mensaje'=>'Proveedor eliminado']);
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