import { crearAlmacenLocal } from './almacenLocal';

const MAX = 3;

function normalizar(producto) {
  return {
    id:     String(producto.id ?? producto.id_producto ?? ''),
    nombre: producto.nombre || '',
    imagen: producto.imagen || '',
    precio: producto.precio || 0,
  };
}

const almacen = crearAlmacenLocal('op_comparar', normalizar);

/**
 * Seleccion de productos a comparar, maximo MAX (3) a la vez.
 *
 * Comparte el almacen con el carrito y la lista de deseos: antes cada
 * componente tenia su propia copia en un useState y no se enteraba de
 * lo que hicieran los demas.
 */
export function useComparador() {
  const items = almacen.usar();

  return {
    items,
    count: items.length,
    estaEn: id => items.some(p => p.id === String(id)),

    agregar(crudo) {
      const producto = normalizar(crudo);
      const lista    = almacen.leer();
      if (lista.length >= MAX) return;
      if (lista.some(p => p.id === producto.id)) return;
      almacen.publicar([...lista, producto]);
    },

    quitar(id) {
      almacen.publicar(almacen.leer().filter(p => p.id !== String(id)));
    },

    limpiar() {
      almacen.publicar([]);
    },
  };
}
