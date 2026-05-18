import { useState, useCallback } from 'react';

const KEY = 'op_comparar';
const MAX = 3;

function leerStorage() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

/**
 * Hook para gestionar la selección de productos a comparar.
 * Persiste en localStorage bajo la clave 'op_comparar'.
 * Máximo MAX (3) productos simultáneos.
 */
export function useComparador() {
  const [items, setItems] = useState(leerStorage);

  const agregar = useCallback((producto) => {
    setItems(prev => {
      if (prev.length >= MAX) return prev;
      if (prev.find(p => String(p.id) === String(producto.id))) return prev;
      const next = [
        ...prev,
        {
          id:     String(producto.id),
          nombre: producto.nombre  || '',
          imagen: producto.imagen  || '',
          precio: producto.precio  || 0,
        },
      ];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const quitar = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(p => String(p.id) !== String(id));
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const limpiar = useCallback(() => {
    localStorage.setItem(KEY, '[]');
    setItems([]);
  }, []);

  const estaEn = useCallback((id) => {
    return items.some(p => String(p.id) === String(id));
  }, [items]);

  return { items, agregar, quitar, limpiar, estaEn, count: items.length };
}
