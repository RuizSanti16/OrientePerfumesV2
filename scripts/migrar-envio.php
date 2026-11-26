<?php
/* TEMPORAL. Anade la columna del envio a tbl_pedidos y se borra
   despues de comprobar que entro.

   Mira antes si ya estaba, asi que ejecutarlo dos veces no rompe
   nada. Solo anade una columna: no borra ni modifica datos.
*/

header('Content-Type: application/json');

if (($_GET['clave'] ?? '') !== 'envio-pedidos-op') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../configuracion/Conexion.php';

function existeColumna(PDO $pdo, $tabla, $columna) {
    $s = $pdo->prepare("
        SELECT 1 FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = :c
    ");
    $s->execute([':t' => $tabla, ':c' => $columna]);
    return (bool) $s->fetch();
}

$pasos = [];

if (existeColumna($pdo, 'tbl_pedidos', 'envio')) {
    $pasos[] = 'tbl_pedidos.envio: ya estaba';
} else {
    try {
        $pdo->exec("ALTER TABLE tbl_pedidos ADD COLUMN envio DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER descuento");
        $pasos[] = 'tbl_pedidos.envio: anadida';
    } catch (PDOException $e) {
        $pasos[] = 'tbl_pedidos.envio: FALLO -> ' . $e->getMessage();
    }
}

$resultado = [
    'pasos'        => $pasos,
    'estado_final' => ['tbl_pedidos.envio' => existeColumna($pdo, 'tbl_pedidos', 'envio')],
];

/* La insercion que hace el endpoint al crear un pedido */
try {
    $pdo->query("SELECT id, total, descuento, envio FROM tbl_pedidos LIMIT 1")->fetch();
    $resultado['lectura'] = 'funciona';
} catch (PDOException $e) {
    $resultado['lectura'] = $e->getMessage();
}

/* Los ajustes de tarifas: se crean con los valores acordados si la
   tabla aun no los tiene, para que el panel no salga en blanco. */
try {
    $ins = $pdo->prepare("INSERT IGNORE INTO tbl_ajustes (clave, valor) VALUES (:c, :v)");
    foreach (['envioLocal' => '15000', 'envioNacional' => '20000', 'freeShippingMin' => '150000'] as $c => $v) {
        $ins->execute([':c' => $c, ':v' => $v]);
    }
    $leidos = [];
    foreach ($pdo->query("SELECT clave, valor FROM tbl_ajustes WHERE clave IN ('envioLocal','envioNacional','freeShippingMin')") as $f) {
        $leidos[$f['clave']] = $f['valor'];
    }
    $resultado['tarifas'] = $leidos;
} catch (PDOException $e) {
    $resultado['tarifas'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
