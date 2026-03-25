/* =============================================================
   OrientPerfumes — Noticias Admin
   Archivo  : admin/js/noticias-admin.js
   Depende  : admin-data.js (AdminDB) · admin-core.js (showToast, confirmAction, initAdminLayout)

   RESPONSABILIDADES:
     1. Tabs de navegación interna (Video / Lanzamientos / Comentarios)
     2. CRUD del Video principal
     3. CRUD de Lanzamientos
     4. Moderación de Comentarios (aprobar / eliminar)
     5. Badges de contadores en tiempo real

   CLAVES localStorage compartidas con js/noticias.js (frontend público):
     · "op_video"         → { tipo, url, titulo, descripcion }
     · "op_lanzamientos"  → Array<{ id, nombre, badge, descripcion, imagen }>
     · "op_comentarios"   → Array<{ id, nombre, texto, likes, dislikes, aprobado, fecha }>
============================================================= */

/* ── Filtro activo de comentarios ────────────────────────────── */
var filtroComentarios = 'pendientes';

/* ── Inicialización ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initAdminLayout();      // auth + sidebar + AdminDB.init()
  initTabs();
  initFiltrosComentarios();
  cargarVideo();
  renderLanzamientos();
  renderComentarios();
  actualizarBadges();
});

/* =============================================================
   1. TABS
   Muestra/oculta los paneles al hacer clic en cada pestaña.
============================================================= */
function initTabs() {
  document.querySelectorAll('.noticias-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      /* Desactivar todos los tabs y ocultar todos los paneles */
      document.querySelectorAll('.noticias-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      document.querySelectorAll('.noticias-panel').forEach(function (p) {
        p.style.display = 'none';
      });
      /* Activar tab y panel seleccionados */
      tab.classList.add('active');
      var panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.style.display = 'block';
    });
  });
}

/* =============================================================
   2. BADGES
   Actualiza los contadores numéricos en las pestañas.
============================================================= */
function actualizarBadges() {
  var lanzamientos = leerStorage('op_lanzamientos') || [];
  var comentarios  = leerStorage('op_comentarios')  || [];
  var pendientes   = comentarios.filter(function (c) { return !c.aprobado; }).length;

  /* Badge de lanzamientos (total activos) */
  var badgeLanz = document.getElementById('badgeLanzamientos');
  if (badgeLanz) badgeLanz.textContent = lanzamientos.length;

  /* Badge de comentarios pendientes */
  var badgePend = document.getElementById('badgePendientes');
  if (badgePend) {
    badgePend.textContent = pendientes;
    badgePend.style.display = pendientes > 0 ? 'inline-flex' : 'none';
  }

  /* Contador en el botón de filtro "Pendientes" */
  var cntEl = document.getElementById('cntPendientes');
  if (cntEl) cntEl.textContent = pendientes;
}

/* =============================================================
   3. VIDEO PRINCIPAL
============================================================= */

/**
 * cargarVideo()
 * Lee la configuración guardada y rellena el formulario.
 */
function cargarVideo() {
  var data = leerStorage('op_video');
  if (!data) return;
  document.getElementById('videoTipo').value        = data.tipo        || 'file';
  document.getElementById('videoUrl').value         = data.url         || '';
  document.getElementById('videoTitulo').value      = data.titulo      || '';
  document.getElementById('videoDescripcion').value = data.descripcion || '';
  if (data.url) actualizarPreviewVideo();
}

/**
 * actualizarPreviewVideo()
 * Genera o actualiza la previsualización del video en tiempo real.
 * Se llama con oninput en el campo URL y al cargar la página.
 */
function actualizarPreviewVideo() {
  var url  = document.getElementById('videoUrl').value.trim();
  var tipo = document.getElementById('videoTipo').value;
  var wrap = document.getElementById('videoPreviewWrap');
  var cont = document.getElementById('videoPreviewContainer');
  if (!url) { wrap.style.display = 'none'; return; }

  cont.innerHTML = '';
  wrap.style.display = 'block';

  if (tipo === 'youtube' || tipo === 'vimeo') {
    /* Embed externo: YouTube o Vimeo */
    var embedUrl = convertirUrlEmbed(url, tipo);
    var iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    cont.appendChild(iframe);
  } else {
    /* Archivo de video directo (.mp4, .webm, etc.) */
    var video = document.createElement('video');
    video.src      = url;
    video.controls = true;
    video.preload  = 'metadata';
    video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    cont.appendChild(video);
  }
}

/**
 * onVideoTipoChange()
 * Refresca la previsualización cuando el usuario cambia el tipo de video.
 */
