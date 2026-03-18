    /* =============================================================
    OrientPerfumes — Lógica de interacción
    Archivo : js/main.js
    Módulos :
        1. Header  — sombra al hacer scroll
        2. Carrusel Hero — auto-avance, flechas, dots, teclado
        3. Drawer  — menú lateral (abrir / cerrar)
        4. Wishlist — toggle corazón + badge
        5. Carrito  — añadir producto + badge + feedback visual
        6. Búsqueda — limpiar con Escape
    ============================================================= */

    /* ──────────────────────────────────────────────────────────
        1. HEADER: sombra al hacer scroll
        ────────────────────────────────────────────────────────── */
        const header = document.getElementById('header');

        window.addEventListener('scroll', () => {
        // Añade clase "scrolled" cuando el usuario baja más de 10px
        header.classList.toggle('scrolled', window.scrollY > 10);
        });


        /* ──────────────────────────────────────────────────────────
        2. HERO CARRUSEL
        Variables de estado: índice actual y temporizador
        ────────────────────────────────────────────────────────── */
        const slides    = document.querySelectorAll('.hero__slide');
        const dots      = document.querySelectorAll('.hero__dot');
        const btnPrev   = document.getElementById('hero-prev');
        const btnNext   = document.getElementById('hero-next');
        let   current   = 0;           // índice del slide activo
        let   autoTimer = null;        // referencia al setInterval

        /**
         * goToSlide(index)
         * Activa el slide y el dot correspondientes,
         * desactiva los anteriores y actualiza atributos ARIA.
         */
        function goToSlide(index) {
        // Quitar clase activa al slide y dot actuales
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        dots[current].setAttribute('aria-selected', 'false');

        // Calcular nuevo índice circular
        current = (index + slides.length) % slides.length;

        // Activar nuevo slide y dot
        slides[current].classList.add('active');
        dots[current].classList.add('active');
        dots[current].setAttribute('aria-selected', 'true');
        }

        /**
         * startAuto()
         * Inicia el avance automático cada 6 segundos
         */
        function startAuto() {
        stopAuto(); // evitar timers duplicados
        autoTimer = setInterval(() => goToSlide(current + 1), 6000);
        }

        /** stopAuto(): detiene el avance automático */
        function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        // Eventos de las flechas de navegación
        btnPrev.addEventListener('click', () => { goToSlide(current - 1); startAuto(); });
        btnNext.addEventListener('click', () => { goToSlide(current + 1); startAuto(); });

        // Eventos de los dots indicadores
        dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goToSlide(i); startAuto(); });
        });

        // Navegación con teclado (ArrowLeft / ArrowRight)
        document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { goToSlide(current - 1); startAuto(); }
        if (e.key === 'ArrowRight') { goToSlide(current + 1); startAuto(); }
        });

        // Iniciar auto-avance al cargar
        startAuto();


        /* ──────────────────────────────────────────────────────────
        3. MENÚ DRAWER (panel lateral)
        ────────────────────────────────────────────────────────── */
        const menuToggle    = document.getElementById('menu-toggle');
        const drawer        = document.getElementById('drawer');
        const drawerOverlay = document.getElementById('drawer-overlay');
        const drawerClose   = document.getElementById('drawer-close');

        /** openDrawer(): desliza el panel y gestiona ARIA */
        function openDrawer() {
        drawer.classList.add('open');
        drawerOverlay.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        drawerOverlay.setAttribute('aria-hidden', 'false');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // bloquea scroll de fondo
        }

        /** closeDrawer(): oculta el panel */
        function closeDrawer() {
        drawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        drawerOverlay.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // restaura scroll
        }

        menuToggle.addEventListener('click', openDrawer);
        drawerClose.addEventListener('click', closeDrawer);
        drawerOverlay.addEventListener('click', closeDrawer);

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
        });

        // Cerrar drawer al navegar a un anchor
        drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeDrawer);
        });


        /* ──────────────────────────────────────────────────────────
        4. WISHLIST: toggle corazón en tarjetas de producto
        Cambia 🤍 por ❤️ al hacer clic y actualiza el badge
        ────────────────────────────────────────────────────────── */
        const wishBtns  = document.querySelectorAll('.product-card__wish');
        const wishBadge = document.querySelector('.action-btn[aria-label*="deseos"] .action-btn__badge');
        let   wishCount = 0;

        wishBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // evitar que active el producto
            const isActive = btn.dataset.active === 'true';

            if (isActive) {
            // Quitar de wishlist
            btn.textContent = '🤍';
            btn.dataset.active = 'false';
            wishCount = Math.max(0, wishCount - 1);
            } else {
            // Agregar a wishlist
            btn.textContent = '❤️';
            btn.dataset.active = 'true';
            wishCount++;
            }

            // Actualizar badge y label ARIA del botón de header
            wishBadge.textContent = wishCount;
            const wishActionBtn = document.querySelector('.action-btn[aria-label*="deseos"]');
            wishActionBtn.setAttribute('aria-label', `Lista de deseos (${wishCount} items)`);
        });
        });


        /* ──────────────────────────────────────────────────────────
        5. CARRITO: añadir productos (simulado)
        Incrementa el contador del badge del carrito
        ────────────────────────────────────────────────────────── */
        const addBtns    = document.querySelectorAll('.product-card__add');
        const cartBadge  = document.querySelector('.action-btn[aria-label*="Carrito"] .action-btn__badge');
        let   cartCount  = 0;

        addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            cartCount++;
            cartBadge.textContent = cartCount;

            const cartActionBtn = document.querySelector('.action-btn[aria-label*="Carrito"]');
            cartActionBtn.setAttribute('aria-label', `Carrito de compras (${cartCount} items)`);

            // Feedback visual breve: texto cambia momentáneamente
            const originalText = btn.textContent;
            btn.textContent = '✓ Añadido';
            btn.style.background = '#4a7c59';
            setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            }, 1200);
        });
        });


        /* ──────────────────────────────────────────────────────────
        6. BÚSQUEDA: limpiar con Escape
        ────────────────────────────────────────────────────────── */
        const searchInput = document.getElementById('search-input');

        searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.blur();
        }
        });

    /* ──────────────────────────────────────────────────────────
       7. SESIÓN DE USUARIO
       Lee "op_session" de localStorage (escrito por login.js).

       · Si hay sesión activa  → oculta el botón "Iniciar sesión",
         muestra el nombre del usuario y el botón "Salir".
       · Si NO hay sesión      → muestra el enlace al login.html
         y protege la landing redirigiendo al login.

       PROTECCIÓN DE RUTA:
         La landing (index.html) solo debe ser accesible si el
         usuario ha iniciado sesión. Si accede directamente sin
         sesión, se le redirige automáticamente a login.html.
    ────────────────────────────────────────────────────────── */

    /**
     * getSession()
     * Lee la sesión activa desde localStorage.
     * @returns {{username: string, email: string} | null}
     */
    function getSession() {
      try {
        return JSON.parse(localStorage.getItem('op_session') || 'null');
      } catch {
        return null;
      }
    }

    /**
     * clearSession()
     * Elimina la sesión activa del almacenamiento local.
     */
    function clearSession() {
      localStorage.removeItem('op_session');
    }

    /**
     * initSession()
     * Punto de entrada del módulo de sesión.
     * Se llama al cargar la página.
     */
    function initSession() {
      const session = getSession();

      // ── Sin sesión: redirigir al login ──
      // Descomenta las siguientes 3 líneas para activar la
      // protección de ruta (solo si tienes backend o en producción).
      // if (!session) {
      //   window.location.href = 'login.html';
      //   return;
      // }

      const btnAccount   = document.getElementById('btn-account');
      const sessionInfo  = document.getElementById('session-info');
      const sessionName  = document.getElementById('session-username');
      const btnLogout    = document.getElementById('btn-logout');

      if (session && session.username) {
        // ── Con sesión: mostrar nombre y ocultar enlace al login ──
        if (btnAccount)  btnAccount.hidden = true;
        if (sessionInfo) sessionInfo.hidden = false;
        if (sessionName) sessionName.textContent = session.username;
      }
      // Sin sesión: el enlace al login ya está visible por defecto (HTML)

      // ── Botón cerrar sesión ──
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          clearSession();
          // Redirigir al login después de cerrar sesión
          window.location.href = 'login.html';
        });
      }
    }

    // Arrancar el módulo de sesión al cargar el DOM
    document.addEventListener('DOMContentLoaded', initSession);
