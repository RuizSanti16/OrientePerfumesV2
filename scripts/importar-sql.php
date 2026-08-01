<?php
/* =============================================================
   scripts/importar-sql.php
   Importa un volcado .sql en una base MySQL.

   Existe porque el cliente `mysql` que trae XAMPP es antiguo y no
   sabe autenticarse contra MySQL 8, que usa el plugin
   caching_sha2_password. Falla con:

     ERROR 1045 (28000): Plugin caching_sha2_password could not be
     loaded

   PHP, en cambio, si lo soporta a traves de mysqlnd, asi que sirve
   perfectamente para cargar el volcado.

   USO:
     php scripts/importar-sql.php <url-mysql> <archivo.sql>

   EJEMPLO:
     php scripts/importar-sql.php "mysql://root:clave@host:52341/railway" database/orientperfums.sql

   La URL se puede copiar tal cual de MYSQL_PUBLIC_URL en Railway.
============================================================= */

if (php_sapi_name() !== 'cli') {
    http_response_code(404);
    exit;
}

/* --dry-run analiza el archivo y muestra lo que haria, sin conectar
   ni escribir nada. Sirve para comprobar el volcado antes de tocar la
   base de produccion. */
$args   = array_slice($argv, 1);
$dryRun = in_array('--dry-run', $args, true);
$args   = array_values(array_filter($args, fn($a) => $a !== '--dry-run'));

if ($dryRun) {
    $archivo = $args[0] ?? '';
    $url     = '';
    if ($archivo === '') {
        fwrite(STDERR, "Uso: php scripts/importar-sql.php --dry-run <archivo.sql>\n");
        exit(1);
    }
} else {
    $url     = $args[0] ?? getenv('DATABASE_URL') ?: '';
    $archivo = $args[1] ?? '';

    if ($url === '' || $archivo === '') {
        fwrite(STDERR, "Uso: php scripts/importar-sql.php <url-mysql> <archivo.sql>\n");
        fwrite(STDERR, "     php scripts/importar-sql.php --dry-run <archivo.sql>\n");
        exit(1);
    }
}

if (!is_readable($archivo)) {
    fwrite(STDERR, "No se puede leer el archivo: $archivo\n");
    exit(1);
}

/* ── Descomponer la URL ── */
$p = $dryRun ? ['host' => 'sin-conexion'] : parse_url($url);
if ($p === false || empty($p['host'])) {
    fwrite(STDERR, "La URL no es valida. Debe ser mysql://usuario:clave@host:puerto/base\n");
    exit(1);
}

$pdo = null;

if (!$dryRun) {
    $host   = $p['host'];
    $puerto = $p['port'] ?? 3306;
    $user   = isset($p['user']) ? urldecode($p['user']) : 'root';
    $pass   = isset($p['pass']) ? urldecode($p['pass']) : '';
    $base   = isset($p['path']) ? ltrim($p['path'], '/') : '';

    if ($base === '') {
        fwrite(STDERR, "La URL no indica el nombre de la base de datos.\n");
        exit(1);
    }

    echo "Conectando a $host:$puerto, base '$base'...\n";

    try {
        $pdo = new PDO(
            "mysql:host=$host;port=$puerto;dbname=$base;charset=utf8mb4",
            $user,
            $pass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 30]
        );
    } catch (PDOException $e) {
        fwrite(STDERR, "No se pudo conectar: " . $e->getMessage() . "\n");
        exit(1);
    }

    echo "Conexion correcta. ";
} else {
    echo "MODO PRUEBA: no se conecta ni se escribe nada.\n";
}

echo "Leyendo $archivo...\n";

$sql = file_get_contents($archivo);

/* Algunos editores guardan el archivo con marca BOM al principio, que
   se pegaria a la primera sentencia y la invalidaria. */
$sql = preg_replace('/^\xEF\xBB\xBF/', '', $sql);

/* ── Separar en sentencias ──
   Se recorre caracter a caracter para no partir por un punto y coma
   que este dentro de una cadena de texto, cosa habitual en los
   volcados (descripciones de producto, etc.). */
