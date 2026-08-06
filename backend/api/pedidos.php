<?php
/* =============================================================
   api/pedidos.php — Gestión de pedidos de la tienda

   AUTO-MIGRA:
     tbl_pedidos(id, codigo_seguimiento, nombre, correo, telefono,
                 direccion, ciudad, notas, estado, total, descuento,
                 cupon, metodo_pago, fecha_pedido)
     tbl_pedido_items(id, id_pedido, id_producto, nombre_producto,
                      cantidad, precio_unitario, presentacion)

   Métodos:
     GET  ?codigo=X      → seguimiento público (sin token)
     GET  (admin)        → listar todos / ?id=X para uno
     POST (público)      → crear pedido (devuelve codigo_seguimiento)
     PUT  (admin)        → actualizar estado
     DELETE (admin)      → eliminar pedido
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
require_once '../configuracion/precios.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

/* ── Auto-migración de tablas ─────────────────────────────── */
$pdo->exec("
    CREATE TABLE IF NOT EXISTS tbl_pedidos (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        codigo_seguimiento  VARCHAR(12) UNIQUE NOT NULL,
        nombre              VARCHAR(120) NOT NULL,
        correo              VARCHAR(120) NOT NULL,
        telefono            VARCHAR(30)  DEFAULT '',
        direccion           TEXT         NOT NULL,
        ciudad              VARCHAR(80)  DEFAULT '',
        notas               TEXT         DEFAULT NULL,
        estado              ENUM('pendiente','preparacion','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
        total               DECIMAL(12,2) NOT NULL DEFAULT 0,
        descuento           DECIMAL(12,2) NOT NULL DEFAULT 0,
        cupon               VARCHAR(30)  DEFAULT NULL,
        metodo_pago         VARCHAR(40)  DEFAULT 'contraentrega',
        fecha_pedido        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS tbl_pedido_items (
        id                INT AUTO_INCREMENT PRIMARY KEY,
        id_pedido         INT NOT NULL,
        id_producto       INT DEFAULT NULL,
        nombre_producto   VARCHAR(200) NOT NULL,
        cantidad          INT NOT NULL DEFAULT 1,
        precio_unitario   DECIMAL(12,2) NOT NULL DEFAULT 0,
        presentacion      VARCHAR(80)  DEFAULT NULL,
        FOREIGN KEY (id_pedido) REFERENCES tbl_pedidos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

/* ── Helper: generar código de seguimiento ──────────────── */
function generarCodigo() {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code  = 'OP';
    for ($i = 0; $i < 8; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

/* ── Helper: obtener pedido con items ─────────────────────── */
function obtenerPedidoCompleto(PDO $pdo, $where, array $params) {
    $stmt = $pdo->prepare("SELECT * FROM tbl_pedidos WHERE {$where}");
    $stmt->execute($params);
    $pedido = $stmt->fetch();
    if (!$pedido) return null;

    $items = $pdo->prepare("SELECT * FROM tbl_pedido_items WHERE id_pedido = :id");
    $items->execute([':id' => $pedido['id']]);
    $pedido['items'] = $items->fetchAll();
    return $pedido;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        /* ── GET ─────────────────────────────────────────── */
        case 'GET':
            $codigo = $_GET['codigo'] ?? null;
            $id     = $_GET['id']     ?? null;

            /* Seguimiento público — no requiere token */
            if ($codigo) {
                $pedido = obtenerPedidoCompleto($pdo, 'codigo_seguimiento = :c', [':c' => strtoupper(trim($codigo))]);
                if (!$pedido) {
                    echo json_encode(['ok' => false, 'mensaje' => 'Pedido no encontrado']);
                    exit;
                }
                echo json_encode(['ok' => true, 'data' => $pedido]);
                exit;
            }

            /* Admin: requiere token */
            verificarTokenAdmin($pdo);

            if ($id) {
                $pedido = obtenerPedidoCompleto($pdo, 'id = :id', [':id' => $id]);
                if (!$pedido) {
                    echo json_encode(['ok' => false, 'mensaje' => 'Pedido no encontrado']);
                    exit;
                }
                echo json_encode(['ok' => true, 'data' => $pedido]);
            } else {
                $stmt = $pdo->query("SELECT * FROM tbl_pedidos ORDER BY id DESC");
                echo json_encode(['ok' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        /* ── POST: crear pedido (público) ─────────────────── */
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);

            $required = ['nombre', 'correo', 'direccion', 'items'];
            foreach ($required as $f) {
                if (empty($b[$f])) {
                    echo json_encode(['ok' => false, 'mensaje' => "Campo requerido: {$f}"]);
                    exit;
                }
            }

            /* El importe se calcula aquí, con los precios de la base.
               Antes se guardaba el total que enviaba el navegador, lo
               que permitiría pagar 1 peso por un pedido de 500.000 en
               cuanto haya una pasarela cobrando de verdad. Del cliente
               solo se acepta qué producto y cuántas unidades. */
            $calculo = calcularTotalesPedido($pdo, $b['items'], $b['cupon'] ?? null);
            if (!$calculo['ok']) {
                echo json_encode(['ok' => false, 'mensaje' => $calculo['mensaje']]);
                exit;
            }

            /* Generar código único */
            $codigo = '';
            do {
                $codigo = generarCodigo();
                $check  = $pdo->prepare("SELECT id FROM tbl_pedidos WHERE codigo_seguimiento = :c");
                $check->execute([':c' => $codigo]);
            } while ($check->fetch());

            $pdo->beginTransaction();

            /* Insertar pedido */
            $ins = $pdo->prepare("
                INSERT INTO tbl_pedidos
                    (codigo_seguimiento, nombre, correo, telefono, direccion, ciudad,
                     notas, estado, total, descuento, cupon, metodo_pago)
                VALUES
                    (:codigo, :nombre, :correo, :tel, :dir, :ciudad,
                     :notas, 'pendiente', :total, :desc, :cupon, :metodo)
            ");
            $ins->execute([
                ':codigo'  => $codigo,
                ':nombre'  => trim($b['nombre']),
                ':correo'  => trim($b['correo']),
                ':tel'     => trim($b['telefono']  ?? ''),
                ':dir'     => trim($b['direccion']),
                ':ciudad'  => trim($b['ciudad']    ?? ''),
                ':notas'   => trim($b['notas']     ?? ''),
                ':total'   => $calculo['total'],
                ':desc'    => $calculo['descuento'],
                ':cupon'   => $calculo['cupon'],
                ':metodo'  => $b['metodo_pago'] ?? 'contraentrega',
            ]);
            $idPedido = $pdo->lastInsertId();

            /* Insertar items */
            $insItem = $pdo->prepare("
                INSERT INTO tbl_pedido_items
                    (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, presentacion)
                VALUES (:pid, :iprod, :nombre, :cant, :precio, :pres)
            ");
            /* Las líneas también salen del cálculo: nombre y precio se
               toman de tbl_productos, no de lo que llegó. */
            foreach ($calculo['items'] as $item) {
                $insItem->execute([
                    ':pid'    => $idPedido,
                    ':iprod'  => $item['id_producto'],
                    ':nombre' => $item['nombre'],
                    ':cant'   => $item['cantidad'],
                    ':precio' => $item['precio_unitario'],
                    ':pres'   => $item['presentacion'],
                ]);
            }

            $pdo->commit();

            /* Enviar confirmación por email (no-fatal).

               El try/catch no bastaba: mail() no lanza una excepción
               cuando no puede conectar con el servidor de correo, sino
               que emite un warning de PHP. Ese warning se imprimía
               antes del JSON y dejaba la respuesta ilegible, de modo
               que el cliente veía un error pese a que el pedido sí se
               había creado, y era probable que volviera a comprar. Con
               @ se silencia la salida y se mira el valor devuelto; el
               fallo queda en el log del servidor. */
            $asunto   = "Pedido Orient Perfumes #{$codigo}";
            $cuerpo   = "Hola {$b['nombre']},\n\nTu pedido ha sido recibido correctamente.\n\n";
            $cuerpo  .= "Código de seguimiento: {$codigo}\n";
            $cuerpo  .= "Puedes consultar el estado en: " . ($_SERVER['HTTP_ORIGIN'] ?? 'https://orientperfumes.com') . "/seguimiento/{$codigo}\n\n";
            $cuerpo  .= "Total: $" . number_format($calculo['total'], 0, ',', '.') . "\n";
            $cuerpo  .= "\nGracias por tu compra.\nOrient Perfumes";

            $headers  = "From: no-reply@orientperfumes.com\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

            if (!@mail(trim($b['correo']), $asunto, $cuerpo, $headers)) {
                error_log("[OrientPerfumes] No se pudo enviar el correo del pedido {$codigo}");
            }

            echo json_encode([
                'ok'     => true,
                'mensaje' => 'Pedido creado exitosamente',
                'codigo'  => $codigo,
                'id'      => $idPedido,
            ]);
            break;

        /* ── PUT: actualizar estado (admin) ────────────────── */
        case 'PUT':
            verificarTokenAdmin($pdo);
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }

            $estados = ['pendiente', 'preparacion', 'enviado', 'entregado', 'cancelado'];
            if (!empty($b['estado']) && !in_array($b['estado'], $estados)) {
                echo json_encode(['ok' => false, 'mensaje' => 'Estado inválido']);
                exit;
            }

            $upd = $pdo->prepare("UPDATE tbl_pedidos SET estado = :e WHERE id = :id");
            $upd->execute([':e' => $b['estado'], ':id' => $b['id']]);

            echo json_encode(['ok' => true, 'mensaje' => 'Estado actualizado']);
            break;

        /* ── DELETE (admin) ───────────────────────────────── */
        case 'DELETE':
            verificarTokenAdmin($pdo);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $pdo->prepare("DELETE FROM tbl_pedidos WHERE id = :id")->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Pedido eliminado']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>
