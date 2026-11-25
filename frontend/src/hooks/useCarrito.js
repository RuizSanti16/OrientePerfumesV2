import { crearAlmacenLocal } from './almacenLocal';

/* Tope por línea. El servidor rechaza más de 50 unidades en
   precios.php; cortar aquí evita que el cliente llegue hasta el pago
   para enterarse. */
export const MAX_POR_LINEA = 50;

/* Cada pantalla metia el producto de una forma distinta: la portada
   mandaba el objeto de la API tal cual (con id_producto y sin id), y
   la ficha y Coleccion mandaban un id compuesto, "15_100ml", que no
   es el id de ningun producto. El checkout leia item.id, asi que al
   pagar salia "Hay un producto sin identificar en el pedido" o se
   enviaba una cadena donde el backend espera un entero.

   La normalizacion vive aqui, que es el unico sitio por el que pasan
   todas las altas: la linea guarda siempre el id_producto numerico y
   la presentacion por separado. */
function normalizar(producto) {
  const crudo = producto.id_producto ?? producto.id ?? '';
  const id    = parseInt(String(crudo), 10);
  const cant  = parseInt(String(producto.cantidad ?? 1), 10);
  return {
    ...producto,
    id_producto: Number.isFinite(id) && id > 0 ? id : null,
    presentacion: producto.presentacion || '',
    cantidad: Number.isFinite(cant) && cant > 0 ? Math.min(cant, MAX_POR_LINEA) : 1,
  };
}

/* Misma linea = mismo producto y misma presentacion. Antes comparaba
   por x.id, de modo que el mismo perfume anadido desde la portada y
   desde su ficha salia dos veces en el carrito. */
export function claveLinea(item) {
  return `${item.id_producto}|${item.presentacion || ''}`;
}

/* El carrito vive una sola vez, en el módulo, y los componentes se
   suscriben: antes cada useCarrito() creaba su propia copia y el
   Header no se enteraba de lo que añadía la ficha de producto. El
   mecanismo está en almacenLocal.js, compartido con la lista de
   deseos. */
const almacen = crearAlmacenLocal('op_carrito', normalizar);

/* ── Operaciones ─────────────────────────────────────────── */

export function agregarAlCarrito(crudo) {
  const producto = normalizar(crudo);
  const clave    = claveLinea(producto);
  const lista    = almacen.leer();
  const idx      = lista.findIndex(x => claveLinea(x) === clave);

  if (idx >= 0) {
    const nuevo = [...lista];
    nuevo[idx] = {
      ...nuevo[idx],
      cantidad: Math.min(nuevo[idx].cantidad + producto.cantidad, MAX_POR_LINEA),
    };
    almacen.publicar(nuevo);
    return;
  }
  almacen.publicar([...lista, producto]);
}

/**
 * Cambia la cantidad de una línea. Con 0 o menos, la quita: es lo que
 * se espera al bajar desde 1 con el botón de menos.
 */
export function cambiarCantidad(clave, cantidad) {
  const n = Math.min(Math.max(0, Math.floor(cantidad)), MAX_POR_LINEA);
  if (n === 0) return quitarDelCarrito(clave);
  almacen.publicar(almacen.leer().map(
    x => (claveLinea(x) === clave ? { ...x, cantidad: n } : x)
  ));
}

export function quitarDelCarrito(clave) {
  almacen.publicar(almacen.leer().filter(x => claveLinea(x) !== clave));
}

export function vaciarCarrito() {
  almacen.publicar([]);
}

/* ── Hook ────────────────────────────────────────────────── */

export function useCarrito() {
  const carrito = almacen.usar();

  const total = carrito.reduce((s, i) => s + (i.precio * (i.cantidad || 1)), 0);
  const count = carrito.reduce((s, i) => s + (i.cantidad || 1), 0);

  return {
    carrito,
    total,
    count,
    agregar: agregarAlCarrito,
    quitar:  quitarDelCarrito,
    cambiar: cambiarCantidad,
    vaciar:  vaciarCarrito,
  };
}
