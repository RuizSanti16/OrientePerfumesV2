<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once '../configuracion/Conexion.php';

/* Tienda cerrada al publico: responde 503 a quien no traiga sesion
   de administrador. La comprobacion va aqui, en el servidor, porque
   un aviso puesto solo en React no impediria pedir los datos
   directamente a este endpoint. */
require_once __DIR__ . "/../configuracion/mantenimiento.php";
bloquearSiMantenimiento($pdo);


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