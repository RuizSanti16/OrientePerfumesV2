<?php
/* =============================================================
   api/pago_webhook.php — recibe los avisos de pago de Bold.

   Esta URL es publica: cualquiera puede enviarle un JSON diciendo que
   un pedido esta pagado. Lo unico que distingue un aviso real de uno
   falso es la firma, asi que se verifica ANTES de mirar el contenido.

   REGLAS QUE IMPONE BOLD Y POR QUE SE NOTAN EN EL CODIGO

   - Hay que responder 200 en menos de 2 segundos. Por eso no se envian
     correos ni se hace nada lento aqui: solo se registra y se
     actualiza el pedido.

   - Bold reintenta hasta 5 veces (15 min, 1 h, 4 h, 8 h y 24 h) hasta
     recibir un 200, y puede mandar el mismo evento varias veces. De
     ahi que el id de transaccion sea clave unica en tbl_pagos: si ya
     esta registrado, se responde 200 y no se toca nada. Sin eso, un
     reintento aplicaria el mismo pago dos veces.

   - Un aviso con la firma mal NO se responde con 200: se responde 401.
     Un 200 le diria a Bold que el evento quedo aceptado.

   SE COMPRUEBA TAMBIEN EL IMPORTE
   Aunque el hash de integridad ya impide alterar el monto al iniciar
   el cobro, se vuelve a comparar contra el total del pedido. Si no
   cuadran, el pedido queda en 'error' en vez de 'aprobado': es
   preferible revisarlo a mano a despachar algo cobrado de menos.
============================================================= */

require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/bold.php';
require_once __DIR__ . '/../configuracion/avisos.php';

/* El cuerpo se lee crudo y se usa tal cual para la firma: decodificar
   y volver a codificar cambiaria los espacios y el orden, y la firma
   dejaria de cuadrar. */
$cuerpoCrudo = file_get_contents('php://input');
$firma       = boldFirmaDeLaPeticion();

function responder($codigo, $mensaje) {
    http_response_code($codigo);
    header('Content-Type: application/json');
    echo json_encode(['ok' => $codigo === 200, 'mensaje' => $mensaje]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(405, 'Metodo no permitido');
}

list($firmaValida, $motivo) = boldVerificarEvento($cuerpoCrudo, $firma);
if (!$firmaValida) {
    /* Se registra porque un intento de falsificacion es justo lo que
       conviene saber, pero no se detalla al que llama. */
    error_log('[OrientPerfumes] Webhook rechazado: ' . $motivo);
    responder(401, 'Firma no valida');
}

$evento = json_decode($cuerpoCrudo, true);
if (!is_array($evento)) {
    responder(400, 'Cuerpo no valido');
}

$tipo        = (string) ($evento['type'] ?? '');
$transaccion = (string) ($evento['subject'] ?? ($evento['data']['payment_id'] ?? ''));
$referencia  = (string) ($evento['data']['metadata']['reference'] ?? '');
$montoBold   = (int)    ($evento['data']['amount']['total'] ?? 0);
$moneda      = (string) ($evento['data']['amount']['currency'] ?? 'COP');
$metodo      = (string) ($evento['data']['payment_method'] ?? '');

if ($transaccion === '') {
    responder(400, 'El evento no identifica la transaccion');
}

try {
    /* Idempotencia: si este id de transaccion ya esta registrado, el
       evento es un reintento o un duplicado. Se confirma con 200 para
       que Bold deje de reenviarlo, sin volver a aplicar nada. */
    $ya = $pdo->prepare("SELECT id FROM tbl_pagos WHERE transaccion_id = :t LIMIT 1");
    $ya->execute([':t' => $transaccion]);
    if ($ya->fetch()) {
        responder(200, 'Evento ya procesado');
    }

    /* El pedido se busca por la referencia que enviamos al cobrar. */
    $pedido = null;
    if ($referencia !== '') {
        $p = $pdo->prepare("SELECT id, total, estado_pago, codigo_seguimiento FROM tbl_pedidos WHERE referencia_pago = :r LIMIT 1");
        $p->execute([':r' => $referencia]);
        $pedido = $p->fetch();
    }

    $estado = boldEstadoAPedido($tipo);

    /* El importe tiene que coincidir con el del pedido. Si no, no se
       da por pagado: queda en 'error' para revisarlo. */
    if ($pedido && $estado === 'aprobado') {
        $totalPedido = (int) round((float) $pedido['total']);
        if ($montoBold !== $totalPedido) {
            error_log(sprintf(
                '[OrientPerfumes] Webhook: importe distinto en %s. Bold=%d pedido=%d',
                $referencia, $montoBold, $totalPedido
            ));
            $estado = 'error';
        }
    }

    $pdo->beginTransaction();

    /* Se registra el evento siempre, incluso si no se encuentra el
       pedido: sin ese rastro, un aviso que no casa con nada
       desapareceria sin dejar forma de investigarlo. */
    $pdo->prepare("
        INSERT INTO tbl_pagos
            (id_pedido, referencia, transaccion_id, estado, metodo, monto_centavos, moneda, evento)
        VALUES (:pedido, :ref, :tx, :estado, :metodo, :monto, :moneda, :evento)
    ")->execute([
        ':pedido' => $pedido['id'] ?? null,
        ':ref'    => $referencia,
        ':tx'     => $transaccion,
        ':estado' => $tipo !== '' ? $tipo : 'DESCONOCIDO',
        ':metodo' => $metodo,
        /* La columna se llamo monto_centavos pensando en Wompi; Bold
           maneja pesos enteros y aqui se guarda tal cual. */
        ':monto'  => $montoBold,
        ':moneda' => $moneda,
        ':evento' => $cuerpoCrudo,
    ]);

    if ($pedido) {
        /* Un pedido ya aprobado no se degrada por un aviso posterior:
           una anulacion llegaria como VOID_APPROVED y esa si cambia el
           estado, pero un SALE_REJECTED tardio no debe borrar un pago
           que ya entro. */
        $degradar = ($pedido['estado_pago'] === 'aprobado' && $estado === 'rechazado');

        if (!$degradar) {
            $pdo->prepare("
                UPDATE tbl_pedidos
                   SET estado_pago = :e,
                       fecha_pago  = CASE WHEN :e2 = 'aprobado' THEN NOW() ELSE fecha_pago END
                 WHERE id = :id
            ")->execute([':e' => $estado, ':e2' => $estado, ':id' => $pedido['id']]);
        }
    } else {
        error_log('[OrientPerfumes] Webhook sin pedido para la referencia: ' . $referencia);
    }

    $pdo->commit();

    /* Aviso al WhatsApp del negocio, solo cuando el dinero entra de
       verdad y el pedido no constaba ya como pagado.

       Va despues del commit y nunca antes del 200: si CallMeBot tarda
       o falla, Bold no debe quedarse esperando ni reintentar un
       evento que ya quedo aplicado. avisarWhatsApp traga sus propios
       fallos por ese motivo. */
    if ($pedido && $estado === 'aprobado' && $pedido['estado_pago'] !== 'aprobado') {
        avisarWhatsApp(textoPagoAprobado(
            $pedido['codigo_seguimiento'],
            $pedido['total'],
            $metodo
        ));
    }

    /* 200 siempre que el evento se haya registrado, aunque no casara
       con ningun pedido: ya esta guardado y reenviarlo no ayudaria. */
    responder(200, 'Recibido');

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('[OrientPerfumes] Webhook: ' . $e->getMessage());
    /* 500 a proposito: aqui si conviene que Bold reintente, porque el
       fallo es nuestro y puede ser pasajero. */
    responder(500, 'Error al procesar');
}
