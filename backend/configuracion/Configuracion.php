<?php
/* =============================================================
   Configuracion.php
   Datos de conexión a MySQL.

   Las credenciales se leen de variables de entorno para no quedar
   escritas en el repositorio. Si no están definidas se usan los
   valores por defecto de XAMPP, de modo que el entorno local sigue
   funcionando sin configuración extra.

   En producción define:
     DB_HOST, DB_NAME, DB_USER, DB_PASS   (y opcionalmente DB_PORT)
============================================================= */

function envOr($clave, $porDefecto) {
    $v = getenv($clave);
    return ($v === false || $v === '') ? $porDefecto : $v;
}

$host      = envOr('DB_HOST', 'localhost');
$puerto    = envOr('DB_PORT', '3306');
$baseDatos = envOr('DB_NAME', 'orientperfums');
$usuario   = envOr('DB_USER', 'root');
$password  = envOr('DB_PASS', '');   // En XAMPP local la contraseña está vacía

$conexionBD = "mysql:host=$host;port=$puerto;dbname=$baseDatos;charset=utf8mb4";
