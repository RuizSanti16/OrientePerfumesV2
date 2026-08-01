<?php
/* =============================================================
   Conexion.php
   Abre la conexión PDO a MySQL usando los datos de Configuracion.php
============================================================= */

require_once __DIR__ . "/Configuracion.php";

try {
    $pdo = new PDO($conexionBD, $usuario, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    /* NO activar PDO::ATTR_EMULATE_PREPARES = false.
       Con preparadas nativas MySQL no admite reutilizar el mismo
       marcador con nombre, y varias consultas del proyecto lo hacen
       (por ejemplo login.php: "WHERE usuario = :u OR correo = :u").
       Activarlo rompe el login con SQLSTATE[HY093] Invalid parameter
       number. Las preparadas emuladas siguen parametrizando de forma
       segura al declarar charset=utf8mb4 en el DSN. */
} catch (PDOException $e) {
    /* El mensaje de PDO incluye host, usuario y nombre de la base:
       se registra en el log del servidor pero nunca se envía al
       cliente. En local (APP_DEBUG=1) sí se muestra para poder
       diagnosticar. */
    error_log('[OrientPerfumes] Error de conexion: ' . $e->getMessage());

    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "error"   => true,
        "mensaje" => getenv('APP_DEBUG') === '1'
            ? "Error de conexión: " . $e->getMessage()
            : "No se pudo conectar con la base de datos.",
    ]);
    exit;
}
