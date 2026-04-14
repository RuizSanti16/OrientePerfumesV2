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
  /* ── Formato de precios en COP ── */
  function formatCOP(v) {
    return '$ ' + Number(v||0).toLocaleString('es-CO');
  }

  /* ── Parsear precio que puede venir como string "$320.000" o número ── */
  function parsePrecio(v) {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    // Remover $, espacios, puntos de miles y comas
    var limpio = String(v).replace(/[$\s.]/g, '').replace(/,/g, '');
    return parseFloat(limpio) || 0;
  }


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
     4. WISHLIST y CARRITO — funcionales con localStorage
     Claves: "op_wishlist" (array) y "op_carrito" (array)
  ────────────────────────────────────────────────────────── */

  /* ── Helpers localStorage ── */
  function getWishlist()  { try { return JSON.parse(localStorage.getItem('op_wishlist')||'[]'); } catch(e){ return []; } }
  function getCarrito()   { try { return JSON.parse(localStorage.getItem('op_carrito') ||'[]'); } catch(e){ return []; } }
  function saveWishlist(w){ localStorage.setItem('op_wishlist', JSON.stringify(w)); }
  function saveCarrito(c) { localStorage.setItem('op_carrito',  JSON.stringify(c)); }

  /* ── Badges ── */
  const wishBadge = document.getElementById('wish-badge');
  const cartBadge = document.getElementById('cart-badge');
  var wishCount = getWishlist().length;
  var cartCount = getCarrito().reduce(function(sum, i){ return sum + (i.cantidad||1); }, 0);

  function updateBadges() {
    wishCount = getWishlist().length;
    cartCount = getCarrito().reduce(function(sum, i){ return sum + (i.cantidad||1); }, 0);
    if (wishBadge) wishBadge.textContent = wishCount;
    if (cartBadge) cartBadge.textContent = cartCount;
    var wishBtn = document.getElementById('btn-wishlist');
    var cartBtn = document.getElementById('btn-cart');
    if (wishBtn) wishBtn.setAttribute('aria-label', 'Lista de deseos (' + wishCount + ' items)');
    if (cartBtn) cartBtn.setAttribute('aria-label', 'Carrito de compras (' + cartCount + ' items)');
  }

  /* ── Agregar a wishlist ── */
  function toggleWishlist(producto) {
    var w = getWishlist();
    var idx = w.findIndex(function(x){ return x.id === producto.id; });
    if (idx >= 0) { w.splice(idx, 1); }
    else          { w.push(producto); }
    saveWishlist(w);
    updateBadges();
    return idx < 0; // true = agregado, false = quitado
  }

  function estaEnWishlist(id) {
    return getWishlist().some(function(x){ return x.id === id; });
  }

  /* ── Agregar al carrito ── */
  function agregarAlCarrito(producto) {
    var c = getCarrito();
    var idx = c.findIndex(function(x){ return x.id === producto.id && x.presentacion === producto.presentacion; });
    if (idx >= 0) { c[idx].cantidad = (c[idx].cantidad || 1) + 1; }
    else          { producto.cantidad = 1; c.push(producto); }
    saveCarrito(c);
    updateBadges();
  }

  /* ── Panel carrito (drawer) ── */
  function renderCarritoDrawer() {
    var panel = document.getElementById('carrito-panel');
    if (!panel) return;
    var items = getCarrito();
    if (!items.length) {
      panel.innerHTML = '<p style="text-align:center;padding:20px;color:var(--cream-muted);font-size:12px;letter-spacing:0.1em">EL CARRITO ESTÁ VACÍO</p>';
      return;
    }
    var total = items.reduce(function(sum, i){ return sum + (i.precio * (i.cantidad||1)); }, 0);
    panel.innerHTML = items.map(function(item, idx) {
      return '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(201,168,76,0.1)">' +
        (item.imagen ? '<img src="' + item.imagen + '" style="width:44px;height:44px;object-fit:cover;border-radius:4px">' : '<div style="width:44px;height:44px;background:rgba(201,168,76,0.1);border-radius:4px;display:flex;align-items:center;justify-content:center">🫙</div>') +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:12px;color:var(--cream);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + item.nombre + '</div>' +
          (item.presentacion ? '<div style="font-size:10px;color:var(--cream-muted)">' + item.presentacion + '</div>' : '') +
          '<div style="font-size:11px;color:var(--gold,#C9A84C);margin-top:2px">$ ' + Number(item.precio||0).toLocaleString('es-CO') + ' × ' + (item.cantidad||1) + '</div>' +
        '</div>' +
        '<button onclick="quitarDelCarrito(' + idx + ')" style="background:none;border:none;color:#e05252;cursor:pointer;font-size:16px;padding:0 4px">✕</button>' +
      '</div>';
    }).join('') +
    '<div style="margin-top:12px;text-align:right">' +
      '<div style="font-size:11px;color:var(--cream-muted);letter-spacing:0.1em">TOTAL</div>' +
      '<div style="font-size:18px;color:var(--gold,#C9A84C);font-weight:700">$ ' + total.toLocaleString('es-CO') + '</div>' +
    '</div>';
  }

  function quitarDelCarrito(idx) {
    var c = getCarrito();
    c.splice(idx, 1);
    saveCarrito(c);
    updateBadges();
    renderCarritoDrawer();
    renderWishlistDrawer();
  }

  window.cerrarPaneles = cerrarPaneles;
  function renderWishlistDrawer() {
    var panel = document.getElementById('wishlist-panel');
    if (!panel) return;
    var items = getWishlist();
    if (!items.length) {
      panel.innerHTML = '<p style="text-align:center;padding:20px;color:var(--cream-muted);font-size:12px;letter-spacing:0.1em">TU LISTA DE DESEOS ESTÁ VACÍA</p>';
      return;
    }
    panel.innerHTML = items.map(function(item) {
      return '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(201,168,76,0.1)">' +
        (item.imagen ? '<img src="' + item.imagen + '" style="width:44px;height:44px;object-fit:cover;border-radius:4px">' : '<div style="width:44px;height:44px;background:rgba(201,168,76,0.1);border-radius:4px;display:flex;align-items:center;justify-content:center">🫙</div>') +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:12px;color:var(--cream);font-weight:600">' + item.nombre + '</div>' +
          '<div style="font-size:11px;color:var(--cream-muted)">' + (item.marca||'') + '</div>' +
          '<div style="font-size:11px;color:var(--gold,#C9A84C);margin-top:2px">$ ' + Number(item.precio||0).toLocaleString('es-CO') + '</div>' +
        '</div>' +
        '<button onclick="quitarDeWishlist(\'' + item.id + '\')" style="background:none;border:none;color:#e05252;cursor:pointer;font-size:16px;padding:0 4px">✕</button>' +
      '</div>';
    }).join('');
  }

  function quitarDeWishlist(id) {
    var w = getWishlist();
    saveWishlist(w.filter(function(x){ return x.id !== id; }));
    updateBadges();
    renderWishlistDrawer();
    document.querySelectorAll('.product-card__wish[data-id="' + id + '"]').forEach(function(btn){
      btn.textContent = '🤍'; btn.dataset.active = 'false';
    });
  }

  window.quitarDeWishlist  = quitarDeWishlist;
  window.quitarDelCarrito  = quitarDelCarrito;
  window.cerrarPaneles     = cerrarPaneles;

  /* ── Abrir panel al clic en iconos del header ── */
  var panelActivo = null;

  function mostrarPanel(tipo) {
    var carritoP = document.getElementById('panel-carrito-overlay');
    var wishlistP = document.getElementById('panel-wishlist-overlay');
    if (!carritoP) crearPaneles();
    carritoP  = document.getElementById('panel-carrito-overlay');
    wishlistP = document.getElementById('panel-wishlist-overlay');

    if (tipo === 'carrito') {
      renderCarritoDrawer();
      carritoP.classList.add('open');
      wishlistP.classList.remove('open');
    } else {
      renderWishlistDrawer();
      wishlistP.classList.add('open');
      carritoP.classList.remove('open');
    }
    panelActivo = tipo;
  }

  function cerrarPaneles() {
    ['panel-carrito-overlay','panel-wishlist-overlay'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.classList.remove('open');
    });
    panelActivo = null;
  }

  function crearPaneles() {
    var estilos = '<style>' +
      '.side-panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;opacity:0;pointer-events:none;transition:opacity 0.3s}' +
      '.side-panel-overlay.open{opacity:1;pointer-events:all}' +
      '.side-panel{position:absolute;top:0;right:0;bottom:0;width:340px;max-width:100vw;background:#111;border-left:1px solid rgba(201,168,76,0.2);transform:translateX(100%);transition:transform 0.3s;display:flex;flex-direction:column}' +
      '.side-panel-overlay.open .side-panel{transform:translateX(0)}' +
      '.side-panel__header{padding:20px;border-bottom:1px solid rgba(201,168,76,0.15);display:flex;justify-content:space-between;align-items:center}' +
      '.side-panel__title{font-family:Cinzel,serif;font-size:13px;letter-spacing:0.15em;color:#C9A84C}' +
      '.side-panel__close{background:none;border:none;color:#888;cursor:pointer;font-size:20px}' +
      '.side-panel__body{flex:1;overflow-y:auto;padding:16px}' +
    '</style>';

    var carritoHTML = '<div class="side-panel-overlay" id="panel-carrito-overlay">' +
      '<div class="side-panel">' +
        '<div class="side-panel__header">' +
          '<span class="side-panel__title">CARRITO DE COMPRAS</span>' +
          '<button class="side-panel__close" onclick="cerrarPaneles()">✕</button>' +
        '</div>' +
        '<div class="side-panel__body" id="carrito-panel"></div>' +
      '</div></div>';

    var wishlistHTML = '<div class="side-panel-overlay" id="panel-wishlist-overlay">' +
      '<div class="side-panel">' +
        '<div class="side-panel__header">' +
          '<span class="side-panel__title">LISTA DE DESEOS</span>' +
          '<button class="side-panel__close" onclick="cerrarPaneles()">✕</button>' +
        '</div>' +
        '<div class="side-panel__body" id="wishlist-panel"></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', estilos + carritoHTML + wishlistHTML);

    /* Cerrar al clic fuera */
    document.getElementById('panel-carrito-overlay').addEventListener('click', function(e){
      if (e.target === this) cerrarPaneles();
    });
    document.getElementById('panel-wishlist-overlay').addEventListener('click', function(e){
      if (e.target === this) cerrarPaneles();
    });
  }

  /* Inicializar paneles */
  crearPaneles();
  updateBadges();

  /* Conectar botones del header */
  var btnWish = document.getElementById('btn-wishlist');
  var btnCart = document.getElementById('btn-cart');
  if (btnWish) btnWish.addEventListener('click', function(){ mostrarPanel('wishlist'); });
  if (btnCart) btnCart.addEventListener('click', function(){ mostrarPanel('carrito'); });

  /* ──────────────────────────────────────────────────────────
     5. BÚSQUEDA — limpiar campo con Escape
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
     6. SESIÓN DE USUARIO
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

  /* ──────────────────────────────────────────────────────────
     9. PRODUCTOS DESTACADOS
     Lee "op_productos_destacados" del localStorage y renderiza
     las 4 tarjetas en #products-grid del index.html.
     Si no hay datos muestra los productos por defecto.
  ────────────────────────────────────────────────────────── */
  (function renderProductosDestacados() {
    var grid = document.getElementById('products-grid');
    if (!grid) return;

    var DEFAULT = [];

    var productos = DEFAULT;
    try {
      var raw = localStorage.getItem('op_productos_destacados');
      if (raw) productos = JSON.parse(raw);
    } catch(e) {}

    /* Si no hay productos configurados, no mostrar nada */
    if (!productos || productos.length === 0 || productos.every(function(p){ return !p.nombre; })) {
      if (grid) grid.innerHTML = '<p style="text-align:center;padding:40px;color:var(--cream-muted);font-family:var(--font-label);font-size:11px;letter-spacing:0.15em;">PRODUCTOS PRÓXIMAMENTE</p>';
      return;
    }

    var BADGE_MAP = {
      new:  { cls:'badge--new',  label:'Nuevo' },
      excl: { cls:'badge--excl', label:'Exclusivo' },
      sale: { cls:'badge--sale', label:'Oferta' },
      none: { cls:'',            label:'' }
    };

    function escP(s) {
      if (typeof s !== 'string') return '';
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')
              .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    grid.innerHTML = productos.map(function(p) {
      var badge   = BADGE_MAP[p.badge] || BADGE_MAP.none;
      var imgHTML = p.imagen
        ? '<img src="' + escP(p.imagen) + '" alt="' + escP(p.nombre) + '"' +
          ' style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">'
        : '<span class="product-card__placeholder" aria-hidden="true">🫙</span>';

      var badgeHTML = badge.label
        ? '<span class="product-card__badge ' + badge.cls + '">' + badge.label + '</span>'
        : '';

      var precioHTML = (p.badge === 'sale' && p.precioAnterior)
        ? '<s>' + escP(p.precioAnterior) + '</s> ' + escP(p.precio)
        : escP(p.precio);

      /* Selector de presentaciones */
      var presHTML = '';
      var pres = p.presentaciones || [];
      if (pres.length > 1) {
        presHTML = '<div style="margin-top:8px">' +
          '<select class="pres-select" data-id="' + escP(String(p.id||p.nombre)) + '" ' +
            'style="width:100%;background:#1a1a18;color:#C8C0B0;border:1px solid rgba(201,168,76,0.3);border-radius:4px;padding:6px 8px;font-size:11px;letter-spacing:0.05em">' +
            pres.map(function(pr) {
              return '<option value="' + escP(pr.etiqueta) + '" data-precio="' + (pr.precio||0) + '">' +
                escP(pr.etiqueta) + ' — $ ' + Number(pr.precio||0).toLocaleString('es-CO') + '</option>';
            }).join('') +
          '</select>' +
        '</div>';
      }

      var enWish = estaEnWishlist(String(p.id||p.nombre));

      return '<article class="product-card" role="listitem" tabindex="0" data-prod-id="' + escP(String(p.id||p.nombre)) + '">' +
        '<div class="product-card__img-wrap">' +
          imgHTML + badgeHTML +
          '<button class="product-card__wish" data-id="' + escP(String(p.id||p.nombre)) + '" data-active="' + (enWish?'true':'false') + '" aria-label="Lista de deseos">' + (enWish?'❤️':'🤍') + '</button>' +
          '<button class="product-card__add" data-id="' + escP(String(p.id||p.nombre)) + '" aria-label="Añadir al carrito">Añadir al Carrito</button>' +
        '</div>' +
        '<div class="product-card__info">' +
          '<div class="product-card__brand">' + escP(p.marca)  + '</div>' +
          '<div class="product-card__name">'  + escP(p.nombre) + '</div>' +
          '<div class="product-card__price">' + precioHTML     + '</div>' +
          presHTML +
        '</div>' +
      '</article>';
    }).join('');

    /* Re-registrar wishlist y carrito */
    grid.querySelectorAll('.product-card__wish').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var prodId = btn.dataset.id;
        var prod = productos.find(function(x){ return String(x.id||x.nombre) === prodId; });
        if (!prod) return;
        var agregado = toggleWishlist({
          id:     String(prod.id||prod.nombre),
          nombre: prod.nombre,
          marca:  prod.marca  || '',
          precio: parsePrecio(prod.precio),
          imagen: prod.imagen || ''
        });
        btn.textContent    = agregado ? '❤️' : '🤍';
        btn.dataset.active = agregado ? 'true' : 'false';
      });
    });

    grid.querySelectorAll('.product-card__add').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var prodId = btn.dataset.id;
        var prod = productos.find(function(x){ return String(x.id||x.nombre) === prodId; });
        if (!prod) return;

        /* Leer presentación seleccionada si existe */
        var card = btn.closest('.product-card');
        var select = card ? card.querySelector('.pres-select') : null;
        var presLabel = '';
        var precio = parsePrecio(prod.precio);

        if (select) {
          var opt = select.options[select.selectedIndex];
          presLabel = opt ? opt.value : '';
          precio    = opt ? (parseFloat(opt.dataset.precio) || precio) : precio;
        }

        agregarAlCarrito({
          id:           String(prod.id||prod.nombre) + (presLabel ? '_' + presLabel : ''),
          nombre:       prod.nombre,
          marca:        prod.marca  || '',
          precio:       Number(precio),
          imagen:       prod.imagen || '',
          presentacion: presLabel
        });

        var orig = btn.textContent;
        btn.textContent      = '✓ Añadido';
        btn.style.background = '#4a7c59';
        setTimeout(function() {
          btn.textContent      = orig;
          btn.style.background = '';
        }, 1200);
      });
    });
  })();

}); // ── fin DOMContentLoaded ──────────────────────────────────