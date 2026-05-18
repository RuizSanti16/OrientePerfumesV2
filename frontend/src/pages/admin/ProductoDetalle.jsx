import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productoDetalleAPI } from '../../services/api';

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
  const [guardando,setGuardando]= useState(false);
  const [msg,      setMsg]      = useState('');

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
  }, [id]);

  async function guardar() {
    setGuardando(true);
    const res = await productoDetalleAPI.guardar({ id_producto: id, descripcion, imagenes, notas, dupes });
    setMsg(res.ok ? '✓ Guardado correctamente' : '✗ Error: ' + res.mensaje);
    setGuardando(false);
    setTimeout(() => setMsg(''), 3000);
  }

  async function eliminarRating(ratingId) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    await productoDetalleAPI.eliminarRating(ratingId);
    productoDetalleAPI.obtener(id).then(r => { if (r.ok) setProducto(r.data); });
  }

  function handleImagen(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImagenes(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
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

  function handleDupeImg(idx, file) {
    const reader = new FileReader();
    reader.onload = e => updateDupe(idx, 'imagen', e.target.result);
    reader.readAsDataURL(file);
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
          <button onClick={() => navigate('/admin/products')} style={{ background:'none', border:'none', color:'#9A9180', cursor:'pointer', fontSize:12, marginBottom:8, fontFamily:'Cinzel,serif', letterSpacing:'0.1em' }}>← VOLVER</button>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:20, color:'#C9A84C', margin:'0 0 4px' }}>Detalle del Producto</h1>
          <p style={{ color:'#9A9180', fontSize:13, margin:0 }}>{producto.nombre}</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => window.open(`/producto/${id}`, '_blank')}
            style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'8px 16px', color:'#C9A84C', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:11 }}>
            Ver página →
          </button>
          <button onClick={guardar} disabled={guardando}
            style={{ background:'#C9A84C', border:'none', borderRadius:6, padding:'8px 20px', color:'#0a0a08', cursor:guardando?'not-allowed':'pointer', fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.1em', opacity:guardando?0.7:1 }}>
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {msg && <div style={{ marginBottom:16, padding:'10px 16px', background:msg.startsWith('✓')?'rgba(76,175,80,0.1)':'rgba(224,82,82,0.1)', border:`1px solid ${msg.startsWith('✓')?'rgba(76,175,80,0.3)':'rgba(224,82,82,0.3)'}`, borderRadius:6, fontSize:13 }}>{msg}</div>}

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
                style={{ position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'50%', width:22, height:22, color:'#e05252', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
          ))}
          <label style={{ border:'2px dashed rgba(201,168,76,0.3)', borderRadius:8, aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:4 }}>
            <span style={{ fontSize:24 }}>+</span>
            <span style={{ fontSize:9, color:'#9A9180', fontFamily:'Cinzel,serif', letterSpacing:'0.1em' }}>AGREGAR</span>
            <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImagen} />
          </label>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input placeholder="O pega URL de imagen" style={{ ...inp, flex:1 }} id="img-url" />
          <button onClick={() => { const v = document.getElementById('img-url').value; if(v){ setImagenes(p=>[...p,v]); document.getElementById('img-url').value=''; }}}
            style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'8px 14px', color:'#C9A84C', cursor:'pointer', fontSize:11, fontFamily:'Cinzel,serif', whiteSpace:'nowrap' }}>
            + URL
          </button>
        </div>
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
                    <button onClick={() => quitarNota(tipo,i)} style={{ background:'none', border:'none', color:'#e05252', cursor:'pointer', fontSize:12, padding:0, lineHeight:1 }}>✕</button>
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
                {d.imagen
                  ? <img src={d.imagen} style={{ width:52, height:52, objectFit:'cover', borderRadius:6 }} alt="" />
                  : <div style={{ width:52, height:52, background:'rgba(201,168,76,0.05)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}><IconBottle size={22}/></div>}
                <label style={{ display:'block', marginTop:4, textAlign:'center', fontFamily:'Cinzel,serif', fontSize:8, color:'#C9A84C', cursor:'pointer' }}>
                  IMG
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleDupeImg(i, e.target.files[0])} />
                </label>
              </div>
              <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input style={{ ...inp, fontSize:12 }} placeholder="Nombre del perfume *" value={d.nombre} onChange={e => updateDupe(i,'nombre',e.target.value)} />
                <input style={{ ...inp, fontSize:12 }} placeholder="Marca" value={d.marca} onChange={e => updateDupe(i,'marca',e.target.value)} />
                <input style={{ ...inp, fontSize:12, gridColumn:'1/-1' }} placeholder="URL imagen (opcional)" value={d.imagen.startsWith('data:') ? '' : d.imagen} onChange={e => updateDupe(i,'imagen',e.target.value)} />
              </div>
              <button onClick={() => setDupes(prev => prev.filter((_,idx)=>idx!==i))}
                style={{ background:'none', border:'none', color:'#e05252', cursor:'pointer', fontSize:18, flexShrink:0 }}>✕</button>
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
                  <span style={{ color:'#C9A84C', fontSize:13 }}>{'★'.repeat(r.estrellas)}{'☆'.repeat(5-r.estrellas)}</span>
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