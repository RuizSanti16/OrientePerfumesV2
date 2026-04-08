<?php
/* =============================================================
   crear-admin.php
   Crea el primer administrador en tbl_administrador.

   Columnas reales: id_administrador, contraseña, correo,
                    nombre, telefono, usuario

   INSTRUCCIONES:
   1. Edita los datos abajo (usuario y contraseña)
   2. Abre UNA SOLA VEZ en el navegador
   3. ELIMINA este archivo después
   
   URL: http://localhost/OrientPerfumesV2/configuracion/crear-admin.php
============================================================= */

require_once "Conexion.php";

/* ── Edita estos datos antes de ejecutar ─────────────────── */
$nombre    = 'Administrador';
$usuario   = 'admin';
$password  = 'admin123';          // ← cámbialo por uno seguro
$correo    = 'admin@orientperfumes.com';
$telefono  = '';
/* ────────────────────────────────────────────────────────── */

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'>
<style>
  body  { font-family:Arial,sans-serif; max-width:520px; margin:60px auto; padding:20px; }
  .ok   { color:#4caf50; font-size:22px; font-weight:bold; }
  .err  { color:#f44336; font-size:18px; }
  .warn { color:#ff9800; margin-top:16px; padding:12px; background:#fff3e0; border-left:4px solid #ff9800; }
  table { width:100%; border-collapse:collapse; margin-top:16px; }
  th,td { padding:8px 12px; border:1px solid #ddd; text-align:left; }
  th    { background:#f5f5f5; }
  code  { background:#f4f4f4; padding:2px 6px; border-radius:3px; }
</style></head><body>";

try {
    // Verificar si el usuario ya existe
    $check = $pdo->prepare("
        SELECT id_administrador FROM tbl_administrador
        WHERE usuario = :u LIMIT 1
    ");
    $check->execute([':u' => $usuario]);

    if ($check->fetch()) {
        echo "<p class='err'>⚠️ El usuario <code>$usuario</code> ya existe en la base de datos.</p>";
        echo "<p>Si quieres crear otro admin, cambia el valor de <code>\$usuario</code> en este archivo.</p>";
    } else {
        // Insertar con contraseña hasheada
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("
            INSERT INTO tbl_administrador (nombre, usuario, `contraseña`, correo, telefono)
            VALUES (:nombre, :usuario, :contrasena, :correo, :telefono)
        ");
        $stmt->execute([
            ':nombre'     => $nombre,
            ':usuario'    => $usuario,
            ':contrasena' => $hash,
            ':correo'     => $correo,
            ':telefono'   => $telefono
        ]);

        echo "<p class='ok'>✅ Administrador creado exitosamente</p>";
        echo "<table>
            <tr><th>Campo</th><th>Valor</th></tr>
            <tr><td>Nombre</td><td>$nombre</td></tr>
            <tr><td>Usuario</td><td><strong>$usuario</strong></td></tr>
            <tr><td>Contraseña</td><td><strong>$password</strong></td></tr>
            <tr><td>Correo</td><td>$correo</td></tr>
        </table>";

        echo "<div class='warn'>
            <strong>⚠️ IMPORTANTE:</strong><br>
            1. Guarda bien el usuario y contraseña.<br>
            2. <strong>Elimina este archivo</strong> de tu servidor ahora que ya lo usaste.<br>
            3. Ruta a eliminar: <code>configuracion/crear-admin.php</code>
        </div>";
    }

} catch (PDOException $e) {
    echo "<p class='err'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Verifica que la tabla <code>tbl_administrador</code> exista y tenga las columnas correctas.</p>";
}

require_once "CerrarConexion.php";
echo "</body></html>";
?>