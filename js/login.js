/* =============================================================
   OrientPerfumes — Lógica de autenticación
   Archivo : js/login.js

   MÓDULOS:
     1. Estado global       — vista activa, usuarios guardados
     2. Navegación de vistas — login / registro / recuperar
     3. Validación          — campos vacíos, email, contraseña
     4. Iniciar sesión      — verificar credenciales en localStorage
     5. Crear cuenta        — guardar nuevo usuario en localStorage
     6. Recuperar contraseña — simular envío de email
     7. Toggle contraseña   — mostrar/ocultar texto en inputs
     8. Accesibilidad       — submit con tecla Enter
     9. Inicialización      — arranque al cargar el DOM

   ALMACENAMIENTO:
     - Se usa localStorage como simulación de base de datos.
     - Clave "op_users" → array de objetos { username, email, password }
     - Clave "op_session" → objeto { username, email } del usuario activo
     - En producción se reemplazaría por llamadas a una API real.
============================================================= */


/* ─────────────────────────────────────────────────────────────
   1. ESTADO GLOBAL
   Variables que guardan el estado actual de la interfaz.
───────────────────────────────────────────────────────────── */

/**
 * currentView: nombre de la vista actualmente visible.
 * Valores posibles: "login" | "register" | "recover"
 */
let currentView = 'login';


/* ─────────────────────────────────────────────────────────────
   2. HELPERS DE ALMACENAMIENTO
   Funciones para leer y escribir usuarios en localStorage.
───────────────────────────────────────────────────────────── */

/**
 * getUsers()
 * Devuelve el array de usuarios guardados.
 * Si no existe la clave, devuelve un array vacío.
 * @returns {Array<{username:string, email:string, password:string}>}
 */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('op_users') || '[]');
  } catch {
    return [];
  }
}

/**
 * saveUsers(users)
 * Guarda el array de usuarios en localStorage.
 * @param {Array} users
 */
function saveUsers(users) {
  localStorage.setItem('op_users', JSON.stringify(users));
}

/**
 * saveSession(user)
 * Guarda la sesión activa del usuario.
 * @param {{username:string, email:string}} user
 */
function saveSession(user) {
  localStorage.setItem('op_session', JSON.stringify(user));
}


/* ─────────────────────────────────────────────────────────────
   3. NAVEGACIÓN ENTRE VISTAS
   Muestra/oculta las tres secciones del formulario:
   login, register y recover.
───────────────────────────────────────────────────────────── */

/**
 * showView(viewName)
 * Cambia la vista activa y actualiza el subtítulo del panel.
 * @param {'login'|'register'|'recover'} viewName
 */
function showView(viewName) {
  currentView = viewName;

  // Títulos que se muestran en la cabecera del panel
  const subtitles = {
    login:    'Ingresa tu Usuario',
    register: 'Crear Cuenta',
    recover:  'Recuperar Contraseña',
  };

  // Ocultar todas las vistas
  document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));

  // Activar la vista solicitada
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add('active');

  // Actualizar subtítulo en la cabecera
  const subtitle = document.getElementById('panel-subtitle');
  if (subtitle) subtitle.textContent = subtitles[viewName] || '';

  // Limpiar errores al cambiar de vista
  clearAllErrors();
}


/* ─────────────────────────────────────────────────────────────
   4. VALIDACIÓN DE CAMPOS
   Funciones de validación reutilizables.
───────────────────────────────────────────────────────────── */

/**
 * setError(inputId, errId, message)
 * Muestra un mensaje de error bajo el input y lo marca en rojo.
 * @param {string} inputId  — id del input
 * @param {string} errId    — id del span de error
 * @param {string} message  — texto del error
 */
function setError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.add('has-error');
  if (err)   err.textContent = message;
}

/**
 * clearError(inputId, errId)
 * Limpia el error de un campo específico.
 */
function clearError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.remove('has-error');
  if (err)   err.textContent = '';
}

/**
 * clearAllErrors()
 * Limpia todos los mensajes de error del formulario activo.
 */
function clearAllErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('has-error'));
  document.querySelectorAll('.form-alert').forEach(el => { el.hidden = true; el.textContent = ''; });
}

