<?php
/* =============================================================
    api/login.php — Login de administrador

    Columnas tbl_administrador:
    id_administrador, contraseña, correo, nombre, telefono, usuario

    POST body JSON: { "usuario": "...", "password": "..." }
    Respuesta:  { "ok": true|false, "nombre", "usuario", "id", "mensaje" }
============================================================= */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$body          = json_decode(file_get_contents('php://input'), true);
$loginUsuario  = trim($body['usuario']  ?? '');
$loginPassword = trim($body['password'] ?? '');

if (empty($loginUsuario) || empty($loginPassword)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario y contraseña son requeridos']);
    exit;
}

require_once '../configuracion/Conexion.php';

try {
    $stmt = $pdo->prepare("
        SELECT id_administrador, nombre, usuario, `contraseña`
        FROM tbl_administrador
        WHERE usuario = :u OR correo = :u
        LIMIT 1
    ");
    $stmt->execute([':u' => $loginUsuario]);
    $admin = $stmt->fetch();

    if (!$admin) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    /* Verificar contraseña: soporta hash y texto plano */
    $passOk = password_verify($loginPassword, $admin['contraseña'])
           || $admin['contraseña'] === $loginPassword;

    if (!$passOk) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    echo json_encode([
        'ok'      => true,
        'tipo'    => 'admin',
        'nombre'  => $admin['nombre'],
        'usuario' => $admin['usuario'],
        'id'      => $admin['id_administrador']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}

require_once '../configuracion/CerrarConexion.php';
?>
