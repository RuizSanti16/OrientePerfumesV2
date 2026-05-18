<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

/* Auto-migración: garantizar que id_inventario sea AUTO_INCREMENT */
try {
    $col = $pdo->query("SHOW COLUMNS FROM tbl_inventario LIKE 'id_inventario'")->fetch(PDO::FETCH_ASSOC);
    if ($col && stripos($col['Extra'] ?? '', 'auto_increment') === false) {
        // Eliminar filas con id 0 que bloquean el ALTER
        $pdo->exec("DELETE FROM tbl_inventario WHERE id_inventario = 0");
        $pdo->exec("ALTER TABLE tbl_inventario MODIFY COLUMN id_inventario INT NOT NULL AUTO_INCREMENT");
    }
} catch (PDOException $e) { /* continuar aunque falle */ }

try {
    switch ($method) {
        case 'GET':
            $s = $pdo->query("
                SELECT i.*, p.nombre AS nombre_producto, p.imagen, p.marca
                FROM tbl_inventario i
                JOIN tbl_productos p ON i.id_producto = p.id_producto
                ORDER BY p.nombre ASC
            ");
            echo json_encode(['ok'=>true,'data'=>$s->fetchAll()]);
            break;
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_producto'])) { echo json_encode(['ok'=>false,'mensaje'=>'Producto requerido']); break; }
            /* Verificar si ya existe inventario para este producto */
            $check = $pdo->prepare("SELECT id_inventario FROM tbl_inventario WHERE id_producto=:id");
            $check->execute([':id'=>$b['id_producto']]);
            if ($check->fetch()) {
                /* Actualizar */
                $s = $pdo->prepare("UPDATE tbl_inventario SET stock=:s, ubicacion=:u WHERE id_producto=:id");
                $s->execute([':s'=>$b['stock']??0,':u'=>$b['ubicacion']??'',':id'=>$b['id_producto']]);
                echo json_encode(['ok'=>true,'mensaje'=>'Inventario actualizado']);
            } else {
                /* Crear */
                $s = $pdo->prepare("INSERT INTO tbl_inventario (id_producto, stock, ubicacion) VALUES (:id,:s,:u)");
                $s->execute([':id'=>$b['id_producto'],':s'=>$b['stock']??0,':u'=>$b['ubicacion']??'']);
                echo json_encode(['ok'=>true,'id'=>$pdo->lastInsertId(),'mensaje'=>'Inventario creado']);
            }
            break;
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_inventario'])) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $s = $pdo->prepare("UPDATE tbl_inventario SET stock=:s, ubicacion=:u WHERE id_inventario=:id");
            $s->execute([':s'=>$b['stock']??0,':u'=>$b['ubicacion']??'',':id'=>$b['id_inventario']]);
            echo json_encode(['ok'=>true,'mensaje'=>'Inventario actualizado']);
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