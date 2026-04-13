/* =============================================================
   productos-destacados-admin.js
   Lógica del panel admin para gestionar los 4 productos
   destacados del index.html.

   localStorage key: "op_productos_destacados"
   Estructura de cada producto:
   {
     id:             1..4,
     marca:          string,
     nombre:         string,
     precio:         string  (ej: "$320.00"),
     precioAnterior: string  (solo si badge === 'sale'),
     badge:          'new' | 'excl' | 'sale' | 'none',
     imagen:         string  (base64 o URL, vacío = placeholder)
   }
============================================================= */

/* ── Datos por defecto (los que trae el HTML original) ───── */
var DEFAULT_PRODUCTOS = [
  { id: 1, marca: '', nombre: '', precio: '', precioAnterior: '', badge: 'none', imagen: '' },
  { id: 2, marca: '', nombre: '', precio: '', precioAnterior: '', badge: 'none', imagen: '' },
  { id: 3, marca: '', nombre: '', precio: '', precioAnterior: '', badge: 'none', imagen: '' },
  { id: 4, marca: '', nombre: '', precio: '', precioAnterior: '', badge: 'none', imagen: '' }
];

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initAdminLayout();
  renderProductos();
});

/* ── Leer del localStorage ──────────────────────────────── */
function getProductos() {
  try {
    var raw = localStorage.getItem('op_productos_destacados');
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_PRODUCTOS));
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_PRODUCTOS));
  }
}

/* ── Etiquetas legibles para cada badge ─────────────────── */
var BADGE_LABELS = { new:'Nuevo', excl:'Exclusivo', sale:'Oferta', none:'Sin badge' };
var BADGE_CLASSES = { new:'badge-new', excl:'badge-excl', sale:'badge-sale', none:'badge-none' };

/* ============================================================
   RENDERIZAR LOS 4 CARDS
============================================================ */
function renderProductos() {
  var productos = getProductos();
  var grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  productos.forEach(function (p) {
    var card = document.createElement('div');
    card.className = 'prod-card';

    var badgeClass = BADGE_CLASSES[p.badge] || 'badge-none';
    var badgeLabel = BADGE_LABELS[p.badge] || '';
    var esSale = p.badge === 'sale';

    /* Imagen o placeholder */
    var imgHTML = p.imagen
      ? '<img src="' + (p.imagen.startsWith('data:') ? p.imagen : esc(p.imagen)) + '" alt="' + esc(p.nombre) + '">'
      : '<span class="prod-preview__placeholder">🫙</span>';

    card.innerHTML =
      /* Header */
      '<div class="prod-card__header">' +
        '<span class="prod-card__num">Producto ' + p.id + '</span>' +
      '</div>' +

      /* Previsualización imagen */
      '<div class="prod-preview" id="prev-' + p.id + '">' +
        imgHTML +
        '<span class="prod-preview__badge ' + badgeClass + '" id="badge-prev-' + p.id + '">' +
          badgeLabel +
        '</span>' +
      '</div>' +

      /* Campos */
      '<div class="prod-card__fields">' +

        /* Botón subir imagen */
        '<div class="form-group">' +
          '<label class="btn-upload-img" for="file-' + p.id + '">' +
            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">' +
              '<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>' +
            '</svg>' +
            (p.imagen ? 'Cambiar imagen' : 'Subir imagen') +
          '</label>' +
          '<input type="file" id="file-' + p.id + '" class="file-hidden"' +
            ' accept="image/jpeg,image/png,image/webp"' +
            ' onchange="subirImagen(' + p.id + ', this)">' +
          /* URL alternativa */
          '<input class="form-input" id="imgurl-' + p.id + '"' +
            ' style="margin-top:6px;font-size:11px;"' +
            ' placeholder="O pega una URL de imagen"' +
            ' value="' + (p.imagen && !p.imagen.startsWith('data:') ? esc(p.imagen) : '') + '"' +
            ' oninput="aplicarUrlImagen(' + p.id + ')">' +
        '</div>' +

        /* Marca */
        '<div class="form-group">' +
          '<label class="form-label">Marca</label>' +
          '<input class="form-input" id="marca-' + p.id + '" value="' + esc(p.marca) + '" maxlength="60">' +
        '</div>' +

        /* Nombre */
        '<div class="form-group">' +
          '<label class="form-label">Nombre del producto</label>' +
          '<input class="form-input" id="nombre-' + p.id + '" value="' + esc(p.nombre) + '" maxlength="80">' +
        '</div>' +

        /* Badge */
        '<div class="form-group">' +
          '<label class="form-label">Badge</label>' +
          '<select class="form-select" id="badge-' + p.id + '" onchange="actualizarBadge(' + p.id + ')">' +
            '<option value="new"'  + (p.badge==='new'  ?' selected':'') + '>Nuevo</option>' +
            '<option value="excl"' + (p.badge==='excl' ?' selected':'') + '>Exclusivo</option>' +
            '<option value="sale"' + (p.badge==='sale' ?' selected':'') + '>Oferta</option>' +
            '<option value="none"' + (p.badge==='none' ?' selected':'') + '>Sin badge</option>' +
          '</select>' +
        '</div>' +

        /* Precio */
        '<div class="form-group">' +
          '<label class="form-label">Precio</label>' +
          '<input class="form-input" id="precio-' + p.id + '" value="' + esc(p.precio) + '"' +
            ' placeholder="$0.00" maxlength="20">' +
        '</div>' +

        /* Precio anterior (solo oferta) */
        '<div class="form-group precio-anterior-row' + (esSale ? ' visible' : '') + '" id="prev-price-row-' + p.id + '">' +
          '<label class="form-label">Precio anterior <span style="color:var(--cream-muted);font-family:var(--font-body);text-transform:none;">(tachado)</span></label>' +
          '<input class="form-input" id="precioAnterior-' + p.id + '" value="' + esc(p.precioAnterior || '') + '"' +
            ' placeholder="$0.00" maxlength="20">' +
        '</div>' +

        /* Quitar imagen */
        (p.imagen ?
          '<button class="btn btn-danger btn-sm" onclick="quitarImagen(' + p.id + ')" style="margin-top:4px;">' +
            'Quitar imagen' +
          '</button>'
        : '') +

      '</div>'; /* /prod-card__fields */

    grid.appendChild(card);
  });
}

