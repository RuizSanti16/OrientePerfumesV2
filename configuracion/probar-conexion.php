<?php
// probar-conexion.php
// Abre este archivo en el navegador para verificar que MySQL funciona.
// URL: http://localhost/OrientPerfumes/Configuracion/probar-conexion.php
// ELIMINA este archivo antes de publicar el sitio en internet.

require_once "Conexion.php";

echo "<h2 style='font-family:sans-serif;color:green'>✅ Conexión exitosa</h2>";
echo "<p style='font-family:sans-serif'>Conectado a la base de datos: <strong>orientperfums</strong></p>";

// Listar las tablas encontradas
$tablas = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "<p style='font-family:sans-serif'>Tablas encontradas:</p><ul style='font-family:monospace'>";
foreach ($tablas as $tabla) {
    echo "<li>" . htmlspecialchars($tabla) . "</li>";
}
echo "</ul>";

require_once "CerrarConexion.php";
?>