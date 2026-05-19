import { useEffect, useState, useCallback } from 'react';
import { pedidosAPI } from '../../services/api';

/* ── helpers ─────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── SVG Icons ───────────────────────────────────────────── */
function Icon({ d, size = 18, color = 'currentColor', sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const IC = {
  pedido:   <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></>,
  truck:    <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  trash:    <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
  search:   <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  arrow:    <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  package:  <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
};

/* ── Estado config ───────────────────────────────────────── */
const ESTADOS = {
  pendiente:   { label: 'Pendiente',     color: '#E8A94C' },
  preparacion: { label: 'En preparación',color: '#7EB8C4' },
  enviado:     { label: 'Enviado',       color: '#9B8DC8' },
  entregado:   { label: 'Entregado',     color: '#6BC48C' },
  cancelado:   { label: 'Cancelado',     color: '#e74c3c' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADOS[estado] || { label: estado, color: '#9A9180' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 4,
      fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
      background: `${cfg.color}18`, color: cfg.color,
      border: `1px solid ${cfg.color}40`, whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}

/* ── Modal detalle ───────────────────────────────────────── */
function ModalDetalle({ pedido, onClose, onEstadoChange }) {
  const [estado, setEstado]   = useState(pedido.estado);
  const [saving, setSaving]   = useState(false);

  async function guardar() {
    if (estado === pedido.estado) { onClose(); return; }
    setSaving(true);
    const r = await pedidosAPI.actualizarEstado({ id: pedido.id, estado });
    setSaving(false);
    if (r.ok) { onEstadoChange(pedido.id, estado); onClose(); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Pedido</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#F5F0E8' }}>{pedido.codigo_seguimiento}</div>
            <div style={{ fontSize: 11, color: '#9A9180', marginTop: 3 }}>{fmtFecha(pedido.fecha_pedido)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6355', padding: 4 }}>
            <Icon d={IC.x} size={20} />
          </button>
        </div>

        {/* Cliente */}
        <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Datos del cliente</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
            {[
              ['Nombre',    pedido.nombre],
              ['Correo',    pedido.correo],
              ['Teléfono',  pedido.telefono || '—'],
              ['Ciudad',    pedido.ciudad   || '—'],
              ['Dirección', pedido.direccion],
              ['Método pago', pedido.metodo_pago || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ gridColumn: k === 'Dirección' ? 'span 2' : 'auto' }}>
                <div style={{ fontSize: 10, color: '#6B6355', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, color: '#E8DCC8' }}>{v}</div>
              </div>
            ))}
          </div>
          {pedido.notas && (
            <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
              <div style={{ fontSize: 10, color: '#6B6355', fontFamily: 'Cinzel, serif', marginBottom: 3 }}>Notas</div>
              <div style={{ fontSize: 12, color: '#9A9180' }}>{pedido.notas}</div>
            </div>
          )}
        </div>

        {/* Items */}
        {pedido.items && pedido.items.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Productos</div>
            {pedido.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#E8DCC8' }}>{item.nombre_producto}</div>
                  {item.presentacion && <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{item.presentacion}</div>}
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#9A9180' }}>×{item.cantidad}</div>
                  <div style={{ fontSize: 13, color: '#C9A84C', fontWeight: 600, minWidth: 80, textAlign: 'right' }}>{fmt(item.precio_unitario)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totales */}
        <div style={{ background: 'rgba(201,168,76,0.04)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          {parseFloat(pedido.descuento) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9A9180', marginBottom: 6 }}>
              <span>Descuento {pedido.cupon ? `(${pedido.cupon})` : ''}</span>
              <span style={{ color: '#6BC48C' }}>-{fmt(pedido.descuento)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#C9A84C' }}>
            <span style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', fontSize: 11 }}>TOTAL</span>
            <span>{fmt(pedido.total)}</span>
          </div>
        </div>

        {/* Cambiar estado */}
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Estado del pedido</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {Object.entries(ESTADOS).map(([key, cfg]) => (
              <button key={key} onClick={() => setEstado(key)}
                style={{
                  padding: '7px 14px', borderRadius: 6, fontSize: 11,
                  fontFamily: 'Cinzel, serif', letterSpacing: '0.08em',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: estado === key ? `${cfg.color}20` : 'transparent',
                  border: `1px solid ${estado === key ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                  color: estado === key ? cfg.color : '#9A9180',
                }}>
                {cfg.label}
              </button>
            ))}
          </div>
          <button onClick={guardar} disabled={saving}
            style={{
              width: '100%', padding: '10px', borderRadius: 6, cursor: saving ? 'default' : 'pointer',
              background: '#C9A84C', border: 'none', color: '#0a0a08',
              fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', fontSize: 11, fontWeight: 700,
              opacity: saving ? 0.7 : 1,
            }}>
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function Pedidos() {
  const [pedidos,     setPedidos]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSel,   setPedidoSel]  = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const r = await pedidosAPI.listar();
    if (r.ok) setPedidos(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function cambiarEstado(id, nuevoEstado) {
    setPedidos(ps => ps.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este pedido permanentemente?')) return;
    const r = await pedidosAPI.eliminar(id);
    if (r.ok) setPedidos(ps => ps.filter(p => p.id !== id));
  }

  /* Filtros */
  const pedidosFiltrados = pedidos.filter(p => {
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    const matchBusq = !q || p.codigo_seguimiento?.toLowerCase().includes(q) ||
      p.nombre?.toLowerCase().includes(q) || p.correo?.toLowerCase().includes(q);
    return matchEstado && matchBusq;
  });

  /* Conteos por estado */
  const counts = pedidos.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>PANEL ADMIN</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, color: '#F5F0E8', fontWeight: 600, margin: 0 }}>
          Gestión de <span style={{ color: '#C9A84C' }}>Pedidos</span>
        </h1>
        <p style={{ color: '#6B6355', fontSize: 13, marginTop: 6 }}>
          {pedidos.length} pedidos totales
        </p>
      </div>

      {/* KPIs rápidos */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(ESTADOS).map(([key, cfg]) => (
          <div key={key} style={{
            background: '#111', border: `1px solid ${cfg.color}30`,
            borderRadius: 8, padding: '12px 18px', minWidth: 110,
            cursor: 'pointer',
            outline: filtroEstado === key ? `1px solid ${cfg.color}` : 'none',
          }} onClick={() => setFiltroEstado(filtroEstado === key ? 'todos' : key)}>
            <div style={{ fontSize: 20, fontWeight: 700, color: cfg.color }}>{counts[key] || 0}</div>
            <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', color: '#9A9180', letterSpacing: '0.1em', marginTop: 3 }}>{cfg.label}</div>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B6355' }}>
            <Icon d={IC.search} size={15} />
          </div>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombre o correo..."
            style={{
              width: '100%', padding: '9px 12px 9px 34px', background: '#111',
              border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6,
              color: '#E8DCC8', fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          style={{ padding: '9px 12px', background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6, color: '#E8DCC8', fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
          <option value="todos">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B6355', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.15em' }}>
            Cargando pedidos...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ color: '#6B6355' }}><Icon d={IC.pedido} size={32} /></div>
            <div style={{ color: '#6B6355', fontSize: 13, marginTop: 12, fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}>
              {busqueda || filtroEstado !== 'todos' ? 'Sin resultados para este filtro' : 'No hay pedidos registrados aún'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Código', 'Cliente', 'Fecha', 'Total', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', color: '#6B6355', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => (
                <tr key={p.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#C9A84C', letterSpacing: '0.08em' }}>{p.codigo_seguimiento}</div>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: 13, color: '#E8DCC8' }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: '#6B6355', marginTop: 2 }}>{p.correo}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: '#9A9180', whiteSpace: 'nowrap' }}>
                    {fmtFecha(p.fecha_pedido)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6BC48C', fontWeight: 600 }}>
                    {fmt(p.total)}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <EstadoBadge estado={p.estado} />
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setPedidoSel(p)}
                        title="Ver detalle / cambiar estado"
                        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#C9A84C', display: 'flex', alignItems: 'center' }}>
                        <Icon d={IC.eye} size={15} />
                      </button>
                      <button
                        onClick={() => eliminar(p.id)}
                        title="Eliminar pedido"
                        style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#e74c3c', display: 'flex', alignItems: 'center' }}>
                        <Icon d={IC.trash} size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {pedidoSel && (
        <ModalDetalle
          pedido={pedidoSel}
          onClose={() => setPedidoSel(null)}
          onEstadoChange={cambiarEstado}
        />
      )}
    </div>
  );
}
