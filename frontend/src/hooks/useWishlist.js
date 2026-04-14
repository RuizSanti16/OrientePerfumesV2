import { useState, useEffect } from 'react';

const KEY = 'op_wishlist';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState(getWishlist);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  function toggle(producto) {
    setWishlist(prev => {
      const existe = prev.some(x => x.id === producto.id);
      return existe
        ? prev.filter(x => x.id !== producto.id)
        : [...prev, producto];
    });
  }

  function estaEn(id) {
    return wishlist.some(x => x.id === id);
  }

  function quitar(id) {
    setWishlist(prev => prev.filter(x => x.id !== id));
  }

  return { wishlist, toggle, estaEn, quitar, count: wishlist.length };
}