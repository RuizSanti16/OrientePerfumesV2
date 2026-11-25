<?php
/* =============================================================
   cobertura.php — que metodos de pago se aceptan y donde.

   Solo hay dos formas de pagar:

   - 'bold'     pago en linea por la pasarela. Disponible siempre.
   - 'efectivo' al recibir el pedido. Solo en el Valle de Aburra y
                el Oriente cercano, que es hasta donde se entrega en
                persona.

   Contraentrega y transferencia ya no existen.

   POR QUE SE COMPRUEBA AQUI Y NO SOLO EN EL FORMULARIO
   Hasta ahora pedidos.php guardaba el metodo que viniera en la
   peticion, sin mirarlo. Quitar los botones del checkout no cierra
   nada: la API es publica, y bastaba con enviar
   metodo_pago = 'efectivo' desde Bogota, o un metodo inventado, para
   llevarse un pedido sin pagar. La regla tiene que vivir donde no se
   pueda rodear, y el formulario es solo su reflejo.
============================================================= */

if (!function_exists('ciudadesConEfectivo')) {

    /**
     * Municipios donde se entrega en persona y, por tanto, se puede
     * pagar en efectivo. En minusculas y sin tildes: la comparacion
     * se hace contra la forma normalizada.
     */
    function ciudadesConEfectivo() {
        return [
            /* Valle de Aburra */
            'medellin', 'bello', 'itagui', 'envigado', 'sabaneta',
            'la estrella', 'caldas', 'copacabana', 'girardota', 'barbosa',
            /* Oriente cercano */
            'rionegro', 'guarne', 'marinilla', 'la ceja', 'el retiro',
            'el carmen de viboral',
        ];
    }

    /**
     * Deja la ciudad en la forma con la que se compara: sin tildes,
     * en minusculas y sin espacios de sobra.
     *
     * Se hace a mano y no con iconv() ni Normalizer: el primero
     * depende del locale del servidor y en Hostinger devuelve '?' por
     * cada acento, y el segundo exige la extension intl, que no esta
     * instalada. Las vocales acentuadas del espanol son pocas y fijas.
     */
    function normalizarCiudad($ciudad) {
        $texto = mb_strtolower(trim((string) $ciudad), 'UTF-8');

        $acentos = [
            'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a',
            'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e',
            'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o',
            'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u',
            'ñ' => 'n',
        ];
        $texto = strtr($texto, $acentos);

        /* Varios espacios seguidos cuentan como uno: "la  ceja" */
        return trim(preg_replace('/\s+/', ' ', $texto));
    }

    /**
     * ¿Se puede pagar en efectivo en esta ciudad?
     */
    function permiteEfectivo($ciudad) {
        return in_array(normalizarCiudad($ciudad), ciudadesConEfectivo(), true);
    }

    /**
     * Comprueba el metodo de pago de un pedido.
     *
     * Devuelve [true, metodoLimpio] o [false, mensaje para el cliente].
     */
    function validarMetodoPago($metodo, $ciudad) {
        $metodo = strtolower(trim((string) $metodo));

        if ($metodo === 'bold') {
            return [true, 'bold'];
        }

        if ($metodo === 'efectivo') {
            if (!permiteEfectivo($ciudad)) {
                return [false,
                    'El pago en efectivo solo esta disponible en Medellin, ' .
                    'Rionegro y municipios cercanos. Para tu ciudad el pago ' .
                    'es en linea.'];
            }
            return [true, 'efectivo'];
        }

        return [false, 'El metodo de pago no esta disponible.'];
    }
}
