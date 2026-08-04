<?php
/* =============================================================
   api/carrusel.php — Slides del carrusel de la portada.

   GET  (publico) devuelve los slides ordenados.
   PUT  (admin)   reemplaza el conjunto completo.

   Se reemplaza todo en lugar de actualizar slide a slide porque el
   panel edita los tres a la vez y asi no hay que arrastrar ids ni
   gestionar altas y bajas por separado.
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
            $s = $pdo->query("SELECT id, orden, label, titulo, subtitulo, btn1, btn2, imagen
                              FROM tbl_carrusel ORDER BY orden ASC, id ASC");
            echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            break;

        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            $slides = $b['slides'] ?? null;

            if (!is_array($slides)) {
                echo json_encode(['ok' => false, 'mensaje' => 'Se esperaba una lista de slides']);
                break;
            }

            /* Todo o nada: si algo falla a mitad, no queremos dejar el
               carrusel con la mitad de los slides. */
            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM tbl_carrusel");

            $ins = $pdo->prepare(
                "INSERT INTO tbl_carrusel (orden, label, titulo, subtitulo, btn1, btn2, imagen)
                 VALUES (:orden, :label, :titulo, :subtitulo, :btn1, :btn2, :imagen)"
            );
            $n = 0;
            foreach ($slides as $i => $s) {
                $ins->execute([
                    ':orden'     => $i + 1,
                    ':label'     => $s['label']     ?? '',
                    ':titulo'    => $s['titulo']    ?? '',
                    ':subtitulo' => $s['subtitulo'] ?? '',
                    ':btn1'      => $s['btn1']      ?? '',
                    ':btn2'      => $s['btn2']      ?? '',
                    /* Nunca se guardan imagenes en base64: el panel sube
                       el archivo y aqui solo entra su URL. */
                    ':imagen'    => (isset($s['imagen']) && strpos($s['imagen'], 'data:') !== 0)
                                        ? $s['imagen'] : '',
                ]);
                $n++;
            }
            $pdo->commit();
            echo json_encode(['ok' => true, 'mensaje' => 'Carrusel guardado', 'slides' => $n]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    error_log('[OrientPerfumes] carrusel: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}
