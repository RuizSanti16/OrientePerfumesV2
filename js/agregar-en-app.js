/**
 * FRAGMENTO PARA AGREGAR EN js/app.js
 * =====================================
 * OrientPerfumes · Sección Noticias Preview en el Inicio
 *
 * INSTRUCCIONES:
 * Copia TODO este bloque y pégalo al FINAL de tu archivo js/app.js
 * existente (justo antes del cierre de cualquier función envolvente,
 * o simplemente al final del archivo si el código es de nivel raíz).
 *
 * QUÉ HACE:
 * Lee los lanzamientos guardados en localStorage (clave "op_lanzamientos")
 * y los renderiza en el grid #home-lanzamientos-grid que aparece
 * en index.html dentro de la sección "Noticias & Novedades".
 * Si no hay datos, muestra 4 tarjetas placeholder decorativas.
 */

// ── NOTICIAS PREVIEW (sección en el inicio) ──────────────────────
// Este bloque se auto-ejecuta al cargar la página.
// Solo actúa si existe el elemento #home-lanzamientos-grid,
// por lo que es seguro incluirlo en app.js sin afectar otras páginas.

(function renderLanzamientosHome() {
  const grid = document.getElementById('home-lanzamientos-grid');
  if (!grid) return; // Solo ejecutar en index.html

  // Leer lanzamientos del localStorage (guardados por el admin)
  let lanzamientos = [];
  try {
    const raw = localStorage.getItem('op_lanzamientos');
    lanzamientos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    lanzamientos = [];
  }

  /**
   * Escapa HTML para prevenir XSS al inyectar texto en el DOM.
   */
  function esc(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (lanzamientos.length === 0) {
    // Sin datos en localStorage: mostrar 4 tarjetas placeholder
    grid.innerHTML = Array(4).fill(0).map(() => `
      <article class="home-launch-card" role="listitem">
        <div class="home-launch-card__img-placeholder" aria-hidden="true">🫙</div>
        <div class="home-launch-card__info">
          <div class="home-launch-card__badge">Próximamente</div>
          <div class="home-launch-card__name">Nuevo Lanzamiento</div>
          <p class="home-launch-card__desc">Disponible próximamente en OrientPerfumes</p>
        </div>
      </article>`).join('');
    return;
  }

  // Mostrar máximo 4 lanzamientos (los primeros del array)
  grid.innerHTML = lanzamientos.slice(0, 4).map(item => `
    <article class="home-launch-card" role="listitem"
             tabindex="0" aria-label="${esc(item.nombre)}">
      ${item.imagen
        ? `<img class="home-launch-card__img"
               src="${esc(item.imagen)}"
               alt="${esc(item.nombre)}"
               loading="lazy"/>`
        : `<div class="home-launch-card__img-placeholder" aria-hidden="true">🫙</div>`
      }
      <div class="home-launch-card__info">
        <div class="home-launch-card__badge">${esc(item.badge || 'Próximamente')}</div>
        <div class="home-launch-card__name">${esc(item.nombre || '')}</div>
        <p class="home-launch-card__desc">${esc(item.descripcion || '')}</p>
      </div>
    </article>`).join('');

  // Al hacer clic en una tarjeta, navega a noticias.html
  grid.querySelectorAll('.home-launch-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = 'noticias.html';
    });
    // Accesibilidad: también responde al teclado
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        window.location.href = 'noticias.html';
      }
    });
  });
})();
// ── FIN NOTICIAS PREVIEW ─────────────────────────────────────────
