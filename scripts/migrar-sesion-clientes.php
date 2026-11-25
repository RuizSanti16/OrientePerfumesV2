<?php
/* TEMPORAL. Aplica la migracion de sesion de clientes y se borra
   despues de comprobar que entro.

   Va paso a paso y mira antes de cada uno si ya estaba hecho, de modo
   que ejecutarlo dos veces no rompe nada. Informa de cada paso por
   separado: si algo falla se ve cual y por que, en vez de quedar la
   duda de si la migracion entro entera o a medias.

   Solo anade columnas, indices y una clave foranea. No borra ni
   modifica datos, y no hace MODIFY sobre ninguna columna, que es lo
   que MySQL 8 rechaza cuando hay una foranea de por medio.
*/

header('Content-Type: application/json');

if (($_GET['clave'] ?? '') !== 'sesion-clientes-op') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../configuracion/Conexion.php';

$pasos = [];

function existeColumna(PDO $pdo, $tabla, $columna) {
    $s = $pdo->prepare("
        SELECT 1 FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = :c
    ");
    $s->execute([':t' => $tabla, ':c' => $columna]);
    return (bool) $s->fetch();
}

function existeIndice(PDO $pdo, $tabla, $indice) {
    $s = $pdo->prepare("
        SELECT 1 FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND INDEX_NAME = :i
    ");
    $s->execute([':t' => $tabla, ':i' => $indice]);
    return (bool) $s->fetch();
}

function existeForanea(PDO $pdo, $tabla, $nombre) {
    $s = $pdo->prepare("
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t
           AND CONSTRAINT_NAME = :c AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ");
    $s->execute([':t' => $tabla, ':c' => $nombre]);
    return (bool) $s->fetch();
}

function paso(&$pasos, $nombre, $yaEstaba, callable $hacer) {
    if ($yaEstaba) { $pasos[] = "$nombre: ya estaba"; return; }
    try { $hacer(); $pasos[] = "$nombre: aplicado"; }
    catch (PDOException $e) { $pasos[] = "$nombre: FALLO -> " . $e->getMessage(); }
}

paso($pasos, 'clientes.token', existeColumna($pdo, 'tbl_clientes', 'token'), function () use ($pdo) {
    $pdo->exec("ALTER TABLE tbl_clientes ADD COLUMN token VARCHAR(64) NULL DEFAULT NULL");
});

paso($pasos, 'clientes.token_expiry', existeColumna($pdo, 'tbl_clientes', 'token_expiry'), function () use ($pdo) {
    $pdo->exec("ALTER TABLE tbl_clientes ADD COLUMN token_expiry DATETIME NULL DEFAULT NULL");
});

paso($pasos, 'indice uq_cliente_token', existeIndice($pdo, 'tbl_clientes', 'uq_cliente_token'), function () use ($pdo) {
    $pdo->exec("ALTER TABLE tbl_clientes ADD UNIQUE KEY uq_cliente_token (token)");
});

paso($pasos, 'pedidos.id_cliente', existeColumna($pdo, 'tbl_pedidos', 'id_cliente'), function () use ($pdo) {
    $pdo->exec("ALTER TABLE tbl_pedidos ADD COLUMN id_cliente INT NULL DEFAULT NULL AFTER codigo_seguimiento");
});

paso($pasos, 'indice idx_pedido_cliente', existeIndice($pdo, 'tbl_pedidos', 'idx_pedido_cliente'), function () use ($pdo) {
    $pdo->exec("ALTER TABLE tbl_pedidos ADD KEY idx_pedido_cliente (id_cliente)");
});

paso($pasos, 'foranea fk_pedido_cliente', existeForanea($pdo, 'tbl_pedidos', 'fk_pedido_cliente'), function () use ($pdo) {
    $pdo->exec("
        ALTER TABLE tbl_pedidos
            ADD CONSTRAINT fk_pedido_cliente
                FOREIGN KEY (id_cliente) REFERENCES tbl_clientes (id_cliente)
                ON DELETE SET NULL ON UPDATE CASCADE
    ");
});

/* Estado final, comprobado de nuevo contra el esquema real */
$resultado = [
    'pasos' => $pasos,
    'estado_final' => [
        'clientes.token'        => existeColumna($pdo, 'tbl_clientes', 'token'),
        'clientes.token_expiry' => existeColumna($pdo, 'tbl_clientes', 'token_expiry'),
        'pedidos.id_cliente'    => existeColumna($pdo, 'tbl_pedidos', 'id_cliente'),
        'foranea'               => existeForanea($pdo, 'tbl_pedidos', 'fk_pedido_cliente'),
    ],
];

/* Y las dos consultas que de verdad importan: la que valida la sesion
   en cada compra y la que inserta el pedido. */
try {
    $s = $pdo->prepare("SELECT id_cliente FROM tbl_clientes WHERE token = :t AND token_expiry > NOW() LIMIT 1");
    $s->execute([':t' => str_repeat('0', 64)]);
    $s->fetch();
    $resultado['consulta_de_sesion'] = 'funciona';
} catch (PDOException $e) {
    $resultado['consulta_de_sesion'] = $e->getMessage();
}

try {
    $pdo->query("SELECT id, id_cliente, codigo_seguimiento FROM tbl_pedidos LIMIT 1")->fetch();
    $resultado['consulta_de_pedidos'] = 'funciona';
} catch (PDOException $e) {
    $resultado['consulta_de_pedidos'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
