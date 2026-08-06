<?php
/* =============================================================
   Configuracion.php
   Datos de conexión a MySQL.

   Admite dos formas de configuración, en este orden:

   1) Una sola URL de conexión, que es lo que ofrecen la mayoría de
      plataformas (en Railway la variable se llama MYSQL_URL):

        DATABASE_URL=mysql://usuario:clave@host:puerto/basedatos

      Es preferible porque hay una única variable que copiar en lugar
      de cinco, y con ella no se pueden desparejar host y puerto.

   2) Las cinco variables sueltas:
        DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS

   3) Un archivo entorno.php junto a este, que devuelva un array con
      esas mismas claves. Es la via para hosting compartido, donde no
      hay forma de definir variables de entorno de verdad: SetEnv en
      el .htaccess deja el valor en $_SERVER, pero con PHP como
      CGI/FastCGI (LiteSpeed, que es lo que usa Hostinger) getenv() no
      siempre lo ve. Un archivo no depende de eso.

      Copiar entorno.example.php como entorno.php y rellenarlo. No se
      versiona: lleva credenciales.

   Si no hay ninguna definida se usan los valores por defecto de
   XAMPP, de modo que el entorno local sigue funcionando sin
   configuración extra.
============================================================= */

/* La guarda evita un fatal por redeclaracion si algun archivo llega a
   incluir este con require en lugar de require_once. */
if (!function_exists('envOr')) {
    /* Se lee una sola vez y se conserva entre llamadas. */
    function entornoLocal() {
        static $datos = null;
        if ($datos === null) {
            $archivo = __DIR__ . '/entorno.php';
            $leido   = is_file($archivo) ? require $archivo : null;
            $datos   = is_array($leido) ? $leido : [];
        }
        return $datos;
    }

    function envOr($clave, $porDefecto) {
        /* Orden: entorno real primero, para que una plataforma como
           Railway siga mandando aunque el archivo llegue por error en
           un despliegue. $_SERVER y $_ENV cubren los SAPI donde
           getenv() se queda corto. */
        $fuentes = [
            getenv($clave),
            $_SERVER[$clave] ?? false,
            $_ENV[$clave]    ?? false,
            entornoLocal()[$clave] ?? false,
        ];

        foreach ($fuentes as $v) {
            if ($v !== false && $v !== null && trim((string) $v) !== '') {
                return trim((string) $v);
            }
        }
        return $porDefecto;
    }
}

/* ── Valores por defecto (XAMPP local) ── */
$host      = 'localhost';
$puerto    = '3306';
$baseDatos = 'orientperfums';
$usuario   = 'root';
$password  = '';

/* ── 1) URL de conexión ── */
$url = envOr('DATABASE_URL', envOr('MYSQL_URL', ''));

if ($url !== '') {
    $p = parse_url($url);
    if ($p !== false && !empty($p['host'])) {
        $host      = $p['host'];
        $puerto    = isset($p['port']) ? (string) $p['port'] : '3306';
        $usuario   = isset($p['user']) ? urldecode($p['user']) : $usuario;
        $password  = isset($p['pass']) ? urldecode($p['pass']) : $password;
        /* El path llega como "/basedatos" */
        if (!empty($p['path'])) {
            $baseDatos = ltrim($p['path'], '/');
        }
    }
}

/* ── 2) Variables sueltas: tienen prioridad si están definidas ── */
$host      = envOr('DB_HOST', $host);
$puerto    = envOr('DB_PORT', $puerto);
$baseDatos = envOr('DB_NAME', $baseDatos);
$usuario   = envOr('DB_USER', $usuario);
$password  = envOr('DB_PASS', $password);

$conexionBD = "mysql:host=$host;port=$puerto;dbname=$baseDatos;charset=utf8mb4";
