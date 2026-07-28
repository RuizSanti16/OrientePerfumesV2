import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useSettings, getWhatsappUrl } from '../hooks/useSettings';
import SocialButtons from '../components/SocialButtons';

/* ── SVG Icons ───────────────────────────────────────────────── */
function Ic({ d, size = 18, color = 'currentColor', sw = 1.6, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}

const IC = {
  back:      <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  check:     <><polyline points="20 6 9 17 4 12"/></>,
  mail:      <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  phone:     <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  pin:       <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  whatsapp:  <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>,
  instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
  facebook:  <><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></>,
  tiktok:    <><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></>,
  globe:     <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  send:      <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  refresh:   <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
};

/* ── Field label ─────────────────────────────────────────────── */
function Label({ text, required }) {
  return (
    <label style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.22em', color: '#6B6355', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
      {text}{required && <span style={{ color: '#C9A84C', marginLeft: 3 }}>*</span>}
    </label>
  );
}

const INP = {
  width: '100%', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(201,168,76,0.16)',
  borderRadius: 6, padding: '11px 14px',
  color: '#E8DCC8', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif',
  transition: 'border-color 0.2s, background 0.2s',
};

function focusIn(e)  { e.target.style.borderColor = 'rgba(201,168,76,0.55)'; e.target.style.background = 'rgba(201,168,76,0.04)'; }
function focusOut(e) { e.target.style.borderColor = 'rgba(201,168,76,0.16)'; e.target.style.background = 'rgba(255,255,255,0.03)'; }

/* ── InfoRow ─────────────────────────────────────────────────── */
function InfoRow({ iconD, iconColor, label, children }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: `${iconColor}14`,
        border: `1px solid ${iconColor}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ic d={iconD} size={15} color={iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.22em', color: '#6B6355', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
        {children}
      </div>
    </div>
  );
}

/* ── BtnVolver ───────────────────────────────────────────────── */
function BtnVolver({ onClick, label = 'INICIO' }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 4, padding: '8px 20px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.12em', transition: 'background 0.2s, border-color 0.2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}>
      <Ic d={IC.back} size={13} color="#C9A84C" sw={2.2} />
      {label}
    </button>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Contacto() {
  const navigate = useNavigate();
  const settings = useSettings();
  const waUrl    = getWhatsappUrl(settings);

  const [form,    setForm]    = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [error,   setError]   = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) {
      setError('Por favor completa los campos requeridos.');
      return;
    }
    if (waUrl) {
      const msg = encodeURIComponent(
        `Hola! Soy ${form.nombre}.\n\n${form.mensaje}\n\nCorreo: ${form.email}${form.telefono ? '\nTeléfono: ' + form.telefono : ''}`
      );
      const num = settings.whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
    }
    setEnviado(true);
    setError('');
  }

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif' }}>

      {/* Announcement bar */}
      <div className="announcement-bar">
        <div className="announcement-bar__track" aria-hidden="true">
          <span className="announcement-bar__text">
            Envío gratuito en pedidos superiores a ${(settings.freeShippingMin || 150000).toLocaleString('es-CO')} <span>·</span> Fragancias 100% Originales <span>·</span> Atención personalizada <span>·</span>
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <a onClick={() => navigate('/')} className="header__logo" style={{ cursor: 'pointer' }}>
          <div className="logo-icon"><img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="Logo" /></div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32 }}>
          {[
            { label: 'Inicio',    to: '/'          },
            { label: 'Colección', to: '/coleccion' },
            { label: 'Noticias',  to: '/noticias'  },
            { label: 'Contacto',  to: '/contacto'  },
          ].map(n => (
            <a key={n.to} href={n.to}
              style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em', color: n.to === '/contacto' ? '#C9A84C' : '#9A9180', textDecoration: 'none', padding: '6px 12px', borderRadius: 4, transition: 'color 0.2s', borderBottom: n.to === '/contacto' ? '1px solid rgba(201,168,76,0.5)' : '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.color = n.to === '/contacto' ? '#C9A84C' : '#9A9180'}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="header__actions">
          <div style={{ marginRight: 4 }}><SocialButtons /></div>
          <BtnVolver onClick={() => navigate('/')} label="INICIO" />
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', padding: '72px 24px 56px', textAlign: 'center', overflow: 'hidden' }}>
        {/* Fondo radial */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Línea decorativa */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
          <Ic d={IC.mail} size={14} color="rgba(201,168,76,0.55)" />
          <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }} />
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.28em', color: 'rgba(201,168,76,0.7)', marginBottom: 14, textTransform: 'uppercase' }}>
          Atención al cliente
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(38px,6vw,68px)', color: '#F5F0E8', margin: '0 0 16px', fontWeight: 400, lineHeight: 1 }}>
          Contáctanos
        </h1>
        <p style={{ color: '#9A9180', fontSize: 14, maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
          Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
        </p>
        <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)', margin: '28px auto 0' }} />
      </div>

      {/* ── Contenido principal ── */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

        {/* ════ Formulario ════ */}
        <div style={{ background: '#0f0f0d', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 12, padding: '36px 32px' }}>

          {/* Cabecera sección */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ic d={IC.send} size={14} color="#C9A84C" />
            </div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>Envíanos un mensaje</div>
              <div style={{ fontSize: 12, color: '#6B6355', marginTop: 2 }}>Todos los campos marcados con * son obligatorios</div>
            </div>
          </div>

          {/* Estado enviado */}
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(107,196,140,0.1)', border: '1px solid rgba(107,196,140,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Ic d={IC.check} size={26} color="#6BC48C" sw={2.5} />
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: '#F5F0E8', marginBottom: 10 }}>Mensaje enviado</div>
              <p style={{ color: '#9A9180', fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
                Gracias por contactarnos.<br />Te responderemos a la brevedad.
              </p>
              <button onClick={() => { setEnviado(false); setForm({ nombre: '', email: '', telefono: '', mensaje: '' }); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 6, padding: '10px 22px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em' }}>
                <Ic d={IC.refresh} size={13} color="#C9A84C" />
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {error && (
                <div style={{ background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#e07878', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <Label text="Nombre completo" required />
                <input style={INP} value={form.nombre} onChange={e => set('nombre', e.target.value)}
                  placeholder="Tu nombre completo" onFocus={focusIn} onBlur={focusOut} />
              </div>

              {/* Email + Teléfono */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <Label text="Correo electrónico" required />
                  <input style={INP} type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="tu@correo.com" onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <Label text="Teléfono" />
                  <input style={INP} type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)}
                    placeholder="+57 300 000 0000" onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <Label text="Mensaje" required />
                <textarea style={{ ...INP, resize: 'vertical', minHeight: 130 }}
                  value={form.mensaje} onChange={e => set('mensaje', e.target.value)}
                  placeholder="¿En qué podemos ayudarte? Cuéntanos sobre la fragancia que buscas..."
                  onFocus={focusIn} onBlur={focusOut} />
              </div>

              {/* Submit */}
              <button type="submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#C9A84C', border: 'none', borderRadius: 7, padding: '14px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em', fontWeight: 700, marginTop: 4, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {waUrl
                  ? <><Ic d={IC.whatsapp} size={15} color="#0a0a08" /> ENVIAR POR WHATSAPP</>
                  : <><Ic d={IC.send} size={14} color="#0a0a08" /> ENVIAR MENSAJE</>
                }
              </button>

              {waUrl && (
                <p style={{ fontSize: 11, color: '#6B6355', textAlign: 'center', margin: 0 }}>
                  Se abrirá WhatsApp con tu mensaje listo para enviar.
                </p>
              )}
            </form>
          )}
        </div>

        {/* ════ Panel de información ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Card principal */}
          <div style={{ background: '#0f0f0d', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 12, padding: '28px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.25em', color: '#6B6355', textTransform: 'uppercase', marginBottom: 4 }}>
              Información de contacto
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#F5F0E8', marginBottom: 20, fontWeight: 400 }}>
              Estamos disponibles
            </div>

            {/* WhatsApp */}
            {waUrl && (
              <InfoRow iconD={IC.whatsapp} iconColor="#25D366" label="WhatsApp">
                <a href={waUrl} target="_blank" rel="noreferrer"
                  style={{ color: '#25D366', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'block' }}>
                  {settings.whatsappNumber}
                </a>
                <span style={{ color: '#6B6355', fontSize: 12 }}>Respuesta rápida · Lun–Sáb</span>
              </InfoRow>
            )}

            {/* Email */}
            {settings.storeEmail && (
              <InfoRow iconD={IC.mail} iconColor="#C9A84C" label="Correo electrónico">
                <a href={`mailto:${settings.storeEmail}`}
                  style={{ color: '#C9A84C', textDecoration: 'none', fontSize: 13, display: 'block' }}>
                  {settings.storeEmail}
                </a>
              </InfoRow>
            )}

            {/* Teléfono */}
            {settings.storePhone && (
              <InfoRow iconD={IC.phone} iconColor="#C9A84C" label="Teléfono">
                <span style={{ color: '#E8DCC8', fontSize: 13 }}>{settings.storePhone}</span>
              </InfoRow>
            )}

            {/* Dirección */}
            {settings.storeAddress && (
              <InfoRow iconD={IC.pin} iconColor="#C9A84C" label="Ubicación">
                <span style={{ color: '#E8DCC8', fontSize: 13, lineHeight: 1.5 }}>{settings.storeAddress}</span>
              </InfoRow>
            )}

            {/* Horario */}
            <InfoRow iconD={IC.clock} iconColor="#C9A84C" label="Horario de atención">
              <div style={{ fontSize: 12, lineHeight: 1.9 }}>
                {[
                  { dia: 'Lun – Vie', hora: '9:00 am – 7:00 pm', activo: true },
                  { dia: 'Sábado',    hora: '9:00 am – 3:00 pm', activo: true },
                  { dia: 'Domingo',   hora: 'Cerrado',            activo: false },
                ].map(h => (
                  <div key={h.dia} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: '#9A9180' }}>{h.dia}</span>
                    <span style={{ color: h.activo ? '#C9A84C' : '#6B6355' }}>{h.hora}</span>
                  </div>
                ))}
              </div>
            </InfoRow>
          </div>

          {/* Redes sociales */}
          {(settings.instagram || settings.facebook || settings.tiktok) && (
            <div style={{ background: '#0f0f0d', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.22em', color: '#6B6355', textTransform: 'uppercase', marginBottom: 16 }}>
                Redes sociales
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {settings.instagram && (
                  <SocialLink
                    href={`https://instagram.com/${settings.instagram}`}
                    iconD={IC.instagram} color="#E1306C"
                    label={`@${settings.instagram}`}
                    sub="Instagram"
                  />
                )}
                {settings.facebook && (
                  <SocialLink
                    href={`https://facebook.com/${settings.facebook}`}
                    iconD={IC.facebook} color="#1877F2"
                    label={settings.facebook}
                    sub="Facebook"
                  />
                )}
                {settings.tiktok && (
                  <SocialLink
                    href={`https://tiktok.com/@${settings.tiktok}`}
                    iconD={IC.tiktok} color="#E8DCC8"
                    label={`@${settings.tiktok}`}
                    sub="TikTok"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── SocialLink ──────────────────────────────────────────────── */
function SocialLink({ href, iconD, color, label, sub }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', textDecoration: 'none', transition: 'background 0.2s, border-color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}0f`; e.currentTarget.style.borderColor = `${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ic d={iconD} size={14} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#E8DCC8' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#6B6355', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>{sub}</div>
      </div>
      <svg style={{ marginLeft: 'auto', opacity: 0.3 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
        <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
      </svg>
    </a>
  );
}
