<?php
/* =============================================================
   api/notificaciones.php — Conteos en tiempo real para el admin
   GET /api/notificaciones.php
   Requiere token admin.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

verificarTokenAdmin($pdo);

try {

    /* Pedidos pendientes */
    $pedidosPend = 0;
    try {
        $s = $pdo->query("SELECT COUNT(*) FROM tbl_pedidos WHERE estado = 'pendiente'");
        $pedidosPend = (int)$s->fetchColumn();
    } catch (PDOException $e) {}

    /* Comentarios / noticias pendientes */
    $comentariosPend = 0;
    try {
        $s = $pdo->query("SELECT COUNT(*) FROM tbl_noticias WHERE estado = 'pendiente'");
        $comentariosPend = (int)$s->fetchColumn();
    } catch (PDOException $e) {}

    /* Stock bajo (≤5 unidades) */
    $stockBajo = 0;
    try {
        /* La columna es `stock`, no stock_actual. Con el nombre erróneo la
           consulta fallaba y el catch dejaba el contador en 0: la campana
           de notificaciones nunca avisaba de existencias bajas. */
        $s = $pdo->query("SELECT COUNT(*) FROM tbl_inventario WHERE COALESCE(stock, 0) <= 5");
        $stockBajo = (int)$s->fetchColumn();
    } catch (PDOException $e) {
        error_log('[OrientPerfumes] Stock bajo en notificaciones: ' . $e->getMessage());
    }

    $total = $pedidosPend + $comentariosPend + $stockBajo;

    echo json_encode([
        'ok'   => true,
        'data' => [
            'pedidos_pendientes'     => $pedidosPend,
            'comentarios_pendientes' => $comentariosPend,
            'stock_bajo'             => $stockBajo,
            'total'                  => $total,
        ],
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>
