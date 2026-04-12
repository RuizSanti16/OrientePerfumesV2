<?php
// inspector.php — ver estructura de todas las tablas
// ELIMINAR antes de publicar en producción
require_once "Conexion.php";

$tablas = [
    'tbl_administrador',
    'tbl_clientes',
    'tbl_productos',
    'tbl_proveedores',
    'tbl_inventario',
    'tbl_compras',
    'tbl_detalle_compra',
    'tbl_ventas',
    'tbl_detalle_venta',
    'tbl_ventas_clientes'
];

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'>
<style>
  body { font-family: Arial, sans-serif; background:#1a1a1a; color:#f0f0f0; padding:20px; }
  h2   { color:#C9A84C; border-bottom:1px solid #C9A84C; padding-bottom:6px; }
  h3   { color:#aaa; margin-top:24px; }
  table{ border-collapse:collapse; width:100%; margin-bottom:10px; font-size:13px; }
  th   { background:#333; color:#C9A84C; padding:8px 12px; text-align:left; }
  td   { padding:7px 12px; border-bottom:1px solid #333; }
  .ok  { color:#4caf50; font-weight:bold; }
  .err { color:#f44336; font-weight:bold; }
  .empty { color:#ff9800; }
</style></head><body>";

echo "<h2>🔍 Inspector de Tablas — OrientPerfumes</h2>";

foreach ($tablas as $tabla) {
    echo "<h3>📋 $tabla</h3>";
    try {
        $cols = $pdo->query("DESCRIBE $tabla")->fetchAll();
        echo "<table><tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        foreach ($cols as $c) {
            echo "<tr>
                <td><strong>{$c['Field']}</strong></td>
                <td>{$c['Type']}</td>
                <td>{$c['Null']}</td>
                <td style='color:#C9A84C'>{$c['Key']}</td>
                <td>{$c['Default']}</td>
                <td style='color:#aaa'>{$c['Extra']}</td>
            </tr>";
        }
        echo "</table>";

        $count = $pdo->query("SELECT COUNT(*) FROM $tabla")->fetchColumn();
        if ($count > 0) {
            echo "<p class='ok'>✅ $count registro(s) encontrado(s)</p>";
            // Mostrar primeros 3 registros
            $rows = $pdo->query("SELECT * FROM $tabla LIMIT 3")->fetchAll();
            echo "<table><tr>";
            foreach (array_keys($rows[0]) as $k) echo "<th>$k</th>";
            echo "</tr>";
            foreach ($rows as $row) {
                echo "<tr>";
                foreach ($row as $v) {
                    // Ocultar passwords
                    $display = (stripos($k ?? '', 'pass') !== false || strlen($v ?? '') > 60)
                        ? substr($v ?? '', 0, 40) . '...'
                        : htmlspecialchars($v ?? 'NULL');
                    echo "<td>$display</td>";
                }
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='empty'>⚠️ Tabla vacía</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='err'>❌ Error: " . $e->getMessage() . "</p>";
    }
}

require_once "CerrarConexion.php";
echo "</body></html>";
?>
