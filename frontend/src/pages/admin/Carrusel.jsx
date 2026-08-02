import { useState } from 'react';
import { subirImagen } from '../../services/api';
import { MensajeEstado } from '../../components/Icons';

/* ── Icono subir ── */
const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" width={30} height={30} style={{ opacity: 0.55 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const DEFAULTS = [
  { id: 1, label: 'Perfumería Nicho',   titulo: 'Tesoros\nOlfativos',  subtitulo: 'Las más exclusivas casas de nicho en un solo lugar', btn1: 'Descubrir Nicho',     btn2: 'Ver Catálogo',    imagen: '' },
  { id: 2, label: 'Colección Oriental', titulo: 'Aromas\ndel Oriente', subtitulo: 'Oud, Ambar, Sándalo y Musk en su máxima expresión',   btn1: 'Explorar Colección', btn2: 'Ver Novedades',   imagen: '' },
  { id: 3, label: 'Alta Perfumería',    titulo: 'Firmas\nde Autor',    subtitulo: 'Chanel, Dior, Tom Ford, Creed y las grandes maisons',  btn1: 'Ver Diseñadores',   btn2: 'Nuestras Marcas', imagen: '' },
];

function getSlides() {
  try {
    const r = localStorage.getItem('op_carrusel');
    if (!r) return DEFAULTS;
    /* Migrar datos viejos con BASE64 → mantener imagen vacía */
    return JSON.parse(r).map(s => ({
      ...s,
      imagen: s.imagen?.startsWith('data:') ? '' : (s.imagen || ''),
    }));
  } catch { return DEFAULTS; }
}

