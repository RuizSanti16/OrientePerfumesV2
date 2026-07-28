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

/* Oriental — estrellas individuales que giran sobre su propio eje */
function PatternOriental({ color }) {
  const STARS = [
    /* Zona superior */
    { cx: 28,  cy: 45,  r: 21 },
    { cx: 100, cy: 28,  r: 17 },
    { cx: 174, cy: 52,  r: 20 },
    /* Franja media-alta — evita el centro del ícono */
    { cx: 48,  cy: 118, r: 16 },
    { cx: 162, cy: 112, r: 23 },
    /* Laterales al nivel del ícono — bien pegados a los bordes */
    { cx: 14,  cy: 200, r: 15 },
    { cx: 186, cy: 196, r: 14 },
    /* Zona inferior */
    { cx: 42,  cy: 288, r: 18 },
    { cx: 162, cy: 280, r: 16 },
    { cx: 96,  cy: 318, r: 21 },
    { cx: 188, cy: 338, r: 13 },
  ];
  const DURS = [14, 18, 16, 20, 15, 17, 19, 14, 16, 18, 21];

  function starPath(r) {
    const inner = r * 0.42;
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI / 8) - Math.PI / 2;
      const rr = i % 2 === 0 ? r : inner;
      pts.push(`${(rr * Math.cos(a)).toFixed(2)},${(rr * Math.sin(a)).toFixed(2)}`);
    }
    return `M${pts.join('L')}Z`;
  }

  return (
    <div className="cat-pattern" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg viewBox="0 0 200 370"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        {/* Líneas conectoras — solo dentro de cada zona, sin cruzar el centro */}
        {[[0,1],[1,2],[0,3],[2,4],[3,5],[4,6],[7,9],[8,9],[9,10]].map(([a,b], i) => (
          <line key={`l${i}`}
            x1={STARS[a].cx} y1={STARS[a].cy}
            x2={STARS[b].cx} y2={STARS[b].cy}
            stroke={color} strokeWidth="0.18" opacity="0.18"/>
        ))}
        {/* Cada estrella rota sobre su propio eje */}
        {STARS.map(({ cx, cy, r }, i) => (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: `orientalSpin ${DURS[i % DURS.length]}s linear infinite`,
              animationDelay: `${-(i * 1.4).toFixed(1)}s`,
            }}>
              <path d={starPath(r)} fill="none" stroke={color} strokeWidth="0.55" opacity="0.78"/>
              <circle cx="0" cy="0" r={r * 0.27} fill="none" stroke={color} strokeWidth="0.42" opacity="0.65"/>
              <rect x={-r*0.38} y={-r*0.38} width={r*0.76} height={r*0.76}
                transform="rotate(45)"
                fill="none" stroke={color} strokeWidth="0.32" opacity="0.45"/>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* Nicho — red molecular orgánica + partículas flotantes */
function PatternNicho({ color }) {
  const NODES = [
    { x: 35,  y: 50,  r: 8 }, { x: 95,  y: 32,  r: 5 },
    { x: 162, y: 68,  r: 7 }, { x: 55,  y: 132, r: 6 },
    { x: 132, y: 152, r: 8 }, { x: 180, y: 112, r: 4 },
    { x: 28,  y: 218, r: 7 }, { x: 108, y: 242, r: 5 },
    { x: 170, y: 226, r: 6 }, { x: 60,  y: 320, r: 7 },
    { x: 148, y: 308, r: 5 }, { x: 188, y: 292, r: 4 },
  ];
  const BONDS = [
    [0,1],[1,2],[0,3],[1,3],[2,4],[2,5],[3,4],[4,5],
    [3,6],[4,7],[5,8],[6,7],[7,8],[7,9],[8,10],[9,10],[8,11],[10,11],
  ];
  const PARTICLES = [
    { x: '18%', y: '68%', r: 2.5, delay: '0s',   dur: '4.2s' },
    { x: '48%', y: '80%', r: 1.5, delay: '0.8s', dur: '5.1s' },
    { x: '75%', y: '62%', r: 3,   delay: '1.6s', dur: '3.8s' },
    { x: '32%', y: '52%', r: 1.8, delay: '2.4s', dur: '4.7s' },
    { x: '63%', y: '84%', r: 2,   delay: '0.4s', dur: '5.5s' },
    { x: '86%', y: '72%', r: 1.2, delay: '3.1s', dur: '4s'   },
    { x: '12%', y: '87%', r: 1.6, delay: '1.2s', dur: '6s'   },
    { x: '55%', y: '58%', r: 2.2, delay: '2.8s', dur: '3.5s' },
  ];
  return (
    <div className="cat-pattern" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg viewBox="0 0 200 360"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Curvas orgánicas de fondo */}
        <path d="M-20,80 C55,42 82,145 54,208 C32,272 128,248 152,318"
          fill="none" stroke={color} strokeWidth="30" strokeLinecap="round" opacity="0.09"/>
        <path d="M142,-18 C202,52 148,134 215,172"
          fill="none" stroke={color} strokeWidth="44" strokeLinecap="round" opacity="0.07"/>
        {/* Líneas de enlace molecular */}
        {BONDS.map(([a, b], i) => (
          <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
            stroke={color} strokeWidth="0.45" opacity="0.3"/>
        ))}
        {/* Nodos moleculares */}
        {NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke={color} strokeWidth="0.6" opacity="0.45"/>
            <circle cx={n.x} cy={n.y} r={n.r * 0.32} fill={color} opacity="0.4"/>
          </g>
        ))}
      </svg>
      {PARTICLES.map((p, i) => (
        <div key={i} className="cat-particle" style={{
          position: 'absolute', left: p.x, bottom: p.y,
          width: p.r * 2, height: p.r * 2, borderRadius: '50%',
          background: color,
          animationDelay: p.delay, animationDuration: p.dur,
          boxShadow: `0 0 ${p.r * 4}px ${color}90`,
        }}/>
      ))}
    </div>
  );
}

