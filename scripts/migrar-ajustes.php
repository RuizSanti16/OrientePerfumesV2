<?php
/* TEMPORAL. Crea la tabla de ajustes y se borra despues de
   comprobar que entro.

   CREATE TABLE IF NOT EXISTS, asi que ejecutarlo dos veces no rompe
   nada. No toca ninguna tabla existente ni borra datos.
*/

header('Content-Type: application/json');

if (($_GET['clave'] ?? '') !== 'ajustes-tienda-op') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../configuracion/Conexion.php';

$pasos = [];

function existeTabla(PDO $pdo, $tabla) {
    $s = $pdo->prepare("
        SELECT 1 FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t
    ");
    $s->execute([':t' => $tabla]);
    return (bool) $s->fetch();
}

$yaEstaba = existeTabla($pdo, 'tbl_ajustes');

if ($yaEstaba) {
    $pasos[] = 'tbl_ajustes: ya estaba';
} else {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS tbl_ajustes (
                clave       VARCHAR(60)  NOT NULL PRIMARY KEY,
                valor       TEXT         NULL DEFAULT NULL,
                actualizado DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
        $pasos[] = 'tbl_ajustes: creada';
    } catch (PDOException $e) {
        $pasos[] = 'tbl_ajustes: FALLO -> ' . $e->getMessage();
    }
}

$resultado = [
    'pasos'        => $pasos,
    'estado_final' => ['tbl_ajustes' => existeTabla($pdo, 'tbl_ajustes')],
];

/* Las dos operaciones que de verdad va a hacer el endpoint */
try {
    $pdo->prepare("
        INSERT INTO tbl_ajustes (clave, valor) VALUES (:c, :v)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
    ")->execute([':c' => '__prueba__', ':v' => 'ok']);
    $leido = $pdo->query("SELECT valor FROM tbl_ajustes WHERE clave = '__prueba__'")->fetchColumn();
    $pdo->exec("DELETE FROM tbl_ajustes WHERE clave = '__prueba__'");
    $resultado['escritura_y_lectura'] = ($leido === 'ok') ? 'funciona' : "devolvio: $leido";
} catch (PDOException $e) {
    $resultado['escritura_y_lectura'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
