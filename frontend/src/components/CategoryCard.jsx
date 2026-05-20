import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KEY = 'op_colecciones_logos';
function getLogos() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}

/* ── Paleta única por categoría ─────────────────────────────── */
const CONFIG = {
  'Nicho': {
    num: '01',
    accent: '#9B8DC8',
    eyebrow: 'Perfumería de Autor',
    count: '+120',
    bgGradient: `
      radial-gradient(ellipse at 35% 20%, rgba(155,141,200,0.22) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 75%, rgba(100,80,160,0.14) 0%, transparent 50%),
      linear-gradient(160deg, #110f18 0%, #0a0a08 100%)
    `,
  },
  'Oriental': {
    num: '02',
    accent: '#C17A2A',
    eyebrow: 'Colección Oriental',
    count: '+85',
    bgGradient: `
      radial-gradient(ellipse at 50% 25%, rgba(193,122,42,0.26) 0%, transparent 55%),
      radial-gradient(ellipse at 25% 75%, rgba(160,80,20,0.18) 0%, transparent 45%),
      linear-gradient(160deg, #160d04 0%, #0a0a08 100%)
    `,
  },
  'Diseñador': {
    num: '03',
    accent: '#B8AA88',
    eyebrow: 'Grandes Maisons',
    count: '+200',
    bgGradient: `
      radial-gradient(ellipse at 55% 25%, rgba(184,170,136,0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 40% 75%, rgba(150,138,110,0.12) 0%, transparent 45%),
      linear-gradient(160deg, #14130f 0%, #0a0a08 100%)
    `,
  },
  'Exclusivos': {
    num: '04',
    accent: '#4A90C4',
    eyebrow: 'Ediciones Especiales',
    count: '+45',
    bgGradient: `
      radial-gradient(ellipse at 50% 35%, rgba(74,144,196,0.24) 0%, transparent 55%),
      radial-gradient(ellipse at 65% 70%, rgba(40,90,160,0.16) 0%, transparent 45%),
      linear-gradient(160deg, #07101a 0%, #0a0a08 100%)
    `,
  },
};

/* ── Íconos SVG ──────────────────────────────────────────────── */
const IconNicho = ({ color }) => (
  <svg viewBox="0 0 32 40" fill="none" stroke={color} strokeWidth="1.3" width="34" height="42" aria-hidden="true">
    <rect x="8" y="14" width="16" height="24" rx="4"/>
    <rect x="11" y="8" width="10" height="6" rx="2"/>
    <line x1="14" y1="4" x2="14" y2="8"/>
    <line x1="18" y1="4" x2="18" y2="8"/>
    <circle cx="16" cy="26" r="2.5" strokeWidth="1"/>
  </svg>
);
const IconOriental = ({ color }) => (
  <svg viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.3" width="38" height="38" aria-hidden="true">
    <path d="M28 20a12 12 0 1 1-10.4-11.9A9 9 0 1 0 28 20z"/>
    <circle cx="30" cy="10" r="2" fill={color} strokeWidth="0"/>
  </svg>
);
const IconDisenador = ({ color }) => (
  <svg viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.3" width="38" height="38" aria-hidden="true">
    <path d="M20 6 L34 14 L34 26 L20 34 L6 26 L6 14 Z"/>
    <path d="M20 6 L27 14 L20 22 L13 14 Z" strokeWidth="0.9"/>
    <line x1="6"  y1="14" x2="13" y2="14" strokeWidth="0.9"/>
    <line x1="34" y1="14" x2="27" y2="14" strokeWidth="0.9"/>
    <line x1="6"  y1="26" x2="13" y2="22" strokeWidth="0.9"/>
    <line x1="34" y1="26" x2="27" y2="22" strokeWidth="0.9"/>
    <line x1="20" y1="22" x2="20" y2="34" strokeWidth="0.9"/>
  </svg>
);
const IconExclusivos = ({ color }) => (
  <svg viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.3" width="38" height="38" aria-hidden="true">
    <polygon points="20,4 24,14 35,14 26,21 29,32 20,25 11,32 14,21 5,14 16,14"/>
  </svg>
);

/* ── Patrones SVG únicos por categoría ──────────────────────── */

/* Oriental — arabesco geométrico islámico */
function PatternOriental({ color }) {
  const id = 'pat-oriental';
  return (
    <div className="cat-pattern cat-pattern--oriental" aria-hidden="true">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '140%', height: '140%', position: 'absolute', top: '-20%', left: '-20%' }}>
        <defs>
          <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            {/* Estrella de 8 puntas */}
            <polygon
              points="20,2 22.9,10.1 31.5,7.6 28,16 36.5,20 28,24 31.5,32.4 22.9,29.9 20,38 17.1,29.9 8.5,32.4 12,24 3.5,20 12,16 8.5,7.6 17.1,10.1"
              fill="none" stroke={color} strokeWidth="0.55" opacity="0.8"/>
            <circle cx="20" cy="20" r="4.5" fill="none" stroke={color} strokeWidth="0.45"/>
            <rect x="14" y="14" width="12" height="12" transform="rotate(45 20 20)"
              fill="none" stroke={color} strokeWidth="0.35"/>
            {/* Puntos en las esquinas */}
            <circle cx="0"  cy="0"  r="1" fill={color} opacity="0.4"/>
            <circle cx="40" cy="0"  r="1" fill={color} opacity="0.4"/>
            <circle cx="0"  cy="40" r="1" fill={color} opacity="0.4"/>
            <circle cx="40" cy="40" r="1" fill={color} opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.7"/>
      </svg>
    </div>
  );
}

