<?php
/* =============================================================
   configuracion/auth.php
   Helper de autenticación por token para el panel admin.

   USO:
     require_once '../configuracion/auth.php';
     verificarTokenAdmin($pdo);   // termina con 401 si no válido

   El token viaja en:  Authorization: Bearer <64-char-hex-token>
============================================================= */

function verificarTokenAdmin($pdo) {
    /* ── Obtener el header Authorization ── */
    $auth = '';

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        /* Apache con mod_rewrite puede mover el header */
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $hdrs = apache_request_headers();
        foreach ($hdrs as $k => $v) {
            if (strtolower($k) === 'authorization') { $auth = $v; break; }
        }
    }

    /* ── Validar formato Bearer ── */
    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($auth), $m)) {
        http_response_code(401);
        echo json_encode([
            'ok'      => false,
            'mensaje' => 'No autorizado. Inicia sesión en el panel.',
            'code'    => 'NO_TOKEN',
        ]);
        exit;
    }

    $token = $m[1];

    /* ── Verificar token en BD ── */
    $s = $pdo->prepare(
        "SELECT id_administrador FROM tbl_administrador
         WHERE token = :t AND token_expiry > NOW()
         LIMIT 1"
    );
    $s->execute([':t' => $token]);

    if (!$s->fetch()) {
        http_response_code(401);
        echo json_encode([
            'ok'      => false,
            'mensaje' => 'Sesión expirada o inválida. Por favor inicia sesión de nuevo.',
            'code'    => 'TOKEN_INVALID',
        ]);
        exit;
    }
}
