import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KEY = 'op_colecciones_logos';

function getLogos() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}

/* ── Íconos SVG por categoría ── */
const IconNicho = () => (
  <svg viewBox="0 0 32 40" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="34" height="42" aria-hidden="true">
    <rect x="8" y="14" width="16" height="24" rx="4"/>
    <rect x="11" y="8" width="10" height="6" rx="2"/>
    <line x1="14" y1="4" x2="14" y2="8"/>
    <line x1="18" y1="4" x2="18" y2="8"/>
    <circle cx="16" cy="26" r="2.5" strokeWidth="1"/>
  </svg>
);
const IconOriental = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="38" height="38" aria-hidden="true">
    <path d="M28 20a12 12 0 1 1-10.4-11.9A9 9 0 1 0 28 20z"/>
    <circle cx="30" cy="10" r="2" fill="#C9A84C" strokeWidth="0"/>
  </svg>
);
const IconDisenador = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="38" height="38" aria-hidden="true">
    <path d="M20 6 L34 14 L34 26 L20 34 L6 26 L6 14 Z"/>
    <path d="M20 6 L27 14 L20 22 L13 14 Z" strokeWidth="0.9"/>
    <line x1="6"  y1="14" x2="13" y2="14" strokeWidth="0.9"/>
    <line x1="34" y1="14" x2="27" y2="14" strokeWidth="0.9"/>
    <line x1="6"  y1="26" x2="13" y2="22" strokeWidth="0.9"/>
    <line x1="34" y1="26" x2="27" y2="22" strokeWidth="0.9"/>
    <line x1="20" y1="22" x2="20" y2="34" strokeWidth="0.9"/>
  </svg>
);
const IconExclusivos = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="38" height="38" aria-hidden="true">
    <polygon points="20,4 24,14 35,14 26,21 29,32 20,25 11,32 14,21 5,14 16,14"/>
  </svg>
);

const CONFIG = {
  'Nicho':      { icono: <IconNicho />,      count: '+120', eyebrow: 'Perfumería de Autor',  bg: 'radial-gradient(circle at 50% 30%, rgba(180,130,30,0.22) 0%, transparent 60%), linear-gradient(to bottom, #1a1510, #0a0a08)' },
  'Oriental':   { icono: <IconOriental />,   count: '+85',  eyebrow: 'Colección Oriental',   bg: 'radial-gradient(circle at 60% 40%, rgba(160,100,10,0.24) 0%, transparent 60%), linear-gradient(to bottom, #130e08, #0a0a08)' },
  'Diseñador':  { icono: <IconDisenador />,  count: '+200', eyebrow: 'Grandes Maisons',      bg: 'radial-gradient(circle at 40% 35%, rgba(140,95,15,0.22) 0%, transparent 60%), linear-gradient(to bottom, #151209, #0a0a08)' },
  'Exclusivos': { icono: <IconExclusivos />, count: '+45',  eyebrow: 'Ediciones Especiales', bg: 'radial-gradient(circle at 55% 45%, rgba(170,120,20,0.24) 0%, transparent 60%), linear-gradient(to bottom, #18140c, #0a0a08)' },
};

/* ============================================================
   CategoryCard — limpio, sin logos. Los logos van en el marquee
============================================================ */
export function CategoryCard({ nombre }) {
  const navigate = useNavigate();
  const cfg = CONFIG[nombre] || {};

  return (
    <article
      className="category-card"
      role="listitem"
      tabIndex="0"
      onClick={() => navigate(`/coleccion?categoria=${encodeURIComponent(nombre)}`)}
      onKeyDown={e => { if (e.key === 'Enter') navigate(`/coleccion?categoria=${encodeURIComponent(nombre)}`); }}>

      <div className="category-card__bg" style={{ background: cfg.bg }} aria-hidden="true" />
      <div className="category-card__overlay" aria-hidden="true" />

      <div className="category-card__content">
        <div className="category-card__icon">{cfg.icono}</div>
        <div className="category-card__eyebrow">{cfg.eyebrow}</div>
        <div className="category-card__name">{nombre}</div>
        <div className="category-card__count">{cfg.count} fragancias</div>
      </div>

      <div className="category-card__line" aria-hidden="true" />
    </article>
  );
}

/* ============================================================
   BrandsMarquee — franja horizontal de logos de marcas,
   siempre visible, scroll infinito suave.
============================================================ */
function BrandsMarquee() {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    const all = getLogos();
    /* Aplanar todos los logos de todas las colecciones, sin duplicados */
    const seen = new Set();
    const flat  = Object.values(all).flat().filter(l => {
      if (!l?.imagen || seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });
    setLogos(flat);
  }, []);

  if (!logos.length) return null;

  /* Duplicar para crear un loop perfecto; triplicar si son pocos */
  const copies = logos.length < 6 ? 4 : logos.length < 10 ? 3 : 2;
  const track  = Array.from({ length: copies }, () => logos).flat();
  /* Velocidad: ~4s por logo original */
  const dur = `${Math.max(logos.length * 4, 18)}s`;

  return (
    <div className="brands-marquee" aria-label="Marcas representadas">
      {/* Etiqueta superior */}
      <div className="brands-marquee__header">
        <span className="brands-marquee__line" />
        <span className="brands-marquee__eyebrow">Marcas Representadas</span>
        <span className="brands-marquee__line" />
      </div>

      {/* Degradados laterales */}
      <div className="brands-marquee__fade brands-marquee__fade--left"  aria-hidden="true" />
      <div className="brands-marquee__fade brands-marquee__fade--right" aria-hidden="true" />

      {/* Track animado */}
      <div className="brands-marquee__viewport">
        <div
          className="brands-marquee__track"
          style={{ animationDuration: dur, '--copies': copies }}>
          {track.map((logo, i) => (
            <div key={`${logo.id}-${i}`} className="brands-marquee__item">
              <img
                src={logo.imagen}
                alt={logo.nombre}
                loading="lazy"
                className="brands-marquee__img"
              />
              <span className="brands-marquee__name">{logo.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Sección completa expuesta al resto de la app
============================================================ */
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

      <BrandsMarquee />
    </section>
  );
}
