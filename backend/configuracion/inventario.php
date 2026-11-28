<?php
/* =============================================================
   inventario.php — mover el stock cuando entran o salen pedidos.

   POR QUE EXISTE
   ventas.php descontaba stock y compras.php lo sumaba, pero
   pedidos.php no tocaba el inventario: los pedidos que entraban por
   la tienda no restaban nada. El numero que ve el administrador, y
   el "solo quedan N unidades" que ve el cliente en la ficha, se
   quedaban congelados por mucho que se vendiera.

   CUANDO SE DESCUENTA
   Al confirmar el pedido. Es lo que evita vender dos veces el ultimo
   frasco. Si el pedido se cancela desde el panel, el stock vuelve.

   LAS MUESTRAS NO DESCUENTAN
   El stock se lleva por producto, no por presentacion, y las
   muestras de 5ml y 10ml salen del mismo frasco: restar una unidad
   por cada muestra vaciaria el inventario sin que falte nada en la
   estanteria. Solo descuenta el frasco completo, que es la
   presentacion mas cara del producto, o el producto entero cuando no
   tiene presentaciones.
============================================================= */

if (!function_exists('moverStockDePedido')) {

    /**
     * ¿Esta linea descuenta una unidad del frasco?
     *
     * @param array  $presentaciones lista [{etiqueta, precio}, ...]
     * @param string $presentacion   la elegida por el cliente
     */
    function lineaDescuentaStock(array $presentaciones, $presentacion) {
        $pres = trim((string) $presentacion);

        /* Sin presentaciones, o sin elegir ninguna: es el producto. */
        if ($pres === '' || !$presentaciones) return true;

        /* El frasco completo es el de mayor precio. */
        $mayor = null;
        $precioMayor = -1;
        foreach ($presentaciones as $p) {
            $precio = (float) ($p['precio'] ?? 0);
            if ($precio > $precioMayor) {
                $precioMayor = $precio;
                $mayor = trim((string) ($p['etiqueta'] ?? ''));
            }
        }
        if ($mayor === null) return true;

        return mb_strtolower($mayor, 'UTF-8') === mb_strtolower($pres, 'UTF-8');
    }

    /**
     * Suma o resta stock por las lineas de un pedido.
     *
     * @param int   $signo -1 para descontar al crear, +1 para devolver
     *                     al cancelar.
     * @param array $lineas cada una con id_producto, cantidad y
     *                      presentacion.
     * @return array lo movido, por producto, para poder registrarlo
     */
    function moverStockDePedido(PDO $pdo, array $lineas, $signo) {
        if (!$lineas) return [];

        /* Las presentaciones de todos los productos implicados, de una
           sola consulta. */
        $ids = array_values(array_unique(array_filter(
            array_map(fn($l) => (int) ($l['id_producto'] ?? 0), $lineas)
        )));
        if (!$ids) return [];

        $marcas = implode(',', array_fill(0, count($ids), '?'));
        $s = $pdo->prepare("SELECT id_producto, presentaciones FROM tbl_productos WHERE id_producto IN ($marcas)");
        $s->execute($ids);

        $presPorProducto = [];
        foreach ($s->fetchAll() as $p) {
            $lista = [];
            if (!empty($p['presentaciones'])) {
                $leido = json_decode($p['presentaciones'], true);
                if (is_array($leido)) $lista = $leido;
            }
            $presPorProducto[(int) $p['id_producto']] = $lista;
        }

        /* Cuanto se mueve de cada producto */
        $porProducto = [];
        foreach ($lineas as $l) {
            $id = (int) ($l['id_producto'] ?? 0);
            if ($id <= 0) continue;
            if (!lineaDescuentaStock($presPorProducto[$id] ?? [], $l['presentacion'] ?? '')) continue;
            $porProducto[$id] = ($porProducto[$id] ?? 0) + (int) ($l['cantidad'] ?? 1);
        }
        if (!$porProducto) return [];

        /* El UPDATE no crea filas, y un producto sin fila de
           inventario se quedaria sin descontar en silencio. */
        $existe = $pdo->prepare("SELECT 1 FROM tbl_inventario WHERE id_producto = :id LIMIT 1");
        $crear  = $pdo->prepare("INSERT INTO tbl_inventario (id_producto, stock, ubicacion) VALUES (:id, 0, '')");
        /* GREATEST para que el stock no baje de cero: un numero
           negativo no significa nada en una estanteria y ademas
           rompe los avisos de stock bajo. */
        $mover  = $pdo->prepare("
            UPDATE tbl_inventario
               SET stock = GREATEST(0, COALESCE(stock, 0) + :delta)
             WHERE id_producto = :id
        ");

        $movido = [];
        foreach ($porProducto as $id => $cantidad) {
            $existe->execute([':id' => $id]);
            if (!$existe->fetch()) $crear->execute([':id' => $id]);

            $delta = $signo * $cantidad;
            $mover->execute([':delta' => $delta, ':id' => $id]);
            $movido[$id] = $delta;
        }

        return $movido;
    }
}
