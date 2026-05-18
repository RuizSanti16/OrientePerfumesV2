import { useEffect, useState } from 'react';
import { inventarioAPI, productosAPI } from '../../services/api';

const IconBottle = ({ size = 22 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.1" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.25 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);

export default function Inventory() {
  const [items,      setItems]      = useState([]);
  const [productos,  setProductos]  = useState([]);
  const [modal,      setModal]      = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [form,       setForm]       = useState({ id_producto:'', stock:0, ubicacion:'' });
  const [busqueda,   setBusqueda]   = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [msg,        setMsg]        = useState('');

  useEffect(() => {
    cargar();
    productosAPI.listar().then(r => { if (r.ok) setProductos(r.data); });
  }, []);

  async function cargar() {
    const r = await inventarioAPI.listar();
    if (r.ok) setItems(r.data);
  }

  function abrirNuevo()   { setEditando(null); setForm({ id_producto:'', stock:0, ubicacion:'' }); setModal(true); }
  function abrirEditar(i) { setEditando(i.id_inventario); setForm({ id_producto:i.id_producto, stock:i.stock||0, ubicacion:i.ubicacion||'' }); setModal(true); }

  async function guardar() {
    const res = editando
      ? await inventarioAPI.actualizar({ ...form, id_inventario: editando })
      : await inventarioAPI.crear(form);
    if (res.ok) { setModal(false); cargar(); showMsg('✓ ' + res.mensaje); }
    else showMsg('✗ ' + res.mensaje);
  }

  function showMsg(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  const UMBRAL = 20;
  function getStockStatus(stock) {
    if (stock === 0)       return { label:'Sin stock',  color:'#e05252' };
    if (stock < UMBRAL)    return { label:'Stock bajo',  color:'#ff9800' };
    return                        { label:'En stock',    color:'#4caf50' };
  }

  let filtrados = items.filter(i => !busqueda || (i.nombre_producto||'').toLowerCase().includes(busqueda.toLowerCase()));
  if (filtroStock === 'bajo')     filtrados = filtrados.filter(i => i.stock > 0 && i.stock < UMBRAL);
  if (filtroStock === 'sin')      filtrados = filtrados.filter(i => i.stock === 0 || i.stock === '0');
  if (filtroStock === 'ok')       filtrados = filtrados.filter(i => i.stock >= UMBRAL);

  const sinStock  = items.filter(i => !i.stock || i.stock == 0).length;
  const stockBajo = items.filter(i => i.stock > 0 && i.stock < UMBRAL).length;
  const enStock   = items.filter(i => i.stock >= UMBRAL).length;

  const inp = { width:'100%', background:'#1a1a18', border:'1px solid rgba(201,168,76,0.2)', borderRadius:6, padding:'8px 12px', color:'#E8DCC8', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:12 };

  return (
    <div style={{ padding:32, color:'#E8DCC8' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#C9A84C', margin:'0 0 4px' }}>Inventario</h1>
          <p style={{ color:'#9A9180', fontSize:13, margin:0 }}>{items.length} productos en inventario</p>
        </div>
        <button onClick={abrirNuevo} style={btnGold}>+ Ajustar Stock</button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'En Stock',   value:enStock,   color:'#4caf50', filtro:'ok' },
          { label:'Stock Bajo', value:stockBajo, color:'#ff9800', filtro:'bajo' },
          { label:'Sin Stock',  value:sinStock,  color:'#e05252', filtro:'sin' },
        ].map(k => (
          <div key={k.label} onClick={() => setFiltroStock(filtroStock===k.filtro?'todos':k.filtro)}
            style={{ background: filtroStock===k.filtro ? `${k.color}15` : '#111', border:`1px solid ${filtroStock===k.filtro?k.color:'rgba(201,168,76,0.1)'}`, borderRadius:8, padding:'16px 20px', cursor:'pointer', transition:'all 0.2s' }}>
            <div style={{ fontSize:28, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:11, color:'#9A9180', fontFamily:'Cinzel, serif', letterSpacing:'0.1em', marginTop:4 }}>{k.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {msg && <Msg text={msg} />}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar producto..."
        style={{ ...inp, maxWidth:300, marginBottom:16 }} />

      <div style={{ background:'#111', border:'1px solid rgba(201,168,76,0.1)', borderRadius:8, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
              {['Producto','Marca','Stock','Estado','Ubicación','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(i => {
              const status = getStockStatus(Number(i.stock||0));
              return (
                <tr key={i.id_inventario} style={{ borderBottom:'1px solid rgba(201,168,76,0.05)' }}>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      {i.imagen ? <img src={i.imagen} style={{ width:36, height:36, objectFit:'cover', borderRadius:4 }} alt="" /> : <div style={{ width:36, height:36, background:'rgba(201,168,76,0.1)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}><IconBottle size={20}/></div>}
                      <span style={{ fontWeight:600, color:'#E8DCC8' }}>{i.nombre_producto}</span>
                    </div>
                  </td>
                  <td style={tdMuted}>{i.marca||'—'}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ fontSize:18, fontWeight:700, color:status.color }}>{i.stock||0}</span>
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ background:`${status.color}15`, color:status.color, fontSize:10, fontFamily:'Cinzel, serif', letterSpacing:'0.08em', padding:'3px 10px', borderRadius:20 }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={tdMuted}>{i.ubicacion||'—'}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <button onClick={() => abrirEditar(i)} style={btnEdit}>Editar</button>
                  </td>
                </tr>
              );
            })}
            {!filtrados.length && <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#9A9180' }}>No hay registros de inventario</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal titulo={editando ? 'Editar Stock' : 'Ajustar Stock'} onCerrar={() => setModal(false)} onGuardar={guardar}>
          {!editando && (
            <>
              <Label>PRODUCTO *</Label>
              <select style={inp} value={form.id_producto} onChange={e => setForm(f=>({...f,id_producto:e.target.value}))}>
                <option value="">Selecciona un producto</option>
                {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
              </select>
            </>
          )}
          <Label>STOCK (unidades)</Label>
          <input style={inp} type="number" min="0" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))} placeholder="Cantidad en inventario" />
          <Label>UBICACIÓN</Label>
          <input style={{...inp,marginBottom:0}} value={form.ubicacion} onChange={e => setForm(f=>({...f,ubicacion:e.target.value}))} placeholder="Ej: Bodega A, Estante 3" />
        </Modal>
      )}
    </div>
  );
}

const btnGold = { background:'#C9A84C', border:'none', borderRadius:6, padding:'8px 16px', color:'#0a0a08', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:11, letterSpacing:'0.1em' };
const btnEdit = { background:'transparent', border:'1px solid rgba(201,168,76,0.3)', borderRadius:4, padding:'4px 10px', color:'#C9A84C', cursor:'pointer', fontSize:11 };
const thStyle = { padding:'12px 16px', textAlign:'left', fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180' };
const td      = { padding:'12px 16px', fontWeight:600, color:'#E8DCC8' };
const tdMuted = { padding:'12px 16px', color:'#9A9180', fontSize:13 };
function Msg({ text }) { return <div style={{ marginBottom:16, padding:'10px 16px', background:text.startsWith('✓')?'rgba(76,175,80,0.1)':'rgba(224,82,82,0.1)', border:`1px solid ${text.startsWith('✓')?'rgba(76,175,80,0.3)':'rgba(224,82,82,0.3)'}`, borderRadius:6, fontSize:13 }}>{text}</div>; }
function Label({ children }) { return <div style={{ fontFamily:'Cinzel, serif', fontSize:10, letterSpacing:'0.15em', color:'#9A9180', marginBottom:6 }}>{children}</div>; }
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