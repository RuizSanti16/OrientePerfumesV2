<?php
/* =============================================================
   api/pago_estado.php — consulta el estado del pago de un pedido.

   Lo usa la pantalla de retorno: el cliente vuelve de Bold y hay que
   decirle como fue. Devuelve solo el estado, nunca datos del cobro ni
   del comprador, porque el codigo de seguimiento no es un secreto.

   POR QUE PUEDE DECIR "CONFIRMANDO"
   El aviso de Bold puede tardar hasta 10 minutos, asi que es normal
   que el cliente vuelva antes de que sepamos con certeza si pago. En
   ese caso se responde 'iniciado' y la pantalla avisa de que se esta
   confirmando, en lugar de afirmar algo que todavia no consta.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once __DIR__ . '/../configuracion/Conexion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

$codigo = strtoupper(trim((string) ($_GET['codigo'] ?? '')));

if ($codigo === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Falta el código del pedido.']);
    exit;
}

try {
    $s = $pdo->prepare("
        SELECT codigo_seguimiento, estado_pago, estado, total, fecha_pago
          FROM tbl_pedidos
         WHERE codigo_seguimiento = :c
         LIMIT 1
    ");
    $s->execute([':c' => $codigo]);
    $p = $s->fetch();

    if (!$p) {
        echo json_encode(['ok' => false, 'mensaje' => 'No encontramos ese pedido.']);
        exit;
    }

    /* Mensajes pensados para el cliente, no para el programador. */
    $mensajes = [
        'pendiente' => 'Tu pedido está registrado y aún no se ha iniciado el pago.',
        'iniciado'  => 'Estamos confirmando tu pago. Puede tardar unos minutos.',
        'aprobado'  => 'Tu pago fue confirmado. ¡Gracias por tu compra!',
        'rechazado' => 'El pago fue rechazado. Puedes intentarlo de nuevo con otro medio.',
        'anulado'   => 'El pago fue anulado.',
        'error'     => 'Hubo un problema con el pago. Escríbenos y lo revisamos.',
        'no_aplica' => 'Este pedido no se paga en línea.',
    ];

    $estadoPago = (string) $p['estado_pago'];

    echo json_encode([
        'ok'          => true,
        'codigo'      => $p['codigo_seguimiento'],
        'estado_pago' => $estadoPago,
        'estado_envio'=> $p['estado'],
        'total'       => (int) round((float) $p['total']),
        'fecha_pago'  => $p['fecha_pago'],
        'mensaje'     => $mensajes[$estadoPago] ?? $mensajes['error'],
        /* La pantalla usa esto para decidir si seguir consultando. */
        'definitivo'  => in_array($estadoPago, ['aprobado', 'rechazado', 'anulado'], true),
    ]);

} catch (PDOException $e) {
    responderErrorServidor($e, basename(__FILE__));
}
