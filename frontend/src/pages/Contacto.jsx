import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, getWhatsappUrl } from '../hooks/useSettings';
import SocialButtons from '../components/SocialButtons';

export default function Contacto() {
  const navigate  = useNavigate();
  const settings  = useSettings();
  const waUrl     = getWhatsappUrl(settings);

  const [form, setForm]   = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [error,   setError]   = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) {
      setError('Por favor completa los campos requeridos.');
      return;
    }
    /* Si hay WhatsApp configurado, abre el chat con el mensaje del formulario */
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

  const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '12px 16px', color: '#E8DCC8', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif', transition: 'border-color 0.2s' };

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif' }}>

      {/* Announcement bar */}
      <div className="announcement-bar">
        <div className="announcement-bar__track" aria-hidden="true">
          <span className="announcement-bar__text">
            Envío gratuito en pedidos superiores a ${(settings.freeShippingMin||150000).toLocaleString('es-CO')} <span>·</span> Fragancias 100% Originales <span>·</span> Atención personalizada <span>·</span>
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
        <div className="header__actions">
          <SocialButtons />
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '6px 14px', color: '#9A9180', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em' }}>
            ← INICIO
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ padding: '80px 24px 48px', textAlign: 'center', background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 12 }}>ATENCIÓN AL CLIENTE</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,6vw,64px)', color: '#E8DCC8', margin: '0 0 16px', fontWeight: 400 }}>Contáctanos</h1>
        <p style={{ color: '#9A9180', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.</p>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>

        {/* ── Formulario ── */}
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 24 }}>ENVÍANOS UN MENSAJE</div>

          {enviado ? (
            <div style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#C9A84C', marginBottom: 8 }}>¡Mensaje enviado!</div>
              <p style={{ color: '#9A9180', fontSize: 13 }}>Gracias por contactarnos. Te responderemos pronto.</p>
              <button onClick={() => setEnviado(false)}
                style={{ marginTop: 20, background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, padding: '8px 20px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em' }}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#e05252' }}>{error}</div>}

              <div>
                <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#9A9180', display: 'block', marginBottom: 8 }}>NOMBRE *</label>
                <input style={inp} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre completo"
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#9A9180', display: 'block', marginBottom: 8 }}>EMAIL *</label>
                  <input style={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@correo.com"
                    onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'} />
                </div>
                <div>
                  <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#9A9180', display: 'block', marginBottom: 8 }}>TELÉFONO</label>
                  <input style={inp} type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="3001234567"
                    onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'} />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#9A9180', display: 'block', marginBottom: 8 }}>MENSAJE *</label>
                <textarea style={{ ...inp, resize: 'vertical', minHeight: 120 }} value={form.mensaje} onChange={e => set('mensaje', e.target.value)}
                  placeholder="¿En qué podemos ayudarte? Cuéntanos sobre la fragancia que buscas..."
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'} />
              </div>

              <button type="submit"
                style={{ background: '#C9A84C', border: 'none', borderRadius: 8, padding: '14px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.15em', marginTop: 4, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}>
                {waUrl ? '📱 ENVIAR POR WHATSAPP' : 'ENVIAR MENSAJE'}
              </button>

              {waUrl && (
                <p style={{ fontSize: 11, color: '#9A9180', textAlign: 'center', margin: 0 }}>
                  Al enviar, se abrirá WhatsApp con tu mensaje listo para enviar.
                </p>
              )}
            </form>
          )}
        </div>

        {/* ── Info de contacto ── */}
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 24 }}>INFORMACIÓN DE CONTACTO</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* WhatsApp */}
            {waUrl && (
              <InfoCard icon="💬" titulo="WhatsApp" color="#25D366">
                <a href={waUrl} target="_blank" rel="noreferrer"
                  style={{ color: '#25D366', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  {settings.whatsappNumber}
                </a>
                <p style={{ color: '#9A9180', fontSize: 13, margin: '4px 0 0' }}>Respuesta rápida · Lun–Sáb 9am–7pm</p>
              </InfoCard>
            )}

            {/* Email */}
            {settings.storeEmail && (
              <InfoCard icon="📧" titulo="Correo Electrónico" color="#C9A84C">
                <a href={`mailto:${settings.storeEmail}`}
                  style={{ color: '#C9A84C', textDecoration: 'none', fontSize: 14 }}>
                  {settings.storeEmail}
                </a>
              </InfoCard>
            )}

            {/* Teléfono */}
            {settings.storePhone && (
              <InfoCard icon="📞" titulo="Teléfono" color="#C9A84C">
                <span style={{ fontSize: 14, color: '#E8DCC8' }}>{settings.storePhone}</span>
              </InfoCard>
            )}

            {/* Dirección */}
            {settings.storeAddress && (
              <InfoCard icon="📍" titulo="Ubicación" color="#C9A84C">
                <span style={{ fontSize: 14, color: '#E8DCC8' }}>{settings.storeAddress}</span>
              </InfoCard>
            )}

            {/* Redes sociales */}
            {(settings.instagram || settings.facebook || settings.tiktok) && (
              <InfoCard icon="🌐" titulo="Redes Sociales" color="#C9A84C">
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  {settings.instagram && (
                    <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E1306C', fontSize: 13, textDecoration: 'none' }}>
                      📸 @{settings.instagram}
                    </a>
                  )}
                  {settings.facebook && (
                    <a href={`https://facebook.com/${settings.facebook}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1877F2', fontSize: 13, textDecoration: 'none' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> {settings.facebook}
                    </a>
                  )}
                  {settings.tiktok && (
                    <a href={`https://tiktok.com/@${settings.tiktok}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E8DCC8', fontSize: 13, textDecoration: 'none' }}>
                      🎵 @{settings.tiktok}
                    </a>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Horario */}
            <InfoCard icon="🕐" titulo="Horario de Atención" color="#C9A84C">
              <div style={{ fontSize: 13, color: '#E8DCC8', lineHeight: 1.8 }}>
                <div>Lunes – Viernes: <span style={{ color: '#C9A84C' }}>9:00 am – 7:00 pm</span></div>
                <div>Sábado: <span style={{ color: '#C9A84C' }}>9:00 am – 3:00 pm</span></div>
                <div style={{ color: '#9A9180' }}>Domingo: Cerrado</div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p className="footer__copy">© 2024 OrientPerfumes · Todos los derechos reservados</p>
        <a href="#" className="footer__back">↑ Volver Arriba</a>
      </footer>
    </div>
  );
}

function InfoCard({ icon, titulo, color, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px', background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 10 }}>
      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: color || '#C9A84C', marginBottom: 6 }}>{titulo.toUpperCase()}</div>
        {children}
      </div>
    </div>
  );
}