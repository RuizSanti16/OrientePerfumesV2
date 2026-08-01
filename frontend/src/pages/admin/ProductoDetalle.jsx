import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productoDetalleAPI, productosAPI, subirImagen } from '../../services/api';
import { MensajeEstado, IconClose, IconCheck, IconArrowLeft, IconArrowRight, IconStar, IconStarFilled } from '../../components/Icons';

const IconBottle = ({ size = 24 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.1" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.2 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);

export default function ProductoDetalle() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [guardando,  setGuardando]   = useState(false);
  const [msg,        setMsg]         = useState(null);
  const [subiendo,     setSubiendo]     = useState(false);
  const [subiendoDupe, setSubiendoDupe] = useState({});
  const [todosProductos, setTodosProductos] = useState([]);

  /* Form state */
  const [descripcion, setDescripcion] = useState('');
  const [imagenes,    setImagenes]    = useState([]);
  const [notas,       setNotas]       = useState({ salida:[], corazon:[], fondo:[] });
  const [dupes,       setDupes]       = useState([]);

  /* Nuevas notas (inputs) */
  const [nuevaNota, setNuevaNota] = useState({ salida:'', corazon:'', fondo:'' });

  useEffect(() => {
    productoDetalleAPI.obtener(id).then(res => {
      if (res.ok) {
        const p = res.data;
        setProducto(p);
        setDescripcion(p.descripcion || '');
        setImagenes((p.imagenes || []).map(i => i.imagen));
        setNotas({
          salida:  (p.notas?.salida  || []).map(n => n.nota),
          corazon: (p.notas?.corazon || []).map(n => n.nota),
          fondo:   (p.notas?.fondo   || []).map(n => n.nota),
        });
        setDupes(p.dupes || []);
      }
      setLoading(false);
    });
    /* Cargar todos los productos para el selector de vinculación */
    productosAPI.listar().then(res => {
      if (res.ok) setTodosProductos(res.data);
    });
  }, [id]);

  async function guardar() {
    setGuardando(true);
    const res = await productoDetalleAPI.guardar({ id_producto: id, descripcion, imagenes, notas, dupes });
    setMsg(res.ok ? { ok: true, texto: 'Guardado correctamente' } : { ok: false, texto: 'Error: ' + res.mensaje });
    setGuardando(false);
    setTimeout(() => setMsg(null), 3000);
  }

  async function eliminarRating(ratingId) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    await productoDetalleAPI.eliminarRating(ratingId);
    productoDetalleAPI.obtener(id).then(r => { if (r.ok) setProducto(r.data); });
  }

  async function handleImagen(e) {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (!files.length) return;
    setSubiendo(true);
    for (const file of files) {
      try {
        const res = await subirImagen(file);
        if (res.ok) {
          setImagenes(prev => [...prev, res.url]);
        } else {
          setMsg({ ok: false, texto: 'Error al subir ' + file.name + ': ' + (res.mensaje || 'Error desconocido') });
        }
      } catch {
        setMsg({ ok: false, texto: 'Error de conexión al subir imagen.' });
      }
    }
    setSubiendo(false);
  }

  function agregarNota(tipo) {
    const val = nuevaNota[tipo].trim();
    if (!val) return;
    setNotas(prev => ({ ...prev, [tipo]: [...prev[tipo], val] }));
    setNuevaNota(prev => ({ ...prev, [tipo]: '' }));
  }

  function quitarNota(tipo, idx) {
    setNotas(prev => ({ ...prev, [tipo]: prev[tipo].filter((_,i) => i!==idx) }));
  }

  function agregarDupe() {
    setDupes(prev => [...prev, { nombre:'', marca:'', imagen:'' }]);
  }

  function updateDupe(idx, key, val) {
    setDupes(prev => prev.map((d,i) => i===idx ? {...d,[key]:val} : d));
  }

  async function handleDupeImg(idx, file) {
    if (!file) return;
    setSubiendoDupe(p => ({ ...p, [idx]: true }));
    try {
      const res = await subirImagen(file);
      if (res.ok) {
        updateDupe(idx, 'imagen', res.url);
      } else {
        setMsg({ ok: false, texto: 'Error al subir imagen: ' + (res.mensaje || 'Error desconocido') });
      }
    } catch {
      setMsg('✗ Error de conexión al subir imagen.');
    }
    setSubiendoDupe(p => ({ ...p, [idx]: false }));
  }

  if (loading) return <div style={{ padding:32, color:'#9A9180', fontFamily:'Cinzel,serif', fontSize:11 }}>CARGANDO...</div>;
  if (!producto) return <div style={{ padding:32, color:'#e05252' }}>Producto no encontrado</div>;

  const inp = { width:'100%', background:'#1a1a18', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'8px 12px', color:'#E8DCC8', fontSize:13, outline:'none', boxSizing:'border-box' };
  const NOTA_LABELS = { salida:'◈ Notas de Salida', corazon:'◆ Notas de Corazón', fondo:'◇ Notas de Fondo' };

  return (
    <div style={{ padding:32, color:'#E8DCC8', maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <button onClick={() => navigate('/admin/products')} style={{ background:'none', border:'none', color:'#9A9180', cursor:'pointer', fontSize:12, marginBottom:8, fontFamily:'Cinzel,serif', letterSpacing:'0.1em', display:'flex', alignItems:'center', gap:6, padding:0 }}><IconArrowLeft size={13}/> VOLVER</button>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:20, color:'#C9A84C', margin:'0 0 4px' }}>Detalle del Producto</h1>
          <p style={{ color:'#9A9180', fontSize:13, margin:0 }}>{producto.nombre}</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => window.open(`/producto/${id}`, '_blank')}
            style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'8px 16px', color:'#C9A84C', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:11 }}>
            Ver página <IconArrowRight size={13}/>
          </button>
          <button onClick={guardar} disabled={guardando}
            style={{ background:'#C9A84C', border:'none', borderRadius:6, padding:'8px 20px', color:'#0a0a08', cursor:guardando?'not-allowed':'pointer', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.1em', opacity:guardando?0.7:1 }}>
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} />}

      {/* ── Descripción ── */}
      <Card titulo="Descripción del Producto">
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4}
          style={{ ...inp, resize:'vertical' }} placeholder="Describe el perfume, su historia, personalidad, ocasiones de uso..." />
      </Card>

      {/* ── Galería ── */}
      <Card titulo="Galería de Imágenes">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:10, marginBottom:12 }}>
          {imagenes.map((img, i) => (
            <div key={i} style={{ position:'relative', border:'1px solid rgba(201,168,76,0.15)', borderRadius:8, overflow:'hidden', aspectRatio:'1' }}>
              <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <button onClick={() => setImagenes(prev => prev.filter((_,idx) => idx!==i))}
                style={{ position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'50%', width:22, height:22, color:'#e05252', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}><IconClose size={12}/></button>
            </div>
          ))}
          {/* Botón agregar / spinner */}
          <label style={{ border:'2px dashed rgba(201,168,76,0.3)', borderRadius:8, aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor: subiendo ? 'wait' : 'pointer', gap:4, background: subiendo ? 'rgba(201,168,76,0.04)' : 'transparent' }}>
            {subiendo ? (
              <div style={{ width:20, height:20, border:'2px solid rgba(201,168,76,0.3)', borderTopColor:'#C9A84C', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            ) : (
              <>
                <span style={{ fontSize:24, color:'#C9A84C' }}>+</span>
                <span style={{ fontSize:9, color:'#9A9180', fontFamily:'Cinzel,serif', letterSpacing:'0.1em' }}>AGREGAR</span>
                <span style={{ fontSize:8, color:'rgba(154,145,128,0.5)' }}>JPG · PNG · WEBP</span>
              </>
            )}
            <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImagen} disabled={subiendo} />
          </label>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input placeholder="O pega URL de imagen" style={{ ...inp, flex:1 }} id="img-url" />
          <button onClick={() => { const v = document.getElementById('img-url').value.trim(); if(v){ setImagenes(p=>[...p,v]); document.getElementById('img-url').value=''; }}}
            style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'8px 14px', color:'#C9A84C', cursor:'pointer', fontSize:11, fontFamily:'Cinzel,serif', whiteSpace:'nowrap' }}>
            + URL
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Card>

      {/* ── Notas olfativas ── */}
      <Card titulo="Pirámide Olfativa (Notas)">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {['salida','corazon','fondo'].map(tipo => (
            <div key={tipo}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.15em', color:'#C9A84C', marginBottom:10 }}>
                {NOTA_LABELS[tipo].toUpperCase()}
              </div>
              {/* Tags */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {notas[tipo].map((n,i) => (
                  <span key={i} style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:20, padding:'3px 10px', fontSize:12, color:'#E8DCC8', display:'flex', alignItems:'center', gap:5 }}>
                    {n}
                    <button onClick={() => quitarNota(tipo,i)} style={{ background:'none', border:'none', color:'#e05252', cursor:'pointer', fontSize:12, padding:0, lineHeight:1, display:'flex' }}><IconClose size={12}/></button>
                  </span>
                ))}
              </div>
              {/* Input nueva nota */}
              <div style={{ display:'flex', gap:6 }}>
                <input style={{ ...inp, flex:1, fontSize:12 }} placeholder="Ej: Bergamota"
                  value={nuevaNota[tipo]} onChange={e => setNuevaNota(p=>({...p,[tipo]:e.target.value}))}
                  onKeyDown={e => e.key==='Enter' && (e.preventDefault(), agregarNota(tipo))} />
                <button onClick={() => agregarNota(tipo)}
                  style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'6px 10px', color:'#C9A84C', cursor:'pointer', fontSize:14 }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Dupes ── */}
      <Card titulo="Perfumes Similares (Dupes)">
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:12 }}>
          {dupes.map((d,i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'center', background:'#0f0f0d', border:'1px solid rgba(201,168,76,0.1)', borderRadius:8, padding:12 }}>
              {/* Imagen */}
              <div style={{ flexShrink:0 }}>
                <label style={{ display:'block', cursor: subiendoDupe[i] ? 'wait' : 'pointer', position:'relative' }}>
                  {subiendoDupe[i] ? (
                    <div style={{ width:52, height:52, background:'rgba(201,168,76,0.06)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width:18, height:18, border:'2px solid rgba(201,168,76,0.3)', borderTopColor:'#C9A84C', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                    </div>
                  ) : d.imagen ? (
                    <img src={d.imagen} style={{ width:52, height:52, objectFit:'cover', borderRadius:6, display:'block' }} alt="" />
                  ) : (
                    <div style={{ width:52, height:52, background:'rgba(201,168,76,0.05)', borderRadius:6, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, border:'1px dashed rgba(201,168,76,0.25)' }}>
                      <IconBottle size={18}/>
                      <span style={{ fontFamily:'Cinzel,serif', fontSize:7, color:'#C9A84C', letterSpacing:'0.05em' }}>IMG</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleDupeImg(i, e.target.files[0])} disabled={subiendoDupe[i]} />
                </label>
              </div>
              <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input style={{ ...inp, fontSize:12 }} placeholder="Nombre del perfume *" value={d.nombre} onChange={e => updateDupe(i,'nombre',e.target.value)} />
                <input style={{ ...inp, fontSize:12 }} placeholder="Marca" value={d.marca} onChange={e => updateDupe(i,'marca',e.target.value)} />
                <input style={{ ...inp, fontSize:12, gridColumn:'1/-1' }} placeholder="URL imagen externa (opcional)" value={d.imagen.startsWith('data:') || d.imagen.startsWith('/OrientPerfumes') ? '' : d.imagen} onChange={e => updateDupe(i,'imagen',e.target.value)} />
                {/* Selector de vinculación al catálogo */}
                <div style={{
                  gridColumn:'1/-1',
                  background: d.id_referencia ? 'rgba(76,175,80,0.07)' : 'rgba(201,168,76,0.03)',
                  border: `1px solid ${d.id_referencia ? 'rgba(76,175,80,0.3)' : 'rgba(201,168,76,0.12)'}`,
                  borderRadius:6, padding:'10px 12px',
                  transition:'background 0.2s, border-color 0.2s',
                }}>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.14em', color: d.id_referencia ? 'rgba(76,175,80,0.9)' : '#9A9180', marginBottom:8 }}>
                    {d.id_referencia
                  ? <><IconCheck size={11} sw={2.6}/> VINCULADO AL CATÁLOGO</>
                  : 'VINCULAR A PRODUCTO DEL CATÁLOGO'}
                  </div>

                  {d.id_referencia ? (
                    /* Estado vinculado: muestra el nombre del producto + botón quitar */
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(76,175,80,0.8)', flexShrink:0 }} />
                        <span style={{ fontSize:13, color:'#C9A84C', fontWeight:600 }}>
                          {todosProductos.find(p => String(p.id_producto) === String(d.id_referencia))?.nombre || `Producto #${d.id_referencia}`}
                        </span>
                        {todosProductos.find(p => String(p.id_producto) === String(d.id_referencia))?.marca && (
                          <span style={{ fontSize:11, color:'#9A9180', fontFamily:'Cinzel,serif', letterSpacing:'0.06em' }}>
                            · {todosProductos.find(p => String(p.id_producto) === String(d.id_referencia)).marca}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => updateDupe(i, 'id_referencia', null)}
                        style={{ background:'transparent', border:'1px solid rgba(224,82,82,0.4)', borderRadius:4, padding:'3px 10px', color:'#e05252', cursor:'pointer', fontSize:10, fontFamily:'Cinzel,serif', letterSpacing:'0.08em', whiteSpace:'nowrap', flexShrink:0 }}>
                        Quitar
                      </button>
                    </div>
                  ) : (
                    /* Estado sin vincular: dropdown de selección */
                    <select
                      value=""
                      onChange={e => { if (e.target.value) updateDupe(i, 'id_referencia', e.target.value); }}
                      style={{ ...inp, fontSize:12 }}>
                      <option value="">— Seleccionar producto del catálogo...</option>
                      {todosProductos
                        .filter(p => String(p.id_producto) !== String(id))
                        .map(p => (
                          <option key={p.id_producto} value={p.id_producto}>
                            {p.nombre}{p.marca ? ` · ${p.marca}` : ''}
                          </option>
                        ))
                      }
                    </select>
                  )}
                </div>
              </div>
              <button onClick={() => setDupes(prev => prev.filter((_,idx)=>idx!==i))}
                style={{ background:'none', border:'none', color:'#e05252', cursor:'pointer', fontSize:18, flexShrink:0, display:'flex' }}><IconClose size={14}/></button>
            </div>
          ))}
        </div>
        <button onClick={agregarDupe}
          style={{ width:'100%', background:'transparent', border:'1px dashed rgba(201,168,76,0.3)', borderRadius:6, padding:'10px', color:'#C9A84C', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.1em' }}>
          + AGREGAR SIMILAR
        </button>
      </Card>

      {/* ── Reseñas ── */}
      <Card titulo={`Reseñas (${producto.ratings?.length || 0})`}>
        {!producto.ratings?.length
          ? <p style={{ color:'#9A9180', fontSize:13 }}>No hay reseñas aún.</p>
          : producto.ratings.map(r => (
            <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'12px 0', borderBottom:'1px solid rgba(201,168,76,0.06)' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#E8DCC8' }}>{r.nombre_usuario}</span>
                  <span style={{ color:'#C9A84C', display:'flex', gap:2 }}>
                    {[1,2,3,4,5].map(n => n <= r.estrellas
                      ? <IconStarFilled key={n} size={13}/>
                      : <IconStar key={n} size={13}/>)}
                  </span>
                  <span style={{ fontSize:11, color:'#9A9180' }}>{new Date(r.fecha).toLocaleDateString('es-CO')}</span>
                </div>
                {r.comentario && <p style={{ fontSize:12, color:'#9A9180', margin:0 }}>{r.comentario}</p>}
              </div>
              <button onClick={() => eliminarRating(r.id)}
                style={{ background:'none', border:'1px solid rgba(224,82,82,0.3)', borderRadius:4, padding:'3px 8px', color:'#e05252', cursor:'pointer', fontSize:10, flexShrink:0 }}>
                Eliminar
              </button>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

function Card({ titulo, children }) {
  return (
    <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.15)', borderRadius:8, marginBottom:20, overflow:'hidden' }}>
      <div style={{ padding:'12px 20px', background:'#0f0f0d', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.2em', color:'#C9A84C' }}>{titulo.toUpperCase()}</span>
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}