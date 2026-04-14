<?php
// ver-tabla-admin.php
// Solo para desarrollo — ELIMINAR antes de publicar
require_once "Conexion.php";

echo "<h2 style='font-family:sans-serif'>Estructura de tbl_administrador</h2>";

// Columnas
$cols = $pdo->query("DESCRIBE tbl_administrador")->fetchAll();
echo "<table border='1' cellpadding='8' style='font-family:monospace;border-collapse:collapse'>";
echo "<tr style='background:#333;color:#fff'><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
foreach ($cols as $c) {
    echo "<tr><td>{$c['Field']}</td><td>{$c['Type']}</td><td>{$c['Null']}</td><td>{$c['Key']}</td><td>{$c['Default']}</td></tr>";
}
echo "</table>";

// Datos existentes
echo "<h3 style='font-family:sans-serif;margin-top:20px'>Registros actuales</h3>";
$rows = $pdo->query("SELECT * FROM tbl_administrador")->fetchAll();
if (count($rows) === 0) {
    echo "<p style='font-family:sans-serif;color:red'>⚠️ La tabla está vacía — no hay administradores registrados.</p>";
} else {
    echo "<table border='1' cellpadding='8' style='font-family:monospace;border-collapse:collapse'>";
    echo "<tr style='background:#333;color:#fff'>";
    foreach (array_keys($rows[0]) as $key) echo "<th>$key</th>";
    echo "</tr>";
    foreach ($rows as $row) {
        echo "<tr>";
        foreach ($row as $val) echo "<td>" . htmlspecialchars($val ?? 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

require_once "CerrarConexion.php";
?>