/* Diseñador — retícula de lujo + marco ornamental + shimmer */
function PatternDisenador({ color }) {
  const id = 'pat-disenador';
  const DOTS = [];
  for (let col = 0; col < 9; col++) {
    for (let row = 0; row < 14; row++) {
      const x = col * 28 + (row % 2 === 0 ? 0 : 14);
      const y = row * 28;
      if (x >= 0 && x <= 210 && y >= 0 && y <= 375) DOTS.push({ x, y });
    }
  }
  return (
    <>
      <div className="cat-pattern" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg viewBox="0 0 200 368"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id={id} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M14,0 L28,14 L14,28 L0,14 Z" fill="none" stroke={color} strokeWidth="0.55"/>
              <line x1="14" y1="0" x2="14" y2="28" stroke={color} strokeWidth="0.18" opacity="0.5"/>
              <line x1="0" y1="14" x2="28" y2="14" stroke={color} strokeWidth="0.18" opacity="0.5"/>
            </pattern>
          </defs>
          {/* Retícula con opacidad aumentada */}
          <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.3"/>
          {/* Puntos de acento en intersecciones */}
          {DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="1.1" fill={color} opacity="0.22"/>
          ))}
          {/* Marco doble con esquinas ornamentadas */}
          <rect x="9"  y="9"  width="182" height="350" fill="none" stroke={color} strokeWidth="0.75" opacity="0.4"/>
          <rect x="15" y="15" width="170" height="338" fill="none" stroke={color} strokeWidth="0.35" opacity="0.22"/>
          {[[9,9],[191,9],[9,359],[191,359]].map(([cx,cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.5" fill="none" stroke={color} strokeWidth="0.6" opacity="0.5"/>
              <circle cx={cx} cy={cy} r="1.2" fill={color} opacity="0.45"/>
            </g>
          ))}
        </svg>
      </div>
      <div className="cat-shimmer" aria-hidden="true"
        style={{ '--shimmer-color': color + '30' }}/>
    </>
  );
}

