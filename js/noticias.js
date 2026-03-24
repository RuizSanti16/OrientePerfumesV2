    /**
     * noticias.js — Lógica de la sección Noticias
     * OrientPerfumes · Versión 1.0
     *
     * RESPONSABILIDADES:
     *  1. Cargar y renderizar contenido desde localStorage (puesto por admin)
     *  2. Renderizar tarjetas de Nuevos Lanzamientos
     *  3. Renderizar y gestionar Comentarios (envío, reacciones like/dislike)
     *  4. Gestionar el Video principal
     *  5. Animaciones del drawer (menú lateral)
     *
     * CLAVES DE LOCALSTORE usadas (las mismas que lee admin-noticias):
     *  - "op_video"          → { titulo, descripcion, url, tipo: 'file'|'youtube'|'vimeo' }
     *  - "op_lanzamientos"  → Array de objetos { id, nombre, descripcion, badge, imagen }
     *  - "op_comentarios"   → Array de objetos { id, nombre, texto, likes, dislikes, aprobado, fecha }
     */

    /* ============================================================
    INICIALIZACIÓN
    Se ejecuta cuando el DOM está completamente cargado.
    ============================================================ */
    document.addEventListener('DOMContentLoaded', () => {
    inicializarVideo();
    inicializarLanzamientos();
    inicializarComentarios();
    inicializarDrawer();
    });

    /* ============================================================
    1. VIDEO PRINCIPAL
    Lee la configuración del video desde localStorage y
    decide si mostrar un <video>, un <iframe> (YouTube/Vimeo)
    o mantener el placeholder.
    ============================================================ */
    function inicializarVideo() {
    // Leer datos del video guardados por el admin
    const videoData = leerStorage('op_video');

    const wrapper      = document.getElementById('video-wrapper');
    const placeholder  = document.getElementById('video-placeholder');
    const videoEl      = document.getElementById('main-video');
    const tituloEl     = document.getElementById('video-titulo');
    const descripEl    = document.getElementById('video-descripcion');

    if (!videoData || !videoData.url) {
        // No hay video configurado: mostrar placeholder
        placeholder.classList.remove('hidden');
        videoEl.classList.add('hidden');
        return;
    }

    // Mostrar título y descripción
    if (tituloEl && videoData.titulo)
        tituloEl.textContent = videoData.titulo;
    if (descripEl && videoData.descripcion)
        descripEl.textContent = videoData.descripcion;

    if (videoData.tipo === 'youtube' || videoData.tipo === 'vimeo') {
        // ── Embed externo (YouTube / Vimeo) ───────────────────
        const iframe = document.createElement('iframe');
        iframe.className = 'video-iframe';
        iframe.src = convertirUrlEmbed(videoData.url, videoData.tipo);
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.setAttribute('aria-label', 'Video de OrientPerfumes');
        iframe.title = videoData.titulo || 'Video';

        placeholder.classList.add('hidden');
        videoEl.classList.add('hidden');
        wrapper.appendChild(iframe);

    } else {
        // ── Archivo de video local / URL directa ──────────────
        const source = document.createElement('source');
        source.src = videoData.url;
        // Detectar tipo MIME básico
        source.type = videoData.url.endsWith('.webm') ? 'video/webm'
                    : videoData.url.endsWith('.ogg')  ? 'video/ogg'
                    : 'video/mp4';

        videoEl.appendChild(source);
        videoEl.classList.remove('hidden');
        placeholder.classList.add('hidden');
        videoEl.load();
    }
    }

    /**
     * Convierte una URL normal de YouTube/Vimeo a su versión embed.
     * @param {string} url  - URL original del video
     * @param {string} tipo - 'youtube' | 'vimeo'
     * @returns {string} URL del embed
     */
    function convertirUrlEmbed(url, tipo) {
    if (tipo === 'youtube') {
        // Soporta: youtu.be/ID y youtube.com/watch?v=ID
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&?/]+)/);
        return match
        ? `https://www.youtube.com/embed/${match[1]}?rel=0`
        : url;
    }
    if (tipo === 'vimeo') {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match
        ? `https://player.vimeo.com/video/${match[1]}`
        : url;
    }
    return url;
    }

    /* ============================================================
    2. NUEVOS LANZAMIENTOS
    Lee el array de lanzamientos del localStorage y
    renderiza tarjetas en el grid.
    ============================================================ */
    function inicializarLanzamientos() {
    const grid = document.getElementById('lanzamientos-grid');
    if (!grid) return;

    const lanzamientos = leerStorage('op_lanzamientos') || [];

    if (lanzamientos.length === 0) {
        // Estado vacío: mostrar mensaje elegante
        grid.innerHTML = `
        <div class="lanzamientos-empty" role="status">
            Próximamente · Nuevos lanzamientos
        </div>`;
        return;
    }

    // Renderizar cada tarjeta
    grid.innerHTML = lanzamientos.map(item => crearTarjetaLanzamiento(item)).join('');
    }

    /**
     * Genera el HTML de una tarjeta de lanzamiento.
     * @param {Object} item - { id, nombre, descripcion, badge, imagen }
     * @returns {string} HTML de la tarjeta
     */
    function crearTarjetaLanzamiento(item) {
    // Imagen o placeholder
    const imagenHTML = item.imagen
        ? `<img class="launch-card__img" src="${escapeHTML(item.imagen)}" alt="${escapeHTML(item.nombre)}" loading="lazy"/>`
        : `<div class="launch-card__img-placeholder" aria-hidden="true">IMG</div>`;

    return `
        <article class="launch-card" role="listitem" tabindex="0"
                aria-label="${escapeHTML(item.nombre)}">
        <div class="launch-card__header">${escapeHTML(item.nombre || 'Lanzamiento')}</div>
        <div class="launch-card__badge">${escapeHTML(item.badge || 'Próximamente')}</div>
        <p class="launch-card__desc">${escapeHTML(item.descripcion || '')}</p>
        ${imagenHTML}
        </article>`;
    }

    /* ============================================================
    3. COMENTARIOS
    Lee comentarios aprobados del localStorage, los renderiza
    y gestiona el envío de nuevos comentarios.
    ============================================================ */
    function inicializarComentarios() {
    renderizarComentarios();

    const btnEnviar = document.getElementById('btn-enviar-comentario');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', enviarComentario);
    }
    }

    /**
     * Lee los comentarios aprobados y los renderiza en la lista.
     */
    function renderizarComentarios() {
    const lista = document.getElementById('comentarios-lista');
    if (!lista) return;

    const todos = leerStorage('op_comentarios') || [];
    // Solo mostrar los aprobados por el administrador
    const aprobados = todos.filter(c => c.aprobado === true);

    if (aprobados.length === 0) {
        lista.innerHTML = `
        <div class="comentarios-empty" role="status">
            Sé el primero en comentar
        </div>`;
        return;
    }

    lista.innerHTML = aprobados
        .slice()
        .reverse() // Más recientes primero
        .map(c => crearHTMLComentario(c))
        .join('');

    // Añadir listeners de reacción a los botones recién creados
    lista.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', manejarReaccion);
    });
    }

    /**
     * Genera el HTML de una tarjeta de comentario.
     * @param {Object} c - comentario
     * @returns {string} HTML
     */
    function crearHTMLComentario(c) {
    return `
        <div class="comentario-card" role="listitem" data-id="${c.id}">
        <div class="comentario-avatar" aria-hidden="true">👤</div>
        <div class="comentario-body">
            <div class="comentario-nombre">${escapeHTML(c.nombre)}</div>
            <p class="comentario-texto">${escapeHTML(c.texto)}</p>
        </div>
        <div class="comentario-acciones">
            <button
            class="reaction-btn reaction-btn--like"
            data-id="${c.id}"
            data-tipo="like"
            aria-label="Me gusta (${c.likes || 0})"
            title="Me gusta"
            >
            👍 <span>${c.likes || 0}</span>
            </button>
            <button
            class="reaction-btn reaction-btn--dislike"
            data-id="${c.id}"
            data-tipo="dislike"
            aria-label="No me gusta (${c.dislikes || 0})"
            title="No me gusta"
            >
            👎 <span>${c.dislikes || 0}</span>
            </button>
        </div>
        </div>`;
    }

    /**
     * Maneja el envío de un nuevo comentario desde el formulario.
     * El comentario queda en estado "pendiente" hasta que el admin lo apruebe.
     */
    function enviarComentario() {
    const nombreEl = document.getElementById('comentario-nombre');
    const textoEl  = document.getElementById('comentario-texto');

    const nombre = nombreEl.value.trim();
    const texto  = textoEl.value.trim();

    if (!nombre) {
        mostrarToast('Por favor ingresa tu nombre.');
        nombreEl.focus();
        return;
    }
    if (!texto) {
        mostrarToast('Por favor escribe tu comentario.');
        textoEl.focus();
        return;
    }

    // Crear objeto del nuevo comentario (pendiente de aprobación)
    const nuevoComentario = {
        id:        Date.now(),               // ID único basado en timestamp
        nombre:    nombre,
        texto:     texto,
        likes:     0,
        dislikes:  0,
        aprobado:  false,                    // El admin debe aprobarlo
        fecha:     new Date().toISOString()
    };

    // Añadir al array en localStorage
    const comentarios = leerStorage('op_comentarios') || [];
    comentarios.push(nuevoComentario);
    guardarStorage('op_comentarios', comentarios);

    // Limpiar formulario
    nombreEl.value = '';
    textoEl.value  = '';

    mostrarToast('¡Comentario enviado! Será revisado pronto.');
    }

    /**
     * Maneja el clic en like/dislike de un comentario.
     * Actualiza el contador en localStorage y en el DOM.
     * @param {Event} e - evento click
     */
    function manejarReaccion(e) {
    const btn  = e.currentTarget;
    const id   = parseInt(btn.dataset.id);
    const tipo = btn.dataset.tipo; // 'like' | 'dislike'

    // Evitar doble voto (guardar en sessionStorage)
    const yaVoto = sessionStorage.getItem(`voto_${id}`);
    if (yaVoto) {
        mostrarToast('Ya enviaste tu reacción.');
        return;
    }

    // Actualizar en localStorage
    const comentarios = leerStorage('op_comentarios') || [];
    const idx = comentarios.findIndex(c => c.id === id);
    if (idx === -1) return;

    if (tipo === 'like') {
        comentarios[idx].likes = (comentarios[idx].likes || 0) + 1;
    } else {
        comentarios[idx].dislikes = (comentarios[idx].dislikes || 0) + 1;
    }

    guardarStorage('op_comentarios', comentarios);
    sessionStorage.setItem(`voto_${id}`, tipo);

    // Actualizar el contador en el DOM sin re-renderizar todo
    const span = btn.querySelector('span');
    if (span) span.textContent = tipo === 'like'
        ? comentarios[idx].likes
        : comentarios[idx].dislikes;

    btn.classList.add('active');
    }

    /* ============================================================
    4. DRAWER (Menú lateral)
    Abre y cierra el panel de navegación lateral.
    ============================================================ */
    function inicializarDrawer() {
    const toggle  = document.getElementById('menu-toggle');
    const close   = document.getElementById('drawer-close');
    const overlay = document.getElementById('drawer-overlay');
    const drawer  = document.getElementById('drawer');

    if (!toggle || !drawer) return;

    function abrirDrawer() {
        drawer.classList.add('active');
        overlay.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Evitar scroll del fondo
    }

    function cerrarDrawer() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', abrirDrawer);
    close?.addEventListener('click', cerrarDrawer);
    overlay.addEventListener('click', cerrarDrawer);

    // Cerrar con tecla Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') cerrarDrawer();
    });
    }

    /* ============================================================
    5. TOAST — Mensajes de retroalimentación
    Muestra un mensaje flotante temporal al usuario.
    ============================================================ */

    // Crear el elemento toast una sola vez y reutilizarlo
    let toastEl = null;
    let toastTimer = null;

    /**
     * Muestra un toast de notificación.
     * @param {string} mensaje - Texto a mostrar
     * @param {number} duracion - Duración en ms (default: 3000)
     */
    function mostrarToast(mensaje, duracion = 3000) {
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
    }

    toastEl.textContent = mensaje;
    toastEl.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
    }, duracion);
    }

    /* ============================================================
    UTILIDADES DE LOCALSTORE
    Funciones helper para leer/escribir JSON en localStorage.
    ============================================================ */

    /**
     * Lee y parsea un valor JSON del localStorage.
     * @param {string} clave - Clave del localStorage
     * @returns {any|null} Valor parseado o null si no existe / error
     */
    function leerStorage(clave) {
    try {
        const raw = localStorage.getItem(clave);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn(`[noticias.js] Error al leer "${clave}" del localStorage:`, e);
        return null;
    }
    }

    /**
     * Serializa y guarda un valor en el localStorage.
     * @param {string} clave - Clave del localStorage
     * @param {any}    valor - Valor a guardar (se convierte a JSON)
     */
    function guardarStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
        console.warn(`[noticias.js] Error al guardar "${clave}" en el localStorage:`, e);
    }
    }

    /**
     * Escapa caracteres HTML para prevenir XSS al inyectar texto en el DOM.
     * @param {string} str
     * @returns {string}
     */
    function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
