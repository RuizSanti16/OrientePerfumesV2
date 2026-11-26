<?php
/* =============================================================
   api/testimonios.php — opiniones de clientes sobre la tienda.

   GET            (publico) los aprobados, para la portada.
   GET ?admin=1   (admin)   todos, para moderar.
   POST           (cliente) envia uno nuevo, queda pendiente.
   PUT            (admin)   aprueba o rechaza.
   DELETE         (admin)   borra.

   POR QUE EXISTE
   La portada pedia los testimonios a noticias.php, asi que lo que un
   cliente escribia sobre la tienda caia en la misma tabla que los
   comentarios de las entradas de noticias. Eran la misma cosa con
   dos nombres: se moderaban mezclados, y cualquier comentario
   aprobado en una noticia salia en la portada como testimonio.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once __DIR__ . '/../configuracion/Conexion.php';

require_once __DIR__ . '/../configuracion/mantenimiento.php';
bloquearSiMantenimiento($pdo);

require_once __DIR__ . '/../configuracion/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$esAdmin = isset($_GET['admin']) || in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'DELETE'], true);
if ($esAdmin) {
    verificarTokenAdmin($pdo);
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {

        /* ── GET ──────────────────────────────────────────── */
        case 'GET':
            if (isset($_GET['admin'])) {
                $s = $pdo->query("SELECT * FROM tbl_testimonios ORDER BY fecha DESC");
            } else {
                /* Al publico solo los aprobados, y un numero acotado:
                   la portada muestra unos pocos y no tiene sentido
                   mandarle cientos. */
                $s = $pdo->query("SELECT id, nombre, texto, estrellas, fecha
                                    FROM tbl_testimonios
                                   WHERE estado = 'aprobado'
                                   ORDER BY fecha DESC LIMIT 24");
            }
            echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            break;

        /* ── POST: enviar un testimonio ───────────────────── */
        case 'POST':
            /* Escribir una opinion sobre la tienda exige cuenta: sin
               ella cualquiera podria llenar la portada de texto, y
               ademas una opinion anonima no dice gran cosa. */
            $idCliente = verificarTokenCliente($pdo);

            $b     = json_decode(file_get_contents('php://input'), true);
            $texto = trim((string) ($b['texto'] ?? ''));

            if ($texto === '') {
                echo json_encode(['ok' => false, 'mensaje' => 'Escribe tu opinion.']);
                break;
            }
            if (mb_strlen($texto) > 500) {
                echo json_encode(['ok' => false, 'mensaje' => 'La opinion no puede pasar de 500 caracteres.']);
                break;
            }

            $estrellas = (int) ($b['estrellas'] ?? 5);
            if ($estrellas < 1 || $estrellas > 5) $estrellas = 5;

            /* El nombre sale de la cuenta, no de lo que llegue en la
               peticion: si no, cualquiera firmaria con el nombre de
               otro. */
            $c = $pdo->prepare("SELECT nombre, usuario FROM tbl_clientes WHERE id_cliente = :id");
            $c->execute([':id' => $idCliente]);
            $cliente = $c->fetch();
            $nombre  = trim((string) ($cliente['nombre'] ?: $cliente['usuario'] ?: 'Cliente'));

            /* Uno por cliente a la vez mientras esta pendiente: evita
               que un mismo cliente llene la cola de moderacion. */
            $ya = $pdo->prepare("SELECT COUNT(*) FROM tbl_testimonios WHERE id_cliente = :id AND estado = 'pendiente'");
            $ya->execute([':id' => $idCliente]);
            if ((int) $ya->fetchColumn() > 0) {
                echo json_encode([
                    'ok'      => false,
                    'mensaje' => 'Ya tienes una opinion esperando revision. Te avisaremos cuando se publique.',
                ]);
                break;
            }

            $pdo->prepare("
                INSERT INTO tbl_testimonios (id_cliente, nombre, texto, estrellas, estado)
                VALUES (:cliente, :nombre, :texto, :estrellas, 'pendiente')
            ")->execute([
                ':cliente'   => $idCliente,
                ':nombre'    => $nombre,
                ':texto'     => $texto,
                ':estrellas' => $estrellas,
            ]);

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Gracias. Tu opinion se publicara tras una revision.',
            ]);
            break;

        /* ── PUT: moderar ─────────────────────────────────── */
        case 'PUT':
            $b      = json_decode(file_get_contents('php://input'), true);
            $id     = (int) ($b['id'] ?? 0);
            $estado = (string) ($b['estado'] ?? '');

            if ($id <= 0 || !in_array($estado, ['pendiente', 'aprobado', 'rechazado'], true)) {
                echo json_encode(['ok' => false, 'mensaje' => 'Datos no validos']);
                break;
            }
            $pdo->prepare("UPDATE tbl_testimonios SET estado = :e WHERE id = :id")
                ->execute([':e' => $estado, ':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Testimonio actualizado']);
            break;

        /* ── DELETE ───────────────────────────────────────── */
        case 'DELETE':
            $id = (int) ($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                break;
            }
            $pdo->prepare("DELETE FROM tbl_testimonios WHERE id = :id")->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Testimonio eliminado']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    responderErrorServidor($e, basename(__FILE__));
}

require_once __DIR__ . '/../configuracion/CerrarConexion.php';
