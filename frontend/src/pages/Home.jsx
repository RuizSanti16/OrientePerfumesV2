import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito }    from '../hooks/useCarrito';
import { useWishlist }   from '../hooks/useWishlist';
import { destacadosAPI, noticiasAPI } from '../services/api';
import Header            from '../components/Header';
import Footer           from '../components/Footer';
import { CategoriasSection } from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';

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
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [lanzamientos, setLanzamientos] = useState([]);
  const [carruselData, setCarruselData] = useState([]);
  const [slideActual, setSlideActual] = useState(0);
  const autoRef = useRef(null);
  const session = (() => { try { return JSON.parse(localStorage.getItem('op_session')); } catch { return null; } })();
  const adminSession = (() => { try { return JSON.parse(localStorage.getItem('op_admin_session')); } catch { return null; } })();

  /* ── Testimonios ── */
  const [testimonios,          setTestimonios]          = useState([]);
  const [testimonioTexto,      setTestimonioTexto]      = useState('');
  const [testimonioEstrellas,  setTestimonioEstrellas]  = useState(5);
  const [testimonioEnviando,   setTestimonioEnviando]   = useState(false);
  const [testimonioExito,      setTestimonioExito]      = useState(false);
  const [testimonioError,      setTestimonioError]      = useState('');

  async function enviarTestimonio() {
    if (!testimonioTexto.trim()) return;
    setTestimonioEnviando(true);
    setTestimonioError('');
    try {
      const res = await noticiasAPI.enviar({
        nombre:     session.nombre || session.username || 'Cliente',
        texto:      testimonioTexto.trim(),
        id_cliente: session.id,
        estrellas:  testimonioEstrellas,
      });
      if (res.ok) {
        setTestimonioExito(true);
        setTestimonioTexto('');
      } else {
        setTestimonioError(res.mensaje || 'No se pudo enviar el testimonio');
      }
    } catch {
      setTestimonioError('Error de conexión. Intenta de nuevo.');
    }
    setTestimonioEnviando(false);
  }

  /* ── Cargar datos del localStorage y BD ── */
  useEffect(() => {
    try { const r = localStorage.getItem('op_carrusel');      if (r) setCarruselData(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_lanzamientos'); if (r) setLanzamientos(JSON.parse(r)); } catch {}

    /* Testimonios aprobados */
    noticiasAPI.listarAprobados().then(res => {
      if (res.ok && res.data) setTestimonios(res.data.slice(0, 6));
    }).catch(() => {});

    /* Productos destacados desde BD */
    destacadosAPI.listar().then(res => {
      if (res.ok && res.data.length) {
        setProductosDestacados(res.data.map(p => ({
          id:              p.id_producto,
          nombre:          p.nombre,
          marca:           p.marca || '',
          precio:          p.precio_oferta   || p.precio || 0,
          precioAnterior:  p.precio_anterior || '',
          imagen:          p.imagen || '',
          badge:           p.badge  || 'none',
          presentaciones:  p.presentaciones || [],
          nombre_categoria: p.nombre_categoria || '',
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


  /* ── Panel lateral ── */
  const totalCarrito = carrito.reduce((s,i) => s+(i.precio*(i.cantidad||1)), 0);

  return (
    <>
      <Header
        showSearch={true}
        cartCount={cartCount}
        wishCount={wishCount}
        onCartClick={() => setPanelAbierto(p => p === 'carrito' ? null : 'carrito')}
        onWishlistClick={() => setPanelAbierto(p => p === 'wishlist' ? null : 'wishlist')}
      />

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

      <div className="section-divider"><span className="section-divider__gem"/></div>

      {/* ── Productos Destacados ── */}
      <section className="products-section" id="productos" aria-labelledby="productos-titulo">
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
                onCarrito={(presentacion, precioPres) => agregarCarrito({ ...p, precio: precioPres || parsePrecio(p.precio), presentacion })}
                formatCOP={formatCOP}
              />
            ))}
          </div>
        )}
      </section>

      <div className="section-divider"><span className="section-divider__gem"/></div>

      {/* ── Marcas ── */}
      <section className="brands-section">
        <div className="section__header">
          <div className="section__eyebrow">Productos 100% originales</div>
          <h2 className="section__title" style={{fontSize:'28px'}}>Marcas</h2>
        </div>
        <nav className="brands-list">
          {['Chanel','Dior','Tom Ford','Creed','Xerjoff','Lattafa','Orientica','Azzaro','Armaf','Frech avenue'].map(m => (
            <span key={m} className="brand-item">{m}</span>
          ))}
        </nav>
      </section>

      <div className="section-divider"><span className="section-divider__gem"/></div>

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
                <div className="home-launch-card__img-placeholder" aria-hidden="true">
                    <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.2" width="40" height="54" style={{ opacity:0.25 }}>
                      <rect x="5" y="11" width="14" height="20" rx="3"/><rect x="8" y="5" width="8" height="6" rx="1.5"/><line x1="10" y1="2" x2="10" y2="5"/><line x1="14" y1="2" x2="14" y2="5"/><circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
                    </svg>
                  </div>
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
                  : <div className="home-launch-card__img-placeholder" aria-hidden="true">
                    <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.2" width="40" height="54" style={{ opacity:0.25 }}>
                      <rect x="5" y="11" width="14" height="20" rx="3"/><rect x="8" y="5" width="8" height="6" rx="1.5"/><line x1="10" y1="2" x2="10" y2="5"/><line x1="14" y1="2" x2="14" y2="5"/><circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
                    </svg>
                  </div>}
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
      <section style={{ background:'#0d0d0b', borderTop:'1px solid rgba(201,168,76,0.07)', padding:'72px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="section__header">
            <div className="section__eyebrow">Lo que dicen nuestros clientes</div>
            <h2 className="section__title">Testimonios</h2>
            <p className="section__subtitle">Experiencias reales de quienes ya confían en OrientPerfumes</p>
          </div>

          {/* Tarjetas */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, marginTop:40 }}>
            {(testimonios.length > 0 ? testimonios : [
              { nombre:'Ana M.',    texto:'Una fragancia que me transportó a otro mundo. La calidad es simplemente excepcional.', estrellas:5 },
              { nombre:'Carlos R.', texto:'El mejor lugar para encontrar perfumes orientales únicos. Servicio impecable y entrega rápida.', estrellas:5 },
              { nombre:'Sofía L.',  texto:'Encontré el perfume de mis sueños y el precio fue mucho mejor de lo esperado.', estrellas:5 },
            ]).map((t, i) => (
              <div key={i} style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:12, padding:'24px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                {/* Estrellas */}
                <div style={{ display:'flex', gap:4 }}>
                  {[1,2,3,4,5].map(n => (
                    <svg key={n} viewBox="0 0 24 24" fill={n <= (t.estrellas ?? 5) ? '#C9A84C' : 'none'} stroke="#C9A84C" strokeWidth="1.5" width="16" height="16" aria-hidden="true">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize:14, color:'#C8C0B0', lineHeight:1.75, margin:0, fontStyle:'italic' }}>
                  "{t.texto || ''}"
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:'auto' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:'Cinzel,serif', fontSize:13, color:'#C9A84C' }}>
                      {(t.nombre || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#E8DCC8' }}>{t.nombre || 'Cliente'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario / CTA */}
          <div style={{ marginTop:48, maxWidth:600, margin:'48px auto 0' }}>
            {session ? (
              testimonioExito ? (
                <div style={{ textAlign:'center', padding:'32px 24px', background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:12 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" width="40" height="40" style={{ marginBottom:12 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p style={{ fontFamily:'Cinzel,serif', fontSize:13, color:'#C9A84C', letterSpacing:'0.1em', margin:'0 0 8px' }}>TESTIMONIO ENVIADO</p>
                  <p style={{ fontSize:13, color:'#9A9180', margin:0 }}>Tu comentario está pendiente de aprobación. ¡Gracias por compartir tu experiencia!</p>
                  <button onClick={() => { setTestimonioExito(false); setTestimonioEstrellas(5); }}
                    style={{ marginTop:16, background:'transparent', border:'1px solid rgba(201,168,76,0.4)', color:'#C9A84C', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.15em', padding:'8px 20px', borderRadius:4, cursor:'pointer' }}>
                    ESCRIBIR OTRO
                  </button>
                </div>
              ) : (
                <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.12)', borderRadius:12, padding:'28px 24px' }}>
                  <p style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.18em', color:'#C9A84C', margin:'0 0 20px' }}>COMPARTIR MI EXPERIENCIA</p>

                  {/* Selector de estrellas */}
                  <div style={{ display:'flex', gap:6, marginBottom:16 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setTestimonioEstrellas(n)} aria-label={`${n} estrellas`}
                        style={{ background:'transparent', border:'none', padding:2, cursor:'pointer', lineHeight:0 }}>
                        <svg viewBox="0 0 24 24" fill={n <= testimonioEstrellas ? '#C9A84C' : 'none'} stroke="#C9A84C" strokeWidth="1.5" width="22" height="22">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Nombre (pre-filled, read-only) */}
                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:'block', fontSize:10, fontFamily:'Cinzel,serif', letterSpacing:'0.15em', color:'#9A9180', marginBottom:6 }}>NOMBRE</label>
                    <div style={{ padding:'10px 14px', background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:6, fontSize:13, color:'#C8C0B0' }}>
                      {session.nombre || session.username}
                    </div>
                  </div>

                  {/* Comentario */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:10, fontFamily:'Cinzel,serif', letterSpacing:'0.15em', color:'#9A9180', marginBottom:6 }}>COMENTARIO</label>
                    <textarea value={testimonioTexto} onChange={e => setTestimonioTexto(e.target.value)}
                      placeholder="Cuéntanos tu experiencia con OrientPerfumes..."
                      maxLength={500}
                      rows={4}
                      style={{ width:'100%', boxSizing:'border-box', padding:'10px 14px', background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:6, color:'#E8DCC8', fontSize:13, fontFamily:'Raleway,sans-serif', resize:'vertical', outline:'none' }}
                    />
                    <div style={{ textAlign:'right', fontSize:11, color:'#9A9180', marginTop:4 }}>{testimonioTexto.length}/500</div>
                  </div>

                  {testimonioError && (
                    <p style={{ fontSize:12, color:'#e07070', margin:'0 0 12px' }}>{testimonioError}</p>
                  )}

                  <button onClick={enviarTestimonio} disabled={testimonioEnviando || !testimonioTexto.trim()}
                    style={{ width:'100%', padding:'12px', background: testimonioEnviando || !testimonioTexto.trim() ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:6, color:'#C9A84C', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.18em', cursor: testimonioEnviando || !testimonioTexto.trim() ? 'not-allowed' : 'pointer', transition:'background 0.2s' }}>
                    {testimonioEnviando ? 'ENVIANDO...' : 'ENVIAR TESTIMONIO'}
                  </button>
                </div>
              )
            ) : (
              <div style={{ textAlign:'center', padding:'32px 24px', background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="36" height="36" style={{ marginBottom:12, opacity:0.7 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                </svg>
                <p style={{ fontFamily:'Cinzel,serif', fontSize:12, letterSpacing:'0.12em', color:'#C9A84C', margin:'0 0 8px' }}>COMPARTE TU EXPERIENCIA</p>
                <p style={{ fontSize:13, color:'#9A9180', margin:'0 0 20px', lineHeight:1.6 }}>Inicia sesión para dejar tu testimonio y ayudar a otros amantes de la perfumería.</p>
                <button onClick={() => navigate('/login')}
                  style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.4)', color:'#C9A84C', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.15em', padding:'10px 28px', borderRadius:4, cursor:'pointer', transition:'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  INICIAR SESIÓN
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />


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
          ? <img src={p.imagen} alt={p.nombre} className="product-card__img" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
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
        {p.nombre_categoria && (
          <div className="product-card__category">{p.nombre_categoria}</div>
        )}
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