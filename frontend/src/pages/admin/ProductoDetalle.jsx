import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productoDetalleAPI, productosAPI, notasCatalogoAPI, subirImagen } from '../../services/api';
import { MensajeEstado, IconClose, IconCheck, IconArrowLeft, IconArrowRight, IconStar, IconStarFilled } from '../../components/Icons';
/* El catálogo de notas ya no se importa del código: lo sirve
   notas_catalogo.php, para poder ampliarlo y recortarlo desde aquí
   sin publicar una versión nueva del sitio. */

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
  /* El catálogo de notas que se sugieren. Viene del servidor para que
     se pueda ampliar sin publicar una versión nueva. */
  const [familiasNotas, setFamiliasNotas] = useState([]);
  const catalogoPlano = familiasNotas.flatMap(f => f.notas.map(n => n.nombre));

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
    cargarNotasCatalogo();
  }, [id]);

  function cargarNotasCatalogo() {
    return notasCatalogoAPI.listar()
      .then(r => { if (r.ok) setFamiliasNotas(r.data || []); })
      .catch(() => {});
  }

  /* Crear y quitar notas del catálogo de sugerencias. Devuelven si
     salió bien, para que el campo se vacíe solo al acertar. */
  async function crearNotaCatalogo(nombre, familia) {
    const r = await notasCatalogoAPI.crear({ nombre, familia });
    if (!r?.ok) {
      setMsg({ ok: false, texto: r?.mensaje || 'No se pudo crear la nota' });
      setTimeout(() => setMsg(null), 4000);
      return false;
    }
    await cargarNotasCatalogo();
    setMsg({ ok: true, texto: `“${nombre}” añadida a ${familia}` });
    setTimeout(() => setMsg(null), 3000);
    return true;
  }

  async function eliminarNotaCatalogo(nota) {
    if (!confirm(
      `¿Quitar “${nota.nombre}” de la lista de sugerencias?\n\n` +
      `Los perfumes que ya la tengan la conservan: solo deja de ofrecerse al escribir.`
    )) return;

    const r = await notasCatalogoAPI.eliminar(nota.id);
    if (!r?.ok) {
      setMsg({ ok: false, texto: r?.mensaje || 'No se pudo quitar' });
      setTimeout(() => setMsg(null), 4000);
      return;
    }
    await cargarNotasCatalogo();
    setMsg({
      ok: true,
      texto: r.usos > 0
        ? `“${nota.nombre}” fuera de la lista. Sigue en ${r.usos} perfume${r.usos === 1 ? '' : 's'}.`
        : `“${nota.nombre}” fuera de la lista`,
    });
    setTimeout(() => setMsg(null), 4000);
  }

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

  /* Añade una nota concreta, venga del campo de texto o de la lista.

     No se repite dentro del mismo nivel de la pirámide: tener dos
     veces "Bergamota" en las notas de salida no significa nada y
     ensucia la ficha. */
  function agregarNotaDirecta(tipo, nota) {
    const val = String(nota || '').trim();
    if (!val) return;

    setNotas(prev => {
      const existe = prev[tipo].some(
        n => n.toLowerCase() === val.toLowerCase()
      );
      if (existe) return prev;
      return { ...prev, [tipo]: [...prev[tipo], val] };
    });
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

  /* Vincular a un producto del catálogo rellena lo que falte.

     Antes solo se guardaba el id: el nombre seguía vacío si no se
     escribía a mano, y el servidor descartaba la línea en silencio.
     Se elegía el perfume, se guardaba, y el dupe no aparecía. */
  function vincularDupe(idx, idProducto) {
    const prod = todosProductos.find(p => String(p.id_producto) === String(idProducto));
    setDupes(prev => prev.map((d, i) => i !== idx ? d : {
      ...d,
      id_referencia: idProducto,
      nombre: d.nombre?.trim() || prod?.nombre || '',
      marca:  d.marca?.trim()  || prod?.marca  || '',
      imagen: d.imagen?.trim() || prod?.imagen || '',
    }));
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
      setMsg({ ok: false, texto: 'Error de conexión al subir imagen.' });
    }
    setSubiendoDupe(p => ({ ...p, [idx]: false }));
  }

  if (loading) return <div style={{ padding:32, color:'#9A9180', fontFamily:'Cinzel,serif', fontSize:11 }}>CARGANDO...</div>;
  if (!producto) return <div style={{ padding:32, color:'#C4664C' }}>Producto no encontrado</div>;

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
                style={{ position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'50%', width:22, height:22, color:'#C4664C', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}><IconClose size={12}/></button>
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
                    <button onClick={() => quitarNota(tipo,i)} style={{ background:'none', border:'none', color:'#C4664C', cursor:'pointer', fontSize:12, padding:0, lineHeight:1, display:'flex' }}><IconClose size={12}/></button>
                  </span>
                ))}
              </div>
              {/* Input nueva nota, con sugerencias del catálogo */}
              <CampoNota
                valor={nuevaNota[tipo]}
                onCambiar={v => setNuevaNota(p => ({ ...p, [tipo]: v }))}
                onAgregar={nota => agregarNotaDirecta(tipo, nota)}
                yaPuestas={notas[tipo]}
                catalogo={catalogoPlano}
                inp={inp}
              />
            </div>
          ))}
        </div>

        {/* Elegir de la lista completa, por familias */}
        <PaletaNotas
          onAgregar={(tipo, nota) => agregarNotaDirecta(tipo, nota)}
          notas={notas}
          familias={familiasNotas}
          onCrear={crearNotaCatalogo}
          onEliminar={eliminarNotaCatalogo}
        />
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
                  background: d.id_referencia ? 'rgba(154,171,128,0.07)' : 'rgba(201,168,76,0.03)',
                  border: `1px solid ${d.id_referencia ? 'rgba(154,171,128,0.3)' : 'rgba(201,168,76,0.12)'}`,
                  borderRadius:6, padding:'10px 12px',
                  transition:'background 0.2s, border-color 0.2s',
                }}>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.14em', color: d.id_referencia ? 'rgba(154,171,128,0.9)' : '#9A9180', marginBottom:8 }}>
                    {d.id_referencia
                  ? <><IconCheck size={11} sw={2.6}/> VINCULADO AL CATÁLOGO</>
                  : 'VINCULAR A PRODUCTO DEL CATÁLOGO'}
                  </div>

                  {d.id_referencia ? (
                    /* Estado vinculado: muestra el nombre del producto + botón quitar */
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(154,171,128,0.8)', flexShrink:0 }} />
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
                        style={{ background:'transparent', border:'1px solid rgba(196,102,76,0.4)', borderRadius:4, padding:'3px 10px', color:'#C4664C', cursor:'pointer', fontSize:10, fontFamily:'Cinzel,serif', letterSpacing:'0.08em', whiteSpace:'nowrap', flexShrink:0 }}>
                        Quitar
                      </button>
                    </div>
                  ) : (
                    /* Buscador. Antes era un desplegable con el catálogo
                       entero: con más de trescientas referencias,
                       encontrar un perfume ahí es ir bajando a ciegas. */
                    <BuscadorProducto
                      productos={todosProductos.filter(p => String(p.id_producto) !== String(id))}
                      onElegir={idProd => vincularDupe(i, idProd)}
                      inp={inp}
                    />
                  )}
                </div>
              </div>
              <button onClick={() => setDupes(prev => prev.filter((_,idx)=>idx!==i))}
                style={{ background:'none', border:'none', color:'#C4664C', cursor:'pointer', fontSize:18, flexShrink:0, display:'flex' }}><IconClose size={14}/></button>
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
                style={{ background:'none', border:'1px solid rgba(196,102,76,0.3)', borderRadius:4, padding:'3px 8px', color:'#C4664C', cursor:'pointer', fontSize:10, flexShrink:0 }}>
                Eliminar
              </button>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

