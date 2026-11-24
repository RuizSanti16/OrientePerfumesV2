import { useState, useEffect } from 'react';

const KEY = 'op_carrito';

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
  return {
    ...producto,
    id_producto: Number.isFinite(id) && id > 0 ? id : null,
    presentacion: producto.presentacion || '',
  };
}

/* Misma linea = mismo producto y misma presentacion. Antes comparaba
   por x.id, de modo que el mismo perfume anadido desde la portada y
   desde su ficha salia dos veces en el carrito. */
function mismaLinea(a, b) {
  return a.id_producto === b.id_producto && a.presentacion === b.presentacion;
}

function getCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY) || '[]');
    /* Los carritos ya guardados en el navegador traen la forma vieja */
    return Array.isArray(guardado) ? guardado.map(normalizar) : [];
  } catch { return []; }
}

export function useCarrito() {
  const [carrito, setCarrito] = useState(getCarrito);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(carrito));
  }, [carrito]);

  function agregar(crudo) {
    const producto = normalizar(crudo);
    setCarrito(prev => {
      const idx = prev.findIndex(x => mismaLinea(x, producto));
      if (idx >= 0) {
        const nuevo = [...prev];
        nuevo[idx] = { ...nuevo[idx], cantidad: (nuevo[idx].cantidad || 1) + 1 };
        return nuevo;
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }

  function quitar(idx) {
    setCarrito(prev => prev.filter((_, i) => i !== idx));
  }

  function vaciar() {
    setCarrito([]);
  }

  const total = carrito.reduce((sum, i) => sum + (i.precio * (i.cantidad || 1)), 0);
  const count = carrito.reduce((sum, i) => sum + (i.cantidad || 1), 0);

  return { carrito, agregar, quitar, vaciar, total, count };
}