function separarSentencias($sql) {
    $sentencias = [];
    $actual     = '';
    $enCadena   = false;
    $delim      = '';
    $largo      = strlen($sql);

    for ($i = 0; $i < $largo; $i++) {
        $c = $sql[$i];

        if ($enCadena) {
            $actual .= $c;
            if ($c === '\\') {                   // escape: copiar el siguiente tal cual
                if ($i + 1 < $largo) { $actual .= $sql[++$i]; }
            } elseif ($c === $delim) {
                $enCadena = false;
            }
            continue;
        }

        if ($c === "'" || $c === '"') {
            $enCadena = true;
            $delim    = $c;
            $actual  .= $c;
            continue;
        }

        /* Comentarios de linea.
           En SQL, "--" abre comentario si le sigue un espacio, un
           tabulador o un salto de linea. mysqldump emite lineas con
           "--" a secas como separadores, y exigir "-- " con espacio
           hacia que esas lineas se acumularan y se tragaran la
           sentencia siguiente (por ejemplo los DROP TABLE). */
        $esComentarioLinea = false;
        if ($c === '#') {
            $esComentarioLinea = true;
        } elseif ($c === '-' && ($sql[$i + 1] ?? '') === '-') {
            $sig = $sql[$i + 2] ?? "\n";
            if ($sig === ' ' || $sig === "\t" || $sig === "\n" || $sig === "\r") {
                $esComentarioLinea = true;
            }
        }
        if ($esComentarioLinea) {
            while ($i < $largo && $sql[$i] !== "\n") { $i++; }
            continue;
        }

        /* Comentarios de bloque */
        if ($c === '/' && substr($sql, $i, 2) === '/*') {
            $fin = strpos($sql, '*/', $i);
            $i   = ($fin === false) ? $largo : $fin + 1;
            continue;
        }

        if ($c === ';') {
            $t = trim($actual);
            if ($t !== '') { $sentencias[] = $t; }
            $actual = '';
            continue;
        }

        $actual .= $c;
    }

    $t = trim($actual);
    if ($t !== '') { $sentencias[] = $t; }
    return $sentencias;
}

$sentencias = separarSentencias($sql);
$total      = count($sentencias);
echo "$total sentencias encontradas.\n\n";

if ($dryRun) {
    /* Resumen por tipo de sentencia y aviso de posibles truncados */
    $tipos = [];
    foreach ($sentencias as $s) {
        $primera = strtoupper(strtok(ltrim($s), " \n\t("));
        $tipos[$primera] = ($tipos[$primera] ?? 0) + 1;
    }
    arsort($tipos);
    foreach ($tipos as $tipo => $n) {
        echo "  " . str_pad($tipo, 14) . $n . "\n";
    }
    $sinCerrar = array_filter($sentencias, fn($s) => substr_count($s, "'") % 2 !== 0);
    echo "\nSentencias con comillas descuadradas (deberia ser 0): " . count($sinCerrar) . "\n";
    echo "Sentencia mas larga: " . max(array_map('strlen', $sentencias)) . " caracteres\n";
    exit(0);
}

/* Las claves foraneas impiden crear tablas en cualquier orden. */
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

$ok = 0;
$errores = 0;
foreach ($sentencias as $n => $s) {
    try {
        $pdo->exec($s);
        $ok++;
    } catch (PDOException $e) {
        $errores++;
        $resumen = substr(preg_replace('/\s+/', ' ', $s), 0, 70);
        fwrite(STDERR, "  [" . ($n + 1) . "/$total] ERROR: " . $e->getMessage() . "\n      en: $resumen...\n");
    }
    if (($n + 1) % 10 === 0 || $n + 1 === $total) {
        echo "  procesadas " . ($n + 1) . "/$total\n";
    }
}

$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

echo "\nListo: $ok correctas, $errores con error.\n";

/* ── Resumen de lo importado ── */
$tablas = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
echo count($tablas) . " tablas en la base:\n";
foreach ($tablas as $t) {
    $n = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
    echo "  " . str_pad($t, 30) . $n . " registros\n";
}

exit($errores > 0 ? 1 : 0);