function sinTildes(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/* Campo para escribir una nota, con sugerencias del catálogo.

   Antes era un campo de texto a secas. El mismo ingrediente acababa
   escrito de varias formas según el día —"Bergamota", "bergamota",
   "Bergamotta"— y así no hay manera de agrupar ni de buscar por
   notas más adelante. */
function CampoNota({ valor, onCambiar, onAgregar, yaPuestas, catalogo, inp }) {
  const [conFoco, setConFoco] = useState(false);

  const q = sinTildes(valor.trim().toLowerCase());
  const sugerencias = !q ? [] : catalogo
    .filter(n => sinTildes(n.toLowerCase()).includes(q))
    .filter(n => !yaPuestas.some(p => p.toLowerCase() === n.toLowerCase()))
    .slice(0, 6);

  /* Una nota que no está en el catálogo se puede añadir igual: hay
     casas de nicho con ingredientes que no salen en ninguna lista. */
  const texto      = valor.trim();
  const esConocida = catalogo.some(n => n.toLowerCase() === texto.toLowerCase());

  return (
    <div style={{ position:'relative' }}>
      <div style={{ display:'flex', gap:6 }}>
        <input style={{ ...inp, flex:1, fontSize:12 }} placeholder="Escribe o elige abajo"
          value={valor}
          onFocus={() => setConFoco(true)}
          onBlur={() => setTimeout(() => setConFoco(false), 150)}
          onChange={e => onCambiar(e.target.value)}
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            /* Enter toma la primera sugerencia si la hay: es lo que
               espera quien escribe "berga" y ve "Bergamota" debajo. */
            onAgregar(sugerencias[0] && !esConocida ? sugerencias[0] : valor);
          }} />
        <button onClick={() => onAgregar(valor)}
          style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'6px 10px', color:'#C9A84C', cursor:'pointer', fontSize:14 }}>+</button>
      </div>

      {conFoco && sugerencias.length > 0 && (
        <div style={{
          position:'absolute', top:'100%', left:0, right:0, zIndex:30, marginTop:4,
          background:'#16160f', border:'1px solid rgba(201,168,76,0.3)',
          borderRadius:6, overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.6)',
        }}>
          {sugerencias.map(n => (
            <button key={n} onMouseDown={() => onAgregar(n)}
              style={{ width:'100%', background:'none', border:'none', padding:'7px 10px', textAlign:'left', color:'#E8DCC8', fontSize:12, cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {n}
            </button>
          ))}
        </div>
      )}

      {texto !== '' && !esConocida && sugerencias.length === 0 && (
        <div style={{ fontSize:10, color:'#6B6355', marginTop:4 }}>
          No está en la lista; se añadirá tal cual
        </div>
      )}
    </div>
  );
}

