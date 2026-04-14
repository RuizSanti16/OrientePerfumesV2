import { useState, useEffect } from 'react';

const KEY = 'op_carrito';

function getCarrito() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function useCarrito() {
  const [carrito, setCarrito] = useState(getCarrito);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(carrito));
  }, [carrito]);

  function agregar(producto) {
    setCarrito(prev => {
      const idx = prev.findIndex(
        x => x.id === producto.id && x.presentacion === producto.presentacion
      );
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