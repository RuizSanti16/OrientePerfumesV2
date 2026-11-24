<?php
/* =============================================================
   bold.php — utilidades de la pasarela de pago Bold.

   Sustituye a wompi.php. Aqui viven las dos comprobaciones de las que
   depende que el cobro sea seguro, y conviene entender por que:

   1) HASH DE INTEGRIDAD, al enviar al cliente a pagar.
      El monto viaja en los atributos del boton, en el navegador, donde
      cualquiera puede editarlo. El hash se calcula con un secreto que
      solo conocen el servidor y Bold; si el monto cambia, deja de
      cuadrar y Bold rechaza la transaccion. Sin esto el cliente
      elegiria cuanto pagar.

   2) FIRMA DEL WEBHOOK, al recibir la confirmacion.
      La URL del webhook es publica: cualquiera puede enviarle un JSON
      diciendo que un pedido esta pagado. Bold firma cada evento y aqui
      se recalcula la firma para comprobar que viene de ellos.

   DIFERENCIAS CON WOMPI, que costaron leer la documentacion con calma:

   - El monto va en PESOS ENTEROS, no en centavos. 95000 son $95.000.
     El minimo que acepta Bold son $1.000.
   - La firma del webhook se calcula sobre el cuerpo CODIFICADO EN
     BASE64, no sobre el cuerpo tal cual. Es facil implementarlo mal y
     que no valide nunca.
   - En el ambiente de pruebas la llave secreta de la firma del webhook
     es una CADENA VACIA. Si no se contempla, las pruebas no pasan.

   Documentacion: developers.bold.co
============================================================= */

require_once __DIR__ . '/Configuracion.php';

if (!function_exists('boldConfig')) {

    /* Bold no acepta cobros por debajo de este importe. */
    defined('BOLD_MONTO_MINIMO') || define('BOLD_MONTO_MINIMO', 1000);

    function boldConfig() {
        $entorno = envOr('BOLD_ENTORNO', 'pruebas');

        return [
            'entorno'  => $entorno,
            'pruebas'  => $entorno !== 'produccion',
            'identidad'=> envOr('BOLD_LLAVE_IDENTIDAD', ''),
            'secreta'  => envOr('BOLD_LLAVE_SECRETA', ''),
            'script'   => 'https://checkout.bold.co/library/boldPaymentButton.js',
            /* 'redirect' envia al cliente a la pagina de Bold;
               'embedded' la abre en un modal sin salir de la tienda. */
            'modo'     => envOr('BOLD_MODO', 'redirect'),
        ];
    }

    function boldConfigurado() {
        $c = boldConfig();
        return $c['identidad'] !== '' && $c['secreta'] !== '';
    }

    /**
     * Hash de integridad: SHA256({orderId}{monto}{divisa}{llaveSecreta}).
     * El orden es el que exige Bold y no es intercambiable.
     *
     * @param string $orderId  referencia unica de la venta
     * @param int    $monto    en pesos enteros, sin decimales
     * @param string $moneda   COP o USD
     */
    function boldFirmaIntegridad($orderId, $monto, $moneda = 'COP') {
        $c = boldConfig();
        return hash('sha256', $orderId . (int) $monto . $moneda . $c['secreta']);
    }

    /**
     * Verifica la firma de un evento recibido en el webhook.
     *
     * Bold codifica el cuerpo en base64, lo firma con HMAC-SHA256 usando
     * la llave secreta, y envia el resultado en hexadecimal en la
     * cabecera x-bold-signature.
     *
     * En pruebas la llave es una cadena vacia, por documentacion.
     *
     * @param string $cuerpoCrudo  el cuerpo tal como llego, sin decodificar
     * @param string $firmaRecibida valor de la cabecera x-bold-signature
     * @return array [valido(bool), motivo(string)]
     */
    function boldVerificarEvento($cuerpoCrudo, $firmaRecibida) {
        $c = boldConfig();

        if (trim((string) $firmaRecibida) === '') {
            return [false, 'El evento no trae la cabecera x-bold-signature.'];
        }

        /* En pruebas la llave es vacia; en produccion tiene que existir,
           porque firmar con vacio alli aceptaria cualquier evento. */
        $llave = $c['pruebas'] ? '' : $c['secreta'];
        if (!$c['pruebas'] && $llave === '') {
            return [false, 'Falta BOLD_LLAVE_SECRETA en la configuracion.'];
        }

        $calculada = hash_hmac('sha256', base64_encode($cuerpoCrudo), $llave);

        /* hash_equals para no filtrar informacion por el tiempo que
           tarda la comparacion. */
        if (!hash_equals($calculada, trim((string) $firmaRecibida))) {
            return [false, 'La firma del evento no coincide.'];
        }
        return [true, 'ok'];
    }

    /** Lee la cabecera de la firma, que segun el servidor llega de formas distintas. */
    function boldFirmaDeLaPeticion() {
        foreach (['HTTP_X_BOLD_SIGNATURE', 'REDIRECT_HTTP_X_BOLD_SIGNATURE'] as $k) {
            if (!empty($_SERVER[$k])) return $_SERVER[$k];
        }
        if (function_exists('apache_request_headers')) {
            foreach (apache_request_headers() as $k => $v) {
                if (strtolower($k) === 'x-bold-signature') return $v;
            }
        }
        return '';
    }

    /**
     * Traduce el tipo de evento de Bold al estado de tbl_pedidos.
     * Un tipo desconocido cae en 'error', no en 'aprobado': mas vale un
     * pedido que hay que mirar a mano que uno dado por pagado sin estarlo.
     */
    function boldEstadoAPedido($tipo) {
        switch (strtoupper((string) $tipo)) {
            case 'SALE_APPROVED':  return 'aprobado';
            case 'SALE_REJECTED':  return 'rechazado';
            case 'VOID_APPROVED':  return 'anulado';
            case 'VOID_REJECTED':  return 'error';
            default:               return 'error';
        }
    }
}
