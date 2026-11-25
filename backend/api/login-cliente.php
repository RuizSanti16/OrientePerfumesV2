<?php
/* =============================================================
   api/login-cliente.php — Login de clientes
   Columnas tbl_clientes: id_cliente, nombre, usuario, correo,
                          password (nueva), edad, genero
============================================================= */
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

/* Tienda cerrada al publico: responde 503 a quien no traiga sesion de
   administrador. Va antes de validar los campos porque este endpoint
   abre la conexion despues de validarlos, y con el guardian ahi una
   peticion mal formada respondia sin llegar a pasar por el. */
require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/mantenimiento.php';
require_once __DIR__ . '/../configuracion/auth.php';
bloquearSiMantenimiento($pdo);

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

/* La conexion ya se abrio arriba, junto al control de mantenimiento. */


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

    /* Solo bcrypt. Antes habia detras un
       `|| $cliente['password'] === $loginPassword`, que aceptaba la
       clave comparandola en texto plano: cualquier cuenta que hubiera
       quedado sin cifrar entraba asi, y quien consiguiera leer la
       tabla tendria las claves listas para usar. Una cuenta antigua
       sin cifrar ya no entra, y tiene que recuperar su contrasena. */
    $passOk = password_verify($loginPassword, $cliente['password']);

    if (!$passOk) {
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    /* Token de sesion. Sin el, el servidor no podia distinguir a un
       cliente de cualquiera que llamara a la API, y exigir cuenta
       para comprar habria sido un adorno del navegador. */
    $token = generarTokenSesion();
    $pdo->prepare(
        "UPDATE tbl_clientes
            SET token = :t, token_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY)
          WHERE id_cliente = :id"
    )->execute([':t' => $token, ':id' => $cliente['id_cliente']]);

    echo json_encode([
        'ok'      => true,
        'tipo'    => 'cliente',
        'id'      => $cliente['id_cliente'],
        'nombre'  => $cliente['nombre'],
        'usuario' => $cliente['usuario'],
        'correo'  => $cliente['correo'],
        'token'   => $token,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error del servidor']);
}

require_once '../configuracion/CerrarConexion.php';
?>