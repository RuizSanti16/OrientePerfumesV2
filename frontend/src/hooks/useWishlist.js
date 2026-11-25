import { crearAlmacenLocal } from './almacenLocal';

/* El id se guarda siempre como texto. Unas pantallas lo pasaban con
   String(p.id_producto) y otras con el numero tal cual, asi que
   estaEn() daba false para un producto que si estaba en la lista: el
   corazon salia vacio y volver a pulsarlo lo anadia por segunda vez
   en vez de quitarlo. */
function normalizar(producto) {
  return { ...producto, id: String(producto.id ?? producto.id_producto ?? '') };
}

const almacen = crearAlmacenLocal('op_wishlist', normalizar);

export function toggleWishlist(crudo) {
  const producto = normalizar(crudo);
  const lista    = almacen.leer();
  const existe   = lista.some(x => x.id === producto.id);

  almacen.publicar(existe
    ? lista.filter(x => x.id !== producto.id)
    : [...lista, producto]);
}

export function quitarDeWishlist(id) {
  almacen.publicar(almacen.leer().filter(x => x.id !== String(id)));
}

export function useWishlist() {
  const wishlist = almacen.usar();

  return {
    wishlist,
    count:  wishlist.length,
    toggle: toggleWishlist,
    quitar: quitarDeWishlist,
    estaEn: id => wishlist.some(x => x.id === String(id)),
  };
}
