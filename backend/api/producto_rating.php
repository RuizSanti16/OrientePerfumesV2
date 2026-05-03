<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
require_once '../configuracion/Conexion.php';

try {
    $b = json_decode(file_get_contents('php://input'), true);
    $id       = intval($b['id_producto'] ?? 0);
    $nombre   = trim($b['nombre_usuario'] ?? '');
    $estrellas= intval($b['estrellas'] ?? 0);
    $comentario = trim($b['comentario'] ?? '');

    if (!$id || !$nombre || $estrellas < 1 || $estrellas > 5) {
        echo json_encode(['ok'=>false,'mensaje'=>'Datos inválidos']); exit;
    }

    $s = $pdo->prepare("INSERT INTO tbl_producto_ratings (id_producto,nombre_usuario,estrellas,comentario) VALUES (:id,:n,:e,:c)");
    $s->execute([':id'=>$id,':n'=>$nombre,':e'=>$estrellas,':c'=>$comentario]);
    echo json_encode(['ok'=>true,'mensaje'=>'Calificación enviada','id'=>$pdo->lastInsertId()]);
} catch (PDOException $e) {
    echo json_encode(['ok'=>false,'mensaje'=>$e->getMessage()]);
}
require_once '../configuracion/CerrarConexion.php';
?>