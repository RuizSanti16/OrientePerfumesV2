import { useSyncExternalStore } from 'react';

/* Lista compartida por toda la aplicación y guardada en el navegador.

   El carrito y la lista de deseos tenían cada uno su propio useState,
   de modo que cada componente que llamaba al hook creaba una copia
   aparte: la ficha de producto añadía a la suya y el Header seguía
   mostrando el contador de antes, porque el suyo era otro estado. Y
   como todas esas copias guardaban en la misma clave de
   localStorage, la que escribiera de última borraba lo que hubieran
   hecho las demás.

   Aquí el estado vive una sola vez, en el módulo, y los componentes
   se suscriben. Era el mismo código en dos sitios, así que vive en
   uno.

   @param clave       clave de localStorage
   @param normalizar  da forma a cada elemento al leerlo (los datos ya
                      guardados en el navegador pueden traer una forma
                      antigua); por defecto se dejan tal cual
*/
export function crearAlmacenLocal(clave, normalizar = x => x) {
  function leerGuardado() {
    try {
      const guardado = JSON.parse(localStorage.getItem(clave) || '[]');
      return Array.isArray(guardado) ? guardado.map(normalizar) : [];
    } catch { return []; }
  }

  let estado = leerGuardado();
  const oyentes = new Set();

  function publicar(nuevo) {
    estado = nuevo;
    try { localStorage.setItem(clave, JSON.stringify(estado)); }
    catch { /* modo privado o almacenamiento lleno: sigue funcionando
               en esta pestaña, solo no sobrevive al cierre */ }
    oyentes.forEach(fn => fn());
  }

  function suscribir(fn) {
    oyentes.add(fn);
    return () => oyentes.delete(fn);
  }

  /* Dos pestañas abiertas son la misma lista. Sin esto, comprar o
     marcar algo en una dejaba a la otra mostrando lo de antes, y su
     siguiente escritura revivía lo ya quitado. */
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
      if (e.key !== clave) return;
      estado = leerGuardado();
      oyentes.forEach(fn => fn());
    });
  }

  return {
    leer:     () => estado,
    publicar,
    usar:     () => useSyncExternalStore(suscribir, () => estado),
  };
}
