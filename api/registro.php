<?php
/* =============================================================
   api/registro.php
   Registra nuevos clientes en tbl_clientes.

   POST body JSON: { "usuario": "...", "correo": "...", "password": "..." }
============================================================= */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    exit;
}

$body          = json_decode(file_get_contents('php://input'), true);
$loginUsuario  = trim($body['usuario']  ?? '');
$loginCorreo   = trim($body['correo']   ?? '');
$loginPassword = trim($body['password'] ?? '');

// Validaciones
if (empty($loginUsuario)) {
    echo json_encode(['ok' => false, 'mensaje' => 'El nombre de usuario es requerido']);
    exit;
}
if (empty($loginCorreo) || !filter_var($loginCorreo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'mensaje' => 'El correo no es válido']);
    exit;
}
if (strlen($loginPassword) < 6) {
    echo json_encode(['ok' => false, 'mensaje' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

require_once '../configuracion/Conexion.php';

try {
    // Verificar si usuario o correo ya existen
    $check = $pdo->prepare("
        SELECT id_cliente FROM tbl_clientes
        WHERE usuario = :u OR correo = :c
        LIMIT 1
    ");
    $check->execute([':u' => $loginUsuario, ':c' => $loginCorreo]);

    if ($check->fetch()) {
        echo json_encode(['ok' => false, 'mensaje' => 'El usuario o correo ya está registrado']);
        exit;
    }

    // Insertar nuevo cliente
    $hash = password_hash($loginPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO tbl_clientes (nombre, usuario, correo, password)
        VALUES (:nombre, :usuario, :correo, :password)
    ");
    $stmt->execute([
        ':nombre'   => $loginUsuario,
        ':usuario'  => $loginUsuario,
        ':correo'   => $loginCorreo,
        ':password' => $hash
    ]);

    echo json_encode([
        'ok'      => true,
        'mensaje' => 'Cuenta creada exitosamente',
        'usuario' => $loginUsuario
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor: ' . $e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>