function onVideoTipoChange() {
  if (document.getElementById('videoUrl').value.trim()) {
    actualizarPreviewVideo();
  }
}

/**
 * guardarVideo()
 * Valida y persiste la configuración del video en localStorage.
 */
function guardarVideo() {
  var url = document.getElementById('videoUrl').value.trim();
  if (!url) { showToast('Ingresa una URL de video', 'error'); return; }

  var data = {
    tipo:        document.getElementById('videoTipo').value,
    url:         url,
    titulo:      document.getElementById('videoTitulo').value.trim(),
    descripcion: document.getElementById('videoDescripcion').value.trim(),
  };

  guardarStorage('op_video', data);
  showToast('Video guardado correctamente', 'success');
}

/**
 * eliminarVideo()
 * Elimina la configuración del video tras confirmación.
 * La página pública volverá a mostrar el placeholder.
 */
function eliminarVideo() {
  confirmAction(
    '¿Eliminar la configuración del video? El placeholder volverá a mostrarse en la página pública.',
    function () {
      localStorage.removeItem('op_video');
      document.getElementById('videoUrl').value         = '';
      document.getElementById('videoTitulo').value      = '';
      document.getElementById('videoDescripcion').value = '';
      document.getElementById('videoTipo').value        = 'file';
      document.getElementById('videoPreviewWrap').style.display = 'none';
      showToast('Video eliminado', 'info');
    }
  );
}

/**
 * convertirUrlEmbed(url, tipo)
 * Convierte una URL normal de YouTube/Vimeo al formato embed.
 * @param {string} url  - URL original
 * @param {string} tipo - 'youtube' | 'vimeo'
 * @returns {string}    - URL del embed
 */
function convertirUrlEmbed(url, tipo) {
  if (tipo === 'youtube') {
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&?/]+)/);
    return match ? 'https://www.youtube.com/embed/' + match[1] + '?rel=0' : url;
  }
  if (tipo === 'vimeo') {
    var match = url.match(/vimeo\.com\/(\d+)/);
    return match ? 'https://player.vimeo.com/video/' + match[1] : url;
  }
  return url;
}

/* =============================================================
   4. LANZAMIENTOS — CRUD completo
============================================================= */

/**
 * actualizarThumbLanz()
 * Muestra una miniatura de la imagen mientras el usuario escribe la URL.
 */
function actualizarThumbLanz() {
  var url   = document.getElementById('lanzImagen').value.trim();
  var wrap  = document.getElementById('lanzImagenThumb');
  var thumb = document.getElementById('lanzThumbImg');
  if (url) {
    thumb.src = url;
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
}

/**
 * renderLanzamientos()
 * Pinta la tabla de lanzamientos con los datos actuales del localStorage.
 */
function renderLanzamientos() {
  var items = leerStorage('op_lanzamientos') || [];
  var tbody = document.getElementById('lanzTableBody');
  var count = document.getElementById('lanzCount');

  if (count) count.textContent = items.length + ' registro' + (items.length !== 1 ? 's' : '');

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--cream-muted);">No hay lanzamientos. Agrega el primero usando el formulario de arriba.</td></tr>';
    actualizarBadges();
    return;
  }

  tbody.innerHTML = items.map(function (item) {
    /* Miniatura o placeholder según si hay imagen */
    var imgCell = item.imagen
      ? '<img class="launch-thumb" src="' + esc(item.imagen) + '" alt="' + esc(item.nombre) + '" onerror="this.style.display=\'none\'">'
      : '<div class="launch-thumb-placeholder">🫙</div>';

    return '<tr>' +
      '<td>' + imgCell + '</td>' +
      '<td><strong style="color:var(--cream);">' + esc(item.nombre) + '</strong></td>' +
      '<td><span class="badge badge-gold">' + esc(item.badge || 'Próximamente') + '</span></td>' +
      '<td><div class="cell-truncate">' + esc(item.descripcion || '—') + '</div></td>' +
      '<td><div class="action-btns">' +
        /* Botón editar */
        '<button class="btn btn-outline btn-sm" onclick="editarLanzamiento(\'' + item.id + '\')" title="Editar">' +
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>' +
        '</button>' +
        /* Botón eliminar */
        '<button class="btn btn-danger btn-sm" onclick="eliminarLanzamiento(\'' + item.id + '\')" title="Eliminar">' +
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
        '</button>' +
      '</div></td></tr>';
  }).join('');

  actualizarBadges();
}

/**
 * guardarLanzamiento()
 * Crea un lanzamiento nuevo o actualiza el que se está editando.
 */
