import { useEffect, useState } from 'react';
import { productosAPI, destacadosAPI } from '../../services/api';

export default function Destacados() {
  const [todos,      setTodos]      = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [busqueda,   setBusqueda]   = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const [msg,        setMsg]        = useState('');

  useEffect(() => {
    productosAPI.listar().then(r  => { if (r.ok)  setTodos(r.data); });
    destacadosAPI.listar().then(r => { if (r.ok)  setDestacados(r.data.map(p => p.id_producto)); });
  }, []);

  async function guardar() {
    setGuardando(true); setMsg('');
    const res = await destacadosAPI.guardar(destacados);
    setMsg(res.ok ? '✅ Guardado correctamente' : '❌ Error: ' + res.mensaje);
    setGuardando(false);
    setTimeout(() => setMsg(''), 3000);
  }

  function toggleDestacado(id) {
    setDestacados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const filtrados = todos.filter(p =>
    !busqueda ||
    (p.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.marca||'').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', color: '#E8DCC8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#C9A84C', margin: '0 0 4px' }}>Productos Destacados</h1>
          <p style={{ color: '#9A9180', fontSize: '13px', margin: 0 }}>Selecciona los productos que aparecen en el inicio ({destacados.length} seleccionados)</p>
        </div>
        <button onClick={guardar} disabled={guardando}
          style={{ background: '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#0a0a08', cursor: guardando?'not-allowed':'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.1em', opacity: guardando?0.7:1 }}>
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {msg && <div style={{ marginBottom: '16px', padding: '10px 16px', background: msg.startsWith('✅') ? 'rgba(76,175,80,0.1)' : 'rgba(224,82,82,0.1)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(76,175,80,0.3)' : 'rgba(224,82,82,0.3)'}`, borderRadius: '6px', fontSize: '13px' }}>{msg}</div>}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar productos..."
        style={{ width: '100%', maxWidth: '300px', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '8px 12px', color: '#E8DCC8', fontSize: '13px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '12px' }}>
        {filtrados.map(p => {
          const seleccionado = destacados.includes(p.id_producto);
          return (
            <div key={p.id_producto}
              onClick={() => toggleDestacado(p.id_producto)}
              style={{ background: seleccionado ? 'rgba(201,168,76,0.1)' : '#111', border: `1px solid ${seleccionado ? '#C9A84C' : 'rgba(201,168,76,0.1)'}`, borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
              {seleccionado && (
                <div style={{ position: 'absolute', top: 8, right: 8, background: '#C9A84C', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#0a0a08', fontWeight: 700 }}>✓</div>
              )}
              {p.imagen
                ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                : <div style={{ width: '100%', height: '100px', background: 'rgba(201,168,76,0.05)', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🫙</div>
              }
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8DCC8', marginBottom: '4px' }}>{p.nombre}</div>
              <div style={{ fontSize: '11px', color: '#9A9180' }}>{p.marca || '—'}</div>
              <div style={{ fontSize: '12px', color: '#C9A84C', marginTop: '4px' }}>$ {Number(p.precio||0).toLocaleString('es-CO')}</div>
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