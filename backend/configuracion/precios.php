<?php
/* =============================================================
   precios.php — calcula el importe de un pedido en el servidor.

   POR QUE EXISTE
   El pedido se creaba con el total y los precios que enviaba el
   navegador:

       ':total'  => floatval($b['total'] ?? 0),
       ':precio' => floatval($item['precio_unitario'] ?? 0),

   Con pago contraentrega eso es descuidado pero se sostiene, porque
   una persona revisa el pedido antes de despacharlo. Con una pasarela
   de pago deja de sostenerse: cualquiera puede editar la peticion y
   pagar 1 peso por un pedido de 500.000. El importe que se le cobra al
   cliente tiene que salir de la base de datos, no de la peticion.

   Del cliente solo se acepta QUE producto y CUANTAS unidades. El
   precio, el descuento y el total se calculan aqui.
============================================================= */

if (!function_exists('calcularTotalesPedido')) {

    /**
     * Precio real de un producto en la presentacion elegida.
     *
     * Las presentaciones viven en tbl_productos.presentaciones, un
     * JSON como [{"etiqueta":"100ml","precio":"250000"}, ...]. Un
     * perfume de 250.000 el frasco se vende a 25.000 la muestra de
     * 5ml, asi que cobrar siempre el precio del producto multiplicaba
     * por diez lo que el cliente creia estar pagando.
     *
     * @return array [precio(float), error(string|null)]
     */
    function precioDePresentacion(array $prod, $presentacion) {
        $base = (float) $prod['precio'];
        $pres = trim((string) $presentacion);

        $lista = [];
        if (!empty($prod['presentaciones'])) {
            $leido = json_decode($prod['presentaciones'], true);
            if (is_array($leido)) $lista = $leido;
        }

        /* Sin presentacion elegida, o producto que no las tiene: el
           precio del producto, que es lo que se muestra en la ficha. */
        if ($pres === '' || !$lista) {
            if ($base <= 0) {
                return [0.0, 'Uno de los productos no tiene precio definido.'];
            }
            return [$base, null];
        }

        foreach ($lista as $p) {
            $etiqueta = trim((string) ($p['etiqueta'] ?? ''));
            if ($etiqueta === '' || mb_strtolower($etiqueta, 'UTF-8') !== mb_strtolower($pres, 'UTF-8')) {
                continue;
            }
            $precio = (float) ($p['precio'] ?? 0);
            if ($precio <= 0) {
                return [0.0, 'La presentacion ' . $etiqueta . ' no tiene precio definido.'];
            }
            return [$precio, null];
        }

        /* Pidio una presentacion que este producto no vende. Se
           rechaza en vez de cobrar el precio base: si no, bastaria
           inventarse una etiqueta para elegir que precio se paga. */
        return [0.0, 'La presentacion elegida ya no esta disponible para ' . $prod['nombre'] . '.'];
    }

    /**
     * Devuelve las lineas con su precio real y los totales.
     *
     * @param  PDO         $pdo
     * @param  array       $items  lineas del cliente: id_producto, cantidad, presentacion
     * @param  string|null $cupon  codigo de cupon, opcional
     * @return array  [ok, mensaje, items, subtotal, descuento, total, cupon]
     */
    function calcularTotalesPedido(PDO $pdo, array $items, $cupon = null) {
        if (!$items) {
            return ['ok' => false, 'mensaje' => 'El pedido no tiene productos.'];
        }

        /* Se agrupan las cantidades por producto: si el cliente manda
           dos lineas del mismo articulo no hay motivo para tratarlas
           por separado, y agrupar evita que una cantidad negativa en
           una linea compense a otra. */
        $pedidas = [];
        foreach ($items as $it) {
            $id = (int) ($it['id_producto'] ?? 0);
            if ($id <= 0) {
                return ['ok' => false, 'mensaje' => 'Hay un producto sin identificar en el pedido.'];
            }

            $cant = (int) ($it['cantidad'] ?? 1);
            if ($cant < 1) {
                return ['ok' => false, 'mensaje' => 'La cantidad de un producto no es valida.'];
            }
            /* Tope por linea: una cantidad disparatada casi siempre es
               un error o una prueba, y conviene cortarla antes de
               mandarla a cobrar. */
            if ($cant > 50) {
                return ['ok' => false, 'mensaje' => 'La cantidad maxima por producto es 50 unidades.'];
            }

            /* Se agrupa por producto Y presentacion.

               Agrupar solo por producto juntaba en una sola linea el
               frasco de 100ml y la muestra de 5ml, y se quedaba con
               la presentacion de la primera: dos articulos de precio
               muy distinto cobrados los dos al mismo. */
            $pres  = trim((string) ($it['presentacion'] ?? ''));
            $clave = $id . '|' . mb_strtolower($pres, 'UTF-8');

            if (!isset($pedidas[$clave])) {
                $pedidas[$clave] = ['id' => $id, 'cantidad' => 0, 'presentacion' => $pres];
            }
            $pedidas[$clave]['cantidad'] += $cant;
        }

        /* Precios reales, de la base. */
        $ids    = array_values(array_unique(array_column($pedidas, 'id')));
        $marcas = implode(',', array_fill(0, count($ids), '?'));
        $stmt   = $pdo->prepare("SELECT id_producto, nombre, precio, presentaciones
                                   FROM tbl_productos WHERE id_producto IN ($marcas)");
        $stmt->execute($ids);

        $encontrados = [];
        foreach ($stmt->fetchAll() as $p) { $encontrados[(int) $p['id_producto']] = $p; }

        $lineas   = [];
        $subtotal = 0.0;

        foreach ($pedidas as $datos) {
            $id = $datos['id'];
            if (!isset($encontrados[$id])) {
                return ['ok' => false, 'mensaje' => 'Uno de los productos ya no esta disponible.'];
            }

            $prod = $encontrados[$id];

            /* El precio es el de la presentacion elegida, no el del
               producto.

               Aqui se tomaba siempre tbl_productos.precio, que es el
               del frasco grande: quien pedia una muestra de 5ml por
               25.000 veia 250.000 al ir a pagar. El precio de cada
               presentacion esta en la columna presentaciones, un JSON
               con etiqueta y precio. */
            list($precio, $error) = precioDePresentacion($prod, $datos['presentacion']);
            if ($error !== null) {
                return ['ok' => false, 'mensaje' => $error];
            }

            $subtotal += $precio * $datos['cantidad'];

            $lineas[] = [
                'id_producto'     => $id,
                'nombre'          => $prod['nombre'],
                'cantidad'        => $datos['cantidad'],
                'precio_unitario' => $precio,
                'presentacion'    => $datos['presentacion'] !== '' ? $datos['presentacion'] : null,
            ];
        }

        /* Cupon: mismas reglas que el endpoint publico de validacion,
           pero aplicadas aqui sobre el subtotal real. Que el cliente
           haya visto un descuento en pantalla no basta. */
        $descuento    = 0.0;
        $cuponAplicado = null;

        if ($cupon !== null && trim((string) $cupon) !== '') {
            $codigo = strtoupper(trim((string) $cupon));
            $s = $pdo->prepare("SELECT * FROM tbl_cupones WHERE UPPER(codigo) = :c AND activo = 1 LIMIT 1");
            $s->execute([':c' => $codigo]);
            $cup = $s->fetch();

            if (!$cup) {
                return ['ok' => false, 'mensaje' => 'El cupon no es valido o esta inactivo.'];
            }
            if ($cup['fecha_vencimiento'] && $cup['fecha_vencimiento'] < date('Y-m-d')) {
                return ['ok' => false, 'mensaje' => 'El cupon esta vencido.'];
            }
            if ($cup['usos_max'] !== null && (int) $cup['usos_actuales'] >= (int) $cup['usos_max']) {
                return ['ok' => false, 'mensaje' => 'El cupon alcanzo su limite de usos.'];
            }
            if ((float) $cup['min_compra'] > 0 && $subtotal < (float) $cup['min_compra']) {
                return ['ok' => false, 'mensaje' => 'El pedido no alcanza el minimo de compra del cupon.'];
            }

            $descuento = $cup['tipo'] === 'porcentaje'
                ? $subtotal * ((float) $cup['valor'] / 100)
                : min((float) $cup['valor'], $subtotal);

            $descuento     = round($descuento, 0);
            $cuponAplicado = $cup['codigo'];
        }

        /* En pesos colombianos no se manejan centavos, y la pasarela
           cobra un entero de centavos: se redondea aqui para que el
           importe cobrado y el guardado sean exactamente el mismo. */
        $subtotal = round($subtotal, 0);
        $total    = max(0, $subtotal - $descuento);

        return [
            'ok'        => true,
            'items'     => $lineas,
            'subtotal'  => $subtotal,
            'descuento' => $descuento,
            'total'     => $total,
            'cupon'     => $cuponAplicado,
        ];
    }
}
