<?php
/* =============================================================
   mantenimiento.php — cierra la tienda al publico.

   Mientras MANTENIMIENTO valga '1', los endpoints publicos responden
   503 a cualquiera que no traiga una sesion de administrador valida.
   El panel sigue funcionando con normalidad, de modo que se puede
   seguir trabajando y comprobando la tienda con el sitio cerrado.

   POR QUE EN EL SERVIDOR Y NO SOLO EN REACT
   Un aviso de "proximamente" puesto unicamente en el frontend es una
   cortina, no una puerta: el visitante puede saltarselo tocando el
   navegador, y sobre todo los endpoints seguirian entregando productos
   y precios a quien los pidiera directamente. Comprobarlo aqui cierra
   las dos vias con la misma regla.

   QUE NO SE BLOQUEA
   - login.php, para que el administrador pueda entrar.
   - Los endpoints ya protegidos con verificarTokenAdmin, que exigen
     sesion por su cuenta.
   - estado.php, que es precisamente quien informa de que la tienda
     esta cerrada.
============================================================= */

require_once __DIR__ . '/Configuracion.php';

if (!function_exists('enMantenimiento')) {

    function enMantenimiento() {
        return envOr('MANTENIMIENTO', '0') === '1';
    }

    /**
     * ¿La peticion trae una sesion de administrador valida?
     *
     * No sirve verificarTokenAdmin: ese termina la peticion con 401
     * cuando no hay sesion, y aqui hace falta un simple si o no para
     * decidir si dejar pasar o mostrar el aviso.
     */
    function esAdminAutenticado(PDO $pdo) {
        $auth = '';
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('apache_request_headers')) {
            foreach (apache_request_headers() as $k => $v) {
                if (strtolower($k) === 'authorization') { $auth = $v; break; }
            }
        }

        if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($auth), $m)) {
            return false;
        }

        try {
            $s = $pdo->prepare(
                "SELECT id_administrador FROM tbl_administrador
                  WHERE token = :t AND token_expiry > NOW() LIMIT 1"
            );
            $s->execute([':t' => $m[1]]);
            return (bool) $s->fetch();
        } catch (PDOException $e) {
            /* Si la comprobacion falla no se puede afirmar que sea
               administrador, asi que se trata como visitante. */
            error_log('[OrientPerfumes] Error comprobando sesion: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Corta la peticion con 503 si la tienda esta cerrada y quien
     * llama no es administrador.
     *
     * 503 y no 403: significa "no disponible ahora", que es lo cierto,
     * y los buscadores lo entienden como temporal en vez de dar la
     * pagina por desaparecida.
     */
    function bloquearSiMantenimiento(PDO $pdo) {
        if (!enMantenimiento())      return;
        if (esAdminAutenticado($pdo)) return;

        http_response_code(503);
        header('Retry-After: 3600');
        header('Content-Type: application/json');
        echo json_encode([
            'ok'      => false,
            'code'    => 'MANTENIMIENTO',
            'mensaje' => 'La tienda no esta disponible por el momento.',
        ]);
        exit;
    }
}
