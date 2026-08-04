<?php
/* =============================================================
   api/lanzamientos.php — Tarjetas de novedades de la portada y de la
   pagina de noticias.

   GET  (publico) devuelve los lanzamientos ordenados.
   PUT  (admin)   reemplaza el conjunto completo.
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
            $s = $pdo->query("SELECT id, orden, nombre, descripcion, badge, imagen
                              FROM tbl_lanzamientos ORDER BY orden ASC, id ASC");
            echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            break;

        case 'PUT':
            $b     = json_decode(file_get_contents('php://input'), true);
            $lista = $b['lanzamientos'] ?? null;

            if (!is_array($lista)) {
                echo json_encode(['ok' => false, 'mensaje' => 'Se esperaba una lista de lanzamientos']);
                break;
            }

            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM tbl_lanzamientos");

            $ins = $pdo->prepare(
                "INSERT INTO tbl_lanzamientos (orden, nombre, descripcion, badge, imagen)
                 VALUES (:orden, :nombre, :descripcion, :badge, :imagen)"
            );
            $n = 0;
            foreach ($lista as $i => $l) {
                $ins->execute([
                    ':orden'       => $i + 1,
                    ':nombre'      => $l['nombre']      ?? '',
                    ':descripcion' => $l['descripcion'] ?? '',
                    ':badge'       => $l['badge']       ?? '',
                    ':imagen'      => (isset($l['imagen']) && strpos($l['imagen'], 'data:') !== 0)
                                          ? $l['imagen'] : '',
                ]);
                $n++;
            }
            $pdo->commit();
            echo json_encode(['ok' => true, 'mensaje' => 'Lanzamientos guardados', 'total' => $n]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    error_log('[OrientPerfumes] lanzamientos: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}
