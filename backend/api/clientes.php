<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
require_once '../configuracion/Conexion.php';
$method = $_SERVER['REQUEST_METHOD'];
try {
    switch ($method) {
        case 'GET':
            $s = $pdo->query("SELECT id_cliente, nombre, usuario, correo, telefono, edad, genero FROM tbl_clientes ORDER BY nombre ASC");
            echo json_encode(['ok'=>true,'data'=>$s->fetchAll()]);
            break;
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['nombre']) || empty($b['correo'])) { echo json_encode(['ok'=>false,'mensaje'=>'Nombre y correo requeridos']); break; }
            $hash = !empty($b['password']) ? password_hash($b['password'], PASSWORD_DEFAULT) : password_hash('cliente123', PASSWORD_DEFAULT);
            $s = $pdo->prepare("INSERT INTO tbl_clientes (nombre, usuario, correo, telefono, edad, genero, password) VALUES (:n,:u,:c,:t,:e,:g,:p)");
            $s->execute([':n'=>$b['nombre'],':u'=>$b['usuario']??$b['correo'],':c'=>$b['correo'],':t'=>$b['telefono']??'',':e'=>$b['edad']??null,':g'=>$b['genero']??'',':p'=>$hash]);
            echo json_encode(['ok'=>true,'id'=>$pdo->lastInsertId(),'mensaje'=>'Cliente creado']);
            break;
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_cliente'])) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $s = $pdo->prepare("UPDATE tbl_clientes SET nombre=:n, usuario=:u, correo=:c, telefono=:t, edad=:e, genero=:g WHERE id_cliente=:id");
            $s->execute([':n'=>$b['nombre'],':u'=>$b['usuario']??'',':c'=>$b['correo'],':t'=>$b['telefono']??'',':e'=>$b['edad']??null,':g'=>$b['genero']??'',':id'=>$b['id_cliente']]);
            echo json_encode(['ok'=>true,'mensaje'=>'Cliente actualizado']);
            break;
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $pdo->prepare("DELETE FROM tbl_clientes WHERE id_cliente=:id")->execute([':id'=>$id]);
            echo json_encode(['ok'=>true,'mensaje'=>'Cliente eliminado']);
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