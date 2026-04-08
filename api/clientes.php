<?php
/* =============================================================
   api/clientes.php — CRUD para tbl_clientes

   Columnas reales:
     id_cliente (PK), correo, edad, genero, nombre
   
   NOTA: esta tabla no tiene usuario/password, por eso
   el login de clientes no aplica. Esta tabla es solo
   para gestionar la información de clientes.
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
                $stmt = $pdo->prepare("SELECT * FROM tbl_clientes WHERE id_cliente = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['ok' => true, 'data' => $stmt->fetch()]);
            } else {
                $stmt = $pdo->query("SELECT * FROM tbl_clientes ORDER BY id_cliente DESC");
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
                INSERT INTO tbl_clientes (nombre, correo, edad, genero)
                VALUES (:nombre, :correo, :edad, :genero)
            ");
            $stmt->execute([
                ':nombre' => $b['nombre'] ?? '',
                ':correo' => $b['correo'] ?? '',
                ':edad'   => $b['edad']   ?? null,
                ':genero' => $b['genero'] ?? ''
            ]);

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Cliente creado exitosamente',
                'id'      => $pdo->lastInsertId()
            ]);
            break;

        /* ── ACTUALIZAR ─────────────────────────────────── */
        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);

            if (empty($b['id_cliente'])) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE tbl_clientes SET
                    nombre = :nombre,
                    correo = :correo,
                    edad   = :edad,
                    genero = :genero
                WHERE id_cliente = :id
            ");
            $stmt->execute([
                ':nombre' => $b['nombre'] ?? '',
                ':correo' => $b['correo'] ?? '',
                ':edad'   => $b['edad']   ?? null,
                ':genero' => $b['genero'] ?? '',
                ':id'     => $b['id_cliente']
            ]);

            echo json_encode(['ok' => true, 'mensaje' => 'Cliente actualizado']);
            break;

        /* ── ELIMINAR ───────────────────────────────────── */
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM tbl_clientes WHERE id_cliente = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['ok' => true, 'mensaje' => 'Cliente eliminado']);
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