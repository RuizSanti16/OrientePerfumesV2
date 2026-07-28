<?php
/* =============================================================
   api/noticias.php — Comentarios con moderación

   GET  ?estado=aprobado        → comentarios aprobados (público)
   GET  ?admin=1                → todos los comentarios (admin)
   POST                         → enviar comentario (público, queda pendiente)
   PUT  { id, estado }          → aprobar / rechazar (admin)
   DELETE ?id=X                 → eliminar (admin)
============================================================= */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$isAdmin = isset($_GET['admin']) || in_array($method, ['PUT', 'DELETE']);

/* Solo las escrituras de admin y la lectura admin requieren token */
if ($isAdmin && $method !== 'GET') {
    verificarTokenAdmin($pdo);
} elseif ($method === 'GET' && isset($_GET['admin'])) {
    verificarTokenAdmin($pdo);
}

/* ── Auto-migración: crear tabla y columnas opcionales ── */
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tbl_comentarios_noticias (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            nombre      VARCHAR(100) NOT NULL,
            texto       TEXT         NOT NULL,
            estado      ENUM('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
            fecha       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
} catch (PDOException $e) {}

try { $pdo->exec("ALTER TABLE tbl_comentarios_noticias ADD COLUMN id_cliente INT NULL"); } catch (PDOException $e) {}
try { $pdo->exec("ALTER TABLE tbl_comentarios_noticias ADD COLUMN estrellas TINYINT NOT NULL DEFAULT 5"); } catch (PDOException $e) {}

try {
    switch ($method) {

        /* ── GET: listar comentarios ── */
        case 'GET':
            if (isset($_GET['admin'])) {
                /* Admin: todos, ordenados por fecha descendente, pendientes primero */
                $s = $pdo->query("
                    SELECT * FROM tbl_comentarios_noticias
                    ORDER BY
                        FIELD(estado, 'pendiente', 'aprobado', 'rechazado'),
                        fecha DESC
                ");
            } else {
                /* Público: solo aprobados */
                $s = $pdo->query("
                    SELECT id, nombre, texto, estrellas, fecha
                    FROM tbl_comentarios_noticias
                    WHERE estado = 'aprobado'
                    ORDER BY fecha DESC
                ");
            }
            echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            break;

        /* ── POST: enviar nuevo comentario (queda pendiente) ── */
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            $nombre     = trim($b['nombre']     ?? '');
            $texto      = trim($b['texto']      ?? '');
            $id_cliente = intval($b['id_cliente'] ?? 0);
            $estrellas  = max(1, min(5, intval($b['estrellas'] ?? 5)));

            if (!$nombre || !$texto) {
                echo json_encode(['ok' => false, 'mensaje' => 'Nombre y comentario requeridos']);
                exit;
            }
            if (mb_strlen($nombre) > 100 || mb_strlen($texto) > 1000) {
                echo json_encode(['ok' => false, 'mensaje' => 'Texto demasiado largo']);
                exit;
            }

            /* Verificar que el cliente existe si se proporcionó id_cliente */
            if ($id_cliente > 0) {
                $check = $pdo->prepare("SELECT id_cliente FROM tbl_clientes WHERE id_cliente = :id LIMIT 1");
                $check->execute([':id' => $id_cliente]);
                if (!$check->fetch()) {
                    echo json_encode(['ok' => false, 'mensaje' => 'Cliente no encontrado']);
                    exit;
                }
            }

            $s = $pdo->prepare("
                INSERT INTO tbl_comentarios_noticias (nombre, texto, id_cliente, estrellas)
                VALUES (:nombre, :texto, :id_cliente, :estrellas)
            ");
            $s->execute([
                ':nombre'     => $nombre,
                ':texto'      => $texto,
                ':id_cliente' => $id_cliente > 0 ? $id_cliente : null,
                ':estrellas'  => $estrellas,
            ]);
            echo json_encode(['ok' => true, 'mensaje' => 'Comentario enviado. Será visible tras la revisión del equipo.']);
            break;

        /* ── PUT: cambiar estado (admin) ── */
        case 'PUT':
            verificarTokenAdmin($pdo);
            $b  = json_decode(file_get_contents('php://input'), true);
            $id = intval($b['id'] ?? 0);
            $estado = $b['estado'] ?? '';

            if (!$id || !in_array($estado, ['aprobado', 'rechazado', 'pendiente'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'Datos inválidos']);
                exit;
            }
            $pdo->prepare("UPDATE tbl_comentarios_noticias SET estado = :e WHERE id = :id")
                ->execute([':e' => $estado, ':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Estado actualizado']);
            break;

        /* ── DELETE: eliminar (admin) ── */
        case 'DELETE':
            verificarTokenAdmin($pdo);
            $id = intval($_GET['id'] ?? 0);
            if (!$id) { echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']); exit; }
            $pdo->prepare("DELETE FROM tbl_comentarios_noticias WHERE id = :id")
                ->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Comentario eliminado']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>
