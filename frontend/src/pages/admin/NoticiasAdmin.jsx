import { useState, useEffect, useRef } from 'react';
import { subirImagen, subirVideo } from '../../services/api';

/* ── SVG Icons ───────────────────────────────────────────────── */
function Ico({ d, size = 16, color = 'currentColor', sw = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const ICO = {
  upload:  <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
  video:   <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
  image:   <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  link:    <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  close:   <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  check:   <polyline points="20 6 9 17 4 12"/>,
  trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
  play:    <><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>,
  spinner: <><path d="M21 12a9 9 0 1 1-6.219-8.56"/></>,
  save:    <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
};

/* ── Estilos base ────────────────────────────────────────────── */
const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '9px 12px', color: '#E8DCC8', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif' };
const label = { fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.15em', display: 'block', marginBottom: 6 };
const sectionHeader = { padding: '12px 20px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const sectionTitle  = { fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C' };

function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

/* ── Zona de subida de video ─────────────────────────────────── */
function VideoUploader({ videoData, onChange }) {
  const [tab,       setTab]       = useState('archivo'); // 'archivo' | 'url'
  const [subiendo,  setSubiendo]  = useState(false);
  const [progreso,  setProgreso]  = useState(0);
  const [error,     setError]     = useState('');
  const fileRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    const MAX_MB = 500;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_MB} MB permitidos`);
      return;
    }
    setError('');
    setSubiendo(true);
    setProgreso(0);
    const res = await subirVideo(file, p => setProgreso(p));
    setSubiendo(false);
    if (res.ok) {
      onChange({ ...videoData, url: res.url, nombreArchivo: res.nombre });
    } else {
      setError(res.mensaje || 'Error al subir el video');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function quitarVideo() {
    onChange({ ...videoData, url: '', nombreArchivo: '' });
    setProgreso(0);
    setError('');
  }

  const tieneVideo   = !!videoData.url;
  const esArchivo    = tieneVideo && videoData.url.startsWith('/OrientPerfumesV2/');

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'archivo', label: 'Subir archivo', icon: ICO.upload },
          { key: 'url',     label: 'URL externa',   icon: ICO.link   },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', cursor: 'pointer', border: `1px solid ${tab === t.key ? '#C9A84C' : 'rgba(201,168,76,0.15)'}`, background: tab === t.key ? 'rgba(201,168,76,0.1)' : 'transparent', color: tab === t.key ? '#C9A84C' : '#9A9180', transition: 'all 0.2s' }}>
            <Ico d={t.icon} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: subir archivo */}
      {tab === 'archivo' && (
        <>
          {tieneVideo && esArchivo ? (
            /* Video cargado */
            <div style={{ background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, overflow: 'hidden' }}>
              <video src={videoData.url} controls style={{ width: '100%', display: 'block', maxHeight: 220, background: '#000' }} />
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#C9A84C', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={ICO.check} size={13} color="#4caf50" sw={2.5} />
                    Video subido correctamente
                  </div>
                  {videoData.nombreArchivo && <div style={{ fontSize: 11, color: '#6B6355', marginTop: 2 }}>{videoData.nombreArchivo}</div>}
                </div>
                <button onClick={quitarVideo}
                  style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 6, padding: '5px 10px', color: '#e05252', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Ico d={ICO.trash} size={12} color="#e05252" />
                  Quitar
                </button>
              </div>
            </div>
          ) : subiendo ? (
            /* Progreso de subida */
            <div style={{ background: '#1a1a18', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ marginBottom: 12, color: '#C9A84C', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
              <div style={{ fontSize: 13, color: '#9A9180', marginBottom: 10 }}>Subiendo video... {progreso}%</div>
              <div style={{ height: 6, background: 'rgba(201,168,76,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progreso}%`, background: '#C9A84C', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          ) : (
            /* Zona de drop */
            <div
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current.click()}
              style={{ border: '2px dashed rgba(201,168,76,0.25)', borderRadius: 8, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.5 }}>
                <Ico d={ICO.video} size={36} color="#C9A84C" sw={1.2} />
              </div>
              <div style={{ fontSize: 13, color: '#C9A84C', marginBottom: 4 }}>Arrastra tu video aquí o haz clic para seleccionar</div>
              <div style={{ fontSize: 11, color: '#6B6355' }}>MP4, MOV, WebM, AVI · Máximo 500 MB</div>
              <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/avi,.mp4,.mov,.webm,.avi,.mkv"
                style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}
          {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e05252' }}>{error}</div>}
        </>
      )}

      {/* Tab: URL externa */}
      {tab === 'url' && (
        <div>
          <div style={{ fontSize: 11, color: '#6B6355', marginBottom: 10 }}>Pega un enlace de YouTube, Vimeo o cualquier URL directa de video</div>
          <input style={inp} value={videoData.url} placeholder="https://..."
            onChange={e => onChange({ ...videoData, url: e.target.value, nombreArchivo: '' })} />
          {videoData.url && (
            <div style={{ marginTop: 10 }}>
              <video key={videoData.url} src={videoData.url} controls style={{ width: '100%', borderRadius: 6, maxHeight: 180, background: '#000' }}
                onError={e => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function NoticiasAdmin() {
  const [video,        setVideo]        = useState({ url: '', titulo: '', descripcion: '', nombreArchivo: '' });
  const [lanzamientos, setLanzamientos] = useState([]);
  const [comentarios,  setComentarios]  = useState([]);
  const [msg,          setMsg]          = useState(null);
  const [subiendo,     setSubiendo]     = useState({});  // { [id]: true }

  useEffect(() => {
    try { const r = localStorage.getItem('op_video');        if (r) setVideo(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_lanzamientos'); if (r) setLanzamientos(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_comentarios');  if (r) setComentarios(JSON.parse(r)); } catch {}
  }, []);

  function guardar() {
    localStorage.setItem('op_video',        JSON.stringify(video));
    localStorage.setItem('op_lanzamientos', JSON.stringify(lanzamientos));
    localStorage.setItem('op_comentarios',  JSON.stringify(comentarios));
    showMsg(true, 'Cambios guardados correctamente');
  }

  function showMsg(ok, texto) {
    setMsg({ ok, texto });
    setTimeout(() => setMsg(null), 3500);
  }

  /* ── Lanzamientos ── */
  function agregarLanzamiento() {
    setLanzamientos(p => [...p, { id: Date.now(), nombre: '', descripcion: '', badge: 'Nuevo', imagen: '' }]);
  }
  function updateLanz(id, key, val) {
    setLanzamientos(p => p.map(l => l.id === id ? { ...l, [key]: val } : l));
  }
  function eliminarLanz(id) {
    setLanzamientos(p => p.filter(l => l.id !== id));
  }

  async function handleLanzImg(id, file) {
    if (!file) return;
    setSubiendo(s => ({ ...s, [id]: true }));
    const res = await subirImagen(file);
    setSubiendo(s => ({ ...s, [id]: false }));
    if (res.ok) updateLanz(id, 'imagen', res.url);
    else showMsg(false, res.mensaje || 'Error al subir imagen');
  }

  /* ── Comentarios ── */
  function eliminarComentario(idx) {
    const nuevos = comentarios.filter((_, i) => i !== idx);
    setComentarios(nuevos);
    localStorage.setItem('op_comentarios', JSON.stringify(nuevos));
  }

  return (
    <div style={{ padding: 32, color: '#E8DCC8', maxWidth: 900, margin: '0 auto' }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Noticias</h1>
          <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>Gestiona el video, lanzamientos y comentarios</p>
        </div>
        <button onClick={guardar}
          style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '9px 20px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Ico d={ICO.save} size={14} color="#0a0a08" />
          Guardar Cambios
        </button>
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 16px', background: msg.ok ? 'rgba(76,175,80,0.1)' : 'rgba(224,82,82,0.1)', border: `1px solid ${msg.ok ? 'rgba(76,175,80,0.3)' : 'rgba(224,82,82,0.3)'}`, borderRadius: 6, fontSize: 13 }}>
          <Ico d={msg.ok ? ICO.check : ICO.close} size={15} color={msg.ok ? '#4caf50' : '#e05252'} sw={2.5} />
          {msg.texto}
        </div>
      )}

      {/* ── Video destacado ── */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
        <div style={sectionHeader}>
          <span style={sectionTitle}>VIDEO DESTACADO</span>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <VideoUploader videoData={video} onChange={setVideo} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={label}>TÍTULO</span>
              <input style={inp} value={video.titulo} onChange={e => setVideo(v => ({ ...v, titulo: e.target.value }))} placeholder="Título del video" />
            </div>
            <div>
              <span style={label}>DESCRIPCIÓN</span>
              <input style={inp} value={video.descripcion} onChange={e => setVideo(v => ({ ...v, descripcion: e.target.value }))} placeholder="Descripción breve" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Lanzamientos ── */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
        <div style={sectionHeader}>
          <span style={sectionTitle}>NUEVOS LANZAMIENTOS</span>
          <button onClick={agregarLanzamiento}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, padding: '5px 12px', color: '#C9A84C', cursor: 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
            <Ico d={ICO.plus} size={12} color="#C9A84C" sw={2} />
            Agregar
          </button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {lanzamientos.length === 0 && (
            <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>No hay lanzamientos. Haz clic en "Agregar" para crear uno.</p>
          )}
          {lanzamientos.map(l => (
            <div key={l.id} style={{ background: '#0f0f0d', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                {/* Zona imagen */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 86, height: 86, borderRadius: 6, background: '#1a1a18', border: '1px solid rgba(201,168,76,0.12)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {subiendo[l.id] ? (
                      <div style={{ color: '#C9A84C' }}><Spinner /></div>
                    ) : l.imagen ? (
                      <img src={l.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <Ico d={ICO.image} size={28} color="#6B6355" sw={1.2} />
                    )}
                  </div>
                  <label style={{ ...label, marginBottom: 0, cursor: 'pointer', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ico d={ICO.upload} size={11} color="#C9A84C" />
                    IMAGEN
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => handleLanzImg(l.id, e.target.files[0])} />
                  </label>
                </div>

                {/* Campos */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <span style={label}>NOMBRE</span>
                    <input style={inp} value={l.nombre} onChange={e => updateLanz(l.id, 'nombre', e.target.value)} placeholder="Nombre del perfume" />
                  </div>
                  <div>
                    <span style={label}>BADGE</span>
                    <select style={{ ...inp, padding: '7px 10px' }} value={l.badge} onChange={e => updateLanz(l.id, 'badge', e.target.value)}>
                      <option>Nuevo</option>
                      <option>Exclusivo</option>
                      <option>Oferta</option>
                      <option>Próximamente</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <span style={label}>DESCRIPCIÓN</span>
                    <input style={inp} value={l.descripcion} onChange={e => updateLanz(l.id, 'descripcion', e.target.value)} placeholder="Descripción breve" />
                  </div>
                </div>

                {/* Eliminar */}
                <button onClick={() => eliminarLanz(l.id)}
                  style={{ background: 'none', border: 'none', color: '#6B6355', cursor: 'pointer', padding: 4, flexShrink: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e05252'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6B6355'}>
                  <Ico d={ICO.trash} size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comentarios ── */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={sectionHeader}>
          <span style={sectionTitle}>COMENTARIOS ({comentarios.length})</span>
        </div>
        <div style={{ padding: 20 }}>
          {comentarios.length === 0 && (
            <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>No hay comentarios aún.</p>
          )}
          {comentarios.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8DCC8' }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: '#9A9180', marginTop: 3 }}>{c.texto}</div>
                <div style={{ fontSize: 10, color: 'rgba(201,168,76,0.45)', marginTop: 5 }}>{c.fecha}</div>
              </div>
              <button onClick={() => eliminarComentario(i)}
                style={{ background: 'none', border: 'none', color: '#6B6355', cursor: 'pointer', padding: 4, flexShrink: 0, marginLeft: 12, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#e05252'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B6355'}>
                <Ico d={ICO.trash} size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
