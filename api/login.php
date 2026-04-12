<?php
/* =============================================================
   api/login.php — Login de administrador
<<<<<<< HEAD
   Columnas tbl_administrador:
     id_administrador, nombre, usuario, contrasena, telefono, correo
=======
   
   Columnas tbl_administrador:
     id_administrador, contraseña, correo, nombre, telefono, usuario

   POST body JSON: { "usuario": "...", "password": "..." }
   Respuesta:  { "ok": true|false, "nombre", "usuario", "id", "mensaje" }
>>>>>>> db4434afe1d1a01a0e5cec4091a1731fe6d61472
============================================================= */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
<<<<<<< HEAD
    echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    exit;
}

$body          = json_decode(file_get_contents('php://input'), true);
$loginUsuario  = trim($body['usuario']  ?? '');
$loginPassword = trim($body['password'] ?? '');

if (empty($loginUsuario) || empty($loginPassword)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario y contrasena son requeridos']);
=======
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$usuario  = trim($body['usuario']  ?? '');
$password = trim($body['password'] ?? '');

if (empty($usuario) || empty($password)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario y contraseña son requeridos']);
>>>>>>> db4434afe1d1a01a0e5cec4091a1731fe6d61472
    exit;
}

require_once '../configuracion/Conexion.php';

try {
    $stmt = $pdo->prepare("
<<<<<<< HEAD
        SELECT * FROM tbl_administrador
        WHERE usuario = :u OR correo = :u
        LIMIT 1
    ");
    $stmt->execute([':u' => $loginUsuario]);
    $admin = $stmt->fetch();

    if (!$admin) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contrasena incorrectos']);
        exit;
    }

    $col_pass = $admin['contrasena'] ?? '';
    $passOk   = password_verify($loginPassword, $col_pass) || $col_pass === $loginPassword;

    if (!$passOk) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contrasena incorrectos']);
=======
        SELECT id_administrador, nombre, usuario, `contraseña`
        FROM tbl_administrador
        WHERE usuario = :u OR correo = :u
        LIMIT 1
    ");
    $stmt->execute([':u' => $usuario]);
    $admin = $stmt->fetch();

    if (!$admin) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    /* Verificar contraseña: soporta hash y texto plano */
    $passOk = password_verify($password, $admin['contraseña'])
           || $admin['contraseña'] === $password;

    if (!$passOk) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
>>>>>>> db4434afe1d1a01a0e5cec4091a1731fe6d61472
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