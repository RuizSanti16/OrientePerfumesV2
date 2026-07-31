<?php
/* =============================================================
   api/login.php — Login de administrador
   Columnas tbl_administrador:
     id_administrador, nombre, usuario, contrasena, telefono, correo
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    exit;
}

$body          = json_decode(file_get_contents('php://input'), true);
$loginUsuario  = trim($body['usuario']  ?? '');
$loginPassword = trim($body['password'] ?? '');

if (empty($loginUsuario) || empty($loginPassword)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario y contrasena son requeridos']);
    exit;
}

require_once '../configuracion/Conexion.php';

/* Auto-migración: añadir columnas token si no existen */
try { $pdo->query("SELECT token FROM tbl_administrador LIMIT 1"); }
catch (PDOException $e) {
    $pdo->exec("ALTER TABLE tbl_administrador
                ADD COLUMN token      VARCHAR(64)  NULL DEFAULT NULL,
                ADD COLUMN token_expiry DATETIME   NULL DEFAULT NULL");
}

try {
    $stmt = $pdo->prepare("
        SELECT * FROM tbl_administrador
        WHERE usuario = :u OR correo = :u
        LIMIT 1
    ");
    $stmt->execute([':u' => $loginUsuario]);
    $admin = $stmt->fetch();

    if (!$admin) {
        /* Pequeña demora para dificultar ataques de fuerza bruta por tiempo */
        usleep(300000);
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    $col_pass = $admin['contrasena'] ?? '';

    /* Solo password_verify — sin fallback en texto plano */
    if (!password_verify($loginPassword, $col_pass)) {
        usleep(300000);
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    /* Generar token seguro de 64 caracteres con expiración 24 h */
    $token  = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', time() + 86400);

    $pdo->prepare(
        "UPDATE tbl_administrador SET token = :t, token_expiry = :e WHERE id_administrador = :id"
    )->execute([':t' => $token, ':e' => $expiry, ':id' => $admin['id_administrador']]);

    echo json_encode([
        'ok'      => true,
        'tipo'    => 'admin',
        'nombre'  => $admin['nombre'],
        'usuario' => $admin['usuario'],
        'id'      => $admin['id_administrador'],
        'token'   => $token,
        'expiry'  => $expiry,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}

require_once '../configuracion/CerrarConexion.php';
?>