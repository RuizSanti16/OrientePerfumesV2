<?php
/* TEMPORAL. Crea la tabla de testimonios y se borra despues de
   comprobar que entro.

   CREATE TABLE IF NOT EXISTS, asi que ejecutarlo dos veces no rompe
   nada. No toca tbl_comentarios_noticias: los comentarios que ya
   existen se quedan donde estan, porque son de las noticias.
*/

header('Content-Type: application/json');

if (($_GET['clave'] ?? '') !== 'testimonios-op') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../configuracion/Conexion.php';

function existeTabla(PDO $pdo, $tabla) {
    $s = $pdo->prepare("
        SELECT 1 FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t
    ");
    $s->execute([':t' => $tabla]);
    return (bool) $s->fetch();
}

$pasos = [];

if (existeTabla($pdo, 'tbl_testimonios')) {
    $pasos[] = 'tbl_testimonios: ya estaba';
} else {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS tbl_testimonios (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                id_cliente INT          NULL DEFAULT NULL,
                nombre     VARCHAR(120) NOT NULL,
                texto      VARCHAR(500) NOT NULL,
                estrellas  TINYINT      NOT NULL DEFAULT 5,
                estado     ENUM('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
                fecha      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                KEY idx_testimonio_estado (estado),
                KEY idx_testimonio_cliente (id_cliente),
                CONSTRAINT fk_testimonio_cliente FOREIGN KEY (id_cliente)
                    REFERENCES tbl_clientes (id_cliente) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
        $pasos[] = 'tbl_testimonios: creada';
    } catch (PDOException $e) {
        $pasos[] = 'tbl_testimonios: FALLO -> ' . $e->getMessage();
    }
}

$resultado = [
    'pasos'        => $pasos,
    'estado_final' => ['tbl_testimonios' => existeTabla($pdo, 'tbl_testimonios')],
];

/* Las dos consultas que hace el endpoint */
try {
    $pdo->query("SELECT id, nombre, texto, estrellas, fecha FROM tbl_testimonios WHERE estado = 'aprobado' LIMIT 1")->fetch();
    $resultado['lectura_publica'] = 'funciona';
} catch (PDOException $e) {
    $resultado['lectura_publica'] = $e->getMessage();
}
try {
    $resultado['testimonios']  = (int) $pdo->query("SELECT COUNT(*) FROM tbl_testimonios")->fetchColumn();
    $resultado['comentarios_noticias_intactos'] = (int) $pdo->query("SELECT COUNT(*) FROM tbl_comentarios_noticias")->fetchColumn();
    $resultado['lanzamientos'] = (int) $pdo->query("SELECT COUNT(*) FROM tbl_lanzamientos")->fetchColumn();
} catch (PDOException $e) {
    $resultado['conteos'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
