<?php
/* =============================================================
   api/estadisticas.php — Estadísticas para el Dashboard
   GET /api/estadisticas.php
   Requiere token admin.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
header('Access-Control-Allow-Headers: Authorization, Content-Type');

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

verificarTokenAdmin($pdo);

try {

    /* ── 1. Ventas por mes (últimos 6 meses) ──────────────── */
    $ventasMes = [];
    try {
        $stmt = $pdo->query("
            SELECT
                DATE_FORMAT(fecha, '%Y-%m') AS mes,
                DATE_FORMAT(fecha, '%b %Y') AS mes_label,
                COUNT(*)                    AS cantidad,
                COALESCE(SUM(total), 0)     AS ingresos
            FROM tbl_ventas
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes ASC
        ");
        $ventasMes = $stmt->fetchAll();
    } catch (PDOException $e) { $ventasMes = []; }

    /* ── 2. Productos más vendidos (top 5) ────────────────── */
    $masVendidos = [];
    try {
        $stmt = $pdo->query("
            SELECT
                p.id_producto,
                p.nombre,
                p.marca,
                p.imagen,
                COALESCE(SUM(d.cantidad), 0)                          AS total_vendido,
                COALESCE(SUM(d.cantidad * d.precio_unitario), 0)      AS ingresos
            FROM tbl_detalle_venta d
            JOIN tbl_productos p ON d.id_producto = p.id_producto
            GROUP BY p.id_producto, p.nombre, p.marca, p.imagen
            ORDER BY total_vendido DESC
            LIMIT 5
        ");
        $masVendidos = $stmt->fetchAll();
    } catch (PDOException $e) { $masVendidos = []; }

    /* ── 3. Movimiento por categoría ─────────────────────── */
    $porCategoria = [];
    try {
        $stmt = $pdo->query("
            SELECT
                c.nombre_categoria AS categoria,
                COUNT(DISTINCT p.id_producto)              AS total_productos,
                COALESCE(SUM(d.cantidad), 0)               AS total_vendido
            FROM tbl_categorias c
            LEFT JOIN tbl_productos p  ON p.id_categoria = c.id_categoria
            LEFT JOIN tbl_detalle_venta d ON d.id_producto = p.id_producto
            GROUP BY c.id_categoria, c.nombre_categoria
            ORDER BY total_vendido DESC, total_productos DESC
            LIMIT 8
        ");
        $porCategoria = $stmt->fetchAll();
    } catch (PDOException $e) { $porCategoria = []; }

    /* ── 4. KPIs del período actual vs anterior ──────────── */
    $kpis = [];
    try {
        $stmt = $pdo->query("
            SELECT
                COALESCE(SUM(CASE WHEN DATE_FORMAT(fecha,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m') THEN total ELSE 0 END), 0)                 AS ingresos_mes_actual,
                COALESCE(SUM(CASE WHEN DATE_FORMAT(fecha,'%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m') THEN total ELSE 0 END), 0) AS ingresos_mes_anterior,
                COUNT(CASE WHEN DATE_FORMAT(fecha,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m') THEN 1 END)                                       AS ventas_mes_actual,
                COUNT(CASE WHEN DATE_FORMAT(fecha,'%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m') THEN 1 END)           AS ventas_mes_anterior
            FROM tbl_ventas
        ");
        $kpis = $stmt->fetch();
    } catch (PDOException $e) {
        $kpis = ['ingresos_mes_actual' => 0, 'ingresos_mes_anterior' => 0, 'ventas_mes_actual' => 0, 'ventas_mes_anterior' => 0];
    }

    /* ── 5. Pedidos pendientes ────────────────────────────── */
    $pedidosPendientes = 0;
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM tbl_pedidos WHERE estado = 'pendiente'");
        $pedidosPendientes = (int)$stmt->fetchColumn();
    } catch (PDOException $e) { $pedidosPendientes = 0; }

    /* ── 6. Comentarios pendientes ───────────────────────── */
    $comentariosPendientes = 0;
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM tbl_noticias WHERE estado = 'pendiente'");
        $comentariosPendientes = (int)$stmt->fetchColumn();
    } catch (PDOException $e) { $comentariosPendientes = 0; }

    /* ── 7. Stock bajo ───────────────────────────────────── */
    $stockBajoCount = 0;
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM tbl_inventario WHERE COALESCE(stock_actual, stock, 0) <= 5");
        $stockBajoCount = (int)$stmt->fetchColumn();
    } catch (PDOException $e) { $stockBajoCount = 0; }

    echo json_encode([
        'ok' => true,
        'data' => [
            'ventas_por_mes'         => $ventasMes,
            'productos_mas_vendidos' => $masVendidos,
            'por_categoria'          => $porCategoria,
            'kpis_periodo'           => $kpis,
            'pedidos_pendientes'     => $pedidosPendientes,
            'comentarios_pendientes' => $comentariosPendientes,
            'stock_bajo_count'       => $stockBajoCount,
        ],
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
}

require_once '../configuracion/CerrarConexion.php';
?>
