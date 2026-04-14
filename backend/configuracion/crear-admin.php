<?php
require_once "Conexion.php";

$nombre   = 'Administrador';
$usuario  = 'admin';
$password = 'admin123';
$correo   = 'admin@orientperfumes.com';
$telefono = 0;

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'>
<style>body{font-family:Arial,sans-serif;max-width:520px;margin:60px auto;padding:20px;}
.ok{color:#4caf50;font-size:22px;font-weight:bold;}
.err{color:#f44336;font-size:18px;}
.warn{color:#ff9800;margin-top:16px;padding:12px;background:#fff3e0;border-left:4px solid #ff9800;}
table{width:100%;border-collapse:collapse;margin-top:16px;}
th,td{padding:8px 12px;border:1px solid #ddd;text-align:left;}
th{background:#f5f5f5;}
</style></head><body>";

try {
    $check = $pdo->prepare("SELECT id_administrador FROM tbl_administrador WHERE usuario = :u LIMIT 1");
    $check->execute([':u' => $usuario]);

    if ($check->fetch()) {
        echo "<p class='err'>El usuario <strong>$usuario</strong> ya existe.</p>";
        echo "<p>Ejecuta primero en phpMyAdmin:<br><code>DELETE FROM tbl_administrador WHERE usuario = 'admin';</code></p>";
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO tbl_administrador (nombre, usuario, contrasena, correo, telefono) VALUES (:nombre, :usuario, :contrasena, :correo, :telefono)");
        $stmt->execute([
            ':nombre'     => $nombre,
            ':usuario'    => $usuario,
            ':contrasena' => $hash,
            ':correo'     => $correo,
            ':telefono'   => $telefono
        ]);

        echo "<p class='ok'>✅ Administrador creado</p>";
        echo "<table>
            <tr><th>Usuario</th><td><strong>$usuario</strong></td></tr>
            <tr><th>Contraseña</th><td><strong>$password</strong></td></tr>
            <tr><th>Correo</th><td>$correo</td></tr>
        </table>";
        echo "<div class='warn'>⚠️ Elimina este archivo después de usarlo.</div>";
    }
} catch (PDOException $e) {
    echo "<p class='err'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
require_once "CerrarConexion.php";
echo "</body></html>";
?>