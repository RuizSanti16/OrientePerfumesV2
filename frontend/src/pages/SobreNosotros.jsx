import { useNavigate } from 'react-router-dom';
import { useInView }   from '../hooks/useInView';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* ── Íconos SVG ── */
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.4" width="32" height="32" aria-hidden="true">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.82c-.18.31.1.66.44.55 7.03-2.32 11.75-7.92 12.74-12.37"/>
    <path d="M3 3c0 12.64 10 21 10 21"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.4" width="32" height="32" aria-hidden="true">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.4" width="32" height="32" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.4" width="32" height="32" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

const VALORES = [
  { icono: <IconLeaf />,   titulo: 'Autenticidad',   texto: 'Cada fragancia que ofrecemos es 100% original, seleccionada directamente de las maisons y distribuidores oficiales.' },
  { icono: <IconStar />,   titulo: 'Exclusividad',   texto: 'Curadoria experta de referencias únicas: desde nicho independiente hasta alta perfumería de lujo.' },
  { icono: <IconShield />, titulo: 'Confianza',       texto: 'Tu compra está protegida. Garantía de producto, envío seguro y atención personalizada en cada pedido.' },
  { icono: <IconGlobe />,  titulo: 'Mundo Olfativo',  texto: 'Traemos al alcance de Colombia lo mejor del universo de la perfumería mundial, sin fronteras.' },
];

const STATS = [
  { numero: '500+',  etiqueta: 'Referencias' },
  { numero: '1.200+', etiqueta: 'Clientes satisfechos' },
  { numero: '30+',   etiqueta: 'Marcas exclusivas' },
  { numero: '100%',  etiqueta: 'Originales' },
];

const EQUIPO = [
  { nombre: 'Fundadora', rol: 'Directora & Curadora', descripcion: 'Apasionada por la perfumería de nicho desde sus primeras notas de oud y ambar. Con más de 8 años en el sector.' },
  { nombre: 'Asesor', rol: 'Especialista Olfativo', descripcion: 'Certificado en perfumería por la ISIPCA. Guía a nuestros clientes hacia la fragancia perfecta para cada ocasión.' },
  { nombre: 'Operaciones', rol: 'Logística & Atención', descripcion: 'Asegura que cada pedido llegue en perfectas condiciones y en el menor tiempo posible a todo Colombia.' },
];

