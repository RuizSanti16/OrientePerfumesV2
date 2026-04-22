import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { loginAdmin, loginCliente } = useAuth();

  const [vista,    setVista]   = useState('login'); // login | register | recover
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');
  const [success,  setSuccess] = useState('');

  /* Login */
  const [usuario,  setUsuario]  = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  /* Registro */
  const [regUser,  setRegUser]  = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTel,   setRegTel]   = useState('');
  const [regPass,  setRegPass]  = useState('');
  const [regPass2, setRegPass2] = useState('');
  const [showRegPass,  setShowRegPass]  = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);

  /* Recover */
  const [recEmail, setRecEmail] = useState('');

  function cambiarVista(v) { setVista(v); setError(''); setSuccess(''); }

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!usuario || !password) { setError('Completa todos los campos'); return; }
    setLoading(true);
    try {
      const resAdmin = await authAPI.loginAdmin({ usuario, password });
      if (resAdmin.ok) { loginAdmin(resAdmin); navigate('/admin'); return; }
      const resCliente = await authAPI.loginCliente({ usuario, password });
      if (resCliente.ok) { loginCliente(resCliente); navigate('/'); return; }
      setError('Usuario o contraseña incorrectos.');
    } catch { setError('Error de conexión. Verifica que XAMPP esté activo.'); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!regUser || !regEmail || !regPass) { setError('Completa los campos requeridos'); return; }
    if (regPass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (regPass !== regPass2) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      const res = await authAPI.registro({ usuario: regUser, correo: regEmail, telefono: regTel, password: regPass });
      if (res.ok) { setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.'); cambiarVista('login'); }
      else setError(res.mensaje || 'Error al crear la cuenta');
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  }

  async function handleRecover(e) {
    e.preventDefault();
    if (!recEmail) { setError('Ingresa tu correo electrónico'); return; }
    setSuccess('Si el correo está registrado recibirás las instrucciones.');
    setError('');
  }

  const subtitle = vista === 'login' ? 'Ingresa tu Usuario' : vista === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        .auth-wrapper { display: flex; width: 100vw; height: 100vh; overflow: hidden; }

        .panel-form {
          width: 38%; min-width: 340px;
          background: #201E1A;
          border-right: 1px solid rgba(201,168,76,0.2);
          display: flex; flex-direction: column;
          padding: 36px 40px 32px;
          overflow-y: auto;
          box-shadow: 4px 0 40px rgba(0,0,0,0.6);
        }
        .panel-form__header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 36px; padding-bottom: 24px;
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }
        .panel-form__logo-link {
          display: block; flex-shrink: 0;
          filter: drop-shadow(0 0 6px rgba(201,168,76,0.2));
          transition: filter 0.3s;
        }
        .panel-form__logo-link:hover { filter: drop-shadow(0 0 14px rgba(201,168,76,0.55)); }
        .panel-form__brand-name {
          display: block;
          font-family: 'Cinzel', serif; font-size: 15px;
          letter-spacing: 0.18em; color: #C9A84C;
          font-weight: 600; text-transform: uppercase;
        }
        .panel-form__brand-sub {
          display: block;
          font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.12em; color: #F5F0E8;
          text-transform: uppercase; font-weight: 400;
          margin-top: 3px;
        }
        .auth-view { display: none; flex-direction: column; gap: 18px; flex: 1; animation: fadeIn 0.35s ease; }
        .auth-view.active { display: flex; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        .form-group { display: flex; flex-direction: column; gap: 7px; }
        .form-label { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.22em; color: #C9A84C; text-transform: uppercase; }
        .form-input {
          width: 100%; background: #111110;
          border: 1px solid rgba(201,168,76,0.25); border-radius: 6px;
          padding: 13px 16px; font-family: 'Lato', sans-serif;
          font-size: 14px; color: #F5F0E8; outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .form-input::placeholder { color: rgba(197,186,160,0.35); }
        .form-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .input-wrap { position: relative; }
        .input-wrap .form-input { padding-right: 44px; }
        .toggle-pass {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          color: #C8C0B0; transition: color 0.3s; padding: 4px;
          background: none; border: none; cursor: pointer;
        }
        .toggle-pass:hover { color: #C9A84C; }
        .eye-icon { width: 18px; height: 18px; display: block; }
        .form-error { font-size: 11px; color: #e74c3c; letter-spacing: 0.04em; min-height: 14px; }
        .form-alert { padding: 10px 14px; border-radius: 6px; font-size: 12px; letter-spacing: 0.04em; line-height: 1.5; }
        .form-alert--error { background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.4); color: #e74c3c; }
        .form-alert--success { background: rgba(39,174,96,0.12); border: 1px solid rgba(39,174,96,0.35); color: #2ecc71; }
        .view-description { font-size: 13px; color: #C8C0B0; line-height: 1.6; letter-spacing: 0.03em; }

        .btn-primary {
          width: 100%; font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #0A0A08; background: #C9A84C;
          padding: 14px 20px; border-radius: 6px;
          border: 2px solid #C9A84C; cursor: pointer;
          transition: background 0.3s, color 0.3s, transform 0.3s;
        }
        .btn-primary:hover { background: #E8C96A; border-color: #E8C96A; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .auth-links { display: flex; gap: 10px; margin-top: 4px; }
        .auth-links--center { justify-content: center; }
        .btn-outline {
          flex: 1; font-family: 'Cinzel', serif; font-size: 9.5px;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #C9A84C; background: transparent;
          padding: 11px 10px; border-radius: 6px;
          border: 1px solid rgba(201,168,76,0.4);
          text-align: center; line-height: 1.4; cursor: pointer;
          transition: background 0.3s, border-color 0.3s;
        }
        .btn-outline:hover { background: rgba(201,168,76,0.08); border-color: #C9A84C; }
        .link-btn {
          font-family: 'Lato', sans-serif; font-size: 12px;
          color: #C8C0B0; letter-spacing: 0.04em;
          border-bottom: 1px solid transparent; padding-bottom: 1px;
          background: none; border-top: none; border-left: none; border-right: none;
          cursor: pointer; transition: color 0.3s, border-color 0.3s;
        }
        .link-btn:hover { color: #C9A84C; border-bottom-color: rgba(201,168,76,0.4); }

        .panel-brand {
          flex: 1; position: relative;
          background: linear-gradient(135deg, #0d0b07 0%, #0A0A08 50%, #100e09 100%);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .panel-brand__content { position: relative; z-index: 2; text-align: center; padding: 0 60px; max-width: 680px; }
        .brand-deco { position: absolute; width: 280px; height: 280px; border: 1px solid rgba(201,168,76,0.18); pointer-events: none; z-index: 1; }
        .brand-deco--top-right { top: -80px; right: -80px; border-radius: 4px; transform: rotate(45deg); }
        .brand-deco--bottom-left { bottom: -80px; left: -80px; border-radius: 4px; transform: rotate(45deg); border-color: rgba(201,168,76,0.1); }
        .brand-welcome { display: flex; flex-direction: column; gap: 6px; margin-bottom: 28px; }
        .brand-welcome__line1, .brand-welcome__line2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px,5vw,68px); font-weight: 700;
          color: #F5F0E8; letter-spacing: 0.02em; line-height: 1.1;
          animation: slideInLeft 0.8s ease both;
        }
        .brand-welcome__line2 { animation-delay: 0.15s; }
        .brand-welcome__line3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px,4.5vw,64px); font-weight: 700;
          color: #C9A84C; letter-spacing: 0.04em; line-height: 1.1;
          animation: slideInLeft 0.8s 0.3s ease both;
        }
        .brand-tagline {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(16px,1.8vw,24px); color: #C8C0B0;
          letter-spacing: 0.06em; animation: fadeInUp 0.8s 0.5s ease both;
        }
        .brand-tagline__cursor { display: inline-block; color: #C9A84C; margin-left: 4px; animation: blink 1.1s step-end infinite; }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink       { 0%,100% { opacity:1; } 50% { opacity:0; } }

        @media (max-width: 767px) {
          .auth-wrapper { flex-direction: column; height: auto; min-height: 100vh; }
          .panel-brand  { display: none; }
          .panel-form   { width: 100%; min-width: unset; padding: 32px 24px 40px; overflow-y: visible; }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .panel-form { width: 45%; }
        }
      `}</style>

      <div className="auth-wrapper">

        {/* ── Panel formulario ── */}
        <aside className="panel-form">

          <div className="panel-form__header">
            <a href="/" className="panel-form__logo-link" title="Volver al inicio">
              <img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="" width="56" height="56" style={{ display:'block', objectFit:'contain' }} />
            </a>
            <div>
              <span className="panel-form__brand-name">OrientPerfumes</span>
              <span className="panel-form__brand-sub">{subtitle}</span>
            </div>
          </div>

          {/* ── Vista Login ── */}
          <div className={`auth-view${vista === 'login' ? ' active' : ''}`}>
            <form onSubmit={handleLogin} style={{ display:'contents' }}>
              <FormGroup label="Nombre Usuario">
                <input className="form-input" type="text" placeholder="Escribe tu nombre"
                  value={usuario} onChange={e => setUsuario(e.target.value)} autoComplete="username" />
              </FormGroup>

              <FormGroup label="Contraseña">
                <div className="input-wrap">
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Contraseña"
                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                  <button className="toggle-pass" type="button" onClick={() => setShowPass(v => !v)} aria-label="Mostrar contraseña">
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </FormGroup>

              {error   && <div className="form-alert form-alert--error">{error}</div>}
              {success && <div className="form-alert form-alert--success">{success}</div>}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Cargando...' : 'Entrar'}
              </button>

              <div className="auth-links">
                <button className="btn-outline" type="button" onClick={() => cambiarVista('register')}>Crear Usuario</button>
                <button className="btn-outline" type="button" onClick={() => cambiarVista('recover')}>Recuperar<br/>Contraseña</button>
              </div>
            </form>
          </div>

          {/* ── Vista Registro ── */}
          <div className={`auth-view${vista === 'register' ? ' active' : ''}`}>
            <form onSubmit={handleRegister} style={{ display:'contents' }}>
              <FormGroup label="Nombre de Usuario">
                <input className="form-input" type="text" placeholder="Elige un nombre de usuario"
                  value={regUser} onChange={e => setRegUser(e.target.value)} autoComplete="username" />
              </FormGroup>
              <FormGroup label="Correo Electrónico">
                <input className="form-input" type="email" placeholder="tu@correo.com"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)} autoComplete="email" />
              </FormGroup>
              <FormGroup label="Número de Teléfono">
                <input className="form-input" type="tel" placeholder="Ej: 3001234567"
                  value={regTel} onChange={e => setRegTel(e.target.value)} autoComplete="tel" />
              </FormGroup>
              <FormGroup label="Contraseña">
                <div className="input-wrap">
                  <input className="form-input" type={showRegPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                    value={regPass} onChange={e => setRegPass(e.target.value)} autoComplete="new-password" />
                  <button className="toggle-pass" type="button" onClick={() => setShowRegPass(v => !v)}>
                    <EyeIcon open={showRegPass} />
                  </button>
                </div>
              </FormGroup>
              <FormGroup label="Confirmar Contraseña">
                <div className="input-wrap">
                  <input className="form-input" type={showRegPass2 ? 'text' : 'password'} placeholder="Repite tu contraseña"
                    value={regPass2} onChange={e => setRegPass2(e.target.value)} autoComplete="new-password" />
                  <button className="toggle-pass" type="button" onClick={() => setShowRegPass2(v => !v)}>
                    <EyeIcon open={showRegPass2} />
                  </button>
                </div>
              </FormGroup>

              {error && <div className="form-alert form-alert--error">{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Cargando...' : 'Crear Cuenta'}
              </button>
              <div className="auth-links auth-links--center">
                <button className="link-btn" type="button" onClick={() => cambiarVista('login')}>
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </form>
          </div>

          {/* ── Vista Recuperar ── */}
          <div className={`auth-view${vista === 'recover' ? ' active' : ''}`}>
            <form onSubmit={handleRecover} style={{ display:'contents' }}>
              <p className="view-description">
                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
              </p>
              <FormGroup label="Correo Electrónico">
                <input className="form-input" type="email" placeholder="tu@correo.com"
                  value={recEmail} onChange={e => setRecEmail(e.target.value)} autoComplete="email" />
              </FormGroup>

              {success && <div className="form-alert form-alert--success">{success}</div>}
              {error   && <div className="form-alert form-alert--error">{error}</div>}

              <button className="btn-primary" type="submit">Enviar Instrucciones</button>
              <div className="auth-links auth-links--center">
                <button className="link-btn" type="button" onClick={() => cambiarVista('login')}>
                  ← Volver al inicio de sesión
                </button>
              </div>
            </form>
          </div>

        </aside>

        {/* ── Panel marca ── */}
        <section className="panel-brand" aria-hidden="true">
          <div className="brand-deco brand-deco--top-right" />
          <div className="brand-deco brand-deco--bottom-left" />
          <div className="panel-brand__content">
            <h1 className="brand-welcome">
              <span className="brand-welcome__line1">Bienvenido a la</span>
              <span className="brand-welcome__line2">Familia de</span>
              <span className="brand-welcome__line3">OrientPerfumes</span>
            </h1>
            <p className="brand-tagline">
              Perfumería 100% Original
              <span className="brand-tagline__cursor" aria-hidden="true">|</span>
            </p>
          </div>
        </section>

      </div>
    </>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function EyeIcon({ open }) {
  return (
    <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {open
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );
}