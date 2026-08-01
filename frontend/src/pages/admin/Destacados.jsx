import { useEffect, useState } from 'react';
import { productosAPI, destacadosAPI } from '../../services/api';
import { MensajeEstado, IconCheck } from '../../components/Icons';

const IconBottle = ({ size = 36 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.1" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.2 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);

const BADGES = [
  { value: 'none', label: 'Sin badge',  color: '#9A9180' },
  { value: 'new',  label: 'Nuevo',      color: '#4caf50' },
  { value: 'sale', label: 'Oferta',     color: '#e05252' },
  { value: 'excl', label: 'Exclusivo',  color: '#C9A84C' },
];

export default function Destacados() {
  const [todos,      setTodos]      = useState([]);
  // destacados = [{ id_producto, badge, precioOferta, precioAnterior }]
  const [destacados, setDestacados] = useState([]);
  const [busqueda,   setBusqueda]   = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    productosAPI.listar().then(r => { if (r.ok) setTodos(r.data); });
    destacadosAPI.listar().then(r => {
      if (r.ok) setDestacados(r.data.map(p => ({
        id_producto:    p.id_producto,
        badge:          p.badge          || 'none',
        precioOferta:   p.precio_oferta  || '',
        precioAnterior: p.precio_anterior || '',
      })));
    });
  }, []);

  async function guardar() {
    setGuardando(true); setMsg(null);
    const res = await destacadosAPI.guardar(destacados);
    setMsg(res.ok ? { ok: true, texto: 'Guardado correctamente' } : { ok: false, texto: 'Error: ' + res.mensaje });
    setGuardando(false);
    setTimeout(() => setMsg(null), 3000);
  }

  function estaSeleccionado(id) { return destacados.some(d => d.id_producto === id); }
  function getItem(id)          { return destacados.find(d => d.id_producto === id) || {}; }

  function toggleProducto(id) {
    if (estaSeleccionado(id)) {
      setDestacados(prev => prev.filter(d => d.id_producto !== id));
    } else {
      setDestacados(prev => [...prev, { id_producto: id, badge: 'none', precioOferta: '', precioAnterior: '' }]);
    }
  }

  function updateItem(id, key, val) {
    setDestacados(prev => prev.map(d => d.id_producto === id ? { ...d, [key]: val } : d));
  }

  const filtrados = todos.filter(p =>
    !busqueda ||
    (p.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.marca||'').toLowerCase().includes(busqueda.toLowerCase())
  );

  const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, padding: '6px 10px', color: '#E8DCC8', fontSize: 12, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px', color: '#E8DCC8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#C9A84C', margin: '0 0 4px' }}>Productos Destacados</h1>
          <p style={{ color: '#9A9180', fontSize: '13px', margin: 0 }}>
            Selecciona los productos del inicio y asígnales badge y precio ({destacados.length} seleccionados)
          </p>
        </div>
        <button onClick={guardar} disabled={guardando}
          style={{ background: '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#0a0a08', cursor: guardando ? 'not-allowed' : 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.1em', opacity: guardando ? 0.7 : 1 }}>
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} />}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar productos..."
        style={{ width: '100%', maxWidth: '300px', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '8px 12px', color: '#E8DCC8', fontSize: '13px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '10px' }}>
        {filtrados.map(p => {
          const sel  = estaSeleccionado(p.id_producto);
          const item = getItem(p.id_producto);
          const badge = item.badge || 'none';

          return (
            <div key={p.id_producto} style={{ background: sel ? 'rgba(201,168,76,0.08)' : '#111', border: `1px solid ${sel ? '#C9A84C' : 'rgba(201,168,76,0.1)'}`, borderRadius: '8px', overflow: 'hidden', transition: 'all 0.2s', position: 'relative' }}>

              {sel && (
                <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 2, background: '#C9A84C', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#0a0a08', fontWeight: 700 }}><IconCheck size={12} sw={3}/></div>
              )}

              {/* Imagen */}
              <div onClick={() => toggleProducto(p.id_producto)} style={{ cursor: 'pointer' }}>
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '80px', background: 'rgba(201,168,76,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBottle size={28}/></div>
                }
              </div>

              {/* Info básica */}
              <div style={{ padding: '8px 10px' }} onClick={() => toggleProducto(p.id_producto)} >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#c8d2e8', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>{p.nombre}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '10px', color: '#9A9180' }}>{p.marca || '—'}</span>
                  <span style={{ fontSize: '11px', color: '#C9A84C' }}>$ {Number(p.precio || 0).toLocaleString('es-CO')}</span>
                </div>
              </div>

              {/* Controles (solo si seleccionado) */}
              {sel && (
                <div style={{ padding: '0 10px 10px', borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: '8px' }}>
                  {/* Badge en una sola fila */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: badge === 'sale' ? '8px' : 0 }}>
                    {BADGES.map(b => (
                      <button key={b.value} onClick={() => updateItem(p.id_producto, 'badge', b.value)}
                        style={{ flex: 1, padding: '4px 2px', borderRadius: '4px', border: `1px solid ${badge === b.value ? b.color : 'rgba(201,168,76,0.15)'}`, background: badge === b.value ? `${b.color}22` : 'transparent', color: badge === b.value ? b.color : '#9A9180', fontSize: '9px', fontFamily: 'Cinzel, serif', letterSpacing: '0.04em', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                        {b.label}
                      </button>
                    ))}
                  </div>

                  {/* Precios oferta: inputs lado a lado */}
                  {badge === 'sale' && (
                    <div style={{ background: 'rgba(224,82,82,0.06)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '6px', padding: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', color: '#9A9180', letterSpacing: '0.08em', display: 'block', marginBottom: '3px' }}>OFERTA</label>
                          <input style={inp} type="number" min="0"
                            value={item.precioOferta || ''}
                            onChange={e => updateItem(p.id_producto, 'precioOferta', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', color: '#9A9180', letterSpacing: '0.08em', display: 'block', marginBottom: '3px' }}>ANTERIOR</label>
                          <input style={inp} type="number" min="0"
                            value={item.precioAnterior || ''}
                            onChange={e => updateItem(p.id_producto, 'precioAnterior', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      {(item.precioOferta || item.precioAnterior) && (
                        <div style={{ fontSize: '10px', color: '#9A9180', marginTop: '5px' }}>
                          {item.precioAnterior && <s style={{ color: '#9A9180' }}>$ {Number(item.precioAnterior).toLocaleString('es-CO')}</s>}
                          {' '}
                          {item.precioOferta && <span style={{ color: '#e05252', fontWeight: 600 }}>$ {Number(item.precioOferta).toLocaleString('es-CO')}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!filtrados.length && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.15em' }}>
            NO HAY PRODUCTOS
          </div>
        )}
      </div>
    </div>
  );
}

