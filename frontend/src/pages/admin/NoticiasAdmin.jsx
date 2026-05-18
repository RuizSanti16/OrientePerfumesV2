import { useState, useEffect } from 'react';

const IconBottle = ({ size = 28 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.1" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.2 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);

export default function NoticiasAdmin() {
  const [video, setVideo]             = useState({ url: '', titulo: '', descripcion: '' });
  const [lanzamientos, setLanzamientos] = useState([]);
  const [comentarios, setComentarios]   = useState([]);
  const [msg, setMsg]                   = useState('');

  useEffect(() => {
    try { const r = localStorage.getItem('op_video');        if (r) setVideo(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_lanzamientos'); if (r) setLanzamientos(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_comentarios');  if (r) setComentarios(JSON.parse(r)); } catch {}
  }, []);

  function guardar() {
    localStorage.setItem('op_video', JSON.stringify(video));
    localStorage.setItem('op_lanzamientos', JSON.stringify(lanzamientos));
    localStorage.setItem('op_comentarios', JSON.stringify(comentarios));
    setMsg('✓ Cambios guardados correctamente');
    setTimeout(() => setMsg(''), 3000);
  }

  function agregarLanzamiento() {
    setLanzamientos(prev => [...prev, { id: Date.now(), nombre: '', descripcion: '', badge: 'Nuevo', imagen: '' }]);
  }

  function updateLanz(id, key, val) {
    setLanzamientos(prev => prev.map(l => l.id === id ? { ...l, [key]: val } : l));
  }

  function eliminarLanz(id) {
    setLanzamientos(prev => prev.filter(l => l.id !== id));
  }

  function handleLanzImg(id, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => updateLanz(id, 'imagen', e.target.result);
    reader.readAsDataURL(file);
  }

  function eliminarComentario(idx) {
    setComentarios(prev => prev.filter((_, i) => i !== idx));
  }

  const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 12px', color: '#E8DCC8', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: 32, color: '#E8DCC8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Noticias</h1>
          <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>Gestiona el video, lanzamientos y comentarios</p>
        </div>
        <button onClick={guardar} style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '8px 20px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em' }}>Guardar Cambios</button>
      </div>

      {msg && <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 6, fontSize: 13 }}>{msg}</div>}

      {/* ── Video ── */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C' }}>VIDEO DESTACADO</span>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>URL DEL VIDEO</label>
            <input style={inp} value={video.url} onChange={e => setVideo(v => ({ ...v, url: e.target.value }))} placeholder="https://... o ruta local" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>TÍTULO</label>
              <input style={inp} value={video.titulo} onChange={e => setVideo(v => ({ ...v, titulo: e.target.value }))} placeholder="Título del video" />
            </div>
            <div>
              <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>DESCRIPCIÓN</label>
              <input style={inp} value={video.descripcion} onChange={e => setVideo(v => ({ ...v, descripcion: e.target.value }))} placeholder="Descripción breve" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Lanzamientos ── */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C' }}>NUEVOS LANZAMIENTOS</span>
          <button onClick={agregarLanzamiento} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 4, padding: '4px 12px', color: '#C9A84C', cursor: 'pointer', fontSize: 11 }}>+ Agregar</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {lanzamientos.length === 0 && <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>No hay lanzamientos. Haz clic en "+ Agregar" para crear uno.</p>}
          {lanzamientos.map(l => (
            <div key={l.id} style={{ background: '#0f0f0d', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 6, padding: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Imagen */}
                <div style={{ flexShrink: 0 }}>
                  {l.imagen
                    ? <img src={l.imagen} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} alt="" />
                    : <div style={{ width: 80, height: 80, background: 'rgba(201,168,76,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBottle size={28}/></div>}
                  <label style={{ display: 'block', marginTop: 6, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 9, color: '#C9A84C', cursor: 'pointer', letterSpacing: '0.1em' }}>
                    IMAGEN
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleLanzImg(l.id, e.target.files[0])} />
                  </label>
                </div>
                {/* Campos */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>NOMBRE</label>
                    <input style={inp} value={l.nombre} onChange={e => updateLanz(l.id,'nombre',e.target.value)} placeholder="Nombre del perfume" />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>BADGE</label>
                    <select style={{ ...inp, padding: '6px 8px' }} value={l.badge} onChange={e => updateLanz(l.id,'badge',e.target.value)}>
                      <option>Nuevo</option><option>Exclusivo</option><option>Oferta</option><option>Próximamente</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>DESCRIPCIÓN</label>
                    <input style={inp} value={l.descripcion} onChange={e => updateLanz(l.id,'descripcion',e.target.value)} placeholder="Descripción breve" />
                  </div>
                </div>
                <button onClick={() => eliminarLanz(l.id)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comentarios ── */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C' }}>COMENTARIOS ({comentarios.length})</span>
        </div>
        <div style={{ padding: 20 }}>
          {comentarios.length === 0 && <p style={{ color: '#9A9180', fontSize: 13 }}>No hay comentarios aún.</p>}
          {comentarios.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8DCC8' }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: '#9A9180', marginTop: 2 }}>{c.texto}</div>
                <div style={{ fontSize: 10, color: 'rgba(201,168,76,0.5)', marginTop: 4 }}>{c.fecha}</div>
              </div>
              <button onClick={() => eliminarComentario(i)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}