/* =============================================================
   login.js — Autenticación conectada a MySQL
   OrientPerfumes

   Solo maneja login de ADMINISTRADORES (tbl_administrador).
   tbl_clientes no tiene usuario/password, solo datos personales.

   API: POST /api/login.php → { usuario, password }
============================================================= */

<<<<<<< HEAD
const API_BASE = '/OrientPerfumesV2/api';
=======
const API_BASE = 'api';
>>>>>>> db4434afe1d1a01a0e5cec4091a1731fe6d61472

/* ── Referencias ───────────────────────────────────────────── */
const subtitle     = document.getElementById('panel-subtitle');
const viewLogin    = document.getElementById('view-login');
const viewRegister = document.getElementById('view-register');
const viewRecover  = document.getElementById('view-recover');

/* ── Cambio de vistas ──────────────────────────────────────── */
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

/* ── Toggle password visible ────────────────────────────────── */
document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  });
});

/* ── Helpers ─────────────────────────────────────────────────── */
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
   INICIAR SESIÓN — conectado a tbl_administrador
============================================================ */
document.getElementById('btn-login')?.addEventListener('click', async () => {
  clearAll();

  const usuario  = document.getElementById('login-user')?.value.trim() ?? '';
  const password = document.getElementById('login-pass')?.value ?? '';

  /* Validación local */
  let ok = true;
  if (!usuario)  { setErr('login-user-err', 'Ingresa tu usuario o correo'); ok = false; }
  if (!password) { setErr('login-pass-err', 'Ingresa tu contraseña');       ok = false; }
  if (!ok) return;

  setBtnLoading('btn-login', true, 'Entrar');

  try {
    const res  = await fetch(`${API_BASE}/login.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuario, password })
    });

    const data = await res.json();

    if (data.ok) {
      /* Guardar sesión admin en localStorage */
      localStorage.setItem('op_admin_session', JSON.stringify({
        id:       data.id,
        username: data.usuario,
        nombre:   data.nombre,
        tipo:     'admin'
      }));

      showAlert('login-success', `Bienvenido, ${data.nombre}. Redirigiendo...`, true);
      setTimeout(() => window.location.href = 'admin/index.html', 1200);

    } else {
      showAlert('login-alert', data.mensaje || 'Usuario o contraseña incorrectos', true);
    }

  } catch (err) {
    showAlert('login-alert',
      'Error de conexión. Verifica que XAMPP esté activo y los archivos PHP estén en su lugar.',
      true);
    console.error('[login.js] Error:', err);
  } finally {
    setBtnLoading('btn-login', false, 'Entrar');
  }
});

/* Enter en campos de login */
['login-user', 'login-pass'].forEach(id => {
  document.getElementById(id)?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-login')?.click();
  });
});


/* ============================================================
   CREAR CUENTA
   tbl_clientes no tiene usuario/password, así que esta vista
   informa al usuario que el registro es manual por el admin.
   Si en el futuro se agrega usuario/password a tbl_clientes,
   aquí se conectaría a api/registro.php.
============================================================ */
document.getElementById('btn-register')?.addEventListener('click', () => {
  clearAll();
  showAlert('reg-alert',
    'El registro de nuevos clientes se gestiona desde el panel de administración.',
    true);
});


/* ============================================================
   RECUPERAR CONTRASEÑA — simulado
   Para envío real de email se necesita PHPMailer en el servidor.
============================================================ */
document.getElementById('btn-recover')?.addEventListener('click', () => {
  clearAll();
  const email = document.getElementById('rec-email')?.value.trim() ?? '';

  if (!email) {
    setErr('rec-email-err', 'Ingresa tu correo electrónico');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    setErr('rec-email-err', 'El correo no es válido');
    return;
  }

  showAlert('rec-success',
    'Si el correo está registrado recibirás las instrucciones en breve.',
    true);
});