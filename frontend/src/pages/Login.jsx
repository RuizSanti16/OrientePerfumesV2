import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate  = useNavigate();
  const { loginAdmin, loginCliente } = useAuth();

  const [vista, setVista]   = useState('login'); // login | register | recover
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  /* ── Login ── */
  const [usuario, setUsuario]   = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!usuario || !password) { setError('Completa todos los campos'); return; }
    setLoading(true);
    try {
      /* Intentar admin */
      const resAdmin = await authAPI.loginAdmin({ usuario, password });
      if (resAdmin.ok) {
        loginAdmin(resAdmin);
        navigate('/admin');
        return;
      }
      /* Intentar cliente */
      const resCliente = await authAPI.loginCliente({ usuario, password });
      if (resCliente.ok) {
        loginCliente(resCliente);
        navigate('/');
        return;
      }
      setError('Usuario o contraseña incorrectos');
    } catch {
      setError('Error de conexión. Verifica que XAMPP esté activo.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Registro ── */
  const [regUser, setRegUser]   = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTel, setRegTel]     = useState('');
  const [regPass, setRegPass]   = useState('');
  const [regPass2, setRegPass2] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!regUser || !regEmail || !regPass) { setError('Completa los campos requeridos'); return; }
    if (regPass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (regPass !== regPass2) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      const res = await authAPI.registro({ usuario: regUser, correo: regEmail, telefono: regTel, password: regPass });
      if (res.ok) {
        setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
        setVista('login');
      } else {
        setError(res.mensaje || 'Error al crear la cuenta');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lato, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '48px 32px', background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', color: '#C9A84C', letterSpacing: '0.15em' }}>ORIENTPERFUMES</div>
          <div style={{ fontSize: '12px', color: '#9A9180', letterSpacing: '0.1em', marginTop: '4px' }}>
            {vista === 'login' ? 'INGRESA TU USUARIO' : vista === 'register' ? 'CREAR CUENTA' : 'RECUPERAR CONTRASEÑA'}
          </div>
        </div>

        {error   && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: '#e05252', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', color: '#4caf50', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{success}</div>}

        {/* ── Vista Login ── */}
        {vista === 'login' && (
          <form onSubmit={handleLogin}>
            <Input label="Nombre Usuario" value={usuario} onChange={setUsuario} placeholder="tu_usuario" />
            <Input label="Contraseña" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
            <BtnPrimary disabled={loading}>{loading ? 'Cargando...' : 'Entrar'}</BtnPrimary>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <BtnLink onClick={() => { setVista('register'); setError(''); setSuccess(''); }}>Crear Usuario</BtnLink>
              <BtnLink onClick={() => { setVista('recover'); setError(''); setSuccess(''); }}>Recuperar Contraseña</BtnLink>
            </div>
          </form>
        )}

        {/* ── Vista Registro ── */}
        {vista === 'register' && (
          <form onSubmit={handleRegister}>
            <Input label="Nombre de Usuario *" value={regUser}  onChange={setRegUser}  placeholder="Elige un nombre" />
            <Input label="Correo Electrónico *" value={regEmail} onChange={setRegEmail} type="email" placeholder="tu@correo.com" />
            <Input label="Teléfono"             value={regTel}   onChange={setRegTel}   type="tel"   placeholder="3001234567" />
            <Input label="Contraseña *"         value={regPass}  onChange={setRegPass}  type="password" placeholder="Mínimo 6 caracteres" />
            <Input label="Confirmar Contraseña *" value={regPass2} onChange={setRegPass2} type="password" placeholder="Repite tu contraseña" />
            <BtnPrimary disabled={loading}>{loading ? 'Cargando...' : 'Crear Cuenta'}</BtnPrimary>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <BtnLink onClick={() => { setVista('login'); setError(''); setSuccess(''); }}>¿Ya tienes cuenta? Inicia sesión</BtnLink>
            </div>
          </form>
        )}

        {/* ── Vista Recuperar ── */}
        {vista === 'recover' && (
          <form onSubmit={(e) => { e.preventDefault(); setSuccess('Si el correo está registrado recibirás las instrucciones.'); }}>
            <Input label="Correo Electrónico" value={regEmail} onChange={setRegEmail} type="email" placeholder="tu@correo.com" />
            <BtnPrimary>Enviar Instrucciones</BtnPrimary>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <BtnLink onClick={() => { setVista('login'); setError(''); setSuccess(''); }}>Volver al login</BtnLink>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Sub-componentes locales ── */
function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '0.15em', color: '#9A9180', marginBottom: '6px' }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#E8DCC8', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
}

function BtnPrimary({ children, disabled }) {
  return (
    <button type="submit" disabled={disabled}
      style={{ width: '100%', background: '#C9A84C', border: 'none', borderRadius: '6px', padding: '12px', color: '#0a0a08', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '0.15em', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, marginTop: '8px' }}>
      {children}
    </button>
  );
}

function BtnLink({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ background: 'none', border: 'none', color: '#9A9180', fontSize: '11px', cursor: 'pointer', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
      {children}
    </button>
  );
}