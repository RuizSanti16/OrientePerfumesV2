<?php
/* =============================================================
   api/destacados.php — Productos destacados desde BD
   GET  → listar productos destacados con info completa
   POST → guardar lista de ids destacados
============================================================= */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once '../configuracion/Conexion.php';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        case 'GET':
            $s = $pdo->query("
                SELECT p.*, c.nombre AS nombre_categoria, d.orden
                FROM tbl_destacados d
                JOIN tbl_productos p ON d.id_producto = p.id_producto
                LEFT JOIN tbl_categorias c ON p.id_categoria = c.id_categoria
                ORDER BY d.orden ASC
                LIMIT 8
            ");
            $rows = $s->fetchAll();
            foreach ($rows as &$row) {
                if ($row['presentaciones']) {
                    $row['presentaciones'] = json_decode($row['presentaciones'], true) ?: [];
                } else {
                    $row['presentaciones'] = [];
                }
            }
            echo json_encode(['ok' => true, 'data' => $rows]);
            break;

        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            $ids = $b['ids'] ?? [];

            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM tbl_destacados");
            if (!empty($ids)) {
                $stmt = $pdo->prepare("INSERT INTO tbl_destacados (id_producto, orden) VALUES (:id, :orden)");
                foreach ($ids as $orden => $id) {
                    $stmt->execute([':id' => $id, ':orden' => $orden]);
                }
            }
            $pdo->commit();
            echo json_encode(['ok' => true, 'mensaje' => 'Productos destacados actualizados']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}
require_once '../configuracion/CerrarConexion.php';
?>