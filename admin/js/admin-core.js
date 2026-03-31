/* =============================================================
   OrientPerfumes — Admin Core
   Auth, sidebar, toast, modal utilities
   ============================================================= */

const ADMIN_SESSION_KEY = 'op_admin_session';

/* ── Auth ──────────────────────────────────────────────────── */
function adminGetSession() {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function adminCheckAuth() {
  const session = adminGetSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

function adminLogout() {
  if (confirm('¿Seguro que deseas cerrar sesión?')) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = 'login.html';
  }
}

/* ── Layout init ────────────────────────────────────────────── */
function initAdminLayout() {
  const session = adminCheckAuth();
  if (!session) return;

  // User info
  const nameEl = document.getElementById('adminUserName');
  const roleEl = document.getElementById('adminUserRole');
  if (nameEl) nameEl.textContent = session.name;
  if (roleEl) roleEl.textContent = '(' + session.role + ')';

  // Sidebar toggle
  const sidebar  = document.getElementById('adminSidebar');
  const toggle   = document.getElementById('sidebarToggle');
  const overlay  = document.getElementById('sidebarOverlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active', open);
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // Build sidebar dynamically
  buildSidebar();

  // Init data
  AdminDB.init();
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(message, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>',
    error:   '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>',
    info:    '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/>',
  };

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
    (icons[type] || icons.info) + '</svg>' +
    '<span>' + message + '</span>';

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 320);
  }, 3200);
}

/* ── Modal ──────────────────────────────────────────────────── */
let _modalSaveCallback = null;

function openModal(title, bodyHTML, onSave, saveLabel) {
  saveLabel = saveLabel || 'Guardar';
  const overlay  = document.getElementById('modalOverlay');
  const titleEl  = document.getElementById('modalTitle');
  const bodyEl   = document.getElementById('modalBody');
  const saveBtn  = document.getElementById('modalSaveBtn');
  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHTML;
  _modalSaveCallback = onSave;

  if (saveBtn) saveBtn.textContent = saveLabel;
  overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
  _modalSaveCallback = null;
}

/* ── Confirm dialog ─────────────────────────────────────────── */
function confirmAction(message, onConfirm) {
  if (window.confirm(message)) onConfirm();
}

/* ── Sidebar builder ────────────────────────────────────────── */
var SIDEBAR_ITEMS = [
  { section: 'Catálogo' },
  { id: 'index',      href: 'index.html',      label: 'Dashboard',   icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' },
  { id: 'products',   href: 'products.html',   label: 'Productos',   icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>' },
  { id: 'categories', href: 'categories.html', label: 'Categorías',  icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>' },
  { id: 'brands',     href: 'brands.html',     label: 'Marcas',      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>' },
  { section: 'Personas' },
  { id: 'customers',  href: 'customers.html',  label: 'Clientes',    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zm10 3a3 3 0 11-6 0 3 3 0 016 0z"/>' },
  { id: 'suppliers',  href: 'suppliers.html',  label: 'Proveedores', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>' },
  { section: 'Operaciones' },
  { id: 'sales',      href: 'sales.html',      label: 'Ventas',      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>' },
  { id: 'purchases',  href: 'purchases.html',  label: 'Compras',     icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>' },
  { id: 'orders',     href: 'orders.html',     label: 'Pedidos',     icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>' },
  { section: 'Análisis' },
  { id: 'inventory',  href: 'inventory.html',  label: 'Inventario',  icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>' },
  { id: 'reports',    href: 'reports.html',    label: 'Reportes',    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>' },
  { section: 'Contenido' },
  { id: 'noticias',   href: 'noticias.html',   label: 'Noticias',    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h6"/>' },
  { section: 'Sistema' },
  { id: 'users',      href: 'users.html',      label: 'Usuarios',    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>' },
  { id: 'settings',   href: 'settings.html',   label: 'Ajustes',     icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>' },
];

function buildSidebar() {
  var sidebarEl = document.getElementById('adminSidebar');
  if (!sidebarEl) return;

  var current = window.location.pathname.split('/').pop() || 'index.html';

  var html =
    '<div class="sidebar-brand">' +
    '<img class="sidebar-brand__logo" src="../assets/Logo Oriente SIN FONDO (1) (1).png" alt="OrientPerfumes">' + 
      '<div class="sidebar-brand__text">' +
        '<div class="sidebar-brand__name">OrientPerfumes</div>' +
        '<div class="sidebar-brand__sub">Panel Admin</div>' +
      '</div>' +
    '</div>' +
    '<nav class="admin-nav">';

  SIDEBAR_ITEMS.forEach(function (item) {
    if (item.section) {
      html += '<span class="admin-nav__section">' + item.section + '</span>';
    } else {
      var active = (item.href === current || item.href === current.replace('index.html', 'index.html')) ? ' active' : '';
      html += '<a href="' + item.href + '" class="admin-nav__link' + active + '">' +
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">' +
        item.icon + '</svg>' + item.label + '</a>';
    }
  });
  html += '</nav>';
  sidebarEl.innerHTML = html;
}

/* ── DOM ready ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  // Modal overlay click-outside
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  // Modal close button
  const closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Modal save button
  const saveBtn = document.getElementById('modalSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      if (typeof _modalSaveCallback === 'function') _modalSaveCallback();
    });
  }
});