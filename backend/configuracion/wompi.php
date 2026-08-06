<?php
/* =============================================================
   wompi.php — utilidades para la pasarela de pago.

   Aqui viven las dos firmas que sostienen la seguridad del cobro.
   Merecen explicacion, porque de un vistazo parecen tramites:

   1) FIRMA DE INTEGRIDAD, al enviar al cliente a pagar.
      El importe viaja en la URL del checkout, donde cualquiera puede
      editarlo. La firma es un SHA256 de la referencia, el importe y la
      moneda concatenados con un secreto que solo conocen el servidor y
      la pasarela. Si alguien cambia el importe, la firma deja de
      cuadrar y la pasarela rechaza el intento. Sin esto, el cliente
      elegiria cuanto pagar.

   2) FIRMA DE EVENTOS, al recibir la confirmacion.
      La URL del webhook es publica: cualquiera puede enviarle un JSON
      diciendo "el pedido X esta pagado". La pasarela firma cada evento
      con otro secreto, y aqui se recalcula la firma para comprobar que
      el aviso viene de ella. Sin esta verificacion, cualquiera podria
      marcar pedidos como pagados sin pagar.

   Las llaves se leen de entorno.php (o de variables de entorno) con
   envOr, definido en Configuracion.php.
============================================================= */

require_once __DIR__ . '/Configuracion.php';

if (!function_exists('wompiConfig')) {

    function wompiConfig() {
        $entorno = envOr('WOMPI_ENTORNO', 'sandbox');

        return [
            'entorno'   => $entorno,
            'publica'   => envOr('WOMPI_LLAVE_PUBLICA', ''),
            'integridad'=> envOr('WOMPI_SECRETO_INTEGRIDAD', ''),
            'eventos'   => envOr('WOMPI_SECRETO_EVENTOS', ''),
            /* El checkout es el mismo dominio en ambos ambientes: lo que
               distingue prueba de produccion es el prefijo de la llave
               (pub_test_ frente a pub_prod_). */
            'checkout'  => 'https://checkout.wompi.co/p/',
            'api'       => $entorno === 'produccion'
                ? 'https://production.wompi.co/v1'
                : 'https://sandbox.wompi.co/v1',
        ];
    }

    /** ¿Estan puestas las llaves necesarias para cobrar? */
    function wompiConfigurado() {
        $c = wompiConfig();
        return $c['publica'] !== '' && $c['integridad'] !== '';
    }

    /**
     * Firma de integridad: SHA256(referencia + centavos + moneda + secreto).
     * El orden de los tres primeros es el que exige la pasarela.
     */
    function wompiFirmaIntegridad($referencia, $centavos, $moneda = 'COP') {
        $c = wompiConfig();
        return hash('sha256', $referencia . $centavos . $moneda . $c['integridad']);
    }

    /**
     * Verifica la firma de un evento recibido en el webhook.
     *
     * El propio evento indica que campos se firmaron, en
     * signature.properties, con rutas del estilo "transaction.amount_in_cents".
     * Se toman esos valores en ese orden, se concatenan, se anade el
     * timestamp y el secreto, y el SHA256 debe coincidir con
     * signature.checksum.
     *
     * Se compara con hash_equals para no filtrar informacion por el
     * tiempo que tarda la comparacion.
     */
    function wompiVerificarEvento(array $evento) {
        $c = wompiConfig();
        if ($c['eventos'] === '') {
            return [false, 'Falta WOMPI_SECRETO_EVENTOS en la configuracion.'];
        }

        $props    = $evento['signature']['properties'] ?? null;
        $checksum = $evento['signature']['checksum']   ?? null;
        $ts       = $evento['timestamp']               ?? null;

        if (!is_array($props) || !$checksum || $ts === null) {
            return [false, 'El evento no trae firma completa.'];
        }

        $cadena = '';
        foreach ($props as $ruta) {
            $valor = $evento['data'] ?? null;
            foreach (explode('.', (string) $ruta) as $parte) {
                if (!is_array($valor) || !array_key_exists($parte, $valor)) {
                    return [false, "El evento no trae el campo firmado: $ruta"];
                }
                $valor = $valor[$parte];
            }
            $cadena .= (string) $valor;
        }

        $calculado = hash('sha256', $cadena . $ts . $c['eventos']);

        if (!hash_equals($calculado, (string) $checksum)) {
            return [false, 'La firma del evento no coincide.'];
        }
        return [true, 'ok'];
    }

    /**
     * Traduce el estado de la pasarela al de tbl_pedidos.
     * Un estado desconocido no se convierte en 'aprobado' por descuido:
     * cae en 'error', que obliga a mirarlo.
     */
    function wompiEstadoAPedido($estadoPasarela) {
        switch (strtoupper((string) $estadoPasarela)) {
            case 'APPROVED': return 'aprobado';
            case 'DECLINED': return 'rechazado';
            case 'VOIDED':   return 'anulado';
            case 'PENDING':  return 'iniciado';
            case 'ERROR':    return 'error';
            default:         return 'error';
        }
    }
}