function guardarLanzamiento() {
  var nombre = document.getElementById('lanzNombre').value.trim();
  if (!nombre) { showToast('El nombre del producto es obligatorio', 'error'); return; }

  var items    = leerStorage('op_lanzamientos') || [];
  var idActual = document.getElementById('lanzId').value;

  var nuevoItem = {
    id:          idActual || String(Date.now()),
    nombre:      nombre,
    badge:       document.getElementById('lanzBadge').value.trim() || 'Próximamente',
    descripcion: document.getElementById('lanzDesc').value.trim(),
    imagen:      document.getElementById('lanzImagen').value.trim(),
  };

  if (idActual) {
    /* Modo edición: reemplazar por ID */
    var idx = items.findIndex(function (i) { return i.id === idActual; });
    if (idx !== -1) items[idx] = nuevoItem;
    showToast('Lanzamiento actualizado', 'success');
  } else {
    /* Modo creación: añadir al final */
    items.push(nuevoItem);
    showToast('Lanzamiento agregado', 'success');
  }

  guardarStorage('op_lanzamientos', items);
  limpiarFormLanzamiento();
  renderLanzamientos();
}

/**
 * editarLanzamiento(id)
 * Carga los datos de un lanzamiento existente en el formulario.
 */
function editarLanzamiento(id) {
  var items = leerStorage('op_lanzamientos') || [];
  var item  = items.find(function (i) { return i.id === id; });
  if (!item) return;

  document.getElementById('lanzId').value     = item.id;
  document.getElementById('lanzNombre').value = item.nombre      || '';
  document.getElementById('lanzBadge').value  = item.badge       || '';
  document.getElementById('lanzDesc').value   = item.descripcion || '';
  document.getElementById('lanzImagen').value = item.imagen      || '';
  actualizarThumbLanz();

  /* Cambiar UI al modo edición */
  document.getElementById('lanzFormTitulo').textContent   = 'Editando: ' + item.nombre;
  document.getElementById('lanzBtnLabel').textContent     = 'Guardar Cambios';
  document.getElementById('btnCancelarLanz').style.display = 'inline-flex';

  /* Scroll suave al formulario */
  document.querySelector('#panel-lanzamientos .admin-card')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * cancelarEdicionLanz()
 * Cancela la edición y resetea el formulario al modo creación.
 */
function cancelarEdicionLanz() {
  limpiarFormLanzamiento();
}

/**
 * limpiarFormLanzamiento()
 * Borra todos los campos del formulario y resetea el modo UI.
 */
function limpiarFormLanzamiento() {
  document.getElementById('lanzId').value         = '';
  document.getElementById('lanzNombre').value     = '';
  document.getElementById('lanzBadge').value      = '';
  document.getElementById('lanzDesc').value       = '';
  document.getElementById('lanzImagen').value     = '';
  document.getElementById('lanzImagenThumb').style.display  = 'none';
  document.getElementById('lanzFormTitulo').textContent      = 'Agregar Lanzamiento';
  document.getElementById('lanzBtnLabel').textContent        = 'Agregar Lanzamiento';
  document.getElementById('btnCancelarLanz').style.display   = 'none';
}

/**
 * eliminarLanzamiento(id)
 * Elimina un lanzamiento por ID tras confirmación.
 */
function eliminarLanzamiento(id) {
  confirmAction('¿Eliminar este lanzamiento? Esta acción no se puede deshacer.', function () {
    var items = leerStorage('op_lanzamientos') || [];
    items = items.filter(function (i) { return i.id !== id; });
    guardarStorage('op_lanzamientos', items);
    renderLanzamientos();
    showToast('Lanzamiento eliminado', 'info');
  });
}

/* =============================================================
   5. COMENTARIOS — Moderación
============================================================= */

/**
 * initFiltrosComentarios()
 * Enlaza los botones de filtro con la función de renderizado.
 */
function initFiltrosComentarios() {
  document.querySelectorAll('.filter-coment').forEach(function (btn) {
    btn.addEventListener('click', function () {
      /* Actualizar estilos de los botones */
      document.querySelectorAll('.filter-coment').forEach(function (b) {
        b.classList.remove('active', 'btn-gold');
        b.classList.add('btn-outline');
      });
      btn.classList.add('active', 'btn-gold');
      btn.classList.remove('btn-outline');

      /* Actualizar filtro activo y re-renderizar */
      filtroComentarios = btn.dataset.filter;
      renderComentarios();

      /* Actualizar título del panel según filtro */
      var titles = {
        pendientes: 'Comentarios Pendientes',
        aprobados:  'Comentarios Aprobados',
        todos:      'Todos los Comentarios',
      };
      var titleEl = document.getElementById('comentTableTitle');
      if (titleEl) titleEl.textContent = titles[filtroComentarios] || 'Comentarios';
    });
  });
}

/**
 * renderComentarios()
 * Pinta la tabla de comentarios aplicando el filtro activo.
 */
function renderComentarios() {
  var todos = leerStorage('op_comentarios') || [];

  /* Aplicar filtro */
  var items;
  if (filtroComentarios === 'pendientes') {
    items = todos.filter(function (c) { return !c.aprobado; });
  } else if (filtroComentarios === 'aprobados') {
    items = todos.filter(function (c) { return c.aprobado; });
  } else {
    items = todos.slice();
  }

  /* Ordenar: más recientes primero */
  items.sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });

  var tbody = document.getElementById('comentTableBody');

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--cream-muted);">No hay comentarios en esta categoría.</td></tr>';
    actualizarBadges();
    return;
  }

  tbody.innerHTML = items.map(function (c) {
    var fecha = c.fecha
      ? new Date(c.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';

    var estadoBadge = c.aprobado
      ? '<span class="badge badge-green">Aprobado</span>'
      : '<span class="badge badge-orange">Pendiente</span>';

    /* Botón aprobar solo visible en comentarios pendientes */
    var btnAprobar = !c.aprobado
      ? '<button class="btn btn-sm" style="background:rgba(82,168,117,0.12);border:1px solid rgba(82,168,117,0.3);color:var(--success);" onclick="aprobarComentario(\'' + c.id + '\')" title="Aprobar">✓ Aprobar</button>'
      : '';

    return '<tr>' +
      '<td><strong style="color:var(--cream);">' + esc(c.nombre) + '</strong></td>' +
      '<td><div class="cell-truncate">' + esc(c.texto) + '</div></td>' +
      '<td style="font-size:12px;">' + fecha + '</td>' +
      '<td style="font-size:12px;color:var(--cream-muted);">👍 ' + (c.likes || 0) + '&nbsp;&nbsp;👎 ' + (c.dislikes || 0) + '</td>' +
      '<td>' + estadoBadge + '</td>' +
      '<td><div class="action-btns">' +
        btnAprobar +
        '<button class="btn btn-danger btn-sm" onclick="eliminarComentario(\'' + c.id + '\')" title="Eliminar">' +
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
        '</button>' +
      '</div></td></tr>';
  }).join('');

  actualizarBadges();
}

