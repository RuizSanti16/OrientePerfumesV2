import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import Footer from '../components/Footer';

const NAV = [
  { label: 'Inicio',    to: '/'          },
  { label: 'Colección', to: '/coleccion' },
  { label: 'Noticias',  to: '/noticias'  },
  { label: 'Contacto',  to: '/contacto'  },
];

export default function NotFound() {
  const navigate = useNavigate();
  const [refContent, visContent] = useInView(0.1);

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* Destellos de fondo */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '15%', left: '8%',  width: 'min(360px, 80vw)', height: 'min(360px, 80vw)', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '18%', right: '6%', width: 'min(440px, 85vw)', height: 'min(440px, 85vw)', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <header className="header">
        <a href="/" className="header__logo">
          <div className="logo-icon">
            <img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="OrientPerfumes" />
          </div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>

        <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32 }}>
          {NAV.map(n => (
            <a key={n.to} href={n.to}
              style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em', color: '#9A9180', textDecoration: 'none', padding: '6px 12px', borderRadius: 4, transition: 'color 0.2s', borderBottom: '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.color = '#9A9180'}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <BtnVolver onClick={() => navigate('/')} label="INICIO" />
        </div>
      </header>

      {/* Contenido principal */}
      <div
        ref={refContent}
        className={`fade-up${visContent ? ' visible' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '40px 24px', textAlign: 'center' }}>

        {/* Logo tenue */}
        <img
          src="/assets/Logo Oriente SIN FONDO (1) (1).png"
          alt=""
          aria-hidden="true"
          style={{ width: 72, height: 72, objectFit: 'contain', opacity: 0.18, marginBottom: 32 }}
        />

        {/* Número 404 decorativo */}
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(100px, 18vw, 180px)',
          color: 'rgba(201,168,76,0.12)',
          lineHeight: 0.85,
          letterSpacing: '-0.03em',
          userSelect: 'none',
          marginBottom: 32,
        }} aria-hidden="true">
          404
        </div>

        {/* Título */}
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.28em', color: '#C9A84C', marginBottom: 20 }}>
          PÁGINA NO ENCONTRADA
        </div>

        {/* Descripción */}
        <p style={{ color: '#9A9180', fontSize: 15, maxWidth: 420, lineHeight: 1.75, marginBottom: 44 }}>
          La página que buscas no existe o fue movida. Explora nuestras colecciones o regresa al inicio.
        </p>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: '#C9A84C', border: 'none', borderRadius: 4, padding: '13px 32px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            VOLVER AL INICIO
          </button>
          <button
            onClick={() => navigate('/coleccion?categoria=Nicho')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 4, padding: '13px 32px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            VER COLECCIONES
          </button>
        </div>

        {/* Línea decorativa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(201,168,76,0.2)', fontSize: 20, letterSpacing: 8 }}>
          <div style={{ width: 60, height: 1, background: 'rgba(201,168,76,0.15)' }} />
          — —
          <div style={{ width: 60, height: 1, background: 'rgba(201,168,76,0.15)' }} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

function BtnVolver({ onClick, label = 'INICIO' }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 4, padding: '8px 20px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.12em', transition: 'background 0.2s, border-color 0.2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}
