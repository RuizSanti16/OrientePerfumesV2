<?php
/* =============================================================
   api/registro.php
   Registra nuevos clientes en tbl_clientes.

   POST body JSON: { "usuario": "...", "correo": "...", "password": "..." }
============================================================= */
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

/* Tienda cerrada al publico: responde 503 a quien no traiga sesion de
   administrador. Va antes de validar los campos porque este endpoint
   abre la conexion despues de validarlos, y con el guardian ahi una
   peticion mal formada respondia sin llegar a pasar por el. No filtraba
   datos, pero el cierre de la tienda no debe depender de la forma que
   tenga la peticion. */
require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/mantenimiento.php';
bloquearSiMantenimiento($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    exit;
}

$body          = json_decode(file_get_contents('php://input'), true);
$loginUsuario  = trim($body['usuario']   ?? '');
$loginCorreo   = trim($body['correo']    ?? '');
$loginPassword = trim($body['password']  ?? '');
$loginTelefono = trim($body['telefono']  ?? '');

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

/* La conexion ya se abrio arriba, junto al control de mantenimiento. */


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
        INSERT INTO tbl_clientes (nombre, usuario, correo, password, telefono)
        VALUES (:nombre, :usuario, :correo, :password, :telefono)
    ");
    $stmt->execute([
        ':nombre'    => $loginUsuario,
        ':usuario'   => $loginUsuario,
        ':correo'    => $loginCorreo,
        ':password'  => $hash,
        ':telefono'  => $loginTelefono
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