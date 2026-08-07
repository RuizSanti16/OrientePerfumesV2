<?php
/* =============================================================
   api/login-cliente.php — Login de clientes
   Columnas tbl_clientes: id_cliente, nombre, usuario, correo,
                          password (nueva), edad, genero
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
    echo json_encode(['ok' => false, 'mensaje' => 'Campos requeridos']);
    exit;
}

require_once '../configuracion/Conexion.php';

/* Tienda cerrada al publico: responde 503 a quien no traiga sesion
   de administrador. La comprobacion va aqui, en el servidor, porque
   un aviso puesto solo en React no impediria pedir los datos
   directamente a este endpoint. */
require_once __DIR__ . "/../configuracion/mantenimiento.php";
bloquearSiMantenimiento($pdo);


try {
    $stmt = $pdo->prepare("
        SELECT * FROM tbl_clientes
        WHERE usuario = :u OR correo = :u
        LIMIT 1
    ");
    $stmt->execute([':u' => $loginUsuario]);
    $cliente = $stmt->fetch();

    if (!$cliente) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    if (empty($cliente['password'])) {
        echo json_encode(['ok' => false, 'mensaje' => 'Este usuario no tiene contraseña configurada']);
        exit;
    }

    $passOk = password_verify($loginPassword, $cliente['password'])
           || $cliente['password'] === $loginPassword;

    if (!$passOk) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    echo json_encode([
        'ok'      => true,
        'tipo'    => 'cliente',
        'id'      => $cliente['id_cliente'],
        'nombre'  => $cliente['nombre'],
        'usuario' => $cliente['usuario'],
        'correo'  => $cliente['correo']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}

require_once '../configuracion/CerrarConexion.php';
?>