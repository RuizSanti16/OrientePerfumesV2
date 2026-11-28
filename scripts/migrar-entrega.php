<?php
/* TEMPORAL. Anade la columna de tipo de entrega a tbl_pedidos y se
   borra despues de comprobar que entro.

   Mira antes si ya estaba, asi que ejecutarlo dos veces no rompe
   nada. Solo anade una columna: no borra ni modifica datos.
*/

header('Content-Type: application/json');

if (($_GET['clave'] ?? '') !== 'entrega-pedidos-op') {
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

if (existeColumna($pdo, 'tbl_pedidos', 'entrega')) {
    $pasos[] = 'tbl_pedidos.entrega: ya estaba';
} else {
    try {
        $pdo->exec("ALTER TABLE tbl_pedidos ADD COLUMN entrega VARCHAR(20) NOT NULL DEFAULT 'domicilio' AFTER ciudad");
        $pasos[] = 'tbl_pedidos.entrega: anadida';
    } catch (PDOException $e) {
        $pasos[] = 'tbl_pedidos.entrega: FALLO -> ' . $e->getMessage();
    }
}

$resultado = [
    'pasos'        => $pasos,
    'estado_final' => ['tbl_pedidos.entrega' => existeColumna($pdo, 'tbl_pedidos', 'entrega')],
];

/* La consulta que hace el endpoint al crear un pedido */
try {
    $pdo->query("SELECT id, entrega, envio, total FROM tbl_pedidos LIMIT 1")->fetch();
    $resultado['lectura'] = 'funciona';
} catch (PDOException $e) {
    $resultado['lectura'] = $e->getMessage();
}

/* El inventario, que es lo otro que entra en este despliegue: se
   comprueba que la tabla esta donde se espera y cuantos productos
   tienen fila. */
try {
    $resultado['inventario'] = [
        'filas'     => (int) $pdo->query("SELECT COUNT(*) FROM tbl_inventario")->fetchColumn(),
        'productos' => (int) $pdo->query("SELECT COUNT(*) FROM tbl_productos")->fetchColumn(),
    ];
} catch (PDOException $e) {
    $resultado['inventario'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
