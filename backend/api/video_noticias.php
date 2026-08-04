<?php
/* =============================================================
   api/video_noticias.php — Video destacado de la seccion de noticias.

   Es una configuracion de una sola fila (id = 1), no una lista.

   GET  (publico) devuelve el video configurado.
   PUT  (admin)   lo actualiza.
============================================================= */
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    verificarTokenAdmin($pdo);
}

try {
    switch ($method) {

        case 'GET':
            $s = $pdo->query("SELECT url, titulo, descripcion, nombre_archivo
                              FROM tbl_video_noticias WHERE id = 1 LIMIT 1");
            $v = $s->fetch();
            /* Si la fila no existe todavia se devuelve la estructura
               vacia, para que el frontend no tenga que distinguir. */
            echo json_encode(['ok' => true, 'data' => $v ?: [
                'url' => '', 'titulo' => '', 'descripcion' => '', 'nombre_archivo' => '',
            ]]);
            break;

        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);

            $s = $pdo->prepare(
                "INSERT INTO tbl_video_noticias (id, url, titulo, descripcion, nombre_archivo)
                 VALUES (1, :url, :titulo, :descripcion, :archivo)
                 ON DUPLICATE KEY UPDATE
                   url = VALUES(url), titulo = VALUES(titulo),
                   descripcion = VALUES(descripcion), nombre_archivo = VALUES(nombre_archivo)"
            );
            $s->execute([
                ':url'         => $b['url']            ?? '',
                ':titulo'      => $b['titulo']         ?? '',
                ':descripcion' => $b['descripcion']    ?? '',
                ':archivo'     => $b['nombre_archivo'] ?? ($b['nombreArchivo'] ?? ''),
            ]);
            echo json_encode(['ok' => true, 'mensaje' => 'Video guardado']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    }

} catch (PDOException $e) {
    error_log('[OrientPerfumes] video_noticias: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}
