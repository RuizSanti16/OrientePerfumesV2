/* =============================================================
   OrientPerfumes — Lógica de interacción
   Archivo : js/app.js

   MÓDULOS:
     1. Header        — sombra al hacer scroll
     2. Carrusel Hero — auto-avance, flechas, dots, teclado
     3. Drawer        — abrir / cerrar menú lateral
     4. Búsqueda      — limpiar campo con Escape
     5. Wishlist      — toggle corazón en tarjetas de producto
     6. Carrito       — añadir producto + feedback visual
     7. Sesión        — leer op_session del localStorage y
                        mostrar nombre + botón cerrar sesión
                        dentro del drawer
     8. Noticias      — renderizar lanzamientos en el inicio

   IMPORTANTE: TODO el código que accede al DOM está dentro de
   DOMContentLoaded para garantizar que los elementos existen
   antes de intentar usarlos.
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     1. HEADER — sombra al hacer scroll
  ────────────────────────────────────────────────────────── */
  const header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }


  /* ──────────────────────────────────────────────────────────
     2. HERO CARRUSEL
     Lee configuración desde localStorage (clave "op_carrusel").
     Si el admin guardó imágenes/textos los aplica antes de
     inicializar el carrusel. Si no hay datos usa el HTML tal cual.
  ────────────────────────────────────────────────────────── */

  /* ── Aplicar datos del admin al carrusel ── */
  (function aplicarCarrusel() {
    try {
      var raw = localStorage.getItem('op_carrusel');
      if (!raw) return;
      var datos = JSON.parse(raw);

      datos.forEach(function (slide, i) {
        var el = document.querySelectorAll('.hero__slide')[i];
        if (!el) return;

        /* Imagen de fondo: si hay URL la aplica sobre el gradiente */
        var bg = el.querySelector('.hero__bg');
        if (bg && slide.imagen) {
          bg.style.backgroundImage    = 'url(' + slide.imagen + ')';
          bg.style.backgroundSize     = slide.imgSize || 'cover';
          bg.style.backgroundPosition =
            (slide.imgPosX !== undefined ? slide.imgPosX : 50) + '% ' +
            (slide.imgPosY !== undefined ? slide.imgPosY : 50) + '%';
        }

        /* Label */
        var labelEl = el.querySelector('.hero__label');
        if (labelEl && slide.label) {
          /* Preservar los ::before/::after con solo cambiar el texto */
          labelEl.childNodes.forEach(function (n) {
            if (n.nodeType === 3) n.textContent = slide.label;
          });
        }

        /* Título (soporta \n como salto de línea) */
        var tituloEl = el.querySelector('.hero__title');
        if (tituloEl && slide.titulo) {
          tituloEl.innerHTML = slide.titulo.replace(/\\n/g, '<br>');
        }

        /* Subtítulo */
        var subEl = el.querySelector('.hero__subtitle');
        if (subEl && slide.subtitulo) {
          subEl.textContent = slide.subtitulo;
        }

        /* Botones CTA */
        var btns = el.querySelectorAll('.hero__cta a');
        if (btns[0] && slide.btn1) btns[0].textContent = slide.btn1;
        if (btns[1] && slide.btn2) btns[1].textContent = slide.btn2;
      });
    } catch (e) {
      console.warn('[app.js] Error al cargar datos del carrusel:', e);
    }
  })();
  const slides  = document.querySelectorAll('.hero__slide');
  const dots    = document.querySelectorAll('.hero__dot');
  const btnPrev = document.getElementById('hero-prev');
  const btnNext = document.getElementById('hero-next');
  let current   = 0;
  let autoTimer = null;

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goToSlide(current + 1), 6000);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  if (slides.length && btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => { goToSlide(current - 1); startAuto(); });
    btnNext.addEventListener('click', () => { goToSlide(current + 1); startAuto(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goToSlide(i); startAuto(); });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goToSlide(current - 1); startAuto(); }
      if (e.key === 'ArrowRight') { goToSlide(current + 1); startAuto(); }
    });

    startAuto();
  }


  /* ──────────────────────────────────────────────────────────
     3. DRAWER — abrir / cerrar el menú lateral
     El CSS usa la clase "open" para mostrar el panel.
  ────────────────────────────────────────────────────────── */
  const menuToggle    = document.getElementById('menu-toggle');
  const drawer        = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerClose   = document.getElementById('drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle && drawer) {
    menuToggle.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }


  /* ──────────────────────────────────────────────────────────
     4. BÚSQUEDA — limpiar campo con Escape
  ────────────────────────────────────────────────────────── */
  const searchInput = document.getElementById('search-input');

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.blur();
      }
    });
  }


  /* ──────────────────────────────────────────────────────────
     5. WISHLIST — toggle corazón en tarjetas de producto
        Actualiza el badge del header al agregar/quitar.
  ────────────────────────────────────────────────────────── */
  const wishBtns  = document.querySelectorAll('.product-card__wish');
  const wishBadge = document.getElementById('wish-badge');
  let wishCount   = 0;

  wishBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = btn.dataset.active === 'true';

      if (isActive) {
        btn.textContent    = '🤍';
        btn.dataset.active = 'false';
        wishCount = Math.max(0, wishCount - 1);
      } else {
        btn.textContent    = '❤️';
        btn.dataset.active = 'true';
        wishCount++;
      }

      if (wishBadge) wishBadge.textContent = wishCount;
    });
  });


  /* ──────────────────────────────────────────────────────────
     6. CARRITO — añadir productos (simulado)
        Actualiza el badge del header al agregar.
  ────────────────────────────────────────────────────────── */
  const addBtns  = document.querySelectorAll('.product-card__add');
  const cartBadge = document.getElementById('cart-badge');
  let cartCount  = 0;

  addBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cartCount++;

      if (cartBadge) cartBadge.textContent = cartCount;

      const originalText   = btn.textContent;
      btn.textContent      = '✓ Añadido';
      btn.style.background = '#4a7c59';
      setTimeout(() => {
        btn.textContent      = originalText;
        btn.style.background = '';
      }, 1200);
    });
  });


  /* ──────────────────────────────────────────────────────────
     7. SESIÓN DE USUARIO
     Lee "op_session" del localStorage.
     · Sin sesión → muestra #btn-account (Iniciar Sesión)
     · Con sesión → oculta #btn-account, muestra #session-info
  ────────────────────────────────────────────────────────── */
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('op_session') || 'null');
    } catch {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem('op_session');
  }

  const session     = getSession();
  const btnAccount  = document.getElementById('btn-account');
  const sessionInfo = document.getElementById('session-info');
  const sessionName = document.getElementById('session-username');
  const btnLogout   = document.getElementById('btn-logout');

  if (session && session.username) {
    if (btnAccount)  btnAccount.hidden  = true;
    if (sessionInfo) sessionInfo.hidden = false;
    if (sessionName) sessionName.textContent = session.username;
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      clearSession();
      window.location.href = 'login.html';
    });
  }


  /* ──────────────────────────────────────────────────────────
     8. NOTICIAS PREVIEW — renderizar lanzamientos en el inicio
     Solo actúa si existe #home-lanzamientos-grid en la página.
  ────────────────────────────────────────────────────────── */
  const grid = document.getElementById('home-lanzamientos-grid');

  if (grid) {
    let lanzamientos = [];
    try {
      const raw = localStorage.getItem('op_lanzamientos');
      lanzamientos = raw ? JSON.parse(raw) : [];
    } catch (e) {
      lanzamientos = [];
    }

    function esc(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
    }

    if (lanzamientos.length === 0) {
      grid.innerHTML = Array(4).fill(0).map(() => `
        <article class="home-launch-card" role="listitem">
          <div class="home-launch-card__img-placeholder" aria-hidden="true">🫙</div>
          <div class="home-launch-card__info">
            <div class="home-launch-card__badge">Próximamente</div>
            <div class="home-launch-card__name">Nuevo Lanzamiento</div>
            <p class="home-launch-card__desc">Disponible próximamente en OrientPerfumes</p>
          </div>
        </article>`).join('');
    } else {
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

      grid.querySelectorAll('.home-launch-card').forEach(card => {
        card.addEventListener('click', () => {
          window.location.href = 'noticias.html';
        });
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            window.location.href = 'noticias.html';
          }
        });
      });
    }
  }

}); // ── fin DOMContentLoaded ──────────────────────────────────