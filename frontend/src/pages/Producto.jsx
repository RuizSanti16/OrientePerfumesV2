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
    if (!rNombre || !rEstrellas) { setRMsg('△ Completa nombre y estrellas'); return; }
    setREnviando(true);
    const res = await productoDetalleAPI.calificar({ id_producto: id, nombre_usuario: rNombre, estrellas: rEstrellas, comentario: rComentario });
    if (res.ok) {
      setRMsg('✓ ¡Gracias por tu calificación!');
      setRNombre(''); setREstrellas(0); setRComentario('');
      /* Refrescar ratings */
      productoDetalleAPI.obtener(id).then(r => { if (r.ok) setProducto(r.data); });
    } else { setRMsg('✗ Error al enviar'); }
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
          <div>
            {/* Imagen principal */}
            <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:12, overflow:'hidden', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, position:'relative' }}>
              {galeria.length > 0
                ? <img src={galeria[imgActiva]} alt={producto.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <IconBottle size={80}/>}
              {/* Wishlist */}
              <button onClick={() => toggleWish({ id:String(producto.id_producto), nombre:producto.nombre, marca:producto.marca||'', precio:Number(precio), imagen:producto.imagen||'' })}
                style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', width:40, height:40, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {enWishlist ? <IconHeartFilled size={20}/> : <IconHeart size={20}/>}
              </button>
            </div>
            {/* Thumbnails */}
            {galeria.length > 1 && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {galeria.map((img, i) => (
                  <div key={i} onClick={() => setImgActiva(i)}
                    style={{ width:68, height:68, border:`2px solid ${imgActiva===i?'#C9A84C':'rgba(201,168,76,0.15)'}`, borderRadius:8, overflow:'hidden', cursor:'pointer', transition:'border-color 0.2s' }}>
                    <img src={img} alt={`${producto.nombre} ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                ))}
              </div>
            )}
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
              <button onClick={handleCarrito} style={{ flex:1, background:added?'#4a7c59':'#C9A84C', border:'none', borderRadius:8, padding:'14px', color:'#0a0a08', fontFamily:'Cinzel,serif', fontSize:12, letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.3s' }}>
                {added ? '✓ AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO'}
              </button>
              <button onClick={() => toggleWish({ id:String(producto.id_producto), nombre:producto.nombre, marca:producto.marca||'', precio:Number(precio), imagen:producto.imagen||'' })}
                style={{ width:50, background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {enWishlist ? <IconHeartFilled size={22}/> : <IconHeart size={22}/>}
              </button>
            </div>

            {/* Info extra */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, paddingTop:16, borderTop:'1px solid rgba(201,168,76,0.1)' }}>
              {[['◆','Fragancia 100% Original'],['◈','Envío a todo Colombia'],['◇','Compra segura y garantizada']].map(([ic,tx]) => (
                <div key={tx} style={{ display:'flex', gap:10, alignItems:'center', fontSize:13, color:'#9A9180' }}>
                  <span style={{ color:'#C9A84C', fontSize:10 }}>{ic}</span><span>{tx}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Notas olfativas ── */}
        {tieneNotas && (
          <Section titulo="Pirámide Olfativa" eyebrow="Acordes">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
              {['salida','corazon','fondo'].map(tipo => {
                const cfg = NOTA_CONFIG[tipo];
                const notas = producto.notas?.[tipo] || [];
                if (!notas.length) return null;
                return (
                  <div key={tipo} style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:10, padding:20 }}>
                    <div style={{ textAlign:'center', marginBottom:14 }}>
                      <div style={{ marginBottom:6 }}>{cfg.icono}</div>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:11, color:'#C9A84C', letterSpacing:'0.15em' }}>{cfg.label.toUpperCase()}</div>
                      <div style={{ fontSize:11, color:'#9A9180', marginTop:3 }}>{cfg.sub}</div>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
                      {notas.map((n,i) => (
                        <span key={i} style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:20, padding:'4px 12px', fontSize:12, color:'#E8DCC8' }}>
                          {n.nota}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Dupes ── */}
        {producto.dupes?.length > 0 && (
          <Section titulo="Perfumes Similares" eyebrow="Dupes">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
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
                      <button key={n} type="button"
                        onMouseEnter={() => setRHover(n)} onMouseLeave={() => setRHover(0)}
                        onClick={() => setREstrellas(n)}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, color:(rHover||rEstrellas)>=n?'#C9A84C':'rgba(201,168,76,0.2)', transition:'color 0.15s' }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>COMENTARIO (OPCIONAL)</label>
                  <textarea value={rComentario} onChange={e=>setRComentario(e.target.value)} rows={3} placeholder="Cuéntanos tu experiencia con esta fragancia..." style={{ ...inputStyle, resize:'vertical' }} />
                </div>
                {rMsg && <div style={{ fontSize:13, padding:'8px 12px', borderRadius:6, background:rMsg.startsWith('✓')?'rgba(76,175,80,0.1)':rMsg.startsWith('△')?'rgba(255,152,0,0.1)':'rgba(224,82,82,0.1)', border:`1px solid ${rMsg.startsWith('✓')?'rgba(76,175,80,0.3)':rMsg.startsWith('△')?'rgba(255,152,0,0.3)':'rgba(224,82,82,0.3)'}` }}>{rMsg}</div>}
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
        <span key={n} style={{ fontSize:size, color: n <= Math.round(valor) ? '#C9A84C' : 'rgba(201,168,76,0.2)', lineHeight:1 }}>★</span>
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