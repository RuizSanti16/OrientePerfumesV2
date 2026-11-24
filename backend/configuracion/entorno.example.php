<?php
/* =============================================================
   entorno.example.php — plantilla de configuracion por archivo.

   PARA QUE SIRVE
   En hosting compartido (Hostinger y similares) no hay forma de
   definir variables de entorno de verdad. SetEnv en el .htaccess deja
   el valor en $_SERVER, pero con PHP como CGI/FastCGI (LiteSpeed, que
   es lo que usa Hostinger) getenv() no siempre lo ve. Este archivo no
   depende de eso.

   COMO USARLO
   1. Copiar este archivo como entorno.php, en esta misma carpeta.
   2. Rellenar los valores con los datos reales del hosting.
   3. Subirlo. NO se versiona: esta en .gitignore porque lleva la
      contrasena de la base de datos.

   Las variables de entorno de verdad, si existen, tienen prioridad
   sobre lo que haya aqui.
============================================================= */

return [
    /* ── Base de datos ──────────────────────────────────────
       En hPanel: Bases de datos > MySQL. Al crear la base te da el
       nombre, el usuario y la contrasena. El host casi siempre es
       'localhost' porque la base vive en el mismo servidor. */
    'DB_HOST' => 'localhost',
    'DB_PORT' => '3306',
    'DB_NAME' => 'uXXXXXXXX_orientperfums',
    'DB_USER' => 'uXXXXXXXX_orient',
    'DB_PASS' => 'la-contrasena-de-la-base',

    /* ── Origenes permitidos para CORS ──────────────────────
       Con la tienda y la API en el mismo dominio no hace falta: las
       peticiones son del mismo origen y el navegador no aplica CORS.
       Se deja por si algun dia la API se sirve desde otro dominio.
         'CORS_ORIGINS' => 'https://tudominio.com,https://www.tudominio.com',

       ── Ruta publica de las subidas ────────────────────────
       Prefijo con el que se construyen las URL de imagenes y videos.
       Con el backend en public_html/api, los archivos quedan bajo
       /api/uploads. Sin barra final. */
    'UPLOADS_BASE_URL' => '/api/uploads',

    /* ── Errores ────────────────────────────────────────────
       '0' en produccion: los detalles van al log del servidor y nunca
       al navegador. Ponerlo a '1' solo para diagnosticar. */
    'APP_DEBUG' => '0',

    /* ── Tienda cerrada al publico ──────────────────────────
       '1' muestra "Proximamente disponible" a los visitantes y hace
       que los endpoints publicos respondan 503. El panel sigue
       funcionando, y quien tenga sesion de administrador ve la tienda
       con normalidad para poder revisarla.

       Se comprueba en el servidor, no solo en React: un aviso puesto
       unicamente en el frontend se saltaria tocando el navegador, y los
       endpoints seguirian entregando productos y precios a quien los
       pidiera directamente.

       '0' reabre la tienda. */
    'MANTENIMIENTO' => '0',

    /* ── Pasarela de pago (Bold) ────────────────────────────
       Las llaves salen de bold.co, seccion Integraciones >
       Llaves de integracion > Boton de pagos. Hay dos juegos, uno de
       pruebas y otro de produccion.

       'pruebas' cobra con tarjetas ficticias; 'produccion' mueve
       dinero de verdad y exige pasar antes el proceso de
       certificacion de Bold.

       La llave de identidad es publica: viaja al navegador y solo
       sirve para identificar el comercio. La secreta no sale nunca de
       aqui: firma el importe que se envia a cobrar y valida los avisos
       que llegan al webhook. Sin ella el cobro no es seguro, porque lo
       primero evita que el cliente elija cuanto paga y lo segundo que
       cualquiera marque pedidos como pagados.

       MODO: 'redirect' envia al cliente a la pagina de Bold y lo trae
       de vuelta; 'embedded' abre la pasarela en una ventana sobre la
       tienda. Conviene empezar por redirect, que depende de menos
       cosas, y cambiarlo despues si se prefiere. */
    'BOLD_ENTORNO'          => 'pruebas',
    'BOLD_LLAVE_IDENTIDAD'  => 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'BOLD_LLAVE_SECRETA'    => 'xxxxxxxxxxxxxxxxxxxxxx',
    'BOLD_MODO'             => 'redirect',
];