/* ============================================================
   SUBIR IMAGEN DESDE ARCHIVO
============================================================ */
function subirImagen(id, input) {
  var file = input.files[0];
  if (!file) return;

  var MB = file.size / 1024 / 1024;
  if (MB > 2) {
    showToast('La imagen pesa ' + MB.toFixed(1) + ' MB. Recomendamos máx. 500 KB (squoosh.app)', 'warning');
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var base64 = e.target.result;

    /* Guardar en localStorage inmediatamente */
    var productos = getProductos();
    var idx = productos.findIndex(function (p) { return p.id === id; });
    if (idx !== -1) {
      productos[idx].imagen = base64;
      try {
        localStorage.setItem('op_productos_destacados', JSON.stringify(productos));
      } catch (err) {
        showToast('Almacenamiento lleno. Usa imágenes más pequeñas.', 'error');
        return;
      }
    }

    /* Limpiar URL si había */
    var urlInput = document.getElementById('imgurl-' + id);
    if (urlInput) urlInput.value = '';

    renderProductos();
    showToast('Imagen cargada · guarda para aplicarla', 'info');
  };
  reader.readAsDataURL(file);
}

/* ── Aplicar URL externa ── */
function aplicarUrlImagen(id) {
  var url = document.getElementById('imgurl-' + id).value.trim();
  var preview = document.getElementById('prev-' + id);
  if (!preview) return;

  /* Quitar imagen anterior del preview */
  var placeholder = preview.querySelector('.prod-preview__placeholder');
  var img = preview.querySelector('img');

  if (url) {
    if (img) {
      img.src = url;
    } else {
      if (placeholder) placeholder.style.display = 'none';
      var newImg = document.createElement('img');
      newImg.src = url;
      newImg.alt = '';
      preview.insertBefore(newImg, preview.firstChild);
    }
  } else {
    if (img) img.remove();
    if (placeholder) placeholder.style.display = '';
  }
}

/* ── Quitar imagen ── */
function quitarImagen(id) {
  confirmAction('¿Quitar la imagen del producto ' + id + '?', function () {
    var productos = getProductos();
    var idx = productos.findIndex(function (p) { return p.id === id; });
    if (idx !== -1) {
      productos[idx].imagen = '';
      localStorage.setItem('op_productos_destacados', JSON.stringify(productos));
    }
    renderProductos();
    showToast('Imagen quitada', 'info');
  });
}

/* ── Actualizar badge en previsualización en tiempo real ── */
function actualizarBadge(id) {
  var badge = document.getElementById('badge-' + id).value;
  var badgeEl = document.getElementById('badge-prev-' + id);
  var prevPriceRow = document.getElementById('prev-price-row-' + id);

  /* Actualizar clase y texto del badge en la imagen */
  if (badgeEl) {
    badgeEl.className = 'prod-preview__badge ' + (BADGE_CLASSES[badge] || 'badge-none');
    badgeEl.textContent = BADGE_LABELS[badge] || '';
  }

  /* Mostrar/ocultar campo precio anterior */
  if (prevPriceRow) {
    prevPriceRow.classList.toggle('visible', badge === 'sale');
  }
}

/* ============================================================
   GUARDAR TODOS LOS PRODUCTOS
============================================================ */
function guardarProductos() {
  var productos = getProductos();

  var resultado = productos.map(function (p) {
    var urlInput = document.getElementById('imgurl-' + p.id);
    var urlVal   = urlInput ? urlInput.value.trim() : '';

    /* imagen: URL escrita > imagen guardada (base64 o url previa) */
    var imagen = urlVal || p.imagen || '';

    return {
      id:             p.id,
      marca:          getVal('marca-' + p.id,          p.marca),
      nombre:         getVal('nombre-' + p.id,         p.nombre),
      precio:         getVal('precio-' + p.id,         p.precio),
      precioAnterior: getVal('precioAnterior-' + p.id, p.precioAnterior || ''),
      badge:          getSelectVal('badge-' + p.id,    p.badge),
      imagen:         imagen
    };
  });

  try {
    localStorage.setItem('op_productos_destacados', JSON.stringify(resultado));
    showToast('¡Guardado! Recarga el inicio para ver los cambios.', 'success');
    renderProductos();
  } catch (e) {
    showToast('Error: almacenamiento lleno. Usa imágenes más pequeñas o por URL.', 'error');
  }
}

/* ── Restaurar por defecto ── */
function restaurarDefecto() {
  confirmAction('¿Restaurar los 4 productos a los valores originales?', function () {
    localStorage.removeItem('op_productos_destacados');
    renderProductos();
    showToast('Productos restaurados', 'info');
  });
}

/* ── Helpers ─────────────────────────────────────────────── */
function getVal(id, fallback) {
  var el = document.getElementById(id);
  return el ? (el.value.trim() || fallback) : fallback;
}
function getSelectVal(id, fallback) {
  var el = document.getElementById(id);
  return el ? el.value : fallback;
}
function esc(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}