/* Todas las notas, por familias, para elegir con el ratón.

   Cada nota lleva tres botones, uno por nivel de la pirámide: lo
   normal es saber que un perfume lleva bergamota y dudar de si va en
   salida o en corazón, no al revés.

   La lista se puede ampliar y recortar desde aquí mismo: es mientras
   se rellena una ficha cuando se descubre que falta un ingrediente,
   no en otra pantalla a la que habría que ir y volver. */
function PaletaNotas({ onAgregar, notas, familias, onCrear, onEliminar }) {
  const [abierta,   setAbierta]   = useState(null);
  const [nueva,     setNueva]     = useState('');
  const [guardando, setGuardando] = useState(false);

  function nivelesDe(nota) {
    return ['salida', 'corazon', 'fondo'].filter(
      t => notas[t].some(n => n.toLowerCase() === nota.toLowerCase())
    );
  }

  async function crear() {
    const nombre = nueva.trim();
    if (!nombre || !abierta) return;
    setGuardando(true);
    const ok = await onCrear(nombre, abierta);
    setGuardando(false);
    if (ok) setNueva('');
  }

  return (
    <div style={{ marginTop:22, borderTop:'1px solid rgba(201,168,76,0.12)', paddingTop:16 }}>
      <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.15em', color:'#C9A84C', marginBottom:4 }}>
        NOTAS FRECUENTES
      </div>
      <p style={{ fontSize:11, color:'#6B6355', margin:'0 0 12px' }}>
        Abre una familia y pulsa S, C o F para ponerla en salida, corazón o fondo.
      </p>

      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {familias.map(f => (
          <button key={f.familia}
            onClick={() => { setAbierta(a => a === f.familia ? null : f.familia); setNueva(''); }}
            style={{
              background: abierta === f.familia ? `${f.color}22` : 'transparent',
              border: `1px solid ${abierta === f.familia ? f.color : 'rgba(201,168,76,0.18)'}`,
              borderRadius:20, padding:'5px 13px', cursor:'pointer',
              color: abierta === f.familia ? f.color : '#9A9180', fontSize:11,
            }}>
            {f.familia}
            <span style={{ marginLeft:6, opacity:0.6, fontSize:10 }}>{f.notas.length}</span>
          </button>
        ))}
      </div>

      {abierta && (
        <>
        <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:7 }}>
          {(familias.find(f => f.familia === abierta)?.notas || []).map(nota => {
            const puesta = nivelesDe(nota.nombre);
            return (
              <div key={nota.id} style={{
                display:'flex', alignItems:'center', gap:6,
                background:'#0f0f0d', border:'1px solid rgba(201,168,76,0.12)',
                borderRadius:18, padding:'3px 5px 3px 11px',
              }}>
                <span style={{ fontSize:12, color: puesta.length ? '#C9A84C' : '#C8C0B0' }}>{nota.nombre}</span>
                <span style={{ display:'flex', gap:2 }}>
                  {[['salida','S'], ['corazon','C'], ['fondo','F']].map(([tipo, letra]) => {
                    const activa = puesta.includes(tipo);
                    return (
                      <button key={tipo}
                        onClick={() => onAgregar(tipo, nota.nombre)}
                        disabled={activa}
                        title={activa ? `Ya está en ${tipo}` : `Añadir a ${tipo}`}
                        style={{
                          width:19, height:19, borderRadius:'50%',
                          background: activa ? 'rgba(154,171,128,0.22)' : 'transparent',
                          border: `1px solid ${activa ? 'rgba(154,171,128,0.5)' : 'rgba(201,168,76,0.3)'}`,
                          color: activa ? '#9AAB80' : '#C9A84C',
                          cursor: activa ? 'default' : 'pointer',
                          fontSize:9, fontFamily:'Cinzel,serif', padding:0,
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                        {letra}
                      </button>
                    );
                  })}
                  {/* Quitar del catálogo de sugerencias */}
                  <button onClick={() => onEliminar(nota)}
                    title="Quitar de la lista de sugerencias"
                    style={{
                      width:19, height:19, borderRadius:'50%', background:'transparent',
                      border:'1px solid rgba(196,102,76,0.25)', color:'#C4664C',
                      cursor:'pointer', padding:0, marginLeft:2,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                    <IconClose size={9} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>

        {/* Añadir una nota nueva a esta familia */}
        <div style={{ marginTop:12, display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          <input
            value={nueva}
            onChange={e => setNueva(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); crear(); } }}
            placeholder={`Nueva nota en ${abierta}...`}
            style={{
              flex:'1 1 200px', background:'#151513', border:'1px solid rgba(201,168,76,0.18)',
              borderRadius:6, padding:'7px 11px', color:'#E8DCC8', fontSize:12, outline:'none',
            }} />
          <button onClick={crear} disabled={!nueva.trim() || guardando}
            style={{
              background: nueva.trim() ? 'rgba(201,168,76,0.12)' : 'transparent',
              border:'1px solid rgba(201,168,76,0.3)', borderRadius:6, padding:'7px 15px',
              color:'#C9A84C', cursor: nueva.trim() ? 'pointer' : 'not-allowed',
              fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.08em',
              opacity: nueva.trim() ? 1 : 0.5, whiteSpace:'nowrap',
            }}>
            {guardando ? 'GUARDANDO...' : '+ CREAR NOTA'}
          </button>
        </div>
        <p style={{ fontSize:10, color:'#5a5448', margin:'8px 0 0', lineHeight:1.5 }}>
          Las notas que crees quedan disponibles para todos los perfumes. Quitar
          una de la lista no la borra de los perfumes que ya la tienen.
        </p>
        </>
      )}
    </div>
  );
}

/* Buscador de productos del catálogo.

   Reemplaza al desplegable que listaba las más de trescientas
   referencias de golpe. Muestra como mucho ocho coincidencias: una
   lista larga dentro de una tarjeta vuelve al mismo problema. */
function BuscadorProducto({ productos, onElegir, inp }) {
  const [texto, setTexto] = useState('');

  const q = texto.trim().toLowerCase();
  const encontrados = q.length < 2 ? [] : productos.filter(p =>
    (p.nombre || '').toLowerCase().includes(q) ||
    (p.marca  || '').toLowerCase().includes(q)
  ).slice(0, 8);

  return (
    <div>
      <input
        style={{ ...inp, fontSize:12 }}
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="Escribe el nombre o la marca del perfume..." />

      {q.length >= 2 && (
        encontrados.length === 0 ? (
          <div style={{ fontSize:11, color:'#6B6355', padding:'8px 2px' }}>
            Ningún producto del catálogo coincide con “{texto}”
          </div>
        ) : (
          <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:3 }}>
            {encontrados.map(p => (
              <button key={p.id_producto}
                onClick={() => { onElegir(p.id_producto); setTexto(''); }}
                style={{
                  background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.15)',
                  borderRadius:5, padding:'7px 10px', cursor:'pointer', textAlign:'left',
                  color:'#E8DCC8', fontSize:12, display:'flex', justifyContent:'space-between', gap:8,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}>
                <span>{p.nombre}</span>
                {p.marca && <span style={{ color:'#9A9180', fontSize:11, whiteSpace:'nowrap' }}>{p.marca}</span>}
              </button>
            ))}
          </div>
        )
      )}
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