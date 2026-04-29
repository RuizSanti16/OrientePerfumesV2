import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito }    from '../hooks/useCarrito';
import { useWishlist }   from '../hooks/useWishlist';
import { destacadosAPI } from '../services/api';
import SocialButtons     from '../components/SocialButtons';
import { CategoriasSection } from '../components/CategoryCard';

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

  /* ── Cargar datos del localStorage y BD ── */
  useEffect(() => {
    try { const r = localStorage.getItem('op_carrusel');      if (r) setCarruselData(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_lanzamientos'); if (r) setLanzamientos(JSON.parse(r)); } catch {}
    /* Productos destacados desde BD */
    destacadosAPI.listar().then(res => {
      if (res.ok && res.data.length) {
        setProductosDestacados(res.data.map(p => ({
          id:             p.id_producto,
          nombre:         p.nombre,
          marca:          p.marca || '',
          precio:         p.precio_oferta   || p.precio || 0,
          precioAnterior: p.precio_anterior || '',
          imagen:         p.imagen || '',
          badge:          p.badge  || 'none',
          presentaciones: p.presentaciones || [],
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

        <div className="header__search" role="search">
          <label htmlFor="search-input" className="sr-only">Buscar</label>
          <input id="search-input" type="text" placeholder="Buscar productos..." aria-label="Buscar productos" />
          <button aria-label="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>

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
    <CategoriasSection />

      {/* ── Marcas ── */}
      <section className="brands-section">
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
      <section className="home-noticias" id="noticias-preview">
        <div className="section__header">
          <div className="section__eyebrow">Actualidad</div>
          <h2 className="section__title">Noticias &amp; Novedades</h2>
          <p className="section__subtitle">Nuevos lanzamientos y últimas novedades de OrientPerfumes</p>
        </div>
        <div className="home-noticias__grid" id="home-lanzamientos-grid" role="list">
          {lanzamientos.length === 0
            ? [0,1,2,3].map(i => (
              <article key={i} className="home-launch-card" role="listitem">
                <div className="home-launch-card__img-placeholder" aria-hidden="true">🫙</div>
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
                  : <div className="home-launch-card__img-placeholder" aria-hidden="true">🫙</div>}
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
            {/* Contacto */}
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 16 }}>CONTACTO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a onClick={() => navigate('/contacto')} style={{ fontSize: 13, color: '#9A9180', cursor: 'pointer', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#C9A84C'}
                  onMouseLeave={e => e.target.style.color = '#9A9180'}>
                  Contáctanos
                </a>
                <a onClick={() => navigate('/noticias')} style={{ fontSize: 13, color: '#9A9180', cursor: 'pointer', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#C9A84C'}
                  onMouseLeave={e => e.target.style.color = '#9A9180'}>
                  Noticias
                </a>
                <a onClick={() => navigate('/login')} style={{ fontSize: 13, color: '#9A9180', cursor: 'pointer', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#C9A84C'}
                  onMouseLeave={e => e.target.style.color = '#9A9180'}>
                  Iniciar Sesión
                </a>
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
            : <a href="/login" className="drawer__session-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Iniciar Sesión
              </a>
          }
        </div>
        <div className="drawer__divider" aria-hidden="true"/>
        <ul className="drawer__nav">
          {[['#categorias','Fragancias Orientales'],['#categorias','Perfumería Nicho'],['#productos','Productos destacados'],['#productos','Novedades'],['#productos','Ofertas'],['#productos','Exclusivos'],['/noticias','Noticias'],['/contacto','Contacto'],['#','Acerca de Nosotros']].map(([href,label]) => (
            <li key={label}><a href={href} onClick={() => setDrawerAbierto(false)}>{label}</a></li>
          ))}
          {adminSession && <li><a href="/admin" onClick={() => setDrawerAbierto(false)}>Panel Admin</a></li>}
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
              <div style={{marginTop:12,textAlign:'right'}}>
                <div style={{fontSize:11,color:'#9A9180',letterSpacing:'0.1em'}}>TOTAL</div>
                <div style={{fontSize:18,color:'#C9A84C',fontWeight:700}}>{formatCOP(totalCarrito)}</div>
              </div>
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
function ProductCard({ producto: p, enWishlist, onWishlist, onCarrito, formatCOP }) {
  const [added, setAdded] = useState(false);
  const [presIdx, setPresIdx] = useState(0);
  const pres = p.presentaciones || [];

  function handleCarrito() {
    const pr = pres.length > 0 ? pres[presIdx] : null;
    onCarrito(pr?.etiqueta || '', pr?.precio || 0);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const BADGE_MAP = { new:{cls:'badge--new',label:'Nuevo'}, excl:{cls:'badge--excl',label:'Exclusivo'}, sale:{cls:'badge--sale',label:'Oferta'}, none:{cls:'',label:''} };
  const badge = BADGE_MAP[p.badge] || BADGE_MAP.none;

  return (
    <article className="product-card" role="listitem" tabIndex="0">
      <div className="product-card__img-wrap">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
          : <span className="product-card__placeholder" aria-hidden="true">🫙</span>}
        {badge.label && <span className={`product-card__badge ${badge.cls}`}>{badge.label}</span>}
        <button className="product-card__wish" onClick={onWishlist} data-active={enWishlist} aria-label="Lista de deseos">
          {enWishlist ? '❤️' : '🤍'}
        </button>
        <button className={`product-card__add`} onClick={handleCarrito}
          style={added ? {background:'#4a7c59'} : {}}>
          {added ? '✓ Añadido' : 'Añadir al Carrito'}
        </button>
      </div>
      <div className="product-card__info">
        <div className="product-card__brand">{p.marca}</div>
        <div className="product-card__name">{p.nombre}</div>
        <div className="product-card__price">
          {p.badge==='sale' && p.precioAnterior ? <><s>{p.precioAnterior}</s> {p.precio}</> : p.precio}
        </div>
        {pres.length > 1 && (
          <select value={presIdx} onChange={e => setPresIdx(Number(e.target.value))}
            style={{width:'100%',background:'#1a1a18',color:'#C8C0B0',border:'1px solid rgba(201,168,76,0.3)',borderRadius:4,padding:'6px 8px',fontSize:11,marginTop:8}}>
            {pres.map((pr,i) => <option key={i} value={i}>{pr.etiqueta} — {formatCOP(pr.precio)}</option>)}
          </select>
        )}
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