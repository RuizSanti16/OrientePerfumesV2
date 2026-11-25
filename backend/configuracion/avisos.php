<?php
/* =============================================================
   avisos.php — avisa al negocio por WhatsApp cuando hay una venta.

   Se envia por CallMeBot: una peticion GET con el numero, el texto y
   una clave que ellos entregan. No hace falta cuenta de Meta ni
   tarjeta, y solo sirve para escribirle al propio numero del negocio,
   que es justo lo que se quiere aqui. Si algun dia hay que escribir a
   los clientes, hara falta la API oficial de WhatsApp.

   REGLA DE ORO: UN AVISO NUNCA PUEDE TUMBAR UNA VENTA
   Esto se llama despues de que el pedido ya esta guardado. Si
   CallMeBot esta caido, tarda, o la clave esta mal, el pedido sigue
   siendo valido y el cliente tiene que ver su confirmacion igual. Por
   eso aqui nada lanza excepciones ni imprime nada: los fallos van al
   log del servidor y la funcion devuelve false. Es el mismo motivo
   por el que mail() se llama con @ en pedidos.php.

   CONFIGURACION (en entorno.php, que no se versiona)
     'WHATSAPP_AVISOS'  => '1'              activa los avisos
     'WHATSAPP_NUMERO'  => '573001234567'   con indicativo, sin +
     'WHATSAPP_CLAVE'   => '123456'         la que da CallMeBot
============================================================= */

require_once __DIR__ . '/Configuracion.php';

if (!function_exists('avisarWhatsApp')) {

    /* Si el servidor no contesta en este tiempo se deja estar. El
       cliente esta esperando su confirmacion al otro lado. */
    defined('AVISO_TIMEOUT') || define('AVISO_TIMEOUT', 6);

    function avisosActivos() {
        return envOr('WHATSAPP_AVISOS', '0') === '1'
            && envOr('WHATSAPP_NUMERO', '') !== ''
            && envOr('WHATSAPP_CLAVE', '')  !== '';
    }

    /**
     * Manda un texto al WhatsApp del negocio.
     *
     * Devuelve true si se entrego. Nunca lanza.
     */
    function avisarWhatsApp($texto) {
        if (!avisosActivos()) return false;

        $numero = preg_replace('/\D/', '', envOr('WHATSAPP_NUMERO', ''));
        $url = 'https://api.callmebot.com/whatsapp.php?' . http_build_query([
            'phone'  => $numero,
            'text'   => $texto,
            'apikey' => envOr('WHATSAPP_CLAVE', ''),
        ]);

        try {
            if (function_exists('curl_init')) {
                $ch = curl_init($url);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT        => AVISO_TIMEOUT,
                    CURLOPT_CONNECTTIMEOUT => AVISO_TIMEOUT,
                    /* Sin esto, una respuesta 3xx dejaria el aviso a
                       medias sin que nos enteremos. */
                    CURLOPT_FOLLOWLOCATION => true,
                ]);
                $respuesta = curl_exec($ch);
                $codigo    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $error     = curl_error($ch);
                curl_close($ch);

                if ($respuesta === false || $codigo < 200 || $codigo >= 300) {
                    error_log("[OrientPerfumes] Aviso WhatsApp fallido (HTTP {$codigo}) {$error}");
                    return false;
                }
                return true;
            }

            /* Sin curl se intenta con el envoltorio de HTTP. Hostinger
               trae curl, pero asi no depende de ello. */
            $contexto = stream_context_create([
                'http' => ['timeout' => AVISO_TIMEOUT, 'ignore_errors' => true],
            ]);
            if (@file_get_contents($url, false, $contexto) === false) {
                error_log('[OrientPerfumes] Aviso WhatsApp fallido: sin respuesta');
                return false;
            }
            return true;

        } catch (Throwable $e) {
            /* Throwable y no Exception: un fallo de PHP tampoco debe
               llegar a cortar la respuesta del pedido. */
            error_log('[OrientPerfumes] Aviso WhatsApp fallido: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Texto del aviso de pedido nuevo.
     *
     * Lleva lo que hace falta para decidir sin abrir el panel: cuanto,
     * como se paga y a donde va.
     */
    function textoPedidoNuevo($codigo, $nombre, $total, $metodo, $ciudad, $items) {
        $comoPaga = $metodo === 'efectivo'
            ? 'Efectivo al recibir'
            : 'Pago en linea (pendiente de confirmar)';

        $lineas = [];
        foreach ($items as $it) {
            $pres     = !empty($it['presentacion']) ? ' ' . $it['presentacion'] : '';
            $lineas[] = '- ' . $it['cantidad'] . 'x ' . $it['nombre'] . $pres;
        }

        return "NUEVO PEDIDO {$codigo}\n"
             . "{$nombre}" . ($ciudad !== '' ? " - {$ciudad}" : '') . "\n"
             . 'Total: $' . number_format((float) $total, 0, ',', '.') . "\n"
             . "{$comoPaga}\n\n"
             . implode("\n", $lineas);
    }

    /**
     * Texto del aviso de pago aprobado por la pasarela.
     */
    function textoPagoAprobado($codigo, $total, $metodo) {
        return "PAGO APROBADO {$codigo}\n"
             . 'Total: $' . number_format((float) $total, 0, ',', '.')
             . ($metodo !== '' ? "\nMedio: {$metodo}" : '');
    }
}
