<?php
/* =============================================================
   api/destacados.php — Productos destacados con badge y precios
============================================================= */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET' && $method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

try {
    switch ($method) {

        case 'GET':
            $s = $pdo->query("
                SELECT p.*, c.nombre AS nombre_categoria,
                       d.orden, d.badge, d.precio_oferta, d.precio_anterior
                FROM tbl_destacados d
                JOIN tbl_productos p ON d.id_producto = p.id_producto
                LEFT JOIN tbl_categorias c ON p.id_categoria = c.id_categoria
                ORDER BY d.orden ASC
                LIMIT 8
            ");
            $rows = $s->fetchAll();
            foreach ($rows as &$row) {
                $row['presentaciones'] = $row['presentaciones']
                    ? (json_decode($row['presentaciones'], true) ?: [])
                    : [];
            }
            echo json_encode(['ok' => true, 'data' => $rows]);
            break;

        case 'POST':
            $b     = json_decode(file_get_contents('php://input'), true);
            $items = $b['ids'] ?? [];

            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM tbl_destacados");

            if (!empty($items)) {
                $stmt = $pdo->prepare("
                    INSERT INTO tbl_destacados (id_producto, orden, badge, precio_oferta, precio_anterior)
                    VALUES (:id, :orden, :badge, :precio_oferta, :precio_anterior)
                ");
                foreach ($items as $orden => $item) {
                    if (is_array($item)) {
                        $id_prod        = $item['id_producto']    ?? null;
                        $badge          = $item['badge']          ?? 'none';
                        $precio_oferta  = !empty($item['precioOferta'])   ? intval($item['precioOferta'])   : null;
                        $precio_anterior= !empty($item['precioAnterior']) ? intval($item['precioAnterior']) : null;
                    } else {
                        $id_prod = $item; $badge = 'none';
                        $precio_oferta = null; $precio_anterior = null;
                    }
                    if ($id_prod) {
                        $stmt->execute([
                            ':id'              => $id_prod,
                            ':orden'           => $orden,
                            ':badge'           => $badge,
                            ':precio_oferta'   => $precio_oferta,
                            ':precio_anterior' => $precio_anterior,
                        ]);
                    }
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