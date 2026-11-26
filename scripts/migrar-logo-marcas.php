<?php
/* TEMPORAL. Anade la columna del logo a tbl_marcas y se borra
   despues de comprobar que entro.

   Mira antes si ya estaba, asi que ejecutarlo dos veces no rompe
   nada. Solo anade una columna: no borra ni modifica datos, y no
   hace MODIFY sobre ninguna columna, que es lo que MySQL 8 rechaza
   cuando hay una foranea de por medio.
*/

header('Content-Type: application/json');

if (($_GET['clave'] ?? '') !== 'logo-marcas-op') {
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

if (existeColumna($pdo, 'tbl_marcas', 'logo')) {
    $pasos[] = 'tbl_marcas.logo: ya estaba';
} else {
    try {
        $pdo->exec("ALTER TABLE tbl_marcas ADD COLUMN logo VARCHAR(500) NULL DEFAULT NULL AFTER nombre");
        $pasos[] = 'tbl_marcas.logo: anadida';
    } catch (PDOException $e) {
        $pasos[] = 'tbl_marcas.logo: FALLO -> ' . $e->getMessage();
    }
}

$resultado = [
    'pasos'        => $pasos,
    'estado_final' => ['tbl_marcas.logo' => existeColumna($pdo, 'tbl_marcas', 'logo')],
];

/* Las dos consultas que va a hacer el panel, con los nombres reales */
try {
    $marcas = $pdo->query("SELECT id_marca, nombre, logo FROM tbl_marcas ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
    $resultado['lectura']       = 'funciona';
    $resultado['marcas_total']  = count($marcas);
    $resultado['marcas_con_logo'] = count(array_filter($marcas, fn($m) => !empty($m['logo'])));
} catch (PDOException $e) {
    $resultado['lectura'] = $e->getMessage();
}

/* Escritura y vuelta atras, sobre la primera marca, sin dejar rastro */
try {
    if (!empty($marcas)) {
        $id    = $marcas[0]['id_marca'];
        $antes = $marcas[0]['logo'];
        $pdo->prepare("UPDATE tbl_marcas SET logo = :l WHERE id_marca = :id")
            ->execute([':l' => '__prueba__', ':id' => $id]);
        $leido = $pdo->query("SELECT logo FROM tbl_marcas WHERE id_marca = $id")->fetchColumn();
        $pdo->prepare("UPDATE tbl_marcas SET logo = :l WHERE id_marca = :id")
            ->execute([':l' => $antes, ':id' => $id]);
        $resultado['escritura'] = ($leido === '__prueba__') ? 'funciona (y se dejo como estaba)' : "devolvio: $leido";
    }
} catch (PDOException $e) {
    $resultado['escritura'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
