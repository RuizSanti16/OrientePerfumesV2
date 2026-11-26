<?php
/* =============================================================
   api/ajustes.php — ajustes de la tienda

   GET  publico : los lee cualquiera, porque la tienda los necesita
                  para pintar los botones de redes, el de WhatsApp y
                  el minimo de envio gratis.
   PUT  admin   : solo con sesion de administrador.

   POR QUE EXISTE
   La pantalla de Ajustes del panel guardaba con localStorage y nada
   mas, asi que lo que escribia el cliente se quedaba en su navegador:
   nadie mas lo veia y se perdia al borrar la cache.

   QUE NO SE GUARDA AQUI
   Solo las claves de la lista blanca de abajo. Sin ella, cualquiera
   con sesion de admin podria llenar la tabla con lo que quisiera, y
   un dia alguien guardaria algo sensible en un sitio que se sirve
   publicamente.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/auth.php';

/* Este endpoint NO se bloquea con el modo mantenimiento: la pagina de
   "proximamente" tambien quiere el WhatsApp y las redes. */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

/* Lo que puede guardarse, con su valor por defecto. Es tambien lo que
   se devuelve cuando la tabla aun no tiene nada. */
$PERMITIDOS = [
    'storeName'       => 'OrientPerfumes',
    'storeEmail'      => 'info@orientperfumes.com',
    'storePhone'      => '+57 300 000 0000',
    'storeAddress'    => 'Rionegro, Antioquia, Colombia',
    'storeDesc'       => 'Fragancias exclusivas de lujo. Tu destino para los mejores perfumes del mundo.',
    'whatsappNumber'  => '',
    'whatsappMessage' => 'Hola! Me interesa conocer más sobre sus fragancias.',
    'whatsappVisible' => true,
    'instagram'       => '',
    'facebook'        => '',
    'tiktok'          => '',
    /* Envio. freeShippingMin es el importe de productos a partir del
       cual sale gratis; con 0 nunca lo es. */
    'envioLocal'      => 15000,
    'envioNacional'   => 20000,
    'freeShippingMin' => 150000,
    'stockThreshold'  => 20,
    'currency'        => 'COP',
];

/* Los valores se guardan como texto, asi que al leerlos hay que
   devolverles el tipo que tenia el valor por defecto. Sin esto,
   whatsappVisible volveria como la cadena "false", que en JavaScript
   es verdadera, y el boton no habria forma de ocultarlo. */
function conTipoDe($valor, $porDefecto) {
    if (is_bool($porDefecto)) return $valor === '1' || $valor === 'true';
    if (is_int($porDefecto))  return (int) $valor;
    return (string) $valor;
}

function paraGuardar($valor) {
    if (is_bool($valor)) return $valor ? '1' : '0';
    return (string) $valor;
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {

        /* ── GET: leer (publico) ──────────────────────────── */
        case 'GET':
            $ajustes = $PERMITIDOS;
            foreach ($pdo->query("SELECT clave, valor FROM tbl_ajustes") as $fila) {
                $clave = $fila['clave'];
                /* Una clave que ya no este en la lista se ignora en vez
                   de colarse: puede ser de una version anterior. */
                if (!array_key_exists($clave, $PERMITIDOS)) continue;
                $ajustes[$clave] = conTipoDe($fila['valor'], $PERMITIDOS[$clave]);
            }
            echo json_encode(['ok' => true, 'data' => $ajustes]);
            break;

        /* ── PUT: guardar (admin) ─────────────────────────── */
        case 'PUT':
            verificarTokenAdmin($pdo);

            $b = json_decode(file_get_contents('php://input'), true);
            if (!is_array($b)) {
                echo json_encode(['ok' => false, 'mensaje' => 'Cuerpo no valido']);
                exit;
            }

            /* Una sola transaccion: si algo falla a mitad no quedan los
               ajustes medio escritos. */
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("
                INSERT INTO tbl_ajustes (clave, valor) VALUES (:c, :v)
                ON DUPLICATE KEY UPDATE valor = VALUES(valor)
            ");

            $guardados = 0;
            foreach ($PERMITIDOS as $clave => $porDefecto) {
                if (!array_key_exists($clave, $b)) continue;
                $stmt->execute([':c' => $clave, ':v' => paraGuardar($b[$clave])]);
                $guardados++;
            }
            $pdo->commit();

            /* Se devuelve lo que quedo guardado, no lo que llego: asi
               el panel muestra el estado real y no lo que creia. */
            $ajustes = $PERMITIDOS;
            foreach ($pdo->query("SELECT clave, valor FROM tbl_ajustes") as $fila) {
                if (!array_key_exists($fila['clave'], $PERMITIDOS)) continue;
                $ajustes[$fila['clave']] = conTipoDe($fila['valor'], $PERMITIDOS[$fila['clave']]);
            }

            echo json_encode([
                'ok'        => true,
                'mensaje'   => 'Ajustes guardados',
                'guardados' => $guardados,
                'data'      => $ajustes,
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    responderErrorServidor($e, basename(__FILE__));
}

require_once __DIR__ . '/../configuracion/CerrarConexion.php';
