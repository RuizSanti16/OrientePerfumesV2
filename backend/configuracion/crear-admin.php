<?php
/* =============================================================
   crear-admin.php — crea un administrador del panel.

   Solo se ejecuta desde la línea de comandos. La versión anterior
   era accesible por navegador y creaba un usuario "admin" con la
   contraseña "admin123" mostrándola en pantalla: cualquiera que
   abriera la URL obtenía acceso total al panel.

   USO:
     php backend/configuracion/crear-admin.php <usuario> <correo> <contrasena>

   Ejemplo:
     php backend/configuracion/crear-admin.php santiago s@correo.com "MiClave.Segura1"
============================================================= */

if (php_sapi_name() !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . "/Conexion.php";

$usuarioNuevo = $argv[1] ?? null;
$correo       = $argv[2] ?? null;
$clave        = $argv[3] ?? null;

if (!$usuarioNuevo || !$correo || !$clave) {
    fwrite(STDERR, "Uso: php crear-admin.php <usuario> <correo> <contrasena>\n");
    exit(1);
}

if (strlen($clave) < 10) {
    fwrite(STDERR, "Error: la contrasena debe tener al menos 10 caracteres.\n");
    exit(1);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Error: el correo no es valido.\n");
    exit(1);
}

try {
    $check = $pdo->prepare("SELECT id_administrador FROM tbl_administrador WHERE usuario = :u LIMIT 1");
    $check->execute([':u' => $usuarioNuevo]);

    if ($check->fetch()) {
        fwrite(STDERR, "Error: el usuario '$usuarioNuevo' ya existe.\n");
        exit(1);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO tbl_administrador (nombre, usuario, contrasena, correo, telefono)
         VALUES (:nombre, :usuario, :contrasena, :correo, 0)"
    );
    $stmt->execute([
        ':nombre'     => $usuarioNuevo,
        ':usuario'    => $usuarioNuevo,
        ':contrasena' => password_hash($clave, PASSWORD_DEFAULT),
        ':correo'     => $correo,
    ]);

    echo "Administrador '$usuarioNuevo' creado correctamente.\n";
} catch (PDOException $e) {
    fwrite(STDERR, "Error de base de datos: " . $e->getMessage() . "\n");
    exit(1);
}
