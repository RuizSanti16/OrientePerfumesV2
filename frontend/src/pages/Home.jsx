import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito }    from '../hooks/useCarrito';
import { useWishlist }   from '../hooks/useWishlist';
import { useInView }     from '../hooks/useInView';
import { destacadosAPI, noticiasAPI, cuponesAPI } from '../services/api';
import SocialButtons     from '../components/SocialButtons';
import { CategoriasSection } from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';

/* ── Íconos SVG ── */
const IconBottle = ({ size = 40 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.2" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.25 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconHeartFilled = () => (
  <svg viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1.2" width="18" height="18" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

/* ── Helpers ── */
function formatCOP(v) { return '$ ' + Number(v||0).toLocaleString('es-CO'); }
function parsePrecio(v) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  return parseFloat(String(v).replace(/[$\s.]/g,'').replace(/,/g,'')) || 0;
}

export default function Home() {
  const navigate = useNavigate();
  const { agregar: agregarCarrito, count: cartCount, carrito, quitar: quitarCarrito } = useCarrito();
  const { toggle: toggleWish, estaEn, wishlist, quitar: quitarWish, count: wishCount } = useWishlist();
  const [panelAbierto, setPanelAbierto] = useState(null);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [lanzamientos, setLanzamientos] = useState([]);
  const [carruselData, setCarruselData] = useState([]);
  const [slideActual, setSlideActual] = useState(0);
  const autoRef = useRef(null);
  const session = (() => { try { return JSON.parse(localStorage.getItem('op_session')); } catch { return null; } })();
  const adminSession = (() => { try { return JSON.parse(localStorage.getItem('op_admin_session')); } catch { return null; } })();

  /* ── Refs de animación ── */
  const [refCat,     visCat]     = useInView(0.08);
  const [refDestac,  visDestac]  = useInView(0.06);
  const [refBanner,  visBanner]  = useInView(0.15);
  const [refLanz,    visLanz]    = useInView(0.08);
  const [refTestim,  visTestim]  = useInView(0.08);

  /* ── Testimonios ── */
  const [testimonios, setTestimonios] = useState([]);

  /* ── Cupón (carrito Home) ── */
  const [cuponInput,    setCuponInput]    = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [cuponError,    setCuponError]    = useState('');
  const [aplicando,     setAplicando]     = useState(false);

  async function aplicarCuponHome() {
    if (!cuponInput.trim()) return;
    setAplicando(true);
    setCuponError('');
    const total = carrito.reduce((s, i) => s + (i.precio * (i.cantidad || 1)), 0);
    const res   = await cuponesAPI.validar(cuponInput.trim(), total);
    if (res.ok) { setCuponAplicado(res.data); setCuponInput(''); }
    else        { setCuponError(res.mensaje || 'Código inválido'); }
    setAplicando(false);
  }

  /* ── Cargar datos del localStorage y BD ── */
  useEffect(() => {
    try { const r = localStorage.getItem('op_carrusel');      if (r) setCarruselData(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_lanzamientos'); if (r) setLanzamientos(JSON.parse(r)); } catch {}
    /* Testimonios: noticias aprobadas con comentario */
    noticiasAPI.listarAprobados().then(res => {
      if (res.ok && res.data) {
        const con = (res.data || []).filter(n => n.comentario || n.descripcion || n.contenido);
        setTestimonios(con.slice(0, 6));
      }
    }).catch(() => {});

    /* Productos destacados desde BD */
    destacadosAPI.listar().then(res => {
      if (res.ok && res.data.length) {
        setProductosDestacados(res.data.map(p => ({
          id:              p.id_producto,
          nombre:          p.nombre,
          marca:           p.marca || '',
          precio:          p.precio_oferta   || p.precio || 0,   // precio final (oferta o normal)
          precioOriginal:  p.precio          || 0,               // precio base para calcular ratio
          precioAnterior:  p.precio_anterior || '',
          imagen:          p.imagen || '',
          badge:           p.badge  || 'none',
          presentaciones:  p.presentaciones  || [],
        })));
      }
    }).catch(() => {
      /* Fallback al localStorage si la BD no está disponible */
      try {
        const r = localStorage.getItem('op_productos_destacados');
        if (r) { const d = JSON.parse(r); setProductosDestacados(d.filter(p=>p.nombre)); }
      } catch {}
    });
  }, []);

  /* ── Carrusel auto ── */
  const SLIDES = [
    { label: 'Perfumería Nicho', titulo: 'Tesoros\nOlfativos', subtitulo: 'Las más exclusivas casas de nicho en un solo lugar', btn1: 'Descubrir Nicho', btn2: 'Ver Catálogo', bg: 'radial-gradient(ellipse at 70% 50%, rgba(139,105,20,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(80,55,10,0.3) 0%, transparent 50%), linear-gradient(135deg, #1a1208 0%, #0a0a08 50%, #12100a 100%)' },
    { label: 'Colección Oriental', titulo: 'Aromas\ndel Oriente', subtitulo: 'Oud, Ambar, Sándalo y Musk en su máxima expresión', btn1: 'Explorar Colección', btn2: 'Ver Novedades', bg: 'radial-gradient(ellipse at 65% 40%, rgba(120,80,15,0.3) 0%, transparent 55%), radial-gradient(ellipse at 90% 70%, rgba(60,40,8,0.35) 0%, transparent 50%), linear-gradient(150deg, #100d06 0%, #0a0a08 55%, #15120a 100%)' },
    { label: 'Alta Perfumería', titulo: 'Firmas\nde Autor', subtitulo: 'Chanel, Dior, Tom Ford, Creed y las grandes maisons', btn1: 'Ver Diseñadores', btn2: 'Nuestras Marcas', bg: 'radial-gradient(ellipse at 60% 50%, rgba(100,70,10,0.28) 0%, transparent 60%), radial-gradient(ellipse at 85% 60%, rgba(70,45,5,0.3) 0%, transparent 50%), linear-gradient(120deg, #0e0b05 0%, #0a0a08 50%, #131009 100%)' },
  ];

  const slides = carruselData.length ? carruselData.map((s, i) => ({
    ...SLIDES[i],
    label:    s.label    || SLIDES[i]?.label,
    titulo:   s.titulo   || SLIDES[i]?.titulo,
    subtitulo:s.subtitulo|| SLIDES[i]?.subtitulo,
    btn1:     s.btn1     || SLIDES[i]?.btn1,
    btn2:     s.btn2     || SLIDES[i]?.btn2,
    imagen:   s.imagen   || '',
    imgSize:  s.imgSize  || 'cover',
    imgPosX:  s.imgPosX  ?? 50,
    imgPosY:  s.imgPosY  ?? 50,
  })) : SLIDES;

  function goTo(idx) {
    setSlideActual(((idx % slides.length) + slides.length) % slides.length);
  }

  function startAuto() {
    stopAuto();
    autoRef.current = setInterval(() => setSlideActual(s => (s+1) % slides.length), 6000);
  }
  function stopAuto() { if (autoRef.current) clearInterval(autoRef.current); }

  useEffect(() => { startAuto(); return stopAuto; }, [slides.length]);

  /* ── Scroll header ── */
  useEffect(() => {
    function onScroll() {
      const h = document.getElementById('header');
      if (h) h.classList.toggle('scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Panel lateral ── */
  const totalCarrito = carrito.reduce((s,i) => s+(i.precio*(i.cantidad||1)), 0);

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="announcement-bar" role="banner" aria-label="Promociones">
        <div className="announcement-bar__track" aria-hidden="true">
          <span className="announcement-bar__text">
            Envío gratuito en pedidos superiores a $150.000 <span>·</span> Fragancias 100% Originales <span>·</span> Más de 500 referencias exclusivas <span>·</span> Atención personalizada <span>·</span> Envío gratuito en pedidos superiores a $150.000 <span>·</span> Fragancias 100% Originales <span>·</span> Más de 500 referencias exclusivas <span>·</span> Atención personalizada <span>·</span>
          </span>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="header" id="header" role="banner">
        <a href="/" className="header__logo" aria-label="OrientPerfumes – Inicio">
          <div className="logo-icon" aria-hidden="true">
            <img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="OrientPerfumes logo" />
          </div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>

<SearchBar />

        <div className="header__actions" role="navigation">
          <button className="action-btn" id="btn-wishlist" onClick={() => setPanelAbierto(p => p==='wishlist'?null:'wishlist')} aria-label={`Lista de deseos (${wishCount} items)`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span className="action-btn__badge" aria-hidden="true">{wishCount}</span>
          </button>
          <button className="action-btn" id="btn-cart" onClick={() => setPanelAbierto(p => p==='carrito'?null:'carrito')} aria-label={`Carrito (${cartCount} items)`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span className="action-btn__badge" aria-hidden="true">{cartCount}</span>
          </button>
          <SocialButtons />
          <button className="menu-btn" id="menu-toggle" onClick={() => setDrawerAbierto(true)} aria-label="Abrir menú" aria-expanded={drawerAbierto}>
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* ── Hero Carrusel ── */}
      <section className="hero" aria-label="Presentación principal">
        {slides.map((s, i) => {
          const bgStyle = s.imagen
            ? { backgroundImage: `url(${s.imagen})`, backgroundSize: s.imgSize||'cover', backgroundPosition: `${s.imgPosX??50}% ${s.imgPosY??50}%` }
            : { background: s.bg };
          return (
            <div key={i} className={`hero__slide${i===slideActual?' active':''}`} role="group" aria-label={`Slide ${i+1} de ${slides.length}`}>
              <div className="hero__bg" style={bgStyle} aria-hidden="true"></div>
              <div className="hero__overlay" aria-hidden="true"></div>
              <div className="hero__content">
                <div className="hero__label">{s.label}</div>
                <h1 className="hero__title" dangerouslySetInnerHTML={{__html: (s.titulo||'').replace(/\\n|\n/g,'<br>')}}/>
                <p className="hero__subtitle">{s.subtitulo}</p>
                <div className="hero__cta">
                  <a href="#categorias" className="btn-primary">{s.btn1}</a>
                  <a href="#productos"  className="btn-secondary">{s.btn2}</a>
                </div>
              </div>
            </div>
          );
        })}
        <button className="hero__arrow hero__arrow--prev" onClick={() => { goTo(slideActual-1); startAuto(); }} aria-label="Slide anterior">&#8249;</button>
        <button className="hero__arrow hero__arrow--next" onClick={() => { goTo(slideActual+1); startAuto(); }} aria-label="Siguiente slide">&#8250;</button>
        <div className="hero__dots" role="tablist">
          {slides.map((_, i) => (
            <button key={i} className={`hero__dot${i===slideActual?' active':''}`} role="tab" aria-selected={i===slideActual} onClick={() => { goTo(i); startAuto(); }} aria-label={`Ir al slide ${i+1}`}/>
          ))}
        </div>
      </section>

      {/* ── Categorías ── */}
      <div ref={refCat} className={`fade-up${visCat ? ' visible' : ''}`}>
        <CategoriasSection />
      </div>

      {/* ── Productos Destacados ── */}
      <section ref={refDestac} className={`products-section fade-up${visDestac ? ' visible' : ''}`} id="productos" aria-labelledby="productos-titulo">
        <div className="section__header">
          <div className="section__eyebrow">Selección Exclusiva</div>
          <h2 className="section__title" id="productos-titulo">Productos Destacados</h2>
          <p className="section__subtitle">Fragancias seleccionadas por nuestros expertos</p>
        </div>
        {productosDestacados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: '#9A9180', fontSize: 14 }}>
            No hay productos destacados configurados aún.
          </div>
        ) : (
          <div className="products-grid" role="list">
            {productosDestacados.map(p => (
              <ProductCard
                key={p.id}
                producto={{ ...p, precio: formatCOP(parsePrecio(p.precio)), precioAnterior: p.precioAnterior ? formatCOP(parsePrecio(p.precioAnterior)) : '' }}
                enWishlist={estaEn(p.id)}
                onWishlist={() => toggleWish(p)}
                onCarrito={(presentacion, precioPres) => {
                  let precioFinal;
                  if (precioPres && p.badge === 'sale' && p.precioOriginal > 0 && p.precio < p.precioOriginal) {
                    // Aplica el mismo ratio de descuento a la presentación
                    const ratio = p.precio / p.precioOriginal;
                    precioFinal = Math.round(precioPres * ratio);
                  } else {
                    precioFinal = precioPres || p.precio;
                  }
                  agregarCarrito({ ...p, precio: precioFinal, presentacion });
                }}
                formatCOP={formatCOP}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Marcas ── */}
      <section ref={refBanner} className={`brands-section fade-in${visBanner ? ' visible' : ''}`}>
        <div className="section__header">
          <div className="section__eyebrow">Trabajamos con</div>
          <h2 className="section__title" style={{fontSize:'28px'}}>Grandes Maisons</h2>
        </div>
        <nav className="brands-list">
          {['Chanel','Dior','Tom Ford','Creed','Xerjoff','MFK','Amouage','Roja Parfums','Byredo','Initio'].map(m => (
            <span key={m} className="brand-item">{m}</span>
          ))}
        </nav>
      </section>

      {/* ── Noticias Preview ── */}
      <section ref={refLanz} className={`home-noticias fade-up${visLanz ? ' visible' : ''}`} id="noticias-preview">
        <div className="section__header">
          <div className="section__eyebrow">Actualidad</div>
          <h2 className="section__title">Noticias &amp; Novedades</h2>
          <p className="section__subtitle">Nuevos lanzamientos y últimas novedades de OrientPerfumes</p>
        </div>
        <div className="home-noticias__grid" id="home-lanzamientos-grid" role="list">
          {lanzamientos.length === 0
            ? [0,1,2,3].map(i => (
              <article key={i} className="home-launch-card" role="listitem">
                <div className="home-launch-card__img-placeholder" aria-hidden="true"><IconBottle size={36}/></div>
                <div className="home-launch-card__info">
                  <div className="home-launch-card__badge">Próximamente</div>
                  <div className="home-launch-card__name">Nuevo Lanzamiento</div>
                  <p className="home-launch-card__desc">Disponible próximamente en OrientPerfumes</p>
                </div>
              </article>
            ))
            : lanzamientos.slice(0,4).map((item,i) => (
              <article key={i} className="home-launch-card" role="listitem" tabIndex="0" onClick={() => navigate('/noticias')} style={{cursor:'pointer'}}>
                {item.imagen
                  ? <img className="home-launch-card__img" src={item.imagen} alt={item.nombre} loading="lazy"/>
                  : <div className="home-launch-card__img-placeholder" aria-hidden="true"><IconBottle size={36}/></div>}
                <div className="home-launch-card__info">
                  <div className="home-launch-card__badge">{item.badge||'Próximamente'}</div>
                  <div className="home-launch-card__name">{item.nombre||''}</div>
                  <p className="home-launch-card__desc">{item.descripcion||''}</p>
                </div>
              </article>
            ))
          }
        </div>
        <div className="home-noticias__cta">
          <a href="/noticias" className="btn-secondary home-noticias__btn">Ver todas las noticias →</a>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section ref={refTestim} className={`fade-up${visTestim ? ' visible' : ''}`}
        style={{ background:'#0d0d0b', borderTop:'1px solid rgba(201,168,76,0.07)', padding:'72px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="section__header">
            <div className="section__eyebrow">Lo que dicen nuestros clientes</div>
            <h2 className="section__title">Testimonios</h2>
            <p className="section__subtitle">Experiencias reales de quienes ya confían en OrientPerfumes</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, marginTop:40 }}>
            {(testimonios.length > 0 ? testimonios : [
              { nombre:'Ana M.', titulo:'Nicho', texto:'Una fragancia que me transportó a otro mundo. La calidad es simplemente excepcional.' },
              { nombre:'Carlos R.', titulo:'Oriental', texto:'El mejor lugar para encontrar perfumes orientales únicos. Servicio impecable y entrega rápida.' },
              { nombre:'Sofía L.', titulo:'Diseñador', texto:'Encontré el perfume de mis sueños y el precio fue mucho mejor de lo esperado. 100% recomendado.' },
            ]).map((t, i) => (
              <div key={i} className={`fade-up delay-${i+1}${visTestim ? ' visible' : ''}`}
                style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:12, padding:'24px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                {/* Estrellas */}
                <div style={{ display:'flex', gap:3 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ color:'#C9A84C', fontSize:14 }}>★</span>
                  ))}
                </div>
                {/* Texto */}
                <p style={{ fontSize:14, color:'#C8C0B0', lineHeight:1.75, margin:0, fontStyle:'italic' }}>
                  "{t.texto || t.comentario || t.descripcion || t.contenido || ''}"
                </p>
                {/* Autor */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:'auto' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:'Cinzel,serif', fontSize:13, color:'#C9A84C' }}>
                      {(t.nombre || t.nombre_usuario || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#E8DCC8' }}>{t.nombre || t.nombre_usuario || 'Cliente'}</div>
                    {t.titulo && <div style={{ fontSize:11, color:'#9A9180', fontFamily:'Cinzel,serif', letterSpacing:'0.08em' }}>{t.titulo}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* CTA */}
          <div style={{ textAlign:'center', marginTop:40 }}>
            <a href="/coleccion" style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.18em', color:'#C9A84C', textDecoration:'none', border:'1px solid rgba(201,168,76,0.4)', borderRadius:4, padding:'10px 28px', transition:'background 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.8)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(201,168,76,0.4)'; }}>
              DESCUBRIR FRAGANCIAS
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f0f0d', borderTop: '1px solid rgba(201,168,76,0.1)', padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 32, marginBottom: 40 }}>
            {/* Brand */}
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: '#C9A84C', letterSpacing: '0.1em', marginBottom: 8 }}>ORIENTPERFUMES</div>
              <p style={{ fontSize: 13, color: '#9A9180', lineHeight: 1.7, maxWidth: 240 }}>
                Fragancias exclusivas de lujo. Tu destino para los mejores perfumes del mundo.
              </p>
              <div style={{ marginTop: 16 }}>
                <SocialButtons />
              </div>
            </div>
            {/* Navegación */}
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 16 }}>COLECCIONES</div>
              {['Nicho','Oriental','Diseñador','Exclusivos'].map(c => (
                <div key={c} style={{ marginBottom: 8 }}>
                  <a onClick={() => navigate(`/coleccion?categoria=${encodeURIComponent(c)}`)}
                    style={{ fontSize: 13, color: '#9A9180', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#C9A84C'}
                    onMouseLeave={e => e.target.style.color = '#9A9180'}>
                    {c}
                  </a>
                </div>
              ))}
            </div>
            {/* Nosotros */}
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 16 }}>INFORMACIÓN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Sobre Nosotros', to: '/nosotros' },
                  { label: 'Quiz Olfativo', to: '/quiz' },
                  { label: 'Comparador', to: '/comparador' },
                  { label: 'Seguimiento de Pedido', to: '/seguimiento' },
                  { label: 'Preguntas Frecuentes', to: '/faq' },
                  { label: 'Noticias', to: '/noticias' },
                  { label: 'Contáctanos', to: '/contacto' },
                  { label: 'Iniciar Sesión', to: '/login' },
                ].map(({ label, to }) => (
                  <a key={to} onClick={() => navigate(to)}
                    style={{ fontSize: 13, color: '#9A9180', cursor: 'pointer', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#C9A84C'}
                    onMouseLeave={e => e.target.style.color = '#9A9180'}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(201,168,76,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#9A9180', margin: 0 }}>© 2024 OrientPerfumes · Todos los derechos reservados</p>
            <a href="#" style={{ fontSize: 12, color: '#9A9180', textDecoration: 'none' }}>↑ Volver Arriba</a>
          </div>
        </div>
      </footer>

      {/* ── Drawer ── */}
      <div className="drawer-overlay" id="drawer-overlay" aria-hidden={!drawerAbierto}
        onClick={() => setDrawerAbierto(false)}
        style={{opacity: drawerAbierto?1:0, pointerEvents: drawerAbierto?'all':'none'}}/>
      <nav className={`drawer${drawerAbierto?' open':''}`} id="drawer" aria-hidden={!drawerAbierto}>
        <button className="drawer__close" onClick={() => setDrawerAbierto(false)} aria-label="Cerrar menú">✕</button>
        <div className="drawer__logo" aria-hidden="true">OrientPerfumes</div>
        <div className="drawer__session">
          {session || adminSession
            ? <div className="drawer__session-info">
                <div className="drawer__session-user">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span>{(session||adminSession)?.nombre}</span>
                </div>
                <button className="drawer__session-logout" onClick={() => { localStorage.removeItem('op_session'); localStorage.removeItem('op_admin_session'); window.location.reload(); }}>
                  Cerrar Sesión
                </button>
              </div>
            : <button className="drawer__session-btn" onClick={() => { setDrawerAbierto(false); setTimeout(() => navigate('/login'), 300); }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Iniciar Sesión
              </button>
          }
        </div>
        <div className="drawer__divider" aria-hidden="true"/>
        <ul className="drawer__nav">
          {[
            { tipo: 'scroll', target: 'categorias',  label: 'Fragancias Orientales' },
            { tipo: 'scroll', target: 'categorias',  label: 'Perfumería Nicho' },
            { tipo: 'scroll', target: 'productos',   label: 'Productos Destacados' },
            { tipo: 'ruta',   target: '/coleccion',  label: 'Ver Colección' },
            { tipo: 'ruta',   target: '/noticias',   label: 'Noticias' },
            { tipo: 'ruta',   target: '/contacto',   label: 'Contacto' },
            { tipo: 'ruta',   target: '/quiz',        label: 'Quiz Olfativo' },
            { tipo: 'ruta',   target: '/comparador',  label: 'Comparar Fragancias' },
            { tipo: 'ruta',   target: '/seguimiento', label: 'Mis Pedidos' },
          ].map(({ tipo, target, label }) => (
            <li key={label}>
              <a href={tipo === 'scroll' ? `#${target}` : undefined}
                onClick={e => {
                  if (tipo === 'scroll') {
                    e.preventDefault();
                    setDrawerAbierto(false);
                    setTimeout(() => {
                      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300);
                  } else {
                    e.preventDefault();
                    setDrawerAbierto(false);
                    setTimeout(() => navigate(target), 300);
                  }
                }}>
                {label}
              </a>
            </li>
          ))}
          {adminSession && (
            <li>
              <a href="/admin" onClick={e => { e.preventDefault(); setDrawerAbierto(false); setTimeout(() => navigate('/admin'), 300); }}>
                Panel Admin
              </a>
            </li>
          )}
        </ul>
      </nav>

      {/* ── Paneles laterales ── */}
      {panelAbierto && <div onClick={() => setPanelAbierto(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999}}/>}
      <SidePanel abierto={panelAbierto==='carrito'} titulo="CARRITO DE COMPRAS" onCerrar={() => setPanelAbierto(null)}>
        {carrito.length===0
          ? <p style={{textAlign:'center',padding:'20px',color:'#9A9180',fontSize:'12px',letterSpacing:'0.1em'}}>EL CARRITO ESTÁ VACÍO</p>
          : <>
              {carrito.map((item,i) => (
                <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(201,168,76,0.1)'}}>
                  {item.imagen ? <img src={item.imagen} style={{width:44,height:44,objectFit:'cover',borderRadius:4}} alt=""/> : <div style={{width:44,height:44,background:'rgba(201,168,76,0.1)',borderRadius:4}}/>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:'#E8DCC8',fontWeight:600}}>{item.nombre}</div>
                    {item.presentacion && <div style={{fontSize:10,color:'#9A9180'}}>{item.presentacion}</div>}
                    <div style={{fontSize:11,color:'#C9A84C',marginTop:2}}>{formatCOP(item.precio)} × {item.cantidad||1}</div>
                  </div>
                  <button onClick={() => quitarCarrito(i)} style={{background:'none',border:'none',color:'#e05252',cursor:'pointer',fontSize:16}}>✕</button>
                </div>
              ))}
              {/* Cupón */}
              <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid rgba(201,168,76,0.12)'}}>
                {cuponAplicado ? (
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:'rgba(201,168,76,0.06)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:6}}>
                    <span style={{fontSize:11,color:'#C9A84C',fontFamily:'Cinzel,serif',letterSpacing:'0.08em'}}>
                      {cuponAplicado.codigo}{cuponAplicado.tipo==='porcentaje'?` (-${cuponAplicado.valor}%)`:''}
                    </span>
                    <button onClick={()=>{setCuponAplicado(null);setCuponError('');}} style={{background:'none',border:'none',color:'#e05252',cursor:'pointer',fontSize:14}}>✕</button>
                  </div>
                ) : (
                  <div style={{display:'flex',gap:6}}>
                    <input value={cuponInput} onChange={e=>{setCuponInput(e.target.value.toUpperCase());setCuponError('');}}
                      onKeyDown={e=>e.key==='Enter'&&aplicarCuponHome()}
                      placeholder="CÓDIGO DE DESCUENTO"
                      style={{flex:1,background:'#1a1a18',border:'1px solid rgba(201,168,76,0.2)',borderRadius:4,padding:'8px 10px',color:'#E8DCC8',fontSize:11,fontFamily:'Cinzel,serif',letterSpacing:'0.06em',outline:'none'}}/>
                    <button onClick={aplicarCuponHome} disabled={!cuponInput||aplicando}
                      style={{background:cuponInput&&!aplicando?'#C9A84C':'rgba(201,168,76,0.15)',border:'none',borderRadius:4,padding:'8px 12px',color:cuponInput&&!aplicando?'#0a0a08':'#9A9180',fontFamily:'Cinzel,serif',fontSize:10,letterSpacing:'0.1em',cursor:cuponInput&&!aplicando?'pointer':'not-allowed',transition:'all 0.2s'}}>
                      {aplicando?'...':'OK'}
                    </button>
                  </div>
                )}
                {cuponError&&<div style={{fontSize:11,color:'#e05252',marginTop:5}}>{cuponError}</div>}
              </div>
              {/* Totales */}
              <div style={{marginTop:12,textAlign:'right'}}>
                {cuponAplicado&&(
                  <>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#9A9180',marginBottom:4}}>
                      <span style={{letterSpacing:'0.08em'}}>SUBTOTAL</span><span>{formatCOP(totalCarrito)}</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#e08020',marginBottom:8}}>
                      <span style={{letterSpacing:'0.08em'}}>DESCUENTO</span><span>-{formatCOP(cuponAplicado.descuento)}</span>
                    </div>
                  </>
                )}
                <div style={{fontSize:11,color:'#9A9180',letterSpacing:'0.1em'}}>TOTAL</div>
                <div style={{fontSize:18,color:'#C9A84C',fontWeight:700}}>{formatCOP(Math.max(0,totalCarrito-(cuponAplicado?.descuento||0)))}</div>
              </div>
              {/* Finalizar pedido */}
              <button
                onClick={() => { setPanelAbierto(null); navigate('/checkout'); }}
                style={{ marginTop:16, width:'100%', padding:'12px', background:'#C9A84C', border:'none', borderRadius:6, color:'#0a0a08', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.18em', fontWeight:700, cursor:'pointer' }}>
                FINALIZAR PEDIDO
              </button>
            </>
        }
      </SidePanel>
      <SidePanel abierto={panelAbierto==='wishlist'} titulo="LISTA DE DESEOS" onCerrar={() => setPanelAbierto(null)}>
        {wishlist.length===0
          ? <p style={{textAlign:'center',padding:'20px',color:'#9A9180',fontSize:'12px',letterSpacing:'0.1em'}}>TU LISTA DE DESEOS ESTÁ VACÍA</p>
          : wishlist.map(item => (
            <div key={item.id} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(201,168,76,0.1)'}}>
              {item.imagen ? <img src={item.imagen} style={{width:44,height:44,objectFit:'cover',borderRadius:4}} alt=""/> : <div style={{width:44,height:44,background:'rgba(201,168,76,0.1)',borderRadius:4}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:'#E8DCC8',fontWeight:600}}>{item.nombre}</div>
                <div style={{fontSize:11,color:'#9A9180'}}>{item.marca}</div>
                <div style={{fontSize:11,color:'#C9A84C',marginTop:2}}>{formatCOP(item.precio)}</div>
              </div>
              <button onClick={() => quitarWish(item.id)} style={{background:'none',border:'none',color:'#e05252',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
          ))
        }
      </SidePanel>
    </>
  );
}

/* ── Sub-componentes ── */
const BADGE_CFG = {
  new:  { cls:'badge--new',  label:'Nuevo',
    icon:<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/></svg> },
  excl: { cls:'badge--excl', label:'Exclusivo',
    icon:<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  sale: { cls:'badge--sale', label:'Oferta',
    icon:<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
  none: { cls:'', label:'', icon:null },
};

function ProductCard({ producto: p, enWishlist, onWishlist, onCarrito, formatCOP }) {
  const navigate = useNavigate();
  const [added,   setAdded]   = useState(false);
  const [presIdx, setPresIdx] = useState(0);
  const pres  = p.presentaciones || [];
  const badge = BADGE_CFG[p.badge] || BADGE_CFG.none;

  /* precio visible según presentación seleccionada */
  const precioMostrado = (() => {
    if (pres.length === 0) return p.precio;           // ya es el precio de oferta formateado
    const base = pres[presIdx]?.precio || 0;
    if (p.badge === 'sale' && p.precioOriginal > 0 && parsePrecio(p.precio) < p.precioOriginal) {
      const ratio = parsePrecio(p.precio) / p.precioOriginal;
      return formatCOP(Math.round(base * ratio));
    }
    return formatCOP(base);
  })();

  const precioOriginalMostrado = (() => {
    if (pres.length === 0) return p.precioAnterior;
    const base = pres[presIdx]?.precio || 0;
    if (p.badge === 'sale') return formatCOP(base);   // precio sin descuento de la presentación
    return '';
  })();

  function handleCarrito() {
    const pr = pres.length > 0 ? pres[presIdx] : null;
    onCarrito(pr?.etiqueta || '', pr?.precio || 0);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="product-card" role="listitem" tabIndex="0"
      onClick={() => navigate(`/producto/${p.id}`)}
      style={{ cursor:'pointer' }}>
      <div className="product-card__img-wrap">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
          : <span className="product-card__placeholder" aria-hidden="true"><IconBottle size={48}/></span>}

        {badge.label && (
          <span className={`product-card__badge ${badge.cls}`}>
            {badge.icon}{badge.label}
          </span>
        )}

        <button className="product-card__wish"
          onClick={e => { e.stopPropagation(); onWishlist(); }}
          data-active={enWishlist} aria-label="Lista de deseos">
          {enWishlist ? <IconHeartFilled /> : <IconHeart />}
        </button>

        <button className="product-card__add"
          onClick={e => { e.stopPropagation(); handleCarrito(); }}
          style={added ? {background:'#4a7c59'} : {}}>
          {added ? '✓ Añadido' : 'Añadir al Carrito'}
        </button>
      </div>

      <div className="product-card__info">
        {/* Casa / Marca */}
        <div className="product-card__brand">{p.marca}</div>

        {/* Nombre del perfume */}
        <div className="product-card__name">{p.nombre}</div>

        {/* Selector de presentaciones — pills */}
        {pres.length > 1 && (
          <div className="product-card__pres-wrap" onClick={e => e.stopPropagation()}>
            {pres.map((pr, i) => (
              <button key={i}
                className={`product-card__pres-pill${presIdx === i ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); setPresIdx(i); }}>
                {pr.etiqueta}
              </button>
            ))}
          </div>
        )}

        {/* Precio */}
        <div className="product-card__price">
          {p.badge === 'sale' && precioOriginalMostrado
            ? <><s className="product-card__price-old">{precioOriginalMostrado}</s><span className="product-card__price-new">{precioMostrado}</span></>
            : precioMostrado
          }
        </div>
      </div>
    </article>
  );
}

function SidePanel({ abierto, titulo, onCerrar, children }) {
  return (
    <div style={{position:'fixed',top:0,right:0,bottom:0,width:340,maxWidth:'100vw',background:'#111',borderLeft:'1px solid rgba(201,168,76,0.2)',zIndex:1000,transform:abierto?'translateX(0)':'translateX(100%)',transition:'transform 0.3s',display:'flex',flexDirection:'column'}}>
      <div style={{padding:20,borderBottom:'1px solid rgba(201,168,76,0.15)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:'Cinzel,serif',fontSize:13,letterSpacing:'0.15em',color:'#C9A84C'}}>{titulo}</span>
        <button onClick={onCerrar} style={{background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:20}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>{children}</div>
    </div>
  );
}