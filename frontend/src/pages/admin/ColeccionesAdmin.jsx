import { useState, useEffect } from 'react';

const COLECCIONES = ['Nicho', 'Oriental', 'Diseñador', 'Exclusivos'];
const KEY = 'op_colecciones_logos';

function getLogos() {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : { Nicho: [], Oriental: [], 'Diseñador': [], Exclusivos: [] };
  } catch { return { Nicho: [], Oriental: [], 'Diseñador': [], Exclusivos: [] }; }
}

export default function ColeccionesAdmin() {
  const [logos,   setLogos]   = useState(getLogos);
  const [activa,  setActiva]  = useState('Nicho');
  const [msg,     setMsg]     = useState('');

  function guardar() {
    localStorage.setItem(KEY, JSON.stringify(logos));
    setMsg('✓ Cambios guardados');
    setTimeout(() => setMsg(''), 3000);
  }

  function handleFile(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setLogos(prev => ({
          ...prev,
          [activa]: [...(prev[activa] || []), { id: Date.now() + Math.random(), nombre: file.name.replace(/\.[^.]+$/, ''), imagen: ev.target.result }]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function handleUrl(url, nombre) {
    if (!url) return;
    setLogos(prev => ({
      ...prev,
      [activa]: [...(prev[activa] || []), { id: Date.now(), nombre: nombre || 'Marca', imagen: url }]
    }));
  }

  function actualizarNombre(id, nombre) {
    setLogos(prev => ({
      ...prev,
      [activa]: prev[activa].map(l => l.id === id ? { ...l, nombre } : l)
    }));
  }

  function eliminar(id) {
    setLogos(prev => ({ ...prev, [activa]: prev[activa].filter(l => l.id !== id) }));
  }

  const items = logos[activa] || [];

  const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 12px', color: '#E8DCC8', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: 32, color: '#E8DCC8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Logos de Colecciones</h1>
          <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>Gestiona los logos de casas de perfumería por colección</p>
        </div>
        <button onClick={guardar} style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '8px 20px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em' }}>
          Guardar Cambios
        </button>
      </div>

      {msg && <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 6, fontSize: 13 }}>{msg}</div>}

      {/* Tabs de colecciones */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: 0 }}>
        {COLECCIONES.map(col => (
          <button key={col} onClick={() => setActiva(col)}
            style={{ background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.12em', color: activa === col ? '#C9A84C' : '#9A9180', borderBottom: activa === col ? '2px solid #C9A84C' : '2px solid transparent', marginBottom: -1, transition: 'all 0.2s' }}>
            {col.toUpperCase()}
            <span style={{ marginLeft: 6, background: 'rgba(201,168,76,0.15)', color: '#C9A84C', fontSize: 9, padding: '1px 6px', borderRadius: 10 }}>
              {(logos[col] || []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Agregar logos */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 14 }}>AGREGAR LOGOS A {activa.toUpperCase()}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Subir archivo */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.12em', marginBottom: 8 }}>SUBIR IMAGEN</div>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px', border: '2px dashed rgba(201,168,76,0.3)', borderRadius: 6, cursor: 'pointer', background: 'rgba(201,168,76,0.03)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}>
              <span style={{ fontSize: 28 }}>📁</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#C9A84C', letterSpacing: '0.1em' }}>SELECCIONAR IMÁGENES</span>
              <span style={{ fontSize: 11, color: '#9A9180' }}>PNG, JPG, SVG — múltiples archivos</span>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
            </label>
          </div>
          {/* Por URL */}
          <UrlForm onAgregar={handleUrl} inp={inp} />
        </div>
      </div>

      {/* Grid de logos */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', background: '#111', borderRadius: 8, border: '1px solid rgba(201,168,76,0.1)' }}>
          NO HAY LOGOS EN ESTA COLECCIÓN — AGREGA EL PRIMERO
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {items.map(logo => (
            <div key={logo.id} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
              {/* Imagen */}
              <div style={{ background: '#1a1a18', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
                <img src={logo.imagen} alt={logo.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
              {/* Nombre editable */}
              <div style={{ padding: 10 }}>
                <input value={logo.nombre} onChange={e => actualizarNombre(logo.id, e.target.value)}
                  style={{ ...inp, fontSize: 12, padding: '5px 8px', marginBottom: 6 }} placeholder="Nombre de la casa" />
                <button onClick={() => eliminar(logo.id)}
                  style={{ width: '100%', background: 'transparent', border: '1px solid rgba(224,82,82,0.4)', borderRadius: 4, padding: '4px', color: '#e05252', cursor: 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
                  ✕ Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UrlForm({ onAgregar, inp }) {
  const [url,    setUrl]    = useState('');
  const [nombre, setNombre] = useState('');
  return (
    <div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.12em', marginBottom: 8 }}>PEGAR URL</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input style={inp} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la casa (ej: Creed)" />
        <input style={inp} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://... URL de la imagen" />
        <button onClick={() => { if (url) { onAgregar(url, nombre); setUrl(''); setNombre(''); } }}
          style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 6, padding: '8px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em' }}>
          + AGREGAR
        </button>
      </div>
    </div>
  );
}