/**
 * aprobarComentario(id)
 * Marca el comentario como aprobado → se vuelve visible en la página pública.
 */
function aprobarComentario(id) {
  var comentarios = leerStorage('op_comentarios') || [];
  var idx = comentarios.findIndex(function (c) { return String(c.id) === String(id); });
  if (idx === -1) return;
  comentarios[idx].aprobado = true;
  guardarStorage('op_comentarios', comentarios);
  renderComentarios();
  showToast('Comentario aprobado · ya visible en la página', 'success');
}

/**
 * eliminarComentario(id)
 * Borra el comentario definitivamente del localStorage.
 */
function eliminarComentario(id) {
  confirmAction('¿Eliminar este comentario permanentemente?', function () {
    var comentarios = leerStorage('op_comentarios') || [];
    comentarios = comentarios.filter(function (c) { return String(c.id) !== String(id); });
    guardarStorage('op_comentarios', comentarios);
    renderComentarios();
    showToast('Comentario eliminado', 'info');
  });
}

/* =============================================================
   UTILIDADES localStorage
   (Independientes de AdminDB para no mezclar con la BD del admin)
============================================================= */

/**
 * leerStorage(clave)
 * Lee y parsea un valor JSON del localStorage.
 * @param {string} clave
 * @returns {any|null}
 */
function leerStorage(clave) {
  try {
    var raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[noticias-admin.js] Error al leer "' + clave + '":', e);
    return null;
  }
}

/**
 * guardarStorage(clave, valor)
 * Serializa y guarda un valor en localStorage.
 * @param {string} clave
 * @param {any}    valor
 */
function guardarStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (e) {
    console.warn('[noticias-admin.js] Error al guardar "' + clave + '":', e);
    showToast('Error al guardar. El almacenamiento puede estar lleno.', 'error');
  }
}

/**
 * esc(str)
 * Escapa caracteres HTML para prevenir XSS al inyectar strings en el DOM.
 * @param {string} str
 * @returns {string}
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