export default function SobreNosotros() {
  const navigate = useNavigate();

  const [refHero,    visHero]    = useInView(0.1);
  const [refStory,   visStory]   = useInView(0.08);
  const [refValores, visValores] = useInView(0.06);
  const [refStats,   visStats]   = useInView(0.1);
  const [refEquipo,  visEquipo]  = useInView(0.08);

  return (
    <div style={{ background:'#0a0a08', minHeight:'100vh', color:'#E8DCC8', fontFamily:'Raleway,sans-serif' }}>

      <Header />

      {/* ── Hero ── */}
      <section ref={refHero} className={`fade-up${visHero ? ' visible' : ''}`}
        style={{ position:'relative', padding:'100px 24px 80px', textAlign:'center', overflow:'hidden' }}>
        {/* Decoración */}
        <div aria-hidden="true" style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div aria-hidden="true" style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)' }}/>

        <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.3em', color:'#C9A84C', marginBottom:18 }}>NUESTRA HISTORIA</div>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(38px,6vw,72px)', fontWeight:400, color:'#E8DCC8', margin:'0 0 20px', lineHeight:1.15 }}>
          Sobre OrientPerfumes
        </h1>
        <p style={{ fontSize:16, color:'#9A9180', maxWidth:560, margin:'0 auto 36px', lineHeight:1.8 }}>
          Una tienda nacida del amor por las fragancias y el deseo de acercar la perfumería de lujo a Colombia.
        </p>
        <div style={{ width:48, height:1, background:'linear-gradient(90deg,transparent,#C9A84C,transparent)', margin:'0 auto' }}/>
      </section>

      {/* ── Historia ── */}
      <section ref={refStory} className={`fade-up${visStory ? ' visible' : ''}`}
        style={{ maxWidth:900, margin:'0 auto', padding:'64px 24px' }}>
        <div className="rsp-grid-2" style={{ gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.2em', color:'#C9A84C', marginBottom:14 }}>QUIÉNES SOMOS</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(26px,3.5vw,40px)', fontWeight:400, color:'#E8DCC8', margin:'0 0 20px' }}>
              Pasión por las fragancias de lujo
            </h2>
            <p style={{ fontSize:14, color:'#C8C0B0', lineHeight:1.9, marginBottom:16 }}>
              OrientPerfumes nació de una pasión profunda: llevar las mejores fragancias del mundo a cada rincón de Colombia. Comenzamos seleccionando manualmente cada referencia, verificando su autenticidad y construyendo una comunidad de amantes de la perfumería.
            </p>
            <p style={{ fontSize:14, color:'#C8C0B0', lineHeight:1.9 }}>
              Hoy somos la referencia de perfumería nicho, oriental y de diseñador más completa del país. Cada botella en nuestro catálogo ha pasado por un proceso de curadoria riguroso para garantizarte la mejor experiencia olfativa.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {['2018 — Primeras referencias de oud importadas directamente de Dubai',
              '2020 — Apertura del catálogo nicho con 50+ referencias exclusivas',
              '2022 — Más de 300 fragancias y colaboraciones con maisons internacionales',
              '2024 — 500+ referencias y comunidad de más de 1.200 clientes activos',
            ].map((hito, i) => (
              <div key={i} className={`fade-left delay-${i+1}${visStory ? ' visible' : ''}`}
                style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:2, minHeight:40, background:'linear-gradient(180deg,#C9A84C,rgba(201,168,76,0.2))', flexShrink:0, marginTop:4 }}/>
                <p style={{ fontSize:13, color:'#C8C0B0', lineHeight:1.7, margin:0 }}>{hito}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div ref={refStats} style={{ background:'#0d0d0b', borderTop:'1px solid rgba(201,168,76,0.07)', borderBottom:'1px solid rgba(201,168,76,0.07)', padding:'48px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:24 }}>
          {STATS.map((s, i) => (
            <div key={i} className={`fade-up delay-${i+1}${visStats ? ' visible' : ''}`}
              style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(36px,5vw,52px)', color:'#C9A84C', lineHeight:1, fontWeight:400 }}>{s.numero}</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180', marginTop:8 }}>{s.etiqueta.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Valores ── */}
      <section ref={refValores} className={`fade-up${visValores ? ' visible' : ''}`}
        style={{ maxWidth:1100, margin:'0 auto', padding:'72px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.25em', color:'#C9A84C', marginBottom:14 }}>LO QUE NOS DEFINE</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(26px,4vw,44px)', fontWeight:400, color:'#E8DCC8', margin:0 }}>Nuestros Valores</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
          {VALORES.map((v, i) => (
            <div key={i} className={`fade-up delay-${i+1}${visValores ? ' visible' : ''}`}
              style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:12, padding:'28px 22px' }}>
              <div style={{ marginBottom:16 }}>{v.icono}</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:12, letterSpacing:'0.12em', color:'#C9A84C', marginBottom:10 }}>{v.titulo.toUpperCase()}</div>
              <p style={{ fontSize:13, color:'#C8C0B0', lineHeight:1.8, margin:0 }}>{v.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Equipo ── */}
      <section ref={refEquipo} className={`fade-up${visEquipo ? ' visible' : ''}`}
        style={{ background:'#0d0d0b', borderTop:'1px solid rgba(201,168,76,0.07)', padding:'72px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.25em', color:'#C9A84C', marginBottom:14 }}>DETRÁS DE LA MARCA</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(26px,4vw,44px)', fontWeight:400, color:'#E8DCC8', margin:0 }}>Nuestro Equipo</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24 }}>
            {EQUIPO.map((m, i) => (
              <div key={i} className={`fade-up delay-${i+1}${visEquipo ? ' visible' : ''}`}
                style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:12, padding:'28px 22px', textAlign:'center' }}>
                {/* Avatar */}
                <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                  <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, color:'#C9A84C' }}>{m.nombre[0]}</span>
                </div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:12, letterSpacing:'0.1em', color:'#E8DCC8', marginBottom:4 }}>{m.nombre.toUpperCase()}</div>
                <div style={{ fontSize:12, color:'#C9A84C', marginBottom:14 }}>{m.rol}</div>
                <p style={{ fontSize:13, color:'#9A9180', lineHeight:1.8, margin:0 }}>{m.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'64px 24px', textAlign:'center', borderTop:'1px solid rgba(201,168,76,0.07)' }}>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(22px,3.5vw,36px)', color:'#E8DCC8', marginBottom:20, fontWeight:400 }}>
          ¿Listo para descubrir tu fragancia perfecta?
        </div>
        <p style={{ fontSize:14, color:'#9A9180', marginBottom:32 }}>Explora nuestro catálogo y encuentra la esencia que te define.</p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/coleccion" style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.18em', color:'#0a0a08', textDecoration:'none', background:'#C9A84C', borderRadius:4, padding:'12px 32px', transition:'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            VER CATÁLOGO
          </a>
          <a href="/contacto" style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.18em', color:'#C9A84C', textDecoration:'none', border:'1px solid rgba(201,168,76,0.4)', borderRadius:4, padding:'12px 32px', transition:'background 0.2s, border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(201,168,76,0.4)'; }}>
            CONTÁCTANOS
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Botón de volver estándar ── */
function BtnVolver({ onClick, label = 'INICIO' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:8,
        background:'none',
        border:'1px solid rgba(201,168,76,0.45)',
        borderRadius:4,
        padding:'8px 20px',
        color:'#C9A84C',
        cursor:'pointer',
        fontFamily:'Cinzel, serif',
        fontSize:12,
        letterSpacing:'0.12em',
        transition:'background 0.2s, border-color 0.2s',
        whiteSpace:'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}
