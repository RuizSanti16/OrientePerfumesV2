import { useEffect, useState } from 'react';
import { proveedoresAPI } from '../../services/api';
import { MensajeEstado, IconClose } from '../../components/Icons';

export default function Suppliers() {
  const [items,    setItems]    = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editando, setEditando] = useState(null);
  const [form,     setForm]     = useState({ nombre:'', contacto:'', correo:'', telefono:'' });
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => { cargar(); }, []);
  async function cargar() { const r = await proveedoresAPI.listar(); if (r.ok) setItems(r.data); }

  function abrirNuevo()   { setEditando(null); setForm({ nombre:'', contacto:'', correo:'', telefono:'' }); setModal(true); }
  function abrirEditar(p) { setEditando(p.id_proovedor); setForm({ nombre:p.nombre||'', contacto:p.contacto||'', correo:p.correo||'', telefono:p.telefono||'' }); setModal(true); }

  async function guardar() {
    const res = editando
      ? await proveedoresAPI.actualizar({ ...form, id_proovedor: editando })
      : await proveedoresAPI.crear(form);
    if (res.ok) { setModal(false); cargar(); showMsg(true, res.mensaje); }
    else showMsg(false, res.mensaje);
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    const res = await proveedoresAPI.eliminar(id);
    if (res.ok) { cargar(); showMsg(true, 'Proveedor eliminado'); }
  }

  function showMsg(ok, texto) { setMsg({ ok, texto }); setTimeout(() => setMsg(null), 3000); }
  const filtrados = items.filter(i => !busqueda || (i.nombre||'').toLowerCase().includes(busqueda.toLowerCase()));
  const inp = { width:'100%', background:'#1a1a18', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'8px 12px', color:'#E8DCC8', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:12 };

  return (
    <div style={{ padding:32, color:'#E8DCC8' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#C9A84C', margin:'0 0 4px' }}>Proveedores</h1>
          <p style={{ color:'#9A9180', fontSize:13, margin:0 }}>{items.length} proveedores registrados</p>
        </div>
        <button onClick={abrirNuevo} style={btnGold}>+ Nuevo Proveedor</button>
      </div>

      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} />}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar proveedores..."
        style={{ ...inp, maxWidth:280, marginBottom:16 }} />

      <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:8, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
              {['ID','Nombre','Contacto','Correo','Teléfono','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id_proovedor} style={{ borderBottom:'1px solid rgba(201,168,76,0.05)' }}>
                <td style={tdMuted}>{p.id_proovedor}</td>
                <td style={td}>{p.nombre}</td>
                <td style={tdMuted}>{p.contacto||'—'}</td>
                <td style={tdMuted}>{p.correo||'—'}</td>
                <td style={tdMuted}>{p.telefono||'—'}</td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={() => abrirEditar(p)} style={btnEdit}>Editar</button>
                  <button onClick={() => eliminar(p.id_proovedor)} style={btnDel}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!filtrados.length && <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#9A9180' }}>No hay proveedores registrados</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal titulo={editando ? 'Editar Proveedor' : 'Nuevo Proveedor'} onCerrar={() => setModal(false)} onGuardar={guardar}>
          <Label>NOMBRE *</Label>
          <input style={inp} value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} placeholder="Nombre del proveedor" />
          <Label>PERSONA DE CONTACTO</Label>
          <input style={inp} value={form.contacto} onChange={e => setForm(f=>({...f,contacto:e.target.value}))} placeholder="Nombre del contacto" />
          <Label>CORREO</Label>
          <input style={inp} type="email" value={form.correo} onChange={e => setForm(f=>({...f,correo:e.target.value}))} placeholder="correo@proveedor.com" />
          <Label>TELÉFONO</Label>
          <input style={{...inp,marginBottom:0}} value={form.telefono} onChange={e => setForm(f=>({...f,telefono:e.target.value}))} placeholder="3001234567" />
        </Modal>
      )}
    </div>
  );
}

const btnGold = { background:'#C9A84C', border:'none', borderRadius:6, padding:'8px 16px', color:'#0a0a08', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:11, letterSpacing:'0.1em' };
const btnEdit = { background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:4, padding:'4px 10px', color:'#C9A84C', cursor:'pointer', fontSize:11, marginRight:8 };
const btnDel  = { background:'transparent', border:'1px solid #e05252', borderRadius:4, padding:'4px 10px', color:'#e05252', cursor:'pointer', fontSize:11 };
const thStyle = { padding:'12px 16px', textAlign:'left', fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180' };
const td      = { padding:'12px 16px', fontWeight:600, color:'#E8DCC8' };
const tdMuted = { padding:'12px 16px', color:'#9A9180', fontSize:13 };
function Label({ children }) { return <div style={{ fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180', marginBottom:6 }}>{children}</div>; }
function Modal({ titulo, onCerrar, onGuardar, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.2)', borderRadius:12, width:'100%', maxWidth:460, padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontFamily:'Cinzel, serif', color:'#C9A84C', margin:0, fontSize:16 }}>{titulo}</h3>
          <button onClick={onCerrar} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:20, display:'flex' }}><IconClose size={16}/></button>
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