/**
 * showAlert(alertId, message, type)
 * Muestra una alerta global dentro del formulario.
 * @param {string} alertId — id del div de alerta
 * @param {string} message — texto a mostrar
 */
function showAlert(alertId, message) {
  const el = document.getElementById(alertId);
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

/**
 * hideAlert(alertId)
 * Oculta una alerta global.
 */
function hideAlert(alertId) {
  const el = document.getElementById(alertId);
  if (el) { el.hidden = true; el.textContent = ''; }
}

/**
 * isValidEmail(email)
 * Valida el formato básico de un correo electrónico.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


/* ─────────────────────────────────────────────────────────────
   5. INICIAR SESIÓN
   Verifica las credenciales contra los usuarios en localStorage.
   Si son correctas, guarda la sesión y redirige a index.html.
───────────────────────────────────────────────────────────── */

/**
 * handleLogin()
 * Valida el formulario de inicio de sesión.
 * En caso de éxito redirige a la landing (index.html).
 */
function handleLogin() {
  clearAllErrors();

  const usernameInput = document.getElementById('login-user');
  const passwordInput = document.getElementById('login-pass');
  const username      = usernameInput.value.trim();
  const password      = passwordInput.value;
  let   valid         = true;

  // Validar que el campo usuario no esté vacío
  if (!username) {
    setError('login-user', 'login-user-err', 'El nombre de usuario es requerido.');
    valid = false;
  }

  // Validar que el campo contraseña no esté vacío
  if (!password) {
    setError('login-pass', 'login-pass-err', 'La contraseña es requerida.');
    valid = false;
  }

  if (!valid) return;

  // Buscar usuario en el "registro" local
  const users = getUsers();
  const found = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!found) {
    showAlert('login-alert', 'Usuario o contraseña incorrectos.');
    return;
  }

  // ── Login exitoso ──
  // Guardar sesión y redirigir a la landing
  saveSession({ username: found.username, email: found.email });

  // Feedback visual antes de redirigir
  const btn = document.getElementById('btn-login');
  btn.classList.add('loading');
  btn.textContent = 'Ingresando…';

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
}


/* ─────────────────────────────────────────────────────────────
   6. CREAR CUENTA
   Valida el formulario y guarda el nuevo usuario en localStorage.
   Luego cambia automáticamente a la vista de login con un mensaje.
───────────────────────────────────────────────────────────── */

/**
 * handleRegister()
 * Registra un nuevo usuario si pasa todas las validaciones.
 */
function handleRegister() {
  clearAllErrors();

  const username  = document.getElementById('reg-user').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-pass').value;
  const password2 = document.getElementById('reg-pass2').value;
  let   valid     = true;

  // Validar nombre de usuario (mínimo 3 caracteres)
  if (!username || username.length < 3) {
    setError('reg-user', 'reg-user-err', 'Mínimo 3 caracteres.');
    valid = false;
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    setError('reg-email', 'reg-email-err', 'Ingresa un correo válido.');
    valid = false;
  }

  // Validar contraseña (mínimo 6 caracteres)
  if (!password || password.length < 6) {
    setError('reg-pass', 'reg-pass-err', 'La contraseña debe tener al menos 6 caracteres.');
    valid = false;
  }

  // Validar confirmación de contraseña
  if (password !== password2) {
    setError('reg-pass2', 'reg-pass2-err', 'Las contraseñas no coinciden.');
    valid = false;
  }

  if (!valid) return;

  // Verificar si el usuario o email ya existen
  const users = getUsers();

  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    showAlert('reg-alert', 'Ese nombre de usuario ya está en uso.');
    return;
  }

  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    showAlert('reg-alert', 'Ya existe una cuenta con ese correo.');
    return;
  }

  // Guardar nuevo usuario
  users.push({ username, email, password });
  saveUsers(users);

  // Limpiar campos del registro
  ['reg-user', 'reg-email', 'reg-pass', 'reg-pass2'].forEach(id => {
    document.getElementById(id).value = '';
  });

  // Volver al login con mensaje de éxito
  showView('login');
  setTimeout(() => {
    showAlert('login-success', `¡Cuenta creada! Bienvenido, ${username}. Ya puedes iniciar sesión.`);
  }, 50);
}


