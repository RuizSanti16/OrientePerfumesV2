<?php
/* =============================================================
   api/estado.php — dice si la tienda esta abierta.

   Lo consulta el frontend al arrancar para decidir si muestra la
   tienda o el aviso de "proximamente". Es el unico endpoint que no
   se bloquea durante el mantenimiento, por motivos obvios: es quien
   informa de que hay mantenimiento.

   No revela nada: solo si esta cerrada y si quien pregunta trae una
   sesion de administrador. Con la tienda abierta responde lo mismo
   para todos.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/mantenimiento.php';

$cerrada = enMantenimiento();

echo json_encode([
    'ok'            => true,
    'mantenimiento' => $cerrada,
    /* Solo se comprueba la sesion si hace falta decidir algo: con la
       tienda abierta, preguntarlo seria una consulta a la base en cada
       carga de pagina sin ningun efecto sobre la respuesta. */
    'es_admin'      => $cerrada ? esAdminAutenticado($pdo) : false,
]);
