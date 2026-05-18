import { useEffect, useState } from 'react';
import { marcasAPI } from '../../services/api';

export default function Brands() {
  const [items,    setItems]    = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editando, setEditando] = useState(null);
  const [form,     setForm]     = useState({ nombre:'', descripcion:'', pais_origen:'' });
  const [busqueda, setBusqueda] = useState('');
  const [msg,      setMsg]      = useState('');

  useEffect(() => { cargar(); }, []);
  async function cargar() { const r = await marcasAPI.listar(); if (r.ok) setItems(r.data); }

  function abrirNuevo()   { setEditando(null); setForm({ nombre:'', descripcion:'', pais_origen:'' }); setModal(true); }
  function abrirEditar(m) { setEditando(m.id_marca); setForm({ nombre:m.nombre||'', descripcion:m.descripcion||'', pais_origen:m.pais_origen||'' }); setModal(true); }

  async function guardar() {
    const res = editando
      ? await marcasAPI.actualizar({ ...form, id_marca: editando })
      : await marcasAPI.crear(form);
    if (res.ok) { setModal(false); cargar(); showMsg('✓ ' + res.mensaje); }
    else showMsg('✗ ' + res.mensaje);
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta marca?')) return;
    const res = await marcasAPI.eliminar(id);
    if (res.ok) { cargar(); showMsg('✓ Marca eliminada'); }
  }

  function showMsg(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }
  const filtrados = items.filter(i => !busqueda || (i.nombre||'').toLowerCase().includes(busqueda.toLowerCase()));
  const inp = { width:'100%', background:'#1a1a18', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'8px 12px', color:'#E8DCC8', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:12 };

  return (
    <div style={{ padding:32, color:'#E8DCC8' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#C9A84C', margin:'0 0 4px' }}>Marcas</h1>
          <p style={{ color:'#9A9180', fontSize:13, margin:0 }}>{items.length} marcas registradas</p>
        </div>
        <button onClick={abrirNuevo} style={btnGold}>+ Nueva Marca</button>
      </div>

      {msg && <Msg text={msg} />}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar marcas..."
        style={{ ...inp, maxWidth:280, marginBottom:16 }} />

      <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:8, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
              {['ID','Nombre','Descripción','País','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(m => (
              <tr key={m.id_marca} style={{ borderBottom:'1px solid rgba(201,168,76,0.05)' }}>
                <td style={tdMuted}>{m.id_marca}</td>
                <td style={td}>{m.nombre}</td>
                <td style={tdMuted}>{m.descripcion||'—'}</td>
                <td style={tdMuted}>{m.pais_origen||'—'}</td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={() => abrirEditar(m)} style={btnEdit}>Editar</button>
                  <button onClick={() => eliminar(m.id_marca)} style={btnDel}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!filtrados.length && <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#9A9180' }}>No hay marcas registradas</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal titulo={editando ? 'Editar Marca' : 'Nueva Marca'} onCerrar={() => setModal(false)} onGuardar={guardar}>
          <Label>NOMBRE *</Label>
          <input style={inp} value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} placeholder="Nombre de la marca" />
          <Label>DESCRIPCIÓN</Label>
          <input style={inp} value={form.descripcion} onChange={e => setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Descripción breve" />
          <Label>PAÍS DE ORIGEN</Label>
          <input style={{...inp,marginBottom:0}} value={form.pais_origen} onChange={e => setForm(f=>({...f,pais_origen:e.target.value}))} placeholder="Ej: Francia" />
        </Modal>
      )}
    </div>
  );
}

/* ── Shared styles ── */
const btnGold = { background:'#C9A84C', border:'none', borderRadius:6, padding:'8px 16px', color:'#0a0a08', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:11, letterSpacing:'0.1em' };
const btnEdit = { background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:4, padding:'4px 10px', color:'#C9A84C', cursor:'pointer', fontSize:11, marginRight:8 };
const btnDel  = { background:'transparent', border:'1px solid #e05252', borderRadius:4, padding:'4px 10px', color:'#e05252', cursor:'pointer', fontSize:11 };
const thStyle = { padding:'12px 16px', textAlign:'left', fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180' };
const td      = { padding:'12px 16px', fontWeight:600, color:'#E8DCC8' };
const tdMuted = { padding:'12px 16px', color:'#9A9180', fontSize:13 };

function Msg({ text }) {
  return <div style={{ marginBottom:16, padding:'10px 16px', background:text.startsWith('✓')?'rgba(76,175,80,0.1)':'rgba(224,82,82,0.1)', border:`1px solid ${text.startsWith('✓')?'rgba(76,175,80,0.3)':'rgba(224,82,82,0.3)'}`, borderRadius:6, fontSize:13 }}>{text}</div>;
}
function Label({ children }) {
  return <div style={{ fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180', marginBottom:6 }}>{children}</div>;
}
function Modal({ titulo, onCerrar, onGuardar, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.2)', borderRadius:12, width:'100%', maxWidth:460, padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontFamily:'Cinzel, serif', color:'#C9A84C', margin:0, fontSize:16 }}>{titulo}</h3>
          <button onClick={onCerrar} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:20 }}>✕</button>
        </div>
        {children}
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:16 }}>
          <button onClick={onCerrar} style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'8px 16px', color:'#9A9180', cursor:'pointer' }}>Cancelar</button>
          <button onClick={onGuardar} style={btnGold}>Guardar</button>
        </div>
      </div>
    </div>
  );
}