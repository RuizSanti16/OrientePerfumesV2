import { useSyncExternalStore } from 'react';

const KEY = 'op_carrito';

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

function leerGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY) || '[]');
    /* Los carritos ya guardados en el navegador traen la forma vieja */
    return Array.isArray(guardado) ? guardado.map(normalizar) : [];
  } catch { return []; }
}

/* ── El carrito vive en el módulo, no dentro de cada componente ──

   Antes esto era un useState, de modo que cada useCarrito() creaba su
   propia copia: la ficha de producto añadía a la suya y el Header
   seguía mostrando el contador anterior, porque nunca se enteraba. Y
   las dos copias guardaban en el mismo localStorage, así que la que
   escribiera después borraba lo de la otra.

   Con un único estado y useSyncExternalStore, todos los componentes
   leen lo mismo y React los vuelve a dibujar a la vez. */
let estado = leerGuardado();
const oyentes = new Set();

function publicar(nuevo) {
  estado = nuevo;
  try { localStorage.setItem(KEY, JSON.stringify(estado)); }
  catch { /* modo privado o almacenamiento lleno: el carrito sigue
             funcionando en esta pestaña, solo no sobrevive al cierre */ }
  oyentes.forEach(fn => fn());
}

function suscribir(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

/* Dos pestañas abiertas son el mismo carrito. Sin esto, comprar en
   una dejaba a la otra mostrando lo de antes y la siguiente escritura
   revivía los productos ya pedidos. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    estado = leerGuardado();
    oyentes.forEach(fn => fn());
  });
}

/* ── Operaciones ─────────────────────────────────────────── */

export function agregarAlCarrito(crudo) {
  const producto = normalizar(crudo);
  const clave    = claveLinea(producto);
  const idx      = estado.findIndex(x => claveLinea(x) === clave);

  if (idx >= 0) {
    const nuevo = [...estado];
    nuevo[idx] = {
      ...nuevo[idx],
      cantidad: Math.min(nuevo[idx].cantidad + producto.cantidad, MAX_POR_LINEA),
    };
    publicar(nuevo);
    return;
  }
  publicar([...estado, producto]);
}

/**
 * Cambia la cantidad de una línea. Con 0 o menos, la quita: es lo que
 * se espera al bajar desde 1 con el botón de menos.
 */
export function cambiarCantidad(clave, cantidad) {
  const n = Math.min(Math.max(0, Math.floor(cantidad)), MAX_POR_LINEA);
  if (n === 0) return quitarDelCarrito(clave);
  publicar(estado.map(x => (claveLinea(x) === clave ? { ...x, cantidad: n } : x)));
}

export function quitarDelCarrito(clave) {
  publicar(estado.filter(x => claveLinea(x) !== clave));
}

export function vaciarCarrito() {
  publicar([]);
}

/* ── Hook ────────────────────────────────────────────────── */

export function useCarrito() {
  const carrito = useSyncExternalStore(suscribir, () => estado);

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