/* ─────────────────────────────────────────────────────────────
   7. RECUPERAR CONTRASEÑA
   Simula el envío de un correo con instrucciones.
   (En producción aquí iría una llamada a una API real.)
───────────────────────────────────────────────────────────── */

/**
 * handleRecover()
 * Valida el email y muestra mensaje de confirmación simulado.
 */
function handleRecover() {
  clearAllErrors();

  const email = document.getElementById('rec-email').value.trim();

  // Validar formato de email
  if (!isValidEmail(email)) {
    setError('rec-email', 'rec-email-err', 'Ingresa un correo electrónico válido.');
    return;
  }

  // Verificar si el email está registrado
  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

  if (!exists) {
    // Por seguridad mostramos el mismo mensaje aunque no exista
    // (evita que se descubra qué emails están registrados)
    showAlert('rec-success', `Si ${email} está registrado, recibirás las instrucciones en breve.`);
    return;
  }

  // Feedback visual en el botón
  const btn = document.getElementById('btn-recover');
  btn.classList.add('loading');
  btn.textContent = 'Enviando…';

  // Simular delay de envío (en producción: fetch a una API)
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.textContent = 'Enviar Instrucciones';
    showAlert(
      'rec-success',
      `✓ Instrucciones enviadas a ${email}. Revisa tu bandeja de entrada.`
    );
    // Limpiar campo
    document.getElementById('rec-email').value = '';
  }, 1200);
}


/* ─────────────────────────────────────────────────────────────
   8. TOGGLE CONTRASEÑA
   Muestra u oculta el texto en inputs de tipo password.
───────────────────────────────────────────────────────────── */

/**
 * initTogglePassword()
 * Asigna el evento a todos los botones .toggle-pass.
 * Cada botón tiene data-target="<id del input>" para saber
 * qué campo controlar.
 */
function initTogglePassword() {
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input    = document.getElementById(targetId);
      if (!input) return;

      // Alternar type entre "password" y "text"
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';

      // Actualizar aria-label del botón
      btn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');

      // Cambiar opacidad del icono como feedback visual
      const icon = btn.querySelector('.eye-icon');
      if (icon) icon.style.opacity = isHidden ? '0.5' : '1';
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   9. ACCESIBILIDAD — SUBMIT CON ENTER
   Permite enviar el formulario activo presionando Enter,
   como se esperaría en un formulario HTML nativo.
───────────────────────────────────────────────────────────── */

/**
 * initEnterKey()
 * Escucha la tecla Enter en todos los inputs y dispara
 * la acción correspondiente a la vista activa.
 */
function initEnterKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    // Solo actuar si el foco está dentro de un input del formulario
    if (!e.target.matches('.form-input')) return;

    switch (currentView) {
      case 'login':    handleLogin();    break;
      case 'register': handleRegister(); break;
      case 'recover':  handleRecover();  break;
    }
  });
}


/* ─────────────────────────────────────────────────────────────
   10. INICIALIZACIÓN
   Asigna todos los event listeners cuando el DOM está listo.
───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ── Botones de acción principal ──
  document.getElementById('btn-login')   ?.addEventListener('click', handleLogin);
  document.getElementById('btn-register')?.addEventListener('click', handleRegister);
  document.getElementById('btn-recover') ?.addEventListener('click', handleRecover);

  // ── Navegación entre vistas ──
  document.getElementById('go-register')       ?.addEventListener('click', () => showView('register'));
  document.getElementById('go-recover')         ?.addEventListener('click', () => showView('recover'));
  document.getElementById('go-login-from-reg')  ?.addEventListener('click', () => showView('login'));
  document.getElementById('go-login-from-rec')  ?.addEventListener('click', () => showView('login'));

  // ── Toggle de contraseña ──
  initTogglePassword();

  // ── Submit con tecla Enter ──
  initEnterKey();

  // ── Revisar si hay usuario con sesión activa ──
  // Si ya inició sesión, redirigir directamente a la landing.
  try {
    const session = JSON.parse(localStorage.getItem('op_session') || 'null');
    if (session && session.username) {
      window.location.href = 'index.html';
    }
  } catch { /* ignorar errores de parseo */ }

  // ── Mostrar la vista de login por defecto ──
  showView('login');
});