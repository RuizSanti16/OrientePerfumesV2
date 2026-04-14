<?php
/* =============================================================
   api/proveedores.php — CRUD para tbl_proovedores

   Columnas reales:
     id_proovedor (PK), contacto, correo, nombre, telefono
============================================================= */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once '../configuracion/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        /* ── LISTAR ─────────────────────────────────────── */
        case 'GET':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM tbl_proovedores WHERE id_proovedor = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['ok' => true, 'data' => $stmt->fetch()]);
            } else {
                $stmt = $pdo->query("SELECT * FROM tbl_proovedores ORDER BY id_proovedor DESC");
                echo json_encode(['ok' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        /* ── CREAR ──────────────────────────────────────── */
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['nombre'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'El nombre es requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO tbl_proovedores (nombre, contacto, correo, telefono)
                VALUES (:nombre, :contacto, :correo, :telefono)
            ");
            $stmt->execute([
                ':nombre'   => $b['nombre']   ?? '',
                ':contacto' => $b['contacto'] ?? '',
                ':correo'   => $b['correo']   ?? '',
                ':telefono' => $b['telefono'] ?? null
            ]);

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Proveedor creado exitosamente',
                'id'      => $pdo->lastInsertId()
            ]);
            break;

        /* ── ACTUALIZAR ─────────────────────────────────── */
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id_proovedor'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE tbl_proovedores SET
                    nombre   = :nombre,
                    contacto = :contacto,
                    correo   = :correo,
                    telefono = :telefono
                WHERE id_proovedor = :id
            ");
            $stmt->execute([
                ':nombre'   => $b['nombre']   ?? '',
                ':contacto' => $b['contacto'] ?? '',
                ':correo'   => $b['correo']   ?? '',
                ':telefono' => $b['telefono'] ?? null,
                ':id'       => $b['id_proovedor']
            ]);

            echo json_encode(['ok' => true, 'mensaje' => 'Proveedor actualizado']);
            break;

        /* ── ELIMINAR ───────────────────────────────────── */
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM tbl_proovedores WHERE id_proovedor = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Proveedor eliminado']);
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