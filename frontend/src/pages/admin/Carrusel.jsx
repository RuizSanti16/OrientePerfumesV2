import { useState, useEffect } from 'react';

const DEFAULTS = [
  { id: 1, label: 'Perfumería Nicho',   titulo: 'Tesoros\nOlfativos',  subtitulo: 'Las más exclusivas casas de nicho en un solo lugar', btn1: 'Descubrir Nicho',     btn2: 'Ver Catálogo',    imagen: '', imgSize: 'cover', imgPosX: 50, imgPosY: 50, gradient: 'radial-gradient(ellipse at 70% 50%, rgba(139,105,20,0.25) 0%, transparent 60%), linear-gradient(135deg, #1a1208 0%, #0a0a08 50%, #12100a 100%)' },
  { id: 2, label: 'Colección Oriental', titulo: 'Aromas\ndel Oriente', subtitulo: 'Oud, Ambar, Sándalo y Musk en su máxima expresión',   btn1: 'Explorar Colección', btn2: 'Ver Novedades',  imagen: '', imgSize: 'cover', imgPosX: 50, imgPosY: 50, gradient: 'radial-gradient(ellipse at 65% 40%, rgba(120,80,15,0.3) 0%, transparent 55%), linear-gradient(150deg, #100d06 0%, #0a0a08 55%, #15120a 100%)' },
  { id: 3, label: 'Alta Perfumería',    titulo: 'Firmas\nde Autor',    subtitulo: 'Chanel, Dior, Tom Ford, Creed y las grandes maisons',   btn1: 'Ver Diseñadores',   btn2: 'Nuestras Marcas', imagen: '', imgSize: 'cover', imgPosX: 50, imgPosY: 50, gradient: 'radial-gradient(ellipse at 60% 50%, rgba(100,70,10,0.28) 0%, transparent 60%), linear-gradient(120deg, #0e0b05 0%, #0a0a08 50%, #131009 100%)' },
];

function getSlides() {
  try { const r = localStorage.getItem('op_carrusel'); return r ? JSON.parse(r) : DEFAULTS; } catch { return DEFAULTS; }
}

export default function Carrusel() {
  const [slides, setSlides] = useState(getSlides);
  const [msg, setMsg] = useState('');

  function update(id, key, val) {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s));
  }

  function handleFile(id, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => update(id, 'imagen', e.target.result);
    reader.readAsDataURL(file);
  }

  function quitarImagen(id) {
    update(id, 'imagen', '');
    update(id, 'imgSize', 'cover');
    update(id, 'imgPosX', 50);
    update(id, 'imgPosY', 50);
  }

  function guardar() {
    try {
      localStorage.setItem('op_carrusel', JSON.stringify(slides));
      setMsg('✓ Guardado. Recarga el inicio para verlo.');
    } catch {
      setMsg('✗ Error: almacenamiento lleno. Usa imágenes más pequeñas o por URL.');
    }
    setTimeout(() => setMsg(''), 4000);
  }

  function restaurar() {
    if (!confirm('¿Restaurar el carrusel a los valores originales?')) return;
    localStorage.removeItem('op_carrusel');
    setSlides(DEFAULTS);
    setMsg('✓ Carrusel restaurado');
    setTimeout(() => setMsg(''), 3000);
  }

  const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 12px', color: '#E8DCC8', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: 32, color: '#E8DCC8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Carrusel Hero</h1>
          <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>Gestiona las imágenes y textos del carrusel principal</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={restaurar} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 16px', color: '#9A9180', cursor: 'pointer', fontSize: 13 }}>Restaurar</button>
          <button onClick={guardar} style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '8px 20px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em' }}>Guardar Cambios</button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: 16, padding: '10px 16px', background: msg.startsWith('✓') ? 'rgba(76,175,80,0.1)' : 'rgba(224,82,82,0.1)', border: `1px solid ${msg.startsWith('✓') ? 'rgba(76,175,80,0.3)' : 'rgba(224,82,82,0.3)'}`, borderRadius: 6, fontSize: 13 }}>{msg}</div>}

      {slides.map(s => {
        const bgStyle = s.imagen
          ? { backgroundImage: `url(${s.imagen})`, backgroundSize: s.imgSize || 'cover', backgroundPosition: `${s.imgPosX ?? 50}% ${s.imgPosY ?? 50}%` }
          : { background: s.gradient };

        return (
          <div key={s.id} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 24, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '12px 20px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C' }}>SLIDE {s.id}</span>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Preview */}
              <div style={{ ...bgStyle, width: '100%', aspectRatio: '16/6', borderRadius: 4, border: '1px solid rgba(201,168,76,0.15)', backgroundSize: s.imgSize || 'cover', backgroundPosition: `${s.imgPosX??50}% ${s.imgPosY??50}%`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!s.imagen && <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(201,168,76,0.35)' }}>SIN IMAGEN · GRADIENTE ORIGINAL</span>}
                <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'Cinzel, serif' }}>Slide {s.id}</span>
              </div>

              {/* Imagen */}
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#9A9180', marginBottom: 8 }}>IMAGEN</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'end' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 14px', border: '1px dashed rgba(201,168,76,0.4)', borderRadius: 4, background: 'rgba(201,168,76,0.04)', color: '#C9A84C', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    📁 SUBIR
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(s.id, e.target.files[0])} />
                  </label>
                  <input style={inp} value={s.imagen && !s.imagen.startsWith('data:') ? s.imagen : ''} onChange={e => update(s.id, 'imagen', e.target.value)} placeholder="O pega una URL de imagen" />
                </div>
                {s.imagen && (
                  <button onClick={() => quitarImagen(s.id)} style={{ marginTop: 8, background: 'transparent', border: '1px solid #e05252', borderRadius: 4, padding: '4px 12px', color: '#e05252', cursor: 'pointer', fontSize: 11 }}>✕ Quitar imagen</button>
                )}
              </div>

              {/* Controles de imagen */}
              {s.imagen && (
                <div style={{ background: '#0f0f0d', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 4, padding: 16 }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', color: '#C9A84C', marginBottom: 12 }}>AJUSTE DE IMAGEN</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    <div>
                      <label style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>TAMAÑO</label>
                      <select value={s.imgSize || 'cover'} onChange={e => update(s.id, 'imgSize', e.target.value)} style={{ ...inp, padding: '6px 8px' }}>
                        <option value="cover">Cubrir</option>
                        <option value="contain">Contener</option>
                        <option value="auto">Original</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        POS. X <span style={{ color: '#C9A84C' }}>{s.imgPosX ?? 50}%</span>
                      </label>
                      <input type="range" min="0" max="100" value={s.imgPosX ?? 50} onChange={e => update(s.id, 'imgPosX', Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        POS. Y <span style={{ color: '#C9A84C' }}>{s.imgPosY ?? 50}%</span>
                      </label>
                      <input type="range" min="0" max="100" value={s.imgPosY ?? 50} onChange={e => update(s.id, 'imgPosY', Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                  </div>
                  {/* Posición rápida */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#9A9180', letterSpacing: '0.1em', marginBottom: 8 }}>POSICIÓN RÁPIDA</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
                      {[[0,0,'↖'],[50,0,'↑'],[100,0,'↗'],[0,50,'←'],[50,50,'⊙'],[100,50,'→'],[0,100,'↙'],[50,100,'↓'],[100,100,'↘']].map(([x,y,lbl]) => (
                        <button key={lbl} onClick={() => { update(s.id,'imgPosX',x); update(s.id,'imgPosY',y); }}
                          style={{ padding: '5px', border: `1px solid ${s.imgPosX===x&&s.imgPosY===y?'#C9A84C':'rgba(201,168,76,0.2)'}`, borderRadius: 3, background: s.imgPosX===x&&s.imgPosY===y?'rgba(201,168,76,0.08)':'none', color: s.imgPosX===x&&s.imgPosY===y?'#C9A84C':'#9A9180', fontSize: 12, cursor: 'pointer' }}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Textos */}
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#9A9180', marginBottom: 12 }}>TEXTOS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['label','Etiqueta'],['titulo','Título (\\n = salto)'],['subtitulo','Subtítulo'],['btn1','Botón 1'],['btn2','Botón 2']].map(([key, label]) => (
                    <div key={key}>
                      <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{label.toUpperCase()}</label>
                      <input style={inp} value={s[key] || ''} onChange={e => update(s.id, key, e.target.value)} placeholder={label} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}