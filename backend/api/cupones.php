<?php
/* =============================================================
   api/cupones.php
   GET  ?codigo=X&total=Y → validar cupón (público)
   GET  ?admin=1          → listar todos (admin)
   POST                   → crear cupón (admin)
   PUT                    → actualizar (admin)
   DELETE ?id=X           → eliminar (admin)
============================================================= */
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') { http_response_code(200); exit; }

/* Auto-migración: crear tabla si no existe */
$pdo->exec("CREATE TABLE IF NOT EXISTS tbl_cupones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    codigo           VARCHAR(50) UNIQUE NOT NULL,
    tipo             ENUM('porcentaje','fijo') NOT NULL DEFAULT 'porcentaje',
    valor            DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_compra       DECIMAL(10,2) DEFAULT 0,
    usos_max         INT           DEFAULT NULL,
    usos_actuales    INT           DEFAULT 0,
    activo           TINYINT(1)    DEFAULT 1,
    fecha_vencimiento DATE         DEFAULT NULL,
    descripcion      VARCHAR(255)  DEFAULT '',
    fecha_creacion   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)");

try {
    switch ($method) {

        /* ── Validar cupón público o listar todos (admin) ── */
        case 'GET':

            if (isset($_GET['codigo'])) {
                /* Validación pública — no requiere token */
                $codigo = strtoupper(trim($_GET['codigo']));
                $total  = floatval($_GET['total'] ?? 0);

                $s = $pdo->prepare("SELECT * FROM tbl_cupones WHERE UPPER(codigo)=:c AND activo=1");
                $s->execute([':c' => $codigo]);
                $cup = $s->fetch();

                if (!$cup) {
                    echo json_encode(['ok'=>false,'mensaje'=>'Código no válido o inactivo']);
                    break;
                }
                if ($cup['fecha_vencimiento'] && $cup['fecha_vencimiento'] < date('Y-m-d')) {
                    echo json_encode(['ok'=>false,'mensaje'=>'Este cupón ha vencido']);
                    break;
                }
                if ($cup['usos_max'] !== null && (int)$cup['usos_actuales'] >= (int)$cup['usos_max']) {
                    echo json_encode(['ok'=>false,'mensaje'=>'Este cupón ya alcanzó su límite de usos']);
                    break;
                }
                if ($total > 0 && (float)$cup['min_compra'] > 0 && $total < (float)$cup['min_compra']) {
                    $min = number_format((float)$cup['min_compra'], 0, '.', '.');
                    echo json_encode(['ok'=>false,'mensaje'=>"Compra mínima requerida: \$$min COP"]);
                    break;
                }

                $descuento = $cup['tipo'] === 'porcentaje'
                    ? $total * ((float)$cup['valor'] / 100)
                    : min((float)$cup['valor'], $total);

                echo json_encode(['ok'=>true,'data'=>[
                    'codigo'      => $cup['codigo'],
                    'tipo'        => $cup['tipo'],
                    'valor'       => (float)$cup['valor'],
                    'descuento'   => round($descuento, 0),
                    'descripcion' => $cup['descripcion'],
                ]]);
                break;
            }

            /* Listar todos — admin */
            verificarTokenAdmin($pdo);
            $s = $pdo->query("SELECT * FROM tbl_cupones ORDER BY fecha_creacion DESC");
            echo json_encode(['ok'=>true,'data'=>$s->fetchAll()]);
            break;

        /* ── Crear cupón ── */
        case 'POST':
            verificarTokenAdmin($pdo);
            $b = json_decode(file_get_contents('php://input'), true);
            $codigo = strtoupper(trim($b['codigo'] ?? ''));
            if (!$codigo) { echo json_encode(['ok'=>false,'mensaje'=>'El código es requerido']); break; }

            $s = $pdo->prepare("INSERT INTO tbl_cupones
                (codigo,tipo,valor,min_compra,usos_max,activo,fecha_vencimiento,descripcion)
                VALUES (:c,:t,:v,:m,:u,:a,:f,:d)");
            $s->execute([
                ':c' => $codigo,
                ':t' => $b['tipo']  ?? 'porcentaje',
                ':v' => floatval($b['valor']     ?? 0),
                ':m' => floatval($b['min_compra'] ?? 0),
                ':u' => !empty($b['usos_max'])          ? intval($b['usos_max'])          : null,
                ':a' => isset($b['activo'])              ? intval($b['activo'])             : 1,
                ':f' => !empty($b['fecha_vencimiento'])  ? $b['fecha_vencimiento']          : null,
                ':d' => $b['descripcion'] ?? '',
            ]);
            echo json_encode(['ok'=>true,'id'=>$pdo->lastInsertId()]);
            break;

        /* ── Actualizar cupón ── */
        case 'PUT':
            verificarTokenAdmin($pdo);
            $b  = json_decode(file_get_contents('php://input'), true);
            $id = intval($b['id'] ?? 0);
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }

            $s = $pdo->prepare("UPDATE tbl_cupones
                SET codigo=:c,tipo=:t,valor=:v,min_compra=:m,usos_max=:u,
                    activo=:a,fecha_vencimiento=:f,descripcion=:d
                WHERE id=:id");
            $s->execute([
                ':c'  => strtoupper(trim($b['codigo'] ?? '')),
                ':t'  => $b['tipo']  ?? 'porcentaje',
                ':v'  => floatval($b['valor']     ?? 0),
                ':m'  => floatval($b['min_compra'] ?? 0),
                ':u'  => !empty($b['usos_max'])         ? intval($b['usos_max'])         : null,
                ':a'  => isset($b['activo'])             ? intval($b['activo'])            : 1,
                ':f'  => !empty($b['fecha_vencimiento']) ? $b['fecha_vencimiento']         : null,
                ':d'  => $b['descripcion'] ?? '',
                ':id' => $id,
            ]);
            echo json_encode(['ok'=>true]);
            break;

        /* ── Eliminar cupón ── */
        case 'DELETE':
            verificarTokenAdmin($pdo);
            $id = intval($_GET['id'] ?? 0);
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $pdo->prepare("DELETE FROM tbl_cupones WHERE id=:id")->execute([':id'=>$id]);
            echo json_encode(['ok'=>true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok'=>false,'mensaje'=>'Método no permitido']);
    }
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok'=>false,'mensaje'=>$e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>
