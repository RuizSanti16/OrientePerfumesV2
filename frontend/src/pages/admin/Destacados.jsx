import { useEffect, useState } from 'react';
import { productosAPI, destacadosAPI } from '../../services/api';

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
  const [msg,        setMsg]        = useState('');

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
    setGuardando(true); setMsg('');
    const res = await destacadosAPI.guardar(destacados);
    setMsg(res.ok ? '✅ Guardado correctamente' : '❌ Error: ' + res.mensaje);
    setGuardando(false);
    setTimeout(() => setMsg(''), 3000);
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

      {msg && (
        <div style={{ marginBottom: '16px', padding: '10px 16px', background: msg.startsWith('✅') ? 'rgba(76,175,80,0.1)' : 'rgba(224,82,82,0.1)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(76,175,80,0.3)' : 'rgba(224,82,82,0.3)'}`, borderRadius: '6px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar productos..."
        style={{ width: '100%', maxWidth: '300px', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '8px 12px', color: '#E8DCC8', fontSize: '13px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px,1fr))', gap: '14px' }}>
        {filtrados.map(p => {
          const sel  = estaSeleccionado(p.id_producto);
          const item = getItem(p.id_producto);
          const badge = item.badge || 'none';
          const badgeInfo = BADGES.find(b => b.value === badge) || BADGES[0];

          return (
            <div key={p.id_producto} style={{ background: sel ? 'rgba(201,168,76,0.08)' : '#111', border: `1px solid ${sel ? '#C9A84C' : 'rgba(201,168,76,0.1)'}`, borderRadius: '8px', overflow: 'hidden', transition: 'all 0.2s', position: 'relative' }}>

              {sel && (
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, background: '#C9A84C', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#0a0a08', fontWeight: 700 }}>✓</div>
              )}

              <div onClick={() => toggleProducto(p.id_producto)} style={{ cursor: 'pointer' }}>
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '110px', background: 'rgba(201,168,76,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🫙</div>
                }
              </div>

              <div style={{ padding: '12px' }}>
                <div onClick={() => toggleProducto(p.id_producto)} style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8DCC8', marginBottom: '2px' }}>{p.nombre}</div>
                  <div style={{ fontSize: '11px', color: '#9A9180' }}>{p.marca || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#C9A84C', marginTop: '4px', marginBottom: sel ? '10px' : 0 }}>
                    $ {Number(p.precio || 0).toLocaleString('es-CO')}
                  </div>
                </div>

                {sel && (
                  <div>
                    {/* Badge selector */}
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.15em', color: '#9A9180', marginBottom: '6px' }}>BADGE</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px' }}>
                      {BADGES.map(b => (
                        <button key={b.value} onClick={() => updateItem(p.id_producto, 'badge', b.value)}
                          style={{ padding: '5px 6px', borderRadius: '4px', border: `1px solid ${badge === b.value ? b.color : 'rgba(201,168,76,0.15)'}`, background: badge === b.value ? `${b.color}20` : 'transparent', color: badge === b.value ? b.color : '#9A9180', fontSize: '10px', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s' }}>
                          {b.label}
                        </button>
                      ))}
                    </div>

                    {/* Precios para Oferta */}
                    {badge === 'sale' && (
                      <div style={{ background: 'rgba(224,82,82,0.06)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.15em', color: '#e05252' }}>PRECIOS DE OFERTA</div>
                        <div>
                          <label style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>PRECIO OFERTA (COP)</label>
                          <input style={inp} type="number" min="0"
                            value={item.precioOferta || ''}
                            onChange={e => updateItem(p.id_producto, 'precioOferta', e.target.value)}
                            placeholder={`Ej: ${Math.round(Number(p.precio||0) * 0.8).toLocaleString('es-CO')}`}
                          />
                        </div>
                        <div>
                          <label style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: '#9A9180', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>PRECIO ANTERIOR (tachado)</label>
                          <input style={inp} type="number" min="0"
                            value={item.precioAnterior || ''}
                            onChange={e => updateItem(p.id_producto, 'precioAnterior', e.target.value)}
                            placeholder={`Ej: ${Number(p.precio||0).toLocaleString('es-CO')}`}
                          />
                        </div>
                        <div style={{ fontSize: '11px', color: '#9A9180', marginTop: '2px' }}>
                          Vista previa:{' '}
                          {item.precioAnterior && <s style={{ color: '#9A9180' }}>$ {Number(item.precioAnterior).toLocaleString('es-CO')}</s>}
                          {' '}
                          {item.precioOferta && <span style={{ color: '#e05252', fontWeight: 600 }}>$ {Number(item.precioOferta).toLocaleString('es-CO')}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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

