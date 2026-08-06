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
];
