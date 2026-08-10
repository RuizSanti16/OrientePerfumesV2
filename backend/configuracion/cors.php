<?php
/* =============================================================
   configuracion/cors.php
   Cabeceras CORS centralizadas.

   Antes cada endpoint publicaba `Access-Control-Allow-Origin: *`,
   lo que permitía que cualquier web llamara a la API. Aquí sólo se
   responde a los dominios declarados en la variable de entorno
   CORS_ORIGINS (lista separada por comas). Si no está definida se
   asumen los orígenes habituales de desarrollo local.

   Ejemplo en produccion:
     CORS_ORIGINS=https://orientperfumes.com,https://www.orientperfumes.com

   USO (primera línea de cada endpoint):
     require_once __DIR__ . '/../configuracion/cors.php';
============================================================= */

/* Se incluye Configuracion.php para poder usar envOr: getenv() no ve la
   configuracion de entorno.php en hosting compartido, asi que
   CORS_ORIGINS quedaba siempre sin leer. Hoy no se nota porque la tienda
   y la API comparten dominio y no hay CORS de por medio, pero el dia que
   se separen fallaria de forma difícil de relacionar con esta linea. */
require_once __DIR__ . '/Configuracion.php';

$corsEnv = envOr('CORS_ORIGINS', '');

$origenesPermitidos = $corsEnv
    ? array_filter(array_map('trim', explode(',', $corsEnv)))
    : [
        'http://localhost:5173',   // Vite dev server
        'http://localhost:4173',   // Vite preview
        'http://localhost',        // Apache / XAMPP
      ];

$origen = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origen !== '' && in_array($origen, $origenesPermitidos, true)) {
    header('Access-Control-Allow-Origin: ' . $origen);
    /* La respuesta cambia segun el origen: evita que un proxy cachee
       la cabecera de un dominio y se la sirva a otro. */
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
/* El panel admin envia el token en la cabecera Authorization; sin
   declararla aqui el preflight falla en cuanto el frontend y la API
   viven en dominios distintos. */
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

/* El preflight no debe continuar hasta la logica del endpoint. */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