/* Exclusivos — corte brillante de gema + pulso */
function PatternExclusivos({ color }) {
  const cx = 100, cy = 178;

  function ring(r, n, offset = 0) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i * 2 * Math.PI / n) + offset - Math.PI / 2;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }

  const OUTER = ring(72, 8, 0);
  const INNER = ring(45, 8, Math.PI / 8);
  const RAYS  = 16;
  const rayPts = Array.from({ length: RAYS }, (_, i) => {
    const a = (i * 2 * Math.PI / RAYS) - Math.PI / 2;
    return { x: cx + Math.cos(a) * 185, y: cy + Math.sin(a) * 245 };
  });

  return (
    <>
      <div className="cat-pattern" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg viewBox="0 0 200 368"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
          {/* 16 rayos desde el centro */}
          {rayPts.map((r, i) => (
            <line key={i} x1={cx} y1={cy} x2={r.x} y2={r.y}
              stroke={color} strokeWidth="0.5" opacity="0.2"/>
          ))}
          {/* Destellos en puntas alternas */}
          {rayPts.filter((_, i) => i % 2 === 0).map((r, i) => (
            <circle key={i} cx={r.x} cy={r.y} r="1.6" fill={color} opacity="0.25"/>
          ))}
          {/* Anillos concéntricos */}
          {[42, 78, 116].map((r, i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 1.22}
              fill="none" stroke={color} strokeWidth="0.65"
              opacity={0.42 - i * 0.09}/>
          ))}
          {/* Octágono exterior — arista de gema */}
          <polygon points={OUTER.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            fill="none" stroke={color} strokeWidth="0.85" opacity="0.48"/>
          {/* Octágono interior */}
          <polygon points={INNER.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            fill="none" stroke={color} strokeWidth="0.65" opacity="0.36"/>
          {/* Facetas exterior→interior */}
          {OUTER.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={INNER[i].x} y2={INNER[i].y}
              stroke={color} strokeWidth="0.4" opacity="0.3"/>
          ))}
          {/* Facetas interior→centro */}
          {INNER.map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={cx} y2={cy}
              stroke={color} strokeWidth="0.3" opacity="0.22"/>
          ))}
          {/* Centro */}
          <circle cx={cx} cy={cy} r="7"   fill="none" stroke={color} strokeWidth="0.55" opacity="0.42"/>
          <circle cx={cx} cy={cy} r="3.5" fill={color}               opacity="0.58"/>
          {/* Vértices del octágono marcados */}
          {OUTER.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.8" fill={color} opacity="0.35"/>
          ))}
        </svg>
      </div>
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
      style={{ '--accent': accent }}
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
      {cfg.num && (
        <div className="category-card__num" style={{ color: accent }} aria-hidden="true">
          {cfg.num}
        </div>
      )}

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
        <div className="category-card__count"
          style={{ color: accent + '99' }}>{cfg.count} fragancias</div>
      </div>

      {/* Panel reveal en hover */}
      <div className="category-card__reveal">
        <div className="category-card__reveal-eyebrow"
          style={{ color: accent }}>{cfg.eyebrow}</div>
        <div className="category-card__reveal-title">{nombre}</div>
        <button className="category-card__reveal-btn"
          style={{ borderColor: accent, color: accent }}
          onClick={e => { e.stopPropagation(); ir(); }}
          tabIndex="-1">
          Explorar colección
          <ArrowRight color="currentColor" />
        </button>
      </div>

      {/* Línea dorada inferior */}
      <div className="category-card__line"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} aria-hidden="true" />

      {/* Borde acento en hover */}
      <div className="category-card__border" aria-hidden="true" />
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
