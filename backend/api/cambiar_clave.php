<?php
/* =============================================================
   api/cambiar_clave.php — cambia la contrasena del administrador
   que hace la peticion.

   Hasta ahora no existia ninguna via para esto: la unica forma era un
   UPDATE a mano contra la base, y ahi es facil guardar la contrasena en
   texto plano. login.php valida solo con password_verify(), de modo que
   un valor sin hashear deja la cuenta inaccesible sin ningun aviso.

   Sobre que cuenta actua: siempre sobre la del token, nunca sobre un id
   recibido en el cuerpo. Aceptar un id del cliente permitiria a un
   administrador cambiarle la contrasena a otro.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    exit;
}

$idAdmin = verificarTokenAdmin($pdo);

$body   = json_decode(file_get_contents('php://input'), true);
$actual = (string) ($body['contrasena_actual'] ?? '');
$nueva  = (string) ($body['contrasena_nueva']  ?? '');

/* login.php recorta la contrasena que recibe del formulario. Si aqui se
   guardara el hash de una cadena con espacios al principio o al final,
   nunca validaria contra lo que llega al iniciar sesion. */
$actual = trim($actual);
$nueva  = trim($nueva);

if ($actual === '' || $nueva === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Escribe la contraseña actual y la nueva.']);
    exit;
}

if (mb_strlen($nueva) < 10) {
    echo json_encode(['ok' => false, 'mensaje' => 'La nueva contraseña debe tener al menos 10 caracteres.']);
    exit;
}

if ($nueva === $actual) {
    echo json_encode(['ok' => false, 'mensaje' => 'La nueva contraseña debe ser distinta de la actual.']);
    exit;
}

try {
    $s = $pdo->prepare(
        "SELECT contrasena FROM tbl_administrador WHERE id_administrador = :id LIMIT 1"
    );
    $s->execute([':id' => $idAdmin]);
    $admin = $s->fetch();

    if (!$admin) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'La cuenta ya no existe.']);
        exit;
    }

    if (!password_verify($actual, (string) $admin['contrasena'])) {
        usleep(300000);
        echo json_encode(['ok' => false, 'mensaje' => 'La contraseña actual no es correcta.']);
        exit;
    }

    /* Se emite un token nuevo en la misma operacion. Asi cualquier otra
       sesion abierta con el token anterior deja de valer, que es lo que
       se espera al cambiar una contrasena, y la sesion que hace el
       cambio no se queda fuera: recibe el token nuevo en la respuesta. */
    $token  = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', time() + 86400);

    $u = $pdo->prepare(
        "UPDATE tbl_administrador
         SET contrasena = :c, token = :t, token_expiry = :e
         WHERE id_administrador = :id"
    );
    $u->execute([
        ':c'  => password_hash($nueva, PASSWORD_DEFAULT),
        ':t'  => $token,
        ':e'  => $expiry,
        ':id' => $idAdmin,
    ]);

    echo json_encode([
        'ok'      => true,
        'mensaje' => 'Contraseña actualizada. Las demás sesiones se cerraron.',
        'token'   => $token,
        'expiry'  => $expiry,
    ]);

} catch (PDOException $e) {
    error_log('[OrientPerfumes] Error al cambiar contrasena: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}

require_once __DIR__ . '/../configuracion/CerrarConexion.php';
