import { useEffect, useState } from 'react';
import { clientesAPI } from '../../services/api';
import { MensajeEstado, IconClose } from '../../components/Icons';
import { exportarPDF, exportarExcel } from '../../utils/exportar';
import ExportarBotones from '../../components/admin/ExportarBotones';

export default function Customers() {
  const [items,    setItems]    = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editando, setEditando] = useState(null);
  const [form,     setForm]     = useState({ nombre:'', usuario:'', correo:'', telefono:'', edad:'', genero:'' });
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => { cargar(); }, []);
  async function cargar() { const r = await clientesAPI.listar(); if (r.ok) setItems(r.data); }

  function abrirNuevo()   { setEditando(null); setForm({ nombre:'', usuario:'', correo:'', telefono:'', edad:'', genero:'' }); setModal(true); }
  function abrirEditar(c) { setEditando(c.id_cliente); setForm({ nombre:c.nombre||'', usuario:c.usuario||'', correo:c.correo||'', telefono:c.telefono||'', edad:c.edad||'', genero:c.genero||'' }); setModal(true); }

  async function guardar() {
    const res = editando
      ? await clientesAPI.actualizar({ ...form, id_cliente: editando })
      : await clientesAPI.crear(form);
    if (res.ok) { setModal(false); cargar(); showMsg(true, res.mensaje); }
    else showMsg(false, res.mensaje);
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    const res = await clientesAPI.eliminar(id);
    if (res.ok) { cargar(); showMsg(true, 'Cliente eliminado'); }
  }

  function showMsg(ok, texto) { setMsg({ ok, texto }); setTimeout(() => setMsg(null), 3000); }
  const filtrados = items.filter(i => !busqueda ||
    (i.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) ||
    (i.correo||'').toLowerCase().includes(busqueda.toLowerCase())
  );
  const inp = { width:'100%', background:'#1a1a18', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'8px 12px', color:'#E8DCC8', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:12 };

  return (
    <div style={{ padding:32, color:'#E8DCC8' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#C9A84C', margin:'0 0 4px' }}>Clientes</h1>
          <p style={{ color:'#9A9180', fontSize:13, margin:0 }}>{items.length} clientes registrados</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <ExportarBotones disabled={filtrados.length === 0}
            onPDF={() => exportarPDF({
              titulo: 'Reporte de Clientes',
              subtitulo: `${filtrados.length} clientes registrados`,
              archivo: 'clientes',
              secciones: [{
                columnas: ['ID', 'Nombre', 'Usuario', 'Correo', 'Teléfono'],
                filas: filtrados.map(c => [c.id_cliente, c.nombre || '—', c.usuario || '—', c.correo || '—', c.telefono || '—']),
              }],
            })}
            onExcel={() => exportarExcel({
              archivo: 'clientes',
              hojas: [{
                nombre: 'Clientes',
                columnas: ['ID', 'Nombre', 'Usuario', 'Correo', 'Teléfono'],
                filas: filtrados.map(c => [c.id_cliente, c.nombre || '—', c.usuario || '—', c.correo || '—', c.telefono || '—']),
              }],
            })}
          />
          <button onClick={abrirNuevo} style={btnGold}>+ Nuevo Cliente</button>
        </div>
      </div>

      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} />}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o correo..."
        style={{ ...inp, maxWidth:300, marginBottom:16 }} />

      <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:8, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
              {['ID','Nombre','Usuario','Correo','Teléfono','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id_cliente} style={{ borderBottom:'1px solid rgba(201,168,76,0.05)' }}>
                <td style={tdMuted}>{c.id_cliente}</td>
                <td style={td}>{c.nombre}</td>
                <td style={tdMuted}>{c.usuario||'—'}</td>
                <td style={tdMuted}>{c.correo||'—'}</td>
                <td style={tdMuted}>{c.telefono||'—'}</td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={() => abrirEditar(c)} style={btnEdit}>Editar</button>
                  <button onClick={() => eliminar(c.id_cliente)} style={btnDel}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!filtrados.length && <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#9A9180' }}>No hay clientes registrados</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal titulo={editando ? 'Editar Cliente' : 'Nuevo Cliente'} onCerrar={() => setModal(false)} onGuardar={guardar}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><Label>NOMBRE *</Label><input style={inp} value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} placeholder="Nombre completo" /></div>
            <div><Label>USUARIO</Label><input style={inp} value={form.usuario} onChange={e => setForm(f=>({...f,usuario:e.target.value}))} placeholder="Nombre de usuario" /></div>
            <div style={{ gridColumn:'1/-1' }}><Label>CORREO *</Label><input style={inp} type="email" value={form.correo} onChange={e => setForm(f=>({...f,correo:e.target.value}))} placeholder="correo@ejemplo.com" /></div>
            <div><Label>TELÉFONO</Label><input style={inp} value={form.telefono} onChange={e => setForm(f=>({...f,telefono:e.target.value}))} placeholder="3001234567" /></div>
            <div><Label>EDAD</Label><input style={inp} type="number" min="1" value={form.edad} onChange={e => setForm(f=>({...f,edad:e.target.value}))} placeholder="Edad" /></div>
            <div style={{ gridColumn:'1/-1' }}>
              <Label>GÉNERO</Label>
              <select style={{...inp, marginBottom:0}} value={form.genero} onChange={e => setForm(f=>({...f,genero:e.target.value}))}>
                <option value="">Sin especificar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>
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
      <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.2)', borderRadius:12, width:'100%', maxWidth:520, padding:24, maxHeight:'90vh', overflowY:'auto' }}>
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