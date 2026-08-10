<?php
/* =============================================================
   errores.php — respuesta unica para los fallos del servidor.

   POR QUE EXISTE
   Los endpoints devolvian al cliente el mensaje de PDO tal cual:

       echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);

   Ese mensaje incluye el nombre de la base de datos, el de las tablas y
   a veces fragmentos de la consulta. No es un riesgo teorico: en
   produccion se vio un "Table 'uXXXXXXXX_orientperfums.tbl_productos'
   doesn't exist" legible desde el navegador con solo provocar un error.
   Eso le entrega a un atacante el esquema y le ahorra la parte lenta de
   un ataque.

   El detalle sigue haciendo falta para diagnosticar, asi que va al log
   del servidor, donde solo llega quien tiene acceso al hosting, y al
   cliente le llega un mensaje generico. Con APP_DEBUG = '1' se muestra
   completo, para poder depurar sin tocar codigo.

   Se incluye desde Conexion.php, que a su vez incluyen todos los
   endpoints: asi la funcion esta disponible en todas partes sin anadir
   un require a cada archivo.
============================================================= */

require_once __DIR__ . '/Configuracion.php';

if (!function_exists('responderErrorServidor')) {
    /**
     * Registra el fallo y responde con un mensaje que no revela nada.
     *
     * @param Throwable $e
     * @param string    $donde  archivo o operacion, para el log
     */
    function responderErrorServidor($e, $donde = '') {
        $etiqueta = $donde !== '' ? "[$donde] " : '';
        error_log('[OrientPerfumes] ' . $etiqueta . $e->getMessage());

        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json');
        }

        echo json_encode([
            'ok'      => false,
            'mensaje' => envOr('APP_DEBUG', '0') === '1'
                ? $e->getMessage()
                : 'No se pudo completar la operación. Intenta de nuevo.',
        ]);
    }
}
