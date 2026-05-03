import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productoDetalleAPI } from '../services/api';
import { useCarrito }  from '../hooks/useCarrito';
import { useWishlist } from '../hooks/useWishlist';
import SocialButtons   from '../components/SocialButtons';

function formatCOP(v) { return '$ ' + Number(v||0).toLocaleString('es-CO'); }

const NOTA_CONFIG = {
  salida:  { label: 'Notas de Salida',   emoji: '🌸', sub: 'Primera impresión' },
  corazon: { label: 'Notas de Corazón', emoji: '💫', sub: 'El alma del perfume' },
  fondo:   { label: 'Notas de Fondo',   emoji: '🌿', sub: 'La huella que deja' },
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
      <button onClick={() => navigate(-1)} style={btnOutline}>← Volver</button>
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
    if (!rNombre || !rEstrellas) { setRMsg('⚠️ Completa nombre y estrellas'); return; }
    setREnviando(true);
    const res = await productoDetalleAPI.calificar({ id_producto: id, nombre_usuario: rNombre, estrellas: rEstrellas, comentario: rComentario });
    if (res.ok) {
      setRMsg('✅ ¡Gracias por tu calificación!');
      setRNombre(''); setREstrellas(0); setRComentario('');
      /* Refrescar ratings */
      productoDetalleAPI.obtener(id).then(r => { if (r.ok) setProducto(r.data); });
    } else { setRMsg('❌ Error al enviar'); }
    setREnviando(false);
    setTimeout(() => setRMsg(''), 4000);
  }

  const enWishlist = estaEn(String(producto.id_producto));
  const tieneNotas = Object.values(producto.notas||{}).some(arr => arr.length > 0);

  return (
    <div style={{ background:'#0a0a08', minHeight:'100vh', color:'#E8DCC8', fontFamily:'Lato,sans-serif' }}>

      {/* Header */}
      <header className="header">
        <a onClick={() => navigate('/')} className="header__logo" style={{ cursor:'pointer' }}>
          <div className="logo-icon"><img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="Logo" /></div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>
        <div className="header__actions">
          <SocialButtons />
          <button onClick={() => navigate(-1)} style={{ background:'none', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'6px 14px', color:'#9A9180', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.1em' }}>← VOLVER</button>
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
                : <div style={{ fontSize:80 }}>🫙</div>}
              {/* Wishlist */}
              <button onClick={() => toggleWish({ id:String(producto.id_producto), nombre:producto.nombre, marca:producto.marca||'', precio:Number(precio), imagen:producto.imagen||'' })}
                style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', width:40, height:40, cursor:'pointer', fontSize:20 }}>
                {enWishlist ? '❤️' : '🤍'}
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
                style={{ width:50, background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, cursor:'pointer', fontSize:22 }}>
                {enWishlist ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Info extra */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, paddingTop:16, borderTop:'1px solid rgba(201,168,76,0.1)' }}>
              {[['✅','Fragancia 100% Original'],['🚚','Envío a todo Colombia'],['🔒','Compra segura y garantizada']].map(([ic,tx]) => (
                <div key={tx} style={{ display:'flex', gap:10, alignItems:'center', fontSize:13, color:'#9A9180' }}>
                  <span>{ic}</span><span>{tx}</span>
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
                      <div style={{ fontSize:28, marginBottom:6 }}>{cfg.emoji}</div>
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
              {producto.dupes.map(d => (
                <div key={d.id} style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:10, overflow:'hidden', textAlign:'center' }}>
                  {d.imagen
                    ? <img src={d.imagen} alt={d.nombre} style={{ width:'100%', height:110, objectFit:'cover' }} />
                    : <div style={{ height:110, background:'rgba(201,168,76,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>🫙</div>}
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#E8DCC8', marginBottom:3 }}>{d.nombre}</div>
                    {d.marca && <div style={{ fontSize:11, color:'#9A9180', fontFamily:'Cinzel,serif', letterSpacing:'0.08em' }}>{d.marca}</div>}
                  </div>
                </div>
              ))}
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
                {rMsg && <div style={{ fontSize:13, padding:'8px 12px', borderRadius:6, background:rMsg.startsWith('✅')?'rgba(76,175,80,0.1)':rMsg.startsWith('⚠️')?'rgba(255,152,0,0.1)':'rgba(224,82,82,0.1)', border:`1px solid ${rMsg.startsWith('✅')?'rgba(76,175,80,0.3)':rMsg.startsWith('⚠️')?'rgba(255,152,0,0.3)':'rgba(224,82,82,0.3)'}` }}>{rMsg}</div>}
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
const inputStyle = { width:'100%', background:'#1a1a18', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'10px 14px', color:'#E8DCC8', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'Lato,sans-serif' };
const btnOutline = { background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'8px 20px', color:'#C9A84C', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.1em' };