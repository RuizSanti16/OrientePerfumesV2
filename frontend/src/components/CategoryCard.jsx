import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KEY = 'op_colecciones_logos';

function getLogos() {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : {};
  } catch { return {}; }
}

const CONFIG = {
  'Nicho':      { icono: '🏺', count: '+120', eyebrow: 'Perfumería de Autor',  bg: 'radial-gradient(circle at 50% 30%, rgba(180,130,30,0.18) 0%, transparent 55%), linear-gradient(to bottom, #1a1510, #0a0a08)' },
  'Oriental':   { icono: '🌙', count: '+85',  eyebrow: 'Colección Oriental',   bg: 'radial-gradient(circle at 60% 40%, rgba(160,100,10,0.2) 0%, transparent 55%), linear-gradient(to bottom, #130e08, #0a0a08)' },
  'Diseñador':  { icono: '💎', count: '+200', eyebrow: 'Grandes Maisons',      bg: 'radial-gradient(circle at 40% 35%, rgba(140,95,15,0.18) 0%, transparent 55%), linear-gradient(to bottom, #151209, #0a0a08)' },
  'Exclusivos': { icono: '✨', count: '+45',  eyebrow: 'Ediciones Especiales', bg: 'radial-gradient(circle at 55% 45%, rgba(170,120,20,0.2) 0%, transparent 55%), linear-gradient(to bottom, #18140c, #0a0a08)' },
};

export function CategoryCard({ nombre }) {
  const navigate  = useNavigate();
  const [hover,   setHover]   = useState(false);
  const [logos,   setLogos]   = useState([]);
  const cfg = CONFIG[nombre] || {};

  useEffect(() => {
    const all = getLogos();
    setLogos(all[nombre] || []);
  }, [nombre]);

  return (
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
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        borderColor: hover ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.1)',
      }}>

      <div className="category-card__bg" style={{ background: cfg.bg }} aria-hidden="true" />
      <div className="category-card__overlay" aria-hidden="true" />

      {/* Contenido base */}
      <div className="category-card__content" style={{ transition: 'opacity 0.25s', opacity: hover && logos.length ? 0.3 : 1 }}>
        <div className="category-card__icon" aria-hidden="true">{cfg.icono}</div>
        <div className="category-card__name">{nombre}</div>
        <div className="category-card__count">{cfg.count} fragancias</div>
      </div>

      {/* Panel de logos — aparece en hover */}
      {logos.length > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '16px 12px', gap: 10,
          opacity: hover ? 1 : 0,
          transform: hover ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.3s, transform 0.3s',
          pointerEvents: 'none',
        }}>
          {/* Nombre colección arriba */}
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', color: '#C9A84C', marginBottom: 4 }}>
            {cfg.eyebrow?.toUpperCase()}
          </div>

          {/* Grid de logos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: logos.length <= 2 ? `repeat(${logos.length}, 1fr)` : logos.length <= 4 ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
            gap: 8, width: '100%',
          }}>
            {logos.slice(0, 6).map(logo => (
              <div key={logo.id} style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 6, padding: '8px 6px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
              }}>
                <img
                  src={logo.imagen} alt={logo.nombre}
                  style={{ maxWidth: '100%', height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                />
                <span style={{ fontSize: 9, color: '#C8C0B0', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.2 }}>
                  {logo.nombre}
                </span>
              </div>
            ))}
          </div>

          {logos.length > 6 && (
            <div style={{ fontSize: 10, color: '#9A9180', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
              +{logos.length - 6} más →
            </div>
          )}
        </div>
      )}

      <div className="category-card__line" aria-hidden="true" />
    </article>
  );
}

/* Sección completa de colecciones — reemplaza el bloque en Home.jsx */
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