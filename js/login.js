/* =============================================================
   login.js — Autenticación y registro conectados a MySQL
   OrientPerfumes

   API:
     POST /api/login.php         → login admin   { usuario, password }
     POST /api/login-cliente.php → login cliente { usuario, password }
     POST /api/registro.php      → registro      { usuario, correo, password }
============================================================= */

const API_BASE = '/OrientPerfumesV2/api';

/* ── Referencias ─────────────────────────────────────────── */
const subtitle     = document.getElementById('panel-subtitle');
const viewLogin    = document.getElementById('view-login');
const viewRegister = document.getElementById('view-register');
const viewRecover  = document.getElementById('view-recover');

/* ── Cambio de vistas ────────────────────────────────────── */
function showView(view, subtitleText) {
  [viewLogin, viewRegister, viewRecover].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  if (subtitle) subtitle.textContent = subtitleText;
  clearAll();
}

document.getElementById('go-register')?.addEventListener('click', () =>
  showView(viewRegister, 'Crear Cuenta'));
document.getElementById('go-recover')?.addEventListener('click', () =>
  showView(viewRecover, 'Recuperar Contraseña'));
document.getElementById('go-login-from-reg')?.addEventListener('click', () =>
  showView(viewLogin, 'Ingresa tu Usuario'));
document.getElementById('go-login-from-rec')?.addEventListener('click', () =>
  showView(viewLogin, 'Ingresa tu Usuario'));

/* ── Toggle password ─────────────────────────────────────── */
document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  });
});

/* ── Helpers ─────────────────────────────────────────────── */
function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearAll() {
  document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-alert').forEach(e => { e.hidden = true; e.textContent = ''; });
}

function showAlert(id, msg, visible = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.hidden = !visible;
}

function setBtnLoading(id, loading, defaultText) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? 'Cargando...' : defaultText;
}

/* ============================================================
   INICIAR SESIÓN
   1. Intenta como admin  → redirige a admin/index.html
   2. Intenta como cliente → redirige a index.html
============================================================ */
document.getElementById('btn-login')?.addEventListener('click', async () => {
  clearAll();

  const loginUsuario  = document.getElementById('login-user')?.value.trim() ?? '';
  const loginPassword = document.getElementById('login-pass')?.value ?? '';

  let ok = true;
  if (!loginUsuario)  { setErr('login-user-err', 'Ingresa tu usuario'); ok = false; }
  if (!loginPassword) { setErr('login-pass-err', 'Ingresa tu contraseña'); ok = false; }
  if (!ok) return;

  setBtnLoading('btn-login', true, 'Entrar');

  try {
    /* Intentar como administrador */
    const resAdmin = await fetch(`${API_BASE}/login.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuario: loginUsuario, password: loginPassword })
    });
    const dataAdmin = await resAdmin.json();

    if (dataAdmin.ok) {
      localStorage.setItem('op_admin_session', JSON.stringify({
        id:       dataAdmin.id,
        username: dataAdmin.usuario,
        nombre:   dataAdmin.nombre,
        name:     dataAdmin.nombre,
        role:     'admin',
        tipo:     'admin'
      }));
      showAlert('login-success', `Bienvenido, ${dataAdmin.nombre}. Redirigiendo...`, true);
      setTimeout(() => window.location.href = 'admin/index.html', 1200);
      return;
    }

    /* Intentar como cliente */
    const resCliente = await fetch(`${API_BASE}/login-cliente.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuario: loginUsuario, password: loginPassword })
    });
    const dataCliente = await resCliente.json();

    if (dataCliente.ok) {
      localStorage.setItem('op_session', JSON.stringify({
        id:       dataCliente.id,
        username: dataCliente.usuario,
        nombre:   dataCliente.nombre,
        email:    dataCliente.correo,
        tipo:     'cliente'
      }));
      showAlert('login-success', `Bienvenido, ${dataCliente.nombre}. Redirigiendo...`, true);
      setTimeout(() => window.location.href = 'index.html', 1200);
      return;
    }

    showAlert('login-alert', 'Usuario o contraseña incorrectos.', true);

  } catch (err) {
    showAlert('login-alert', 'Error de conexión. Verifica que XAMPP esté activo.', true);
    console.error('[login.js]', err);
  } finally {
    setBtnLoading('btn-login', false, 'Entrar');
    document.getElementById('btn-login').textContent = 'Entrar';
  }
});

['login-user', 'login-pass'].forEach(id => {
  document.getElementById(id)?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-login')?.click();
  });
});


/* ============================================================
   CREAR CUENTA — registra en tbl_clientes
============================================================ */
document.getElementById('btn-register')?.addEventListener('click', async () => {
  clearAll();

  const loginUsuario  = document.getElementById('reg-user')?.value.trim()  ?? '';
  const loginCorreo   = document.getElementById('reg-email')?.value.trim() ?? '';
  const loginPass     = document.getElementById('reg-pass')?.value          ?? '';
  const loginPass2    = document.getElementById('reg-pass2')?.value         ?? '';

  let ok = true;
  if (!loginUsuario)            { setErr('reg-user-err',  'Elige un nombre de usuario');    ok = false; }
  if (!loginCorreo)             { setErr('reg-email-err', 'Ingresa tu correo');             ok = false; }
  if (loginPass.length < 6)     { setErr('reg-pass-err',  'Mínimo 6 caracteres');           ok = false; }
  if (loginPass !== loginPass2) { setErr('reg-pass2-err', 'Las contraseñas no coinciden');  ok = false; }
  if (!ok) return;

  setBtnLoading('btn-register', true, 'Crear Cuenta');

  try {
    const res  = await fetch(`${API_BASE}/registro.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        usuario:  loginUsuario,
        correo:   loginCorreo,
        password: loginPass
      })
    });
    const data = await res.json();

    if (data.ok) {
      showView(viewLogin, 'Ingresa tu Usuario');
      showAlert('login-success', '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.', true);
    } else {
      showAlert('reg-alert', data.mensaje || 'Error al crear la cuenta', true);
    }
  } catch (err) {
    showAlert('reg-alert', 'Error de conexión. Verifica que XAMPP esté activo.', true);
    console.error('[login.js]', err);
  } finally {
    setBtnLoading('btn-register', false, 'Crear Cuenta');
    document.getElementById('btn-register').textContent = 'Crear Cuenta';
  }
});


/* ============================================================
   RECUPERAR CONTRASEÑA — simulado por ahora
============================================================ */
document.getElementById('btn-recover')?.addEventListener('click', () => {
  clearAll();
  const email = document.getElementById('rec-email')?.value.trim() ?? '';
  if (!email)                    { setErr('rec-email-err', 'Ingresa tu correo');    return; }
  if (!/\S+@\S+\.\S+/.test(email)) { setErr('rec-email-err', 'Correo no válido'); return; }
  showAlert('rec-success', 'Si el correo está registrado recibirás las instrucciones en breve.', true);
});