export default function Carrusel() {
  const [slides,    setSlides]    = useState(getSlides);
  const [msg, setMsg] = useState(null);
  const [uploading, setUploading] = useState({});   // { [slideId]: true|false }
  const [drag,      setDrag]      = useState({});   // { [slideId]: true|false }

  function update(id, key, val) {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s));
  }

  /* ── Subir imagen al servidor ── */
  async function subirSlide(id, file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      mostrarMsg(false, 'El archivo no es una imagen válida');
      return;
    }
    setUploading(p => ({ ...p, [id]: true }));
    try {
      const res = await subirImagen(file);
      if (res.ok) {
        update(id, 'imagen', res.url);
      } else {
        mostrarMsg(false, (res.mensaje || 'Error al subir'));
      }
    } catch {
      mostrarMsg(false, 'Error de conexión. Verifica que XAMPP esté activo.');
    }
    setUploading(p => ({ ...p, [id]: false }));
  }

  function onDrop(id, e) {
    e.preventDefault();
    setDrag(p => ({ ...p, [id]: false }));
    const file = e.dataTransfer.files[0];
    if (file) subirSlide(id, file);
  }

  function guardar() {
    try {
      /* Solo guardar campos de texto + URL (nunca BASE64) */
      const toSave = slides.map(s => ({
        id: s.id, label: s.label, titulo: s.titulo, subtitulo: s.subtitulo,
        btn1: s.btn1, btn2: s.btn2,
        imagen: s.imagen?.startsWith('data:') ? '' : (s.imagen || ''),
      }));
      localStorage.setItem('op_carrusel', JSON.stringify(toSave));
      mostrarMsg(true, 'Guardado. Recarga el inicio para verlo.');
    } catch {
      mostrarMsg(false, 'Error al guardar.');
    }
  }

  function restaurar() {
    if (!confirm('¿Restaurar el carrusel a los valores originales?')) return;
    localStorage.removeItem('op_carrusel');
    setSlides(DEFAULTS);
    mostrarMsg(true, 'Carrusel restaurado');
  }

  function mostrarMsg(ok, texto) {
    setMsg({ ok, texto });
    setTimeout(() => setMsg(null), 4000);
  }

  const inp = {
    width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 6, padding: '8px 12px', color: '#E8DCC8', fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif',
  };
  const fieldLabel = {
    fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em',
    color: '#9A9180', marginBottom: 5, display: 'block',
  };

  return (
    <div style={{ padding: 32, color: '#E8DCC8' }}>

      {/* ── Cabecera ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Carrusel Hero</h1>
          <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>Gestiona las imágenes y textos de los 3 slides del carrusel principal</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={restaurar}
            style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 16px', color: '#9A9180', cursor: 'pointer', fontSize: 13 }}>
            Restaurar
          </button>
          <button onClick={guardar}
            style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '8px 20px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em' }}>
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* ── Mensaje ── */}
      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} style={{ marginBottom: 20 }} />}

      {/* ── Slides ── */}
      {slides.map(s => (
        <div key={s.id} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 20, overflow: 'hidden' }}>

          {/* Header del slide */}
          <div style={{ padding: '12px 20px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C' }}>SLIDE {s.id}</span>
          </div>

          <div style={{ padding: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>

            {/* ── Columna imagen ── */}
            <div style={{ flexShrink: 0, width: 180 }}>
              <span style={{ ...fieldLabel, marginBottom: 8 }}>IMAGEN DEL SLIDE</span>

              {/* Zona de subida / preview */}
              <label
                onDragOver={e => { e.preventDefault(); setDrag(p => ({ ...p, [s.id]: true })); }}
                onDragLeave={() => setDrag(p => ({ ...p, [s.id]: false }))}
                onDrop={e => onDrop(s.id, e)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: '100%', aspectRatio: '2/3', borderRadius: 8, cursor: 'pointer',
                  overflow: 'hidden', position: 'relative',
                  border: drag[s.id]
                    ? '2px solid #C9A84C'
                    : s.imagen ? '2px solid rgba(201,168,76,0.4)' : '2px dashed rgba(201,168,76,0.3)',
                  background: drag[s.id] ? 'rgba(201,168,76,0.07)' : s.imagen ? 'transparent' : 'rgba(201,168,76,0.03)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}>

                {uploading[s.id] ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#C9A84C', letterSpacing: '0.1em' }}>SUBIENDO...</span>
                  </div>
                ) : s.imagen ? (
                  <img src={s.imagen} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, textAlign: 'center' }}>
                    <IconUpload />
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.1em', lineHeight: 1.5 }}>
                      {drag[s.id] ? 'SUELTA AQUÍ' : 'SUBIR IMAGEN'}
                      <br />
                      <span style={{ opacity: 0.6 }}>o arrastra aquí</span>
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(154,145,128,0.5)', marginTop: 2 }}>JPG · PNG · WEBP · GIF</span>
                  </div>
                )}

                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => subirSlide(s.id, e.target.files[0])} />
              </label>

              {/* Quitar imagen */}
              {s.imagen && !uploading[s.id] && (
                <button onClick={() => update(s.id, 'imagen', '')}
                  style={{ marginTop: 8, width: '100%', background: 'transparent', border: '1px solid rgba(196,102,76,0.4)', borderRadius: 4, padding: '5px 0', color: '#C4664C', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
                  QUITAR IMAGEN
                </button>
              )}

              {/* URL manual */}
              <div style={{ marginTop: 10 }}>
                <span style={fieldLabel}>O PEGA UNA URL</span>
                <input style={{ ...inp, fontSize: 11 }}
                  value={s.imagen && !s.imagen.startsWith('/OrientPerfumesV2/backend/uploads') ? s.imagen : ''}
                  onChange={e => update(s.id, 'imagen', e.target.value)}
                  placeholder="https://..." />
              </div>
            </div>

            {/* ── Columna textos ── */}
            <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span style={{ ...fieldLabel, fontSize: 10, letterSpacing: '0.15em', color: '#C9A84C' }}>TEXTOS DEL SLIDE</span>

              {[
                ['label',     'Etiqueta superior',          'Ej: Perfumería Nicho'],
                ['titulo',    'Título  (\\n = salto línea)', 'Ej: Tesoros\\nOlfativos'],
                ['subtitulo', 'Subtítulo',                   'Ej: Las más exclusivas casas de nicho'],
                ['btn1',      'Botón 1',                     'Ej: Descubrir Nicho'],
                ['btn2',      'Botón 2',                     'Ej: Ver Catálogo'],
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <span style={fieldLabel}>{label.toUpperCase()}</span>
                  <input style={inp} value={s[key] || ''} onChange={e => update(s.id, key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>

          </div>
        </div>
      ))}

      {/* Spinner animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
