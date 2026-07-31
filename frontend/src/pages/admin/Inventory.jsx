import { useEffect, useState } from 'react';
import { inventarioAPI, productosAPI } from '../../services/api';
import { exportarPDF, exportarExcel } from '../../utils/exportar';
import ExportarBotones from '../../components/admin/ExportarBotones';

/* ── SVG Icons ───────────────────────────────────────────────── */
function Ico({ d, size = 16, color = 'currentColor', sw = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const ICO = {
  search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  minus:   <line x1="5" y1="12" x2="19" y2="12"/>,
  edit:    <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  img:     <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  close:   <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  check:   <polyline points="20 6 9 17 4 12"/>,
  warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
};

/* ── Helpers ─────────────────────────────────────────────────── */
const UMBRAL = 10;

function stockStatus(n) {
  const v = parseInt(n) || 0;
  if (v === 0)       return { label: 'Sin stock',  color: '#e05252', bg: 'rgba(224,82,82,0.12)' };
  if (v < UMBRAL)    return { label: 'Stock bajo',  color: '#E8A94C', bg: 'rgba(232,169,76,0.12)' };
  return               { label: 'En stock',    color: '#4caf50', bg: 'rgba(76,175,80,0.12)' };
}

/* ── Styles ──────────────────────────────────────────────────── */
const S = {
  inp: { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '9px 12px', color: '#E8DCC8', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  btnGold: { background: '#C9A84C', border: 'none', borderRadius: 6, padding: '8px 18px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 },
  btnGhost: { background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 14px', color: '#9A9180', cursor: 'pointer', fontSize: 12 },
};

/* ── Main ────────────────────────────────────────────────────── */
export default function Inventory() {
  const [inventario, setInventario] = useState([]);  // registros con id_inventario
  const [productos,  setProductos]  = useState([]);  // todos los productos
  const [merged,     setMerged]     = useState([]);  // lista combinada
  const [busqueda,   setBusqueda]   = useState('');
  const [filtro,     setFiltro]     = useState('todos');
  const [modal,      setModal]      = useState(null); // null | { item }
  const [ajuste,     setAjuste]     = useState({ modo: 'absoluto', valor: '' });
  const [ubicacion,  setUbicacion]  = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const [msg,        setMsg]        = useState(null); // { ok, texto }

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const [ri, rp] = await Promise.all([inventarioAPI.listar(), productosAPI.listar()]);
    const inv  = ri.ok ? ri.data  : [];
    const prod = rp.ok ? rp.data  : [];
    setInventario(inv);
    setProductos(prod);

    /* Combinar: todos los productos, con datos de inventario si existen */
    const invMap = {};
    inv.forEach(i => { invMap[i.id_producto] = i; });

    const lista = prod.map(p => {
      const i = invMap[p.id_producto];
      // tiene_registro solo es true si el id_inventario es un entero positivo válido
      const idInv = i ? (parseInt(i.id_inventario) || null) : null;
      return {
        id_producto:    p.id_producto,
        nombre:         p.nombre,
        marca:          p.marca,
        imagen:         p.imagen,
        id_inventario:  idInv && idInv > 0 ? idInv : null,
        stock:          i ? parseInt(i.stock) || 0 : 0,
        ubicacion:      i?.ubicacion ?? '',
        tiene_registro: !!(idInv && idInv > 0),
      };
    });
    setMerged(lista);
  }

  /* ── Ajuste rápido inline (+/-) ── */
  async function ajusteRapido(item, delta) {
    const nuevoStock = Math.max(0, item.stock + delta);
    const res = item.tiene_registro
      ? await inventarioAPI.actualizar({ id_inventario: item.id_inventario, stock: nuevoStock, ubicacion: item.ubicacion })
      : await inventarioAPI.crear({ id_producto: item.id_producto, stock: nuevoStock, ubicacion: '' });
    if (res.ok) {
      showMsg(true, `Stock de "${item.nombre}" actualizado a ${nuevoStock}`);
      cargar();
    } else {
      showMsg(false, res.mensaje || 'Error al actualizar');
    }
  }

  /* ── Modal guardar ── */
  async function guardar() {
    if (!modal) return;
    setGuardando(true);

    let nuevoStock;
    if (ajuste.modo === 'absoluto') {
      nuevoStock = Math.max(0, parseInt(ajuste.valor) || 0);
    } else if (ajuste.modo === 'sumar') {
      nuevoStock = Math.max(0, modal.item.stock + (parseInt(ajuste.valor) || 0));
    } else {
      nuevoStock = Math.max(0, modal.item.stock - (parseInt(ajuste.valor) || 0));
    }

    const res = modal.item.tiene_registro
      ? await inventarioAPI.actualizar({ id_inventario: modal.item.id_inventario, stock: nuevoStock, ubicacion })
      : await inventarioAPI.crear({ id_producto: modal.item.id_producto, stock: nuevoStock, ubicacion });

    setGuardando(false);
    if (res.ok) {
      setModal(null);
      showMsg(true, `Stock actualizado correctamente`);
      cargar();
    } else {
      showMsg(false, res.mensaje || 'Error al guardar');
    }
  }

  function abrirModal(item) {
    setAjuste({ modo: 'absoluto', valor: String(item.stock) });
    setUbicacion(item.ubicacion || '');
    setModal({ item });
  }

  function showMsg(ok, texto) {
    setMsg({ ok, texto });
    setTimeout(() => setMsg(null), 3500);
  }

  /* ── Filtros ── */
  let lista = merged.filter(i =>
    !busqueda || i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (i.marca || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  if (filtro === 'sin')  lista = lista.filter(i => i.stock === 0);
  if (filtro === 'bajo') lista = lista.filter(i => i.stock > 0 && i.stock < UMBRAL);
  if (filtro === 'ok')   lista = lista.filter(i => i.stock >= UMBRAL);

  const cnt = {
    sin:  merged.filter(i => i.stock === 0).length,
    bajo: merged.filter(i => i.stock > 0 && i.stock < UMBRAL).length,
    ok:   merged.filter(i => i.stock >= UMBRAL).length,
  };

  /* ── Preview de nuevo stock en modal ── */
  const previewStock = (() => {
    if (!modal) return 0;
    const v = parseInt(ajuste.valor) || 0;
    if (ajuste.modo === 'absoluto') return Math.max(0, v);
    if (ajuste.modo === 'sumar')    return Math.max(0, modal.item.stock + v);
    return Math.max(0, modal.item.stock - v);
  })();

  return (
    <div style={{ padding: 32, color: '#E8DCC8', maxWidth: 1100, margin: '0 auto' }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Inventario</h1>
          <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>{merged.length} productos en total</p>
        </div>
        <ExportarBotones disabled={lista.length === 0}
          onPDF={() => exportarPDF({
            titulo: 'Reporte de Inventario',
            subtitulo: `${lista.length} productos · En stock: ${cnt.ok} · Stock bajo: ${cnt.bajo} · Sin stock: ${cnt.sin}`,
            archivo: 'inventario',
            secciones: [{
              columnas: ['Producto', 'Marca', 'Stock', 'Estado', 'Ubicación'],
              filas: lista.map(i => [i.nombre || '—', i.marca || '—', i.stock, stockStatus(i.stock).label, i.ubicacion || '—']),
            }],
          })}
          onExcel={() => exportarExcel({
            archivo: 'inventario',
            hojas: [{
              nombre: 'Inventario',
              columnas: ['Producto', 'Marca', 'Stock', 'Estado', 'Ubicación'],
              filas: lista.map(i => [i.nombre || '—', i.marca || '—', i.stock, stockStatus(i.stock).label, i.ubicacion || '—']),
            }],
          })}
        />
      </div>

      {/* KPI chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { key: 'ok',   label: 'En Stock',   value: cnt.ok,   color: '#4caf50' },
          { key: 'bajo', label: 'Stock Bajo',  value: cnt.bajo, color: '#E8A94C' },
          { key: 'sin',  label: 'Sin Stock',   value: cnt.sin,  color: '#e05252' },
        ].map(k => (
          <div key={k.key} onClick={() => setFiltro(filtro === k.key ? 'todos' : k.key)}
            style={{ background: filtro === k.key ? `${k.color}15` : '#111', border: `1px solid ${filtro === k.key ? k.color : 'rgba(201,168,76,0.1)'}`, borderRadius: 8, padding: '14px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: '#9A9180', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', marginTop: 4 }}>{k.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 16px', background: msg.ok ? 'rgba(76,175,80,0.1)' : 'rgba(224,82,82,0.1)', border: `1px solid ${msg.ok ? 'rgba(76,175,80,0.3)' : 'rgba(224,82,82,0.3)'}`, borderRadius: 6, fontSize: 13 }}>
          <Ico d={msg.ok ? ICO.check : ICO.warning} size={15} color={msg.ok ? '#4caf50' : '#e05252'} sw={2.5} />
          {msg.texto}
        </div>
      )}

      {/* Buscador */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B6355', pointerEvents: 'none' }}>
          <Ico d={ICO.search} size={15} />
        </span>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar producto o marca..."
          style={{ ...S.inp, paddingLeft: 32 }} />
      </div>

      {/* Tabla */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              {['Producto', 'Marca', 'Stock', 'Estado', 'Ubicación', 'Ajuste rápido', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', color: '#9A9180', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(item => {
              const st = stockStatus(item.stock);
              return (
                <tr key={item.id_producto} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Producto */}
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#1a1a18', border: '1px solid rgba(201,168,76,0.1)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.imagen
                          ? <img src={item.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Ico d={ICO.img} size={16} color="#6B6355" />}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{item.nombre}</span>
                    </div>
                  </td>

                  {/* Marca */}
                  <td style={{ padding: '10px 16px', color: '#9A9180', fontSize: 13 }}>{item.marca || '—'}</td>

                  {/* Stock */}
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: st.color }}>{item.stock}</span>
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ background: st.bg, color: st.color, fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      {st.label}
                    </span>
                  </td>

                  {/* Ubicación */}
                  <td style={{ padding: '10px 16px', color: '#9A9180', fontSize: 12 }}>{item.ubicacion || '—'}</td>

                  {/* Ajuste rápido */}
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => ajusteRapido(item, -1)} title="Quitar 1"
                        style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.2)', color: '#e05252', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ico d={ICO.minus} size={13} color="#e05252" sw={2.5} />
                      </button>
                      <button onClick={() => ajusteRapido(item, +1)} title="Agregar 1"
                        style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)', color: '#4caf50', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ico d={ICO.plus} size={13} color="#4caf50" sw={2.5} />
                      </button>
                    </div>
                  </td>

                  {/* Editar */}
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => abrirModal(item)}
                      style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 6, padding: '5px 10px', color: '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                      <Ico d={ICO.edit} size={12} color="#C9A84C" />
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
            {lista.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9A9180', fontSize: 13 }}>
                No se encontraron productos
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal de edición ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, width: '100%', maxWidth: 480, padding: 28 }}>

            {/* Título */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', margin: '0 0 4px', fontSize: 15 }}>Ajustar Stock</h3>
                <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>{modal.item.nombre}</p>
              </div>
              <button onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', color: '#6B6355', cursor: 'pointer', padding: 4 }}>
                <Ico d={ICO.close} size={18} />
              </button>
            </div>

            {/* Stock actual */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, background: '#1a1a18', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, padding: '14px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#6B6355', marginBottom: 6 }}>STOCK ACTUAL</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: stockStatus(modal.item.stock).color }}>{modal.item.stock}</div>
              </div>
              <div style={{ flex: 1, background: '#1a1a18', border: `1px solid ${stockStatus(previewStock).color}40`, borderRadius: 8, padding: '14px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#6B6355', marginBottom: 6 }}>RESULTADO</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: stockStatus(previewStock).color }}>{previewStock}</div>
              </div>
            </div>

            {/* Modo de ajuste */}
            <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#9A9180', marginBottom: 8 }}>TIPO DE AJUSTE</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { key: 'absoluto', label: 'Establecer total' },
                { key: 'sumar',    label: 'Agregar unidades' },
                { key: 'restar',   label: 'Quitar unidades' },
              ].map(m => (
                <button key={m.key} onClick={() => setAjuste(a => ({ modo: m.key, valor: '' }))}
                  style={{ flex: 1, padding: '8px 4px', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', borderRadius: 6, cursor: 'pointer', border: `1px solid ${ajuste.modo === m.key ? '#C9A84C' : 'rgba(201,168,76,0.15)'}`, background: ajuste.modo === m.key ? 'rgba(201,168,76,0.12)' : 'transparent', color: ajuste.modo === m.key ? '#C9A84C' : '#9A9180', transition: 'all 0.2s' }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Input cantidad */}
            <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#9A9180', marginBottom: 8 }}>
              {ajuste.modo === 'absoluto' ? 'NUEVO STOCK TOTAL' : ajuste.modo === 'sumar' ? 'UNIDADES A AGREGAR' : 'UNIDADES A QUITAR'}
            </div>
            <input type="number" min="0"
              value={ajuste.valor}
              onChange={e => setAjuste(a => ({ ...a, valor: e.target.value }))}
              placeholder="0"
              style={{ ...S.inp, fontSize: 18, textAlign: 'center', fontWeight: 700, marginBottom: 16 }}
              autoFocus
            />

            {/* Ubicación */}
            <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#9A9180', marginBottom: 8 }}>UBICACIÓN</div>
            <input value={ubicacion} onChange={e => setUbicacion(e.target.value)}
              placeholder="Ej: Bodega A, Estante 3"
              style={{ ...S.inp, marginBottom: 24 }} />

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={S.btnGhost}>Cancelar</button>
              <button onClick={guardar} disabled={guardando || ajuste.valor === ''}
                style={{ ...S.btnGold, opacity: (guardando || ajuste.valor === '') ? 0.6 : 1 }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
