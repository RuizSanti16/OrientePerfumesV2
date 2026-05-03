import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KEY = 'op_colecciones_logos';

function getLogos() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}

const CONFIG = {
  'Nicho':      { icono: '🏺', count: '+120', eyebrow: 'Perfumería de Autor',  bg: 'radial-gradient(circle at 50% 30%, rgba(180,130,30,0.22) 0%, transparent 60%), linear-gradient(to bottom, #1a1510, #0a0a08)' },
  'Oriental':   { icono: '🌙', count: '+85',  eyebrow: 'Colección Oriental',   bg: 'radial-gradient(circle at 60% 40%, rgba(160,100,10,0.24) 0%, transparent 60%), linear-gradient(to bottom, #130e08, #0a0a08)' },
  'Diseñador':  { icono: '💎', count: '+200', eyebrow: 'Grandes Maisons',      bg: 'radial-gradient(circle at 40% 35%, rgba(140,95,15,0.22) 0%, transparent 60%), linear-gradient(to bottom, #151209, #0a0a08)' },
  'Exclusivos': { icono: '✨', count: '+45',  eyebrow: 'Ediciones Especiales', bg: 'radial-gradient(circle at 55% 45%, rgba(170,120,20,0.24) 0%, transparent 60%), linear-gradient(to bottom, #18140c, #0a0a08)' },
};

export function CategoryCard({ nombre }) {
  const navigate   = useNavigate();
  const [hover,    setHover]  = useState(false);
  const [logos,    setLogos]  = useState([]);
  const cfg = CONFIG[nombre] || {};

  useEffect(() => {
    const all = getLogos();
    setLogos(all[nombre] || []);
  }, [nombre]);

  const tieneLogos = logos.length > 0;

  return (
    <>
      <style>{`
        @keyframes scrollLogos {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-strip-track {
          display: flex;
          gap: 12px;
          animation: scrollLogos 12s linear infinite;
          width: max-content;
        }
        .logo-strip-track:hover {
          animation-play-state: paused;
        }
        .logo-strip-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex-shrink: 0;
          width: 72px;
          padding: 8px 6px;
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 6px;
          transition: background 0.2s, border-color 0.2s;
        }
        .logo-strip-item:hover {
          background: rgba(201,168,76,0.12);
          border-color: rgba(201,168,76,0.4);
        }
      `}</style>

      <article
        className="category-card"
        role="listitem"
        tabIndex="0"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => navigate(`/coleccion?categoria=${encodeURIComponent(nombre)}`)}
        onKeyDown={e => { if (e.key === 'Enter') navigate(`/coleccion?categoria=${encodeURIComponent(nombre)}`); }}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.3s, min-height 0.4s cubic-bezier(0.4,0,0.2,1)',
          borderColor: hover ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.1)',
          minHeight: hover && tieneLogos ? '300px' : '220px',
          display: 'flex',
          flexDirection: 'column',
        }}>

        {/* Fondo */}
        <div className="category-card__bg" style={{ background: cfg.bg }} aria-hidden="true" />
        <div className="category-card__overlay" aria-hidden="true" />

        {/* Contenido principal */}
        <div style={{
          position: 'relative', zIndex: 1,
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '24px 20px 16px',
          transition: 'transform 0.35s',
          transform: hover && tieneLogos ? 'translateY(-8px)' : 'translateY(0)',
        }}>
          <div style={{ fontSize: 34 }}>{cfg.icono}</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#E8DCC8', letterSpacing: '0.12em' }}>{nombre}</div>
          <div style={{ fontSize: 12, color: '#9A9180', letterSpacing: '0.08em' }}>{cfg.count} fragancias</div>
          {tieneLogos && (
            <div style={{
              fontFamily: 'Cinzel, serif', fontSize: 8,
              letterSpacing: '0.18em', color: 'rgba(201,168,76,0.5)',
              marginTop: 2, transition: 'opacity 0.3s',
              opacity: hover ? 0 : 1,
            }}>
              PASA EL CURSOR
            </div>
          )}
        </div>

        {/* Franja de logos — aparece en hover */}
        {tieneLogos && (
          <div style={{
            position: 'relative', zIndex: 2,
            maxHeight: hover ? '110px' : '0px',
            opacity: hover ? 1 : 0,
            transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.55)',
            borderTop: '1px solid rgba(201,168,76,0.15)',
          }}>
            {/* Degradados laterales para efecto fade */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 28, zIndex: 2,
              background: 'linear-gradient(90deg, rgba(0,0,0,0.7), transparent)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 28, zIndex: 2,
              background: 'linear-gradient(-90deg, rgba(0,0,0,0.7), transparent)',
              pointerEvents: 'none',
            }} />

            {/* Label */}
            <div style={{
              fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.2em',
              color: '#C9A84C', textAlign: 'center', padding: '8px 0 4px',
            }}>
              {cfg.eyebrow?.toUpperCase()}
            </div>

            {/* Track con scroll infinito */}
            <div style={{ overflow: 'hidden', padding: '0 8px 10px' }}>
              <div className="logo-strip-track">
                {/* Duplicamos los logos para el loop infinito */}
                {[...logos, ...logos].map((logo, i) => (
                  <div key={`${logo.id}-${i}`} className="logo-strip-item">
                    <img
                      src={logo.imagen} alt={logo.nombre}
                      style={{ width: 52, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                    />
                    <span style={{
                      fontSize: 7, color: '#9A9180', fontFamily: 'Cinzel, serif',
                      letterSpacing: '0.06em', textAlign: 'center',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 68,
                    }}>
                      {logo.nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="category-card__line" aria-hidden="true" />
      </article>
    </>
  );
}

/* Sección completa */
export function CategoriasSection() {
  return (
    <section className="section" id="categorias">
      <div className="section__header">
        <div className="section__eyebrow">Descubre</div>
        <h2 className="section__title">Nuestras Colecciones</h2>
        <p className="section__subtitle">Cada fragancia, una historia única</p>
      </div>
      <div className="categories-grid" role="list">
        {Object.keys(CONFIG).map(nombre => (
          <CategoryCard key={nombre} nombre={nombre} />
        ))}
      </div>
    </section>
  );
}