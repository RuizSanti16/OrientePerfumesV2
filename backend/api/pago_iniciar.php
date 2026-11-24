<?php
/* =============================================================
   api/pago_iniciar.php — prepara el cobro de un pedido.

   Recibe el codigo de seguimiento de un pedido ya creado y devuelve
   los datos que necesita el boton de Bold, incluido el hash de
   integridad.

   POR QUE EL IMPORTE NO VIENE EN LA PETICION
   El monto se lee del pedido en la base, no de lo que mande el
   navegador. Junto con el hash, que se calcula aqui con la llave
   secreta, eso es lo que impide que alguien pague 1 peso por un pedido
   de 500.000 editando la peticion o los atributos del boton.

   El pedido debe existir antes de pagar: Bold lo pide expresamente y
   ademas es lo sensato, porque el aviso de pago puede tardar hasta 10
   minutos y necesita algo contra lo que casar.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/bold.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    exit;
}

if (!boldConfigurado()) {
    http_response_code(503);
    echo json_encode([
        'ok'      => false,
        'code'    => 'PASARELA_SIN_CONFIGURAR',
        'mensaje' => 'El pago en línea no está disponible por el momento.',
    ]);
    exit;
}

$body   = json_decode(file_get_contents('php://input'), true);
$codigo = strtoupper(trim((string) ($body['codigo'] ?? '')));

if ($codigo === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Falta el código del pedido.']);
    exit;
}

try {
    $s = $pdo->prepare("
        SELECT id, codigo_seguimiento, nombre, correo, telefono, direccion, ciudad,
               total, estado_pago, referencia_pago
          FROM tbl_pedidos
         WHERE codigo_seguimiento = :c
         LIMIT 1
    ");
    $s->execute([':c' => $codigo]);
    $pedido = $s->fetch();

    if (!$pedido) {
        echo json_encode(['ok' => false, 'mensaje' => 'No encontramos ese pedido.']);
        exit;
    }

    /* Un pedido ya pagado no se vuelve a cobrar. Sin esta comprobacion,
       recargar la pantalla de pago despues de pagar abriria un segundo
       cobro por el mismo pedido. */
    if ($pedido['estado_pago'] === 'aprobado') {
        echo json_encode([
            'ok'      => false,
            'code'    => 'YA_PAGADO',
            'mensaje' => 'Este pedido ya fue pagado.',
        ]);
        exit;
    }

    $monto = (int) round((float) $pedido['total']);

    if ($monto < BOLD_MONTO_MINIMO) {
        echo json_encode([
            'ok'      => false,
            'code'    => 'MONTO_MINIMO',
            'mensaje' => 'El monto mínimo para pagar en línea es $' . number_format(BOLD_MONTO_MINIMO, 0, ',', '.') . '.',
        ]);
        exit;
    }

    /* Referencia nueva en cada intento. Bold rechaza reutilizar la de
       una venta ya pagada, y recomienda no reutilizarla nunca; el sello
       de tiempo evita colisiones si el cliente reintenta. Solo se
       admiten alfanumericos, guion y guion bajo, maximo 60 caracteres. */
    $referencia = 'OP-' . $pedido['codigo_seguimiento'] . '-' . time();
    $referencia = substr(preg_replace('/[^A-Za-z0-9_-]/', '', $referencia), 0, 60);

    $pdo->prepare("
        UPDATE tbl_pedidos
           SET referencia_pago = :r,
               estado_pago = 'iniciado',
               metodo_pago = 'bold'
         WHERE id = :id
    ")->execute([':r' => $referencia, ':id' => $pedido['id']]);

    $cfg = boldConfig();

    /* Datos del comprador: Bold los precarga en su formulario para que
       el cliente no tenga que volver a escribirlos. Todos opcionales. */
    $datosCliente = array_filter([
        'email'    => $pedido['correo'],
        'fullName' => $pedido['nombre'],
        'phone'    => preg_replace('/\D/', '', (string) $pedido['telefono']),
    ], fn($v) => $v !== '' && $v !== null);

    $direccion = array_filter([
        'address' => $pedido['direccion'],
        'city'    => $pedido['ciudad'],
        'country' => 'CO',
    ], fn($v) => $v !== '' && $v !== null);

    /* La URL de retorno tiene que ser https y del propio dominio. Se
       arma desde el origen de la peticion para que funcione igual en
       local y en produccion sin tocar configuracion. */
    $origen = rtrim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
    if ($origen === '') {
        $esquema = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $origen  = $esquema . '://' . ($_SERVER['HTTP_HOST'] ?? 'orientperfumes.com.co');
    }

    echo json_encode([
        'ok'   => true,
        'bold' => [
            'apiKey'            => $cfg['identidad'],
            'orderId'           => $referencia,
            'amount'            => (string) $monto,   // pesos enteros, sin decimales
            'currency'          => 'COP',
            'integritySignature'=> boldFirmaIntegridad($referencia, $monto, 'COP'),
            'description'       => 'Pedido ' . $pedido['codigo_seguimiento'] . ' - OrientPerfumes',
            'redirectionUrl'    => $origen . '/pago/resultado',
            'renderMode'        => $cfg['modo'],
            'customerData'      => json_encode($datosCliente, JSON_UNESCAPED_UNICODE),
            'billingAddress'    => json_encode($direccion,    JSON_UNESCAPED_UNICODE),
            'script'            => $cfg['script'],
        ],
        'pedido' => [
            'codigo' => $pedido['codigo_seguimiento'],
            'total'  => $monto,
        ],
    ]);

} catch (PDOException $e) {
    responderErrorServidor($e, basename(__FILE__));
}
