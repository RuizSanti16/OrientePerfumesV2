import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productoDetalleAPI } from '../services/api';
import { useCarrito }  from '../hooks/useCarrito';
import { useWishlist } from '../hooks/useWishlist';
import SocialButtons   from '../components/SocialButtons';

/* ── Íconos SVG ── */
const IconBottle = ({ size = 60 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.1" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.2 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);
const IconHeart = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width={size} height={size} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconHeartFilled = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1.2" width={size} height={size} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

/* ── Íconos de notas olfativas ── */
const IconNotaSalida = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="28" height="28" aria-hidden="true" style={{ opacity: 0.8 }}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
  </svg>
);
const IconNotaCorazon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="28" height="28" aria-hidden="true" style={{ opacity: 0.8 }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconNotaFondo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.3" width="28" height="28" aria-hidden="true" style={{ opacity: 0.8 }}>
    <path d="M12 2C8 2 5 5.5 5 9c0 4 3 7 7 10 4-3 7-6 7-10 0-3.5-3-7-7-7z"/>
    <path d="M12 6v8M9 11l3 3 3-3" strokeWidth="1"/>
  </svg>
);

function formatCOP(v) { return '$ ' + Number(v||0).toLocaleString('es-CO'); }

const NOTA_CONFIG = {
  salida:  { label: 'Notas de Salida',   icono: <IconNotaSalida />,  sub: 'Primera impresión' },
  corazon: { label: 'Notas de Corazón', icono: <IconNotaCorazon />, sub: 'El alma del perfume' },
  fondo:   { label: 'Notas de Fondo',   icono: <IconNotaFondo />,   sub: 'La huella que deja' },
};

export default function Producto() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { agregar } = useCarrito();
  const { toggle: toggleWish, estaEn } = useWishlist();

  const [producto,  setProducto]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [imgActiva, setImgActiva] = useState(0);
  const [presIdx,   setPresIdx]   = useState(0);
  const [added,     setAdded]     = useState(false);

  /* Rating form */
  const [rNombre,    setRNombre]    = useState('');
  const [rEstrellas, setREstrellas] = useState(0);
  const [rHover,     setRHover]     = useState(0);
  const [rComentario,setRComentario]= useState('');
  const [rEnviando,  setREnviando]  = useState(false);
  const [rMsg,       setRMsg]       = useState('');

  useEffect(() => {
    productoDetalleAPI.obtener(id).then(res => {
      if (res.ok) setProducto(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ background:'#0a0a08', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.2em', color:'#9A9180' }}>CARGANDO...</p>
    </div>
  );

  if (!producto) return (
    <div style={{ background:'#0a0a08', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ fontFamily:'Cinzel,serif', fontSize:13, color:'#9A9180' }}>Producto no encontrado</p>
      <BtnVolver onClick={() => navigate(-1)} label="VOLVER" />
    </div>
  );

  /* Galería: imagen principal + adicionales */
  const galeria = [
    ...(producto.imagen ? [producto.imagen] : []),
    ...(producto.imagenes || []).map(i => i.imagen),
  ];

  const pres = producto.presentaciones || [];
  const presActual = pres[presIdx];
  const precio = presActual?.precio || producto.precio;

  function handleCarrito() {
    agregar({ id: String(producto.id_producto) + (presActual ? '_'+presActual.etiqueta : ''), nombre: producto.nombre, marca: producto.marca||'', precio: Number(precio), imagen: producto.imagen||'', presentacion: presActual?.etiqueta||'' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  async function enviarRating(e) {
    e.preventDefault();
    if (!rNombre || !rEstrellas) { setRMsg('warn:Completa nombre y estrellas'); return; }
    setREnviando(true);
    const res = await productoDetalleAPI.calificar({ id_producto: id, nombre_usuario: rNombre, estrellas: rEstrellas, comentario: rComentario });
    if (res.ok) {
      setRMsg('ok:¡Gracias por tu calificación!');
      setRNombre(''); setREstrellas(0); setRComentario('');
      productoDetalleAPI.obtener(id).then(r => { if (r.ok) setProducto(r.data); });
    } else { setRMsg('err:Error al enviar'); }
    setREnviando(false);
    setTimeout(() => setRMsg(''), 4000);
  }

  const enWishlist = estaEn(String(producto.id_producto));
  const tieneNotas = Object.values(producto.notas||{}).some(arr => arr.length > 0);

  return (
    <div style={{ background:'#0a0a08', minHeight:'100vh', color:'#E8DCC8', fontFamily:'Raleway,sans-serif' }}>

      {/* Header */}
      <header className="header">
        <a onClick={() => navigate('/')} className="header__logo" style={{ cursor:'pointer' }}>
          <div className="logo-icon"><img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="Logo" /></div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>

        {/* Navegación */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32 }}>
          {[
            { label: 'Inicio',    to: '/'          },
            { label: 'Colección', to: '/coleccion' },
            { label: 'Noticias',  to: '/noticias'  },
            { label: 'Contacto',  to: '/contacto'  },
          ].map(n => (
            <a key={n.to} href={n.to}
              style={{
                fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em',
                color: '#9A9180',
                textDecoration: 'none', padding: '6px 12px', borderRadius: 4,
                transition: 'color 0.2s',
                borderBottom: '1px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.color = '#9A9180'}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <div style={{ marginRight: 4 }}><SocialButtons /></div>
          <BtnVolver onClick={() => navigate(-1)} label="VOLVER" />
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 24px' }}>

        {/* Breadcrumb */}
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:32, fontSize:12, color:'#9A9180' }}>
          <span onClick={() => navigate('/')} style={{ cursor:'pointer', color:'#C9A84C' }}>Inicio</span>
          <span>›</span>
          {producto.nombre_categoria && <><span onClick={() => navigate(`/coleccion?categoria=${encodeURIComponent(producto.nombre_categoria)}`)} style={{ cursor:'pointer', color:'#C9A84C' }}>{producto.nombre_categoria}</span><span>›</span></>}
          <span>{producto.nombre}</span>
        </div>

        {/* ── Sección principal ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, marginBottom:64 }}>

          {/* Galería */}
          <div style={{ display:'grid', gridTemplateColumns: galeria.length > 1 ? '72px 1fr' : '1fr', gap:10 }}>
            {/* Thumbnails verticales */}
            {galeria.length > 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {galeria.map((img, i) => (
                  <div key={i} onClick={() => setImgActiva(i)}
                    style={{ width:68, height:68, border:`2px solid ${imgActiva===i?'#C9A84C':'rgba(201,168,76,0.12)'}`, borderRadius:8, overflow:'hidden', cursor:'pointer', transition:'border-color 0.2s, opacity 0.2s', opacity: imgActiva===i ? 1 : 0.6, flexShrink:0 }}>
                    <img src={img} alt={`${producto.nombre} ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                ))}
              </div>
            )}
            {/* Imagen principal */}
            <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:12, overflow:'hidden', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {galeria.length > 0
                ? <img src={galeria[imgActiva]} alt={producto.nombre} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'opacity 0.25s' }} />
                : <IconBottle size={80}/>}
              {/* Badge categoría */}
              {producto.nombre_categoria && (
                <div style={{ position:'absolute', top:12, left:12, background:'rgba(0,0,0,0.7)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:4, padding:'3px 10px', fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.15em', color:'#C9A84C' }}>
                  {producto.nombre_categoria.toUpperCase()}
                </div>
              )}
              {/* Wishlist */}
              <button onClick={() => toggleWish({ id:String(producto.id_producto), nombre:producto.nombre, marca:producto.marca||'', precio:Number(precio), imagen:producto.imagen||'' })}
                aria-label={enWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'50%', width:40, height:40, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'border-color 0.2s' }}>
                {enWishlist ? <IconHeartFilled size={20}/> : <IconHeart size={20}/>}
              </button>
              {/* Flechas navegación si hay múltiples imágenes */}
              {galeria.length > 1 && (
                <>
                  <button onClick={() => setImgActiva(i => (i - 1 + galeria.length) % galeria.length)} aria-label="Imagen anterior"
                    style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.55)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'50%', width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <button onClick={() => setImgActiva(i => (i + 1) % galeria.length)} aria-label="Imagen siguiente"
                    style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.55)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'50%', width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Marca + nombre */}
            <div>
              {producto.marca && <div style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.2em', color:'#C9A84C', marginBottom:8 }}>{producto.marca.toUpperCase()}</div>}
              <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(28px,4vw,42px)', color:'#E8DCC8', margin:'0 0 8px', fontWeight:400 }}>{producto.nombre}</h1>
              {producto.nombre_categoria && <span style={{ fontSize:11, color:'#9A9180', fontFamily:'Cinzel,serif', letterSpacing:'0.1em', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:20, padding:'3px 12px' }}>{producto.nombre_categoria}</span>}
            </div>

            {/* Rating resumen */}
            {producto.ratings?.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Stars valor={producto.rating_promedio} size={18} />
                <span style={{ fontSize:13, color:'#E8DCC8', fontWeight:600 }}>{producto.rating_promedio}</span>
                <span style={{ fontSize:12, color:'#9A9180' }}>({producto.ratings.length} reseña{producto.ratings.length!==1?'s':''})</span>
              </div>
            )}

            {/* Precio */}
            <div style={{ fontSize:28, color:'#C9A84C', fontWeight:700 }}>{formatCOP(precio)}</div>

            {/* Stock */}
            <StockBadge stock={producto.stock_actual} />

            {/* Presentaciones */}
            {pres.length > 0 && (
              <div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180', marginBottom:10 }}>PRESENTACIÓN</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {pres.map((pr, i) => (
                    <button key={i} onClick={() => setPresIdx(i)}
                      style={{ padding:'8px 16px', border:`1px solid ${presIdx===i?'#C9A84C':'rgba(201,168,76,0.25)'}`, borderRadius:6, background:presIdx===i?'rgba(201,168,76,0.12)':'transparent', color:presIdx===i?'#C9A84C':'#9A9180', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.1em', transition:'all 0.2s' }}>
                      {pr.etiqueta}<br/>
                      <span style={{ fontSize:10 }}>{formatCOP(pr.precio)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            {producto.descripcion && (
              <p style={{ fontSize:14, color:'#C8C0B0', lineHeight:1.8, borderLeft:'2px solid rgba(201,168,76,0.3)', paddingLeft:16 }}>
                {producto.descripcion}
              </p>
            )}

            {/* Botones acción */}
            <div style={{ display:'flex', gap:12, marginTop:4 }}>
              <button onClick={handleCarrito}
                disabled={producto.stock_actual === 0}
                style={{ flex:1, background: producto.stock_actual===0 ? '#2a2a28' : added?'#4a7c59':'#C9A84C', border:'none', borderRadius:8, padding:'14px', color: producto.stock_actual===0 ? '#666' : '#0a0a08', fontFamily:'Cinzel,serif', fontSize:12, letterSpacing:'0.15em', cursor: producto.stock_actual===0 ? 'not-allowed' : 'pointer', transition:'all 0.3s' }}>
                {producto.stock_actual === 0 ? 'AGOTADO' : added ? 'AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO'}
              </button>
              <button onClick={() => toggleWish({ id:String(producto.id_producto), nombre:producto.nombre, marca:producto.marca||'', precio:Number(precio), imagen:producto.imagen||'' })}
                style={{ width:50, background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {enWishlist ? <IconHeartFilled size={22}/> : <IconHeart size={22}/>}
              </button>
            </div>

            {/* Info extra */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, paddingTop:16, borderTop:'1px solid rgba(201,168,76,0.1)' }}>
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.4" width="16" height="16" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>, text: 'Fragancia 100% Original' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.4" width="16" height="16" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V11m-4-2.5l8 4"/></svg>, text: 'Envío a todo Colombia' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.4" width="16" height="16" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>, text: 'Compra segura y garantizada' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display:'flex', gap:10, alignItems:'center', fontSize:13, color:'#9A9180' }}>
                  {icon}<span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Notas olfativas ── */}
        {tieneNotas && (
          <Section titulo="Pirámide Olfativa" eyebrow="Acordes">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:32, alignItems:'center' }}>

              {/* Pirámide visual SVG */}
              <div style={{ display:'flex', justifyContent:'center' }}>
                <svg viewBox="0 0 200 220" width="200" height="220" aria-hidden="true">
                  <defs>
                    <linearGradient id="pyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.9"/>
                      <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.2"/>
                    </linearGradient>
                  </defs>
                  {/* Tier salida (top) */}
                  <polygon points="100,8 138,68 62,68" fill="rgba(201,168,76,0.18)" stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.6"/>
                  {/* Tier corazón (mid) */}
                  <polygon points="62,72 138,72 158,132 42,132" fill="rgba(201,168,76,0.1)" stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.4"/>
                  {/* Tier fondo (base) */}
                  <polygon points="42,136 158,136 178,196 22,196" fill="rgba(201,168,76,0.06)" stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.25"/>
                  {/* Separadores */}
                  <line x1="62" y1="70" x2="138" y2="70" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.5"/>
                  <line x1="42" y1="134" x2="158" y2="134" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.3"/>
                  {/* Íconos centrados */}
                  <text x="100" y="46" textAnchor="middle" fontSize="8" fill="#C9A84C" fontFamily="Cinzel,serif" letterSpacing="1" opacity="0.9">SALIDA</text>
                  <text x="100" y="108" textAnchor="middle" fontSize="8" fill="#C9A84C" fontFamily="Cinzel,serif" letterSpacing="1" opacity="0.75">CORAZÓN</text>
                  <text x="100" y="170" textAnchor="middle" fontSize="8" fill="#C9A84C" fontFamily="Cinzel,serif" letterSpacing="1" opacity="0.6">FONDO</text>
                </svg>
              </div>

              {/* Tiers de notas */}
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {['salida','corazon','fondo'].map((tipo, idx) => {
                  const cfg = NOTA_CONFIG[tipo];
                  const notas = producto.notas?.[tipo] || [];
                  if (!notas.length) return null;
                  const opacities = [1, 0.8, 0.65];
                  const borders = ['rgba(201,168,76,0.2)','rgba(201,168,76,0.13)','rgba(201,168,76,0.08)'];
                  return (
                    <div key={tipo} style={{ borderLeft:`2px solid ${borders[idx]}`, paddingLeft:20, paddingBottom: idx < 2 ? 24 : 0, position:'relative' }}>
                      {/* Punto conector */}
                      <div style={{ position:'absolute', left:-5, top:6, width:8, height:8, borderRadius:'50%', background:'#C9A84C', opacity:opacities[idx] }}/>
                      {/* Header */}
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <span style={{ opacity: opacities[idx] }}>{cfg.icono}</span>
                        <div>
                          <div style={{ fontFamily:'Cinzel,serif', fontSize:10, color:'#C9A84C', letterSpacing:'0.15em', opacity: opacities[idx] }}>{cfg.label.toUpperCase()}</div>
                          <div style={{ fontSize:11, color:'#9A9180', marginTop:2 }}>{cfg.sub}</div>
                        </div>
                      </div>
                      {/* Pills de notas */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {notas.map((n,i) => (
                          <span key={i} style={{ background:`rgba(201,168,76,${0.06 + (2-idx)*0.03})`, border:`1px solid rgba(201,168,76,${0.15 + (2-idx)*0.05})`, borderRadius:20, padding:'5px 14px', fontSize:12, color:'#E8DCC8' }}>
                            {n.nota}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {/* ── Dupes ── */}
        {producto.dupes?.length > 0 && (
          <Section titulo="Perfumes Similares" eyebrow="También te puede gustar">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
              {producto.dupes.map(d => {
                const refId    = d.ref_id || d.id_referencia || null;
                const clicable = !!refId;
                return (
                  <div
                    key={d.id}
                    onClick={clicable ? () => navigate(`/producto/${refId}`) : undefined}
                    style={{
                      background:'#111',
                      border: clicable ? '1px solid rgba(201,168,76,0.28)' : '1px solid rgba(201,168,76,0.1)',
                      borderRadius:10, overflow:'hidden', textAlign:'center',
                      cursor: clicable ? 'pointer' : 'default',
                      transition:'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                      position:'relative',
                    }}
                    onMouseEnter={e => {
                      if (!clicable) return;
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.65)';
                      e.currentTarget.style.transform   = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow   = '0 8px 28px rgba(0,0,0,0.45)';
                    }}
                    onMouseLeave={e => {
                      if (!clicable) return;
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.28)';
                      e.currentTarget.style.transform   = 'translateY(0)';
                      e.currentTarget.style.boxShadow   = 'none';
                    }}>

                    {/* Badge "En catálogo" */}
                    {clicable && (
                      <div style={{
                        position:'absolute', top:8, right:8, zIndex:2,
                        background:'rgba(201,168,76,0.15)',
                        border:'1px solid rgba(201,168,76,0.4)',
                        borderRadius:4, padding:'2px 7px',
                        fontFamily:'Cinzel,serif', fontSize:8,
                        letterSpacing:'0.12em', color:'#C9A84C',
                      }}>
                        VER →
                      </div>
                    )}

                    {d.imagen
                      ? <img src={d.imagen} alt={d.nombre} style={{ width:'100%', height:110, objectFit:'cover', display:'block' }} />
                      : <div style={{ height:110, background:'rgba(201,168,76,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <IconBottle size={36}/>
                        </div>
                    }

                    <div style={{ padding:'10px 12px 12px' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#E8DCC8', marginBottom:3 }}>{d.nombre}</div>
                      {d.marca && (
                        <div style={{ fontSize:11, color:'#9A9180', fontFamily:'Cinzel,serif', letterSpacing:'0.08em' }}>{d.marca}</div>
                      )}
                      {clicable && (
                        <div style={{ marginTop:8, fontSize:10, color:'rgba(201,168,76,0.6)', fontFamily:'Cinzel,serif', letterSpacing:'0.1em' }}>
                          Disponible en catálogo
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Calificaciones ── */}
        <Section titulo="Reseñas y Calificaciones" eyebrow="Opiniones">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }}>

            {/* Formulario */}
            <div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.15em', color:'#C9A84C', marginBottom:16 }}>DEJAR UNA RESEÑA</div>
              <form onSubmit={enviarRating} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={labelStyle}>TU NOMBRE</label>
                  <input value={rNombre} onChange={e=>setRNombre(e.target.value)} placeholder="¿Cómo te llamas?" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CALIFICACIÓN</label>
                  <div style={{ display:'flex', gap:6, marginTop:6 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" aria-label={`${n} estrella${n>1?'s':''}`}
                        onMouseEnter={() => setRHover(n)} onMouseLeave={() => setRHover(0)}
                        onClick={() => setREstrellas(n)}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:2, lineHeight:0, transition:'transform 0.15s' }}
                        onMouseDown={e => e.currentTarget.style.transform='scale(1.2)'}
                        onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
                        <svg viewBox="0 0 24 24" fill={(rHover||rEstrellas)>=n?'#C9A84C':'none'} stroke="#C9A84C" strokeWidth="1.5" width="30" height="30" style={{ transition:'fill 0.15s', opacity:(rHover||rEstrellas)>=n?1:0.3 }}>
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>COMENTARIO (OPCIONAL)</label>
                  <textarea value={rComentario} onChange={e=>setRComentario(e.target.value)} rows={3} placeholder="Cuéntanos tu experiencia con esta fragancia..." style={{ ...inputStyle, resize:'vertical' }} />
                </div>
                {rMsg && <div style={{ fontSize:13, padding:'8px 12px', borderRadius:6, background:rMsg.startsWith('ok')?'rgba(76,175,80,0.1)':rMsg.startsWith('warn')?'rgba(255,152,0,0.1)':'rgba(224,82,82,0.1)', border:`1px solid ${rMsg.startsWith('ok')?'rgba(76,175,80,0.3)':rMsg.startsWith('warn')?'rgba(255,152,0,0.3)':'rgba(224,82,82,0.3)'}`, color: rMsg.startsWith('ok')?'#7ecf7e':rMsg.startsWith('warn')?'#ffa040':'#e07070' }}>{rMsg.split(':')[1]}</div>}
                <button type="submit" disabled={rEnviando} style={{ background:'#C9A84C', border:'none', borderRadius:8, padding:'12px', color:'#0a0a08', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.15em', cursor:rEnviando?'not-allowed':'pointer', opacity:rEnviando?0.7:1 }}>
                  {rEnviando ? 'ENVIANDO...' : 'ENVIAR RESEÑA'}
                </button>
              </form>
            </div>

            {/* Lista de reseñas */}
            <div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.15em', color:'#C9A84C', marginBottom:16 }}>
                {producto.ratings?.length > 0 ? `${producto.ratings.length} RESEÑA${producto.ratings.length!==1?'S':''}` : 'SIN RESEÑAS AÚN'}
              </div>
              {producto.ratings?.length > 0 && (
                <>
                  {/* Promedio */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, padding:'14px 16px', background:'#111', borderRadius:10, border:'1px solid rgba(201,168,76,0.1)' }}>
                    <div style={{ fontSize:40, fontWeight:700, color:'#C9A84C', lineHeight:1 }}>{producto.rating_promedio}</div>
                    <div>
                      <Stars valor={producto.rating_promedio} size={20} />
                      <div style={{ fontSize:11, color:'#9A9180', marginTop:4 }}>Promedio de {producto.ratings.length} reseña{producto.ratings.length!==1?'s':''}</div>
                    </div>
                  </div>
                  {/* Reseñas */}
                  <div style={{ display:'flex', flexDirection:'column', gap:12, maxHeight:400, overflowY:'auto' }}>
                    {producto.ratings.map(r => (
                      <div key={r.id} style={{ background:'#111', border:'1px solid rgba(201,168,76,0.08)', borderRadius:10, padding:'14px 16px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:'#E8DCC8' }}>{r.nombre_usuario}</div>
                            <Stars valor={r.estrellas} size={13} />
                          </div>
                          <div style={{ fontSize:11, color:'#9A9180' }}>{new Date(r.fecha).toLocaleDateString('es-CO')}</div>
                        </div>
                        {r.comentario && <p style={{ fontSize:13, color:'#C8C0B0', lineHeight:1.6, margin:0, marginTop:6 }}>{r.comentario}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p className="footer__copy">© 2024 OrientPerfumes · Todos los derechos reservados</p>
        <a href="#" className="footer__back">↑ Volver Arriba</a>
      </footer>
    </div>
  );
}

/* ── Sub-componentes ── */
function Stars({ valor, size = 16 }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} viewBox="0 0 24 24" fill={n <= Math.round(valor) ? '#C9A84C' : 'none'} stroke="#C9A84C" strokeWidth="1.5" width={size} height={size} aria-hidden="true" style={{ opacity: n <= Math.round(valor) ? 1 : 0.25 }}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
  );
}

function Section({ titulo, eyebrow, children }) {
  return (
    <div style={{ marginBottom:56 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.2em', color:'#C9A84C', marginBottom:8 }}>{eyebrow?.toUpperCase()}</div>
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(22px,3vw,32px)', color:'#E8DCC8', margin:0, fontWeight:400 }}>{titulo}</h2>
        <div style={{ width:40, height:1, background:'linear-gradient(90deg,#C9A84C,transparent)', marginTop:10 }} />
      </div>
      {children}
    </div>
  );
}

const labelStyle = { fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180', display:'block', marginBottom:6 };
const inputStyle = { width:'100%', background:'#1a1a18', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'10px 14px', color:'#E8DCC8', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'Raleway,sans-serif' };
const btnOutline = { background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'8px 20px', color:'#C9A84C', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.1em' };

/* ── Badge de stock ── */
function StockBadge({ stock }) {
  if (stock === null || stock === undefined) return null;
  if (stock <= 0) return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
      background:'rgba(224,82,82,0.08)', border:'1px solid rgba(224,82,82,0.3)', borderRadius:4 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#e05252" strokeWidth="2" width="14" height="14">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span style={{ color:'#e05252', fontSize:12, fontFamily:'Cinzel,serif', letterSpacing:'0.1em' }}>AGOTADO</span>
    </div>
  );
  if (stock <= 5) return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
      background:'rgba(224,128,32,0.07)', border:'1px solid rgba(224,128,32,0.35)', borderRadius:4 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#e08020" strokeWidth="2" width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      <span style={{ color:'#e08020', fontSize:12, fontFamily:'Cinzel,serif', letterSpacing:'0.1em' }}>
        SOLO QUEDAN {stock} {stock === 1 ? 'UNIDAD' : 'UNIDADES'}
      </span>
    </div>
  );
  if (stock <= 10) return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
      background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:4 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span style={{ color:'#C9A84C', fontSize:12, fontFamily:'Cinzel,serif', letterSpacing:'0.1em' }}>POCAS UNIDADES DISPONIBLES</span>
    </div>
  );
  return null;
}

/* ── Botón de volver estándar ── */
function BtnVolver({ onClick, label = 'INICIO' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'none',
        border: '1px solid rgba(201,168,76,0.45)',
        borderRadius: 4,
        padding: '8px 20px',
        color: '#C9A84C',
        cursor: 'pointer',
        fontFamily: 'Cinzel, serif',
        fontSize: 12,
        letterSpacing: '0.12em',
        transition: 'background 0.2s, border-color 0.2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}