/* Nicho — trazos orgánicos + partículas flotantes */
function PatternNicho({ color }) {
  const PARTICLES = [
    { x: '18%', y: '70%', r: 2.5,  delay: '0s',    dur: '4.2s'  },
    { x: '45%', y: '80%', r: 1.5,  delay: '0.8s',  dur: '5.1s'  },
    { x: '72%', y: '65%', r: 3,    delay: '1.6s',  dur: '3.8s'  },
    { x: '30%', y: '55%', r: 1.8,  delay: '2.4s',  dur: '4.7s'  },
    { x: '60%', y: '85%', r: 2,    delay: '0.4s',  dur: '5.5s'  },
    { x: '85%', y: '75%', r: 1.2,  delay: '3.1s',  dur: '4s'    },
    { x: '10%', y: '88%', r: 1.6,  delay: '1.2s',  dur: '6s'    },
    { x: '55%', y: '60%', r: 2.2,  delay: '2.8s',  dur: '3.5s'  },
  ];
  return (
    <div className="cat-pattern" aria-hidden="true"
      style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Trazo orgánico de fondo */}
      <svg viewBox="0 0 300 400" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.12 }}>
        <path d="M-10,120 C60,90 90,170 70,230 C50,290 130,250 160,320 C190,390 140,420 180,460"
          fill="none" stroke={color} strokeWidth="32" strokeLinecap="round"/>
        <path d="M130,-20 C200,50 150,130 220,170 C290,210 240,300 300,340"
          fill="none" stroke={color} strokeWidth="48" strokeLinecap="round"/>
        <circle cx="80"  cy="170" r="55" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6"/>
        <circle cx="220" cy="300" r="75" fill="none" stroke={color} strokeWidth="1"   opacity="0.4"/>
      </svg>
      {/* Partículas flotantes */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="cat-particle" style={{
          position: 'absolute', left: p.x, bottom: p.y,
          width: p.r * 2, height: p.r * 2, borderRadius: '50%',
          background: color,
          animationDelay: p.delay, animationDuration: p.dur,
          boxShadow: `0 0 ${p.r * 3}px ${color}`,
        }}/>
      ))}
    </div>
  );
}

/* Diseñador — retícula de diamantes + shimmer */
function PatternDisenador({ color }) {
  const id = 'pat-disenador';
  return (
    <>
      <div className="cat-pattern" aria-hidden="true"
        style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <svg viewBox="0 0 200 200" style={{ width:'100%', height:'100%', opacity:0.13 }}>
          <defs>
            <pattern id={id} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M15,0 L30,15 L15,30 L0,15 Z" fill="none" stroke={color} strokeWidth="0.6"/>
              <circle cx="15" cy="15" r="1.5" fill={color} opacity="0.5"/>
              <line x1="15" y1="0"  x2="15" y2="30" stroke={color} strokeWidth="0.2" opacity="0.5"/>
              <line x1="0"  y1="15" x2="30" y2="15" stroke={color} strokeWidth="0.2" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`}/>
        </svg>
      </div>
      {/* Shimmer sweep */}
      <div className="cat-shimmer" aria-hidden="true"
        style={{ '--shimmer-color': color + '30' }}/>
    </>
  );
}

/* Exclusivos — facetas de gema + pulso */
function PatternExclusivos({ color }) {
  const cx = 150, cy = 200;
  const ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);
  const RINGS  = [55, 95, 140];
  return (
    <>
      <div className="cat-pattern" aria-hidden="true"
        style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <svg viewBox="0 0 300 400" style={{ width:'100%', height:'100%', opacity:0.18 }}>
          {/* Rayos de faceta */}
          {ANGLES.map((a, i) => {
            const rad = a * Math.PI / 180;
            return (
              <line key={i}
                x1={cx} y1={cy}
                x2={cx + Math.cos(rad) * 200}
                y2={cy + Math.sin(rad) * 250}
                stroke={color} strokeWidth="0.7" opacity="0.6"/>
            );
          })}
          {/* Anillos concéntricos */}
          {RINGS.map((r, i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 1.3}
              fill="none" stroke={color} strokeWidth="0.6"
              opacity={0.7 - i * 0.15}/>
          ))}
          {/* Facetas horizontales */}
          {[-80, -30, 20, 70, 120].map((y, i) => (
            <line key={i}
              x1={cx - 200} y1={cy + y}
              x2={cx + 200} y2={cy + y}
              stroke={color} strokeWidth="0.4" opacity="0.3"/>
          ))}
          {/* Punto central */}
          <circle cx={cx} cy={cy} r="4" fill={color} opacity="0.7"/>
        </svg>
      </div>
      {/* Pulso de luz */}
      <div className="cat-pulse" aria-hidden="true"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}40 0%, transparent 65%)` }}/>
    </>
  );
}

/* ── Flecha → ────────────────────────────────────────────────── */
const ArrowRight = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── CategoryCard ────────────────────────────────────────────── */
export function CategoryCard({ nombre }) {
  const navigate = useNavigate();
  const cfg    = CONFIG[nombre] || {};
  const accent = cfg.accent || '#C9A84C';

  const ICON_MAP = {
    'Nicho':      <IconNicho      color={accent} />,
    'Oriental':   <IconOriental   color={accent} />,
    'Diseñador':  <IconDisenador  color={accent} />,
    'Exclusivos': <IconExclusivos color={accent} />,
  };

  const PATTERN_MAP = {
    'Nicho':      <PatternNicho      color={accent} />,
    'Oriental':   <PatternOriental   color={accent} />,
    'Diseñador':  <PatternDisenador  color={accent} />,
    'Exclusivos': <PatternExclusivos color={accent} />,
  };

  function ir() { navigate(`/coleccion?categoria=${encodeURIComponent(nombre)}`); }

  return (
    <article
      className="category-card"
      role="listitem"
      tabIndex="0"
      onClick={ir}
      onKeyDown={e => e.key === 'Enter' && ir()}>

      {/* Fondo degradado único */}
      <div className="category-card__bg"
        style={{ background: cfg.bgGradient }} aria-hidden="true" />

      {/* Patrón animado */}
      {PATTERN_MAP[nombre]}

      {/* Overlay oscuro */}
      <div className="category-card__overlay" aria-hidden="true" />

      {/* Número decorativo */}
      <div className="category-card__num" style={{ color: accent }} aria-hidden="true">
        {cfg.num}
      </div>

      {/* Anillo del ícono */}
      <div className="category-card__icon-wrap">
        <div className="category-card__icon-ring"
          style={{ borderColor: accent + '50', boxShadow: `0 0 20px ${accent}20` }}>
          <div className="category-card__icon">{ICON_MAP[nombre]}</div>
        </div>
      </div>

      {/* Info base (se oculta en hover) */}
      <div className="category-card__content">
        <div className="category-card__eyebrow"
          style={{ color: accent + 'BB' }}>{cfg.eyebrow}</div>
        <div className="category-card__name">{nombre}</div>
        <div className="category-card__count">{cfg.count} fragancias</div>
      </div>

      {/* Panel reveal en hover */}
      <div className="category-card__reveal">
        <div className="category-card__reveal-title">{nombre}</div>
        <div className="category-card__reveal-eyebrow"
          style={{ color: accent }}>{cfg.eyebrow}</div>
        <button className="category-card__reveal-btn"
          style={{ borderColor: accent, color: accent }}
          onClick={e => { e.stopPropagation(); ir(); }}
          tabIndex="-1">
          Explorar colección
          <ArrowRight color={accent} />
        </button>
      </div>

      {/* Línea dorada inferior */}
      <div className="category-card__line"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} aria-hidden="true" />

      {/* Borde acento en hover */}
      <div className="category-card__border"
        style={{ '--accent': accent }} aria-hidden="true" />
    </article>
  );
}

/* ── BrandsMarquee ───────────────────────────────────────────── */
function BrandsMarquee() {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    const all  = getLogos();
    const seen = new Set();
    const flat = Object.values(all).flat().filter(l => {
      if (!l?.imagen || seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });
    setLogos(flat);
  }, []);

  if (!logos.length) return null;

  const copies = logos.length < 6 ? 4 : logos.length < 10 ? 3 : 2;
  const track  = Array.from({ length: copies }, () => logos).flat();
  const dur    = `${Math.max(logos.length * 4, 18)}s`;

  return (
    <div className="brands-marquee" aria-label="Marcas representadas">
      <div className="brands-marquee__header">
        <span className="brands-marquee__line" />
        <span className="brands-marquee__eyebrow">Marcas Representadas</span>
        <span className="brands-marquee__line" />
      </div>
      <div className="brands-marquee__fade brands-marquee__fade--left"  aria-hidden="true" />
      <div className="brands-marquee__fade brands-marquee__fade--right" aria-hidden="true" />
      <div className="brands-marquee__viewport">
        <div className="brands-marquee__track"
          style={{ animationDuration: dur, '--copies': copies }}>
          {track.map((logo, i) => (
            <div key={`${logo.id}-${i}`} className="brands-marquee__item">
              <img src={logo.imagen} alt={logo.nombre} loading="lazy"
                className="brands-marquee__img" />
              <span className="brands-marquee__name">{logo.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CategoriasSection ───────────────────────────────────────── */
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
