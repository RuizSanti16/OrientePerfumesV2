<?php
/* TEMPORAL. Anade las columnas de color al carrusel y se borra
   despues de comprobar que entraron.

   Mira antes si ya estaban, asi que ejecutarlo dos veces no rompe
   nada. Solo anade columnas: no borra ni modifica datos.
*/

header('Content-Type: application/json');

if (($_GET['clave'] ?? '') !== 'color-carrusel-op') {
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

foreach (['color_titulo', 'color_subtitulo'] as $columna) {
    if (existeColumna($pdo, 'tbl_carrusel', $columna)) {
        $pasos[] = "tbl_carrusel.$columna: ya estaba";
        continue;
    }
    try {
        $pdo->exec("ALTER TABLE tbl_carrusel ADD COLUMN $columna VARCHAR(20) NULL DEFAULT NULL");
        $pasos[] = "tbl_carrusel.$columna: anadida";
    } catch (PDOException $e) {
        $pasos[] = "tbl_carrusel.$columna: FALLO -> " . $e->getMessage();
    }
}

$resultado = [
    'pasos' => $pasos,
    'estado_final' => [
        'color_titulo'    => existeColumna($pdo, 'tbl_carrusel', 'color_titulo'),
        'color_subtitulo' => existeColumna($pdo, 'tbl_carrusel', 'color_subtitulo'),
    ],
];

/* La consulta que hace el endpoint al servir la portada */
try {
    $slides = $pdo->query("SELECT id, orden, label, titulo, subtitulo, btn1, btn2, imagen,
                                  color_titulo, color_subtitulo
                             FROM tbl_carrusel ORDER BY orden ASC, id ASC")->fetchAll();
    $resultado['lectura'] = 'funciona';
    $resultado['slides']  = count($slides);
} catch (PDOException $e) {
    $resultado['lectura'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
