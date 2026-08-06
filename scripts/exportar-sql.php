<?php
/* =============================================================
   scripts/exportar-sql.php
   Genera un volcado .sql completo (estructura + datos) de una base
   MySQL, listo para importar en otro hosting.

   Existe por lo mismo que importar-sql.php: mysqldump, el que trae
   XAMPP, es antiguo y no sabe autenticarse contra MySQL 8, que usa
   el plugin caching_sha2_password. PHP si, a traves de mysqlnd.

   El volcado que genera:
   - No lleva CREATE DATABASE ni USE. En hosting compartido la base ya
     existe y tiene un nombre impuesto por el panel (uXXXXXXX_algo),
     asi que un USE con el nombre de origen haria fallar la carga.
   - Desactiva las comprobaciones de clave foranea mientras carga, de
     modo que el orden de las tablas no importe.
   - Conserva el AUTO_INCREMENT de cada tabla.

   USO:
     php scripts/exportar-sql.php <url-mysql> <salida.sql>

   EJEMPLO:
     php scripts/exportar-sql.php "mysql://root:clave@host:52341/railway" respaldo.sql
============================================================= */

if (php_sapi_name() !== 'cli') {
    http_response_code(404);
    exit;
}

$url    = $argv[1] ?? getenv('DATABASE_URL') ?: '';
$salida = $argv[2] ?? '';

if ($url === '' || $salida === '') {
    fwrite(STDERR, "Uso: php scripts/exportar-sql.php <url-mysql> <salida.sql>\n");
    exit(1);
}

$p = parse_url($url);
if ($p === false || empty($p['host'])) {
    fwrite(STDERR, "URL de conexion invalida.\n");
    exit(1);
}

$host   = $p['host'];
$puerto = $p['port'] ?? 3306;
$base   = ltrim($p['path'] ?? '', '/');
$user   = isset($p['user']) ? urldecode($p['user']) : '';
$pass   = isset($p['pass']) ? urldecode($p['pass']) : '';

if ($base === '') {
    fwrite(STDERR, "La URL no indica el nombre de la base de datos.\n");
    exit(1);
}

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$puerto;dbname=$base;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    fwrite(STDERR, "No se pudo conectar: " . $e->getMessage() . "\n");
    exit(1);
}

$fh = fopen($salida, 'wb');
if (!$fh) {
    fwrite(STDERR, "No se puede escribir en: $salida\n");
    exit(1);
}

/* Sin BOM y con NAMES utf8mb4: un BOM al principio rompe la carga en
   algunos importadores, y sin el SET los acentos llegan mal. */
fwrite($fh, "-- Volcado de $base generado por exportar-sql.php\n");
fwrite($fh, "-- Fecha: " . date('Y-m-d H:i:s') . "\n");
fwrite($fh, "-- Sin CREATE DATABASE ni USE: la base destino ya existe.\n\n");
fwrite($fh, "SET NAMES utf8mb4;\n");
fwrite($fh, "SET FOREIGN_KEY_CHECKS = 0;\n");
fwrite($fh, "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n\n");

$tablas = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")
              ->fetchAll(PDO::FETCH_COLUMN);

$totalFilas = 0;

foreach ($tablas as $tabla) {
    $crear = $pdo->query("SHOW CREATE TABLE `$tabla`")->fetch();
    $ddl   = $crear['Create Table'] ?? '';

    fwrite($fh, "-- ---------------------------------------------\n");
    fwrite($fh, "-- Tabla: $tabla\n");
    fwrite($fh, "-- ---------------------------------------------\n");
    fwrite($fh, "DROP TABLE IF EXISTS `$tabla`;\n");
    fwrite($fh, $ddl . ";\n\n");

    $filas = $pdo->query("SELECT * FROM `$tabla`");
    $n     = 0;
    $lote  = [];

    while ($fila = $filas->fetch()) {
        $valores = array_map(function ($v) use ($pdo) {
            if ($v === null)  return 'NULL';
            if (is_int($v))   return (string) $v;
            return $pdo->quote((string) $v);
        }, array_values($fila));

        $lote[] = '(' . implode(',', $valores) . ')';
        $n++;

        /* En lotes para no construir una sola sentencia gigante que
           el importador de destino pueda rechazar por tamano. */
        if (count($lote) >= 200) {
            $cols = '`' . implode('`,`', array_keys($fila)) . '`';
            fwrite($fh, "INSERT INTO `$tabla` ($cols) VALUES\n" . implode(",\n", $lote) . ";\n");
            $lote = [];
        }
    }

    if ($lote) {
        $primera = $pdo->query("SELECT * FROM `$tabla` LIMIT 1")->fetch();
        $cols    = '`' . implode('`,`', array_keys($primera)) . '`';
        fwrite($fh, "INSERT INTO `$tabla` ($cols) VALUES\n" . implode(",\n", $lote) . ";\n");
    }

    fwrite($fh, "\n");
    $totalFilas += $n;
    printf("  %-24s %6d filas\n", $tabla, $n);
}

fwrite($fh, "SET FOREIGN_KEY_CHECKS = 1;\n");
fclose($fh);

echo "\n" . count($tablas) . " tablas, $totalFilas filas.\n";
echo "Escrito en: $salida (" . number_format(filesize($salida)) . " bytes)\n";
