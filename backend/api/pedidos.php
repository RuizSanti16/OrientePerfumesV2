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

/* Tienda cerrada al publico: responde 503 a quien no traiga sesion
   de administrador. La comprobacion va aqui, en el servidor, porque
   un aviso puesto solo en React no impediria pedir los datos
   directamente a este endpoint. */
require_once __DIR__ . "/../configuracion/mantenimiento.php";
bloquearSiMantenimiento($pdo);

require_once '../configuracion/auth.php';
require_once '../configuracion/precios.php';
require_once __DIR__ . '/../configuracion/cobertura.php';
require_once __DIR__ . '/../configuracion/avisos.php';
require_once __DIR__ . '/../configuracion/inventario.php';

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
        metodo_pago         VARCHAR(40)  DEFAULT 'bold',
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

        /* ── POST: crear pedido (requiere cuenta) ─────────── */
        case 'POST':
            /* Ver la tienda es libre; comprar no. Se comprueba aqui y
               no solo en React porque este endpoint es publico: sin
               esto bastaria llamarlo directamente para pedir sin
               cuenta. Va lo primero, antes incluso de mirar los
               campos, para no trabajar en balde. */
            $idCliente = verificarTokenCliente($pdo);

            $b = json_decode(file_get_contents('php://input'), true);

            /* Recoger en la tienda o envio a domicilio. Cualquier otro
               valor se trata como domicilio, que es lo que no abarata
               nada por error. Se resuelve antes de validar porque de
               ello depende que campos son obligatorios. */
            $entrega = ($b['entrega'] ?? '') === 'tienda' ? 'tienda' : 'domicilio';

            /* La direccion solo hace falta si hay que llevarlo: a
               quien recoge en la tienda no se le pide, y exigirsela
               rechazaba el pedido con "Campo requerido: direccion"
               aunque el formulario ni siquiera mostrara el campo. */
            $required = $entrega === 'tienda'
                ? ['nombre', 'correo', 'items']
                : ['nombre', 'correo', 'direccion', 'items'];
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
            /* La ciudad entra en el calculo porque de ella depende el
               costo del envio, y la entrega porque recoger no lo paga. */
            $calculo = calcularTotalesPedido($pdo, $b['items'], $b['cupon'] ?? null, $b['ciudad'] ?? '', $entrega);
            if (!$calculo['ok']) {
                echo json_encode(['ok' => false, 'mensaje' => $calculo['mensaje']]);
                exit;
            }

            /* El metodo de pago se comprueba igual que el importe, y
               por la misma razon: aqui se guardaba tal cual venia, de
               modo que bastaba enviar 'efectivo' desde cualquier parte
               para llevarse el pedido sin pagar. El efectivo solo vale
               donde se entrega en persona. */
            list($metodoOk, $metodo) = validarMetodoPago(
                $b['metodo_pago'] ?? '',
                $b['ciudad'] ?? '',
                $entrega
            );
            if (!$metodoOk) {
                echo json_encode(['ok' => false, 'mensaje' => $metodo]);
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
                    (codigo_seguimiento, id_cliente, nombre, correo, telefono, direccion, ciudad,
                     notas, estado, total, descuento, envio, cupon, metodo_pago, entrega)
                VALUES
                    (:codigo, :cliente, :nombre, :correo, :tel, :dir, :ciudad,
                     :notas, 'pendiente', :total, :desc, :envio, :cupon, :metodo, :entrega)
            ");
            $ins->execute([
                ':codigo'  => $codigo,
                ':cliente' => $idCliente,
                ':nombre'  => trim($b['nombre']),
                ':correo'  => trim($b['correo']),
                ':tel'     => trim($b['telefono']  ?? ''),
                ':dir'     => trim($b['direccion']),
                ':ciudad'  => trim($b['ciudad']    ?? ''),
                ':notas'   => trim($b['notas']     ?? ''),
                ':total'   => $calculo['total'],
                ':desc'    => $calculo['descuento'],
                ':envio'   => $calculo['envio'],
                ':entrega' => $entrega,
                ':cupon'   => $calculo['cupon'],
                ':metodo'  => $metodo,
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

            /* Descontar inventario.

               Va dentro de la transacción: si falla, el pedido no se
               crea. Lo contrario sería despachar algo que el stock
               nunca registró como salido. */
            moverStockDePedido($pdo, $calculo['items'], -1);

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

            /* Aviso al WhatsApp del negocio. Va despues del commit y
               despues del correo, y no puede tumbar nada: si el envio
               falla, el pedido ya esta guardado y el cliente ve su
               confirmacion igual. */
            avisarWhatsApp(textoPedidoNuevo(
                $codigo,
                trim($b['nombre']),
                $calculo['total'],
                $metodo,
                trim($b['ciudad'] ?? ''),
                $calculo['items']
            ));

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

            /* Cancelar devuelve el stock, y sacar un pedido de
               cancelado vuelve a descontarlo.

               El stock se reserva al confirmar el pedido, asi que un
               pedido cancelado que no lo devolviera dejaria frascos
               apartados para siempre. Se mira el estado anterior para
               no devolver dos veces si se pulsa cancelar sobre un
               pedido ya cancelado. */
            $anterior = $pdo->prepare("SELECT estado FROM tbl_pedidos WHERE id = :id");
            $anterior->execute([':id' => $b['id']]);
            $estadoAnterior = $anterior->fetchColumn();

            $nuevo = $b['estado'];
            $pasaACancelado  = $nuevo === 'cancelado' && $estadoAnterior !== 'cancelado';
            $saleDeCancelado = $estadoAnterior === 'cancelado' && $nuevo !== 'cancelado';

            $pdo->beginTransaction();
            try {
                $pdo->prepare("UPDATE tbl_pedidos SET estado = :e WHERE id = :id")
                    ->execute([':e' => $nuevo, ':id' => $b['id']]);

                if ($pasaACancelado || $saleDeCancelado) {
                    $li = $pdo->prepare("SELECT id_producto, cantidad, presentacion FROM tbl_pedido_items WHERE id_pedido = :id");
                    $li->execute([':id' => $b['id']]);
                    moverStockDePedido($pdo, $li->fetchAll(PDO::FETCH_ASSOC), $pasaACancelado ? 1 : -1);
                }
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollBack();
                throw $e;
            }

            echo json_encode([
                'ok'      => true,
                'mensaje' => $pasaACancelado
                    ? 'Pedido cancelado. El stock se devolvio al inventario.'
                    : 'Estado actualizado',
            ]);
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
    responderErrorServidor($e, basename(__FILE__));
}

require_once '../configuracion/CerrarConexion.php';
?>
