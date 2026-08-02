import { useState, useEffect } from 'react';
import { subirImagen } from '../../services/api';
import { MensajeEstado } from '../../components/Icons';

const COLECCIONES = ['Nicho', 'Oriental', 'Diseñador', 'Exclusivos'];
const KEY         = 'op_colecciones_logos';

function getLogos() {
  try {
    const r = localStorage.getItem(KEY);
    return r
      ? JSON.parse(r)
      : { Nicho: [], Oriental: [], 'Diseñador': [], Exclusivos: [] };
  } catch {
    return { Nicho: [], Oriental: [], 'Diseñador': [], Exclusivos: [] };
  }
}

/* Icono SVG subir */
const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={22} height={22}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export default function ColeccionesAdmin() {
  const [logos,     setLogos]     = useState(getLogos);
  const [activa,    setActiva]    = useState('Nicho');
  const [msg, setMsg] = useState(null);
  const [subiendo,  setSubiendo]  = useState(false);

  function guardar() {
    localStorage.setItem(KEY, JSON.stringify(logos));
    setMsg({ ok: true, texto: 'Cambios guardados' });
    setTimeout(() => setMsg(null), 3000);
  }

  function mostrarMsg(ok, texto) {
    setMsg({ ok, texto });
    setTimeout(() => setMsg(null), 4000);
  }

  /* ── Subir uno o varios archivos ── */
  async function handleFile(e) {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (!files.length) return;
    setSubiendo(true);

    for (const file of files) {
      try {
        const res = await subirImagen(file);
        if (res.ok) {
          const nombre = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
          setLogos(prev => ({
            ...prev,
            [activa]: [
              ...(prev[activa] || []),
              { id: Date.now() + Math.random(), nombre, imagen: res.url },
            ],
          }));
        } else {
          mostrarMsg(false, 'Error al subir ' + file.name + ': ' + (res.mensaje || 'error desconocido'));
        }
      } catch {
        mostrarMsg(false, 'Error de conexión al subir ' + file.name);
      }
    }

    setSubiendo(false);
  }

  function handleUrl(url, nombre) {
    if (!url.trim()) return;
    setLogos(prev => ({
      ...prev,
      [activa]: [
        ...(prev[activa] || []),
        { id: Date.now(), nombre: nombre || 'Marca', imagen: url.trim() },
      ],
    }));
  }

  function actualizarNombre(id, nombre) {
    setLogos(prev => ({
      ...prev,
      [activa]: prev[activa].map(l => l.id === id ? { ...l, nombre } : l),
    }));
  }

  function eliminar(id) {
    setLogos(prev => ({ ...prev, [activa]: prev[activa].filter(l => l.id !== id) }));
  }

  const items = logos[activa] || [];
  const total = Object.values(logos).reduce((s, arr) => s + (arr?.length || 0), 0);

  const inp = {
    width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 6, padding: '8px 12px', color: '#E8DCC8', fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif',
  };

  return (
    <div style={{ padding: 32, color: '#E8DCC8' }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Logos de Marcas</h1>
          <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>
            Los logos se muestran en el marquee de la sección Colecciones · {total} logo{total !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button onClick={guardar}
          style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '8px 20px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em' }}>
          Guardar Cambios
        </button>
      </div>

      {/* Mensaje */}
      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} />}

      {/* Tabs por colección */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: 0, flexWrap: 'wrap' }}>
        {COLECCIONES.map(col => (
          <button key={col} onClick={() => setActiva(col)}
            style={{
              background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.12em',
              color: activa === col ? '#C9A84C' : '#9A9180',
              borderBottom: activa === col ? '2px solid #C9A84C' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.2s',
            }}>
            {col.toUpperCase()}
            <span style={{ marginLeft: 6, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', fontSize: 9, padding: '2px 7px', borderRadius: 10 }}>
              {(logos[col] || []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Panel de agregar */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 16 }}>
          AGREGAR LOGOS A {activa.toUpperCase()}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Subir archivo */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.12em', marginBottom: 8 }}>
              SUBIR IMAGEN (PNG, JPG, WEBP, SVG...)
            </div>
            <label
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '28px 20px',
                border: '2px dashed rgba(201,168,76,0.3)', borderRadius: 8,
                cursor: subiendo ? 'wait' : 'pointer',
                background: subiendo ? 'rgba(201,168,76,0.04)' : 'transparent',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { if (!subiendo) e.currentTarget.style.borderColor = '#C9A84C'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}>

              {subiendo ? (
                <>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#C9A84C', letterSpacing: '0.1em' }}>SUBIENDO...</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#C9A84C', opacity: 0.7 }}><IconUpload /></span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#C9A84C', letterSpacing: '0.1em' }}>SELECCIONAR IMÁGENES</span>
                  <span style={{ fontSize: 11, color: '#9A9180' }}>Múltiples archivos permitidos</span>
                </>
              )}

              <input
                type="file" accept="image/*" multiple
                style={{ display: 'none' }}
                onChange={handleFile}
                disabled={subiendo} />
            </label>
          </div>

          {/* Por URL */}
          <UrlForm onAgregar={handleUrl} inp={inp} />
        </div>
      </div>

      {/* Grid de logos */}
      {items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px', color: '#9A9180',
          fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em',
          background: '#111', borderRadius: 8, border: '1px dashed rgba(201,168,76,0.1)',
        }}>
          NO HAY LOGOS EN ESTA COLECCIÓN — AGREGA EL PRIMERO
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {items.map(logo => (
            <LogoCard
              key={logo.id}
              logo={logo}
              inp={inp}
              onNombre={nombre => actualizarNombre(logo.id, nombre)}
              onEliminar={() => eliminar(logo.id)}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Tarjeta individual de logo ── */
function LogoCard({ logo, inp, onNombre, onEliminar }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Preview del logo */}
      <div style={{ background: '#0f0f0d', height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        {imgError ? (
          <div style={{ color: '#C4664C', fontSize: 10, fontFamily: 'Cinzel, serif', textAlign: 'center', letterSpacing: '0.1em' }}>ERROR<br/>DE IMAGEN</div>
        ) : (
          <img
            src={logo.imagen} alt={logo.nombre}
            onError={() => setImgError(true)}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
          />
        )}
      </div>

      {/* Nombre editable + eliminar */}
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          value={logo.nombre}
          onChange={e => onNombre(e.target.value)}
          style={{ ...inp, fontSize: 12, padding: '5px 8px' }}
          placeholder="Nombre de la marca"
        />
        <button onClick={onEliminar}
          style={{ width: '100%', background: 'transparent', border: '1px solid rgba(196,102,76,0.35)', borderRadius: 4, padding: '5px', color: '#C4664C', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', transition: 'border-color 0.2s, background 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,102,76,0.07)'; e.currentTarget.style.borderColor = '#C4664C'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,102,76,0.35)'; }}>
          QUITAR
        </button>
      </div>
    </div>
  );
}

/* ── Agregar por URL ── */
function UrlForm({ onAgregar, inp }) {
  const [url,    setUrl]    = useState('');
  const [nombre, setNombre] = useState('');

  function agregar() {
    if (!url.trim()) return;
    onAgregar(url, nombre || 'Marca');
    setUrl('');
    setNombre('');
  }

  return (
    <div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.12em', marginBottom: 8 }}>
        AGREGAR POR URL
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input style={inp} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la marca (ej: Creed)" />
        <input style={inp} value={url}    onChange={e => setUrl(e.target.value)}    placeholder="https://... URL de la imagen" />
        <button
          onClick={agregar}
          disabled={!url.trim()}
          style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 6, padding: '10px 8px', color: '#C9A84C', cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em', opacity: url.trim() ? 1 : 0.5, transition: 'background 0.2s' }}
          onMouseEnter={e => { if (url.trim()) e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          + AGREGAR
        </button>
      </div>
    </div>
  );
}
