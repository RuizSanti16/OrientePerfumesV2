import { useEffect, useState, useCallback } from 'react';
import { pedidosAPI } from '../../services/api';
import { exportarPDF, exportarExcel } from '../../utils/exportar';
import ExportarBotones from '../../components/admin/ExportarBotones';

/* ── Helpers ─────────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtFechaCorta(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Icon ─────────────────────────────────────────────────────── */
function Icon({ d, size = 18, color = 'currentColor', sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      {d}
    </svg>
  );
}
const IC = {
  pedido:   <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></>,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  trash:    <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
  search:   <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  filter:   <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  arrow:    <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  gear:     <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>,
  truck:    <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
};

/* ── Estado config ───────────────────────────────────────────── */
const ESTADOS = {
  pendiente:   { label: 'Pendiente',      color: '#E8A94C', icon: IC.clock  },
  preparacion: { label: 'En preparación', color: '#7EB8C4', icon: IC.gear   },
  enviado:     { label: 'Enviado',        color: '#9B8DC8', icon: IC.truck  },
  entregado:   { label: 'Entregado',      color: '#6BC48C', icon: IC.check  },
  cancelado:   { label: 'Cancelado',      color: '#e74c3c', icon: IC.x      },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADOS[estado] || { label: estado, color: '#9A9180' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 4,
      fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
      background: `${cfg.color}18`, color: cfg.color,
      border: `1px solid ${cfg.color}40`, whiteSpace: 'nowrap',
    }}>
      <Icon d={cfg.icon} size={10} color={cfg.color} sw={2.2}/>
      {cfg.label}
    </span>
  );
}

/* ── KPI Card ────────────────────────────────────────────────── */
function KpiCard({ label, count, color, iconEl, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: active ? `${color}0D` : 'linear-gradient(145deg,#161614,#111110)',
      border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 10,
      padding: '18px 20px',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: active ? color : `${color}44`,
        transition: 'background 0.2s',
      }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', lineHeight: 1.4 }}>
          {label}
        </div>
        <div style={{ opacity: active ? 0.5 : 0.18 }}>
          <Icon d={iconEl} size={16} color={color} sw={1.4}/>
        </div>
      </div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 600, color: active ? color : 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
        {count}
      </div>
    </div>
  );
}

/* ── Modal detalle ───────────────────────────────────────────── */
function ModalDetalle({ pedido, onClose, onEstadoChange }) {
  const [estado, setEstado] = useState(pedido.estado);
  const [saving, setSaving] = useState(false);

  async function guardar() {
    if (estado === pedido.estado) { onClose(); return; }
    setSaving(true);
    const r = await pedidosAPI.actualizarEstado({ id: pedido.id, estado });
    setSaving(false);
    if (r.ok) { onEstadoChange(pedido.id, estado); onClose(); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'linear-gradient(145deg,#161614,#111110)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 14, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 30 }}>

        {/* Header modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ height: 1, width: 18, background: 'rgba(201,168,76,0.4)' }}/>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase' }}>Detalle de pedido</span>
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#F5F0E8', letterSpacing: '0.02em' }}>{pedido.codigo_seguimiento}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 3, fontStyle: 'italic' }}>{fmtFecha(pedido.fecha_pedido)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: '6px 7px', display: 'flex' }}>
            <Icon d={IC.x} size={16} />
          </button>
        </div>

        {/* Cliente */}
        <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>Datos del cliente</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
            {[
              ['Nombre',      pedido.nombre],
              ['Correo',      pedido.correo],
              ['Teléfono',    pedido.telefono   || '—'],
              ['Ciudad',      pedido.ciudad     || '—'],
              ['Dirección',   pedido.direccion],
              ['Método pago', pedido.metodo_pago || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ gridColumn: k === 'Dirección' ? 'span 2' : 'auto' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, color: '#E8DCC8' }}>{v}</div>
              </div>
            ))}
          </div>
          {pedido.notas && (
            <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'Cinzel, serif', marginBottom: 4 }}>Notas</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>{pedido.notas}</div>
            </div>
          )}
        </div>

        {/* Items */}
        {pedido.items && pedido.items.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>Productos</div>
            {pedido.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#E8DCC8' }}>{item.nombre_producto}</div>
                  {item.presentacion && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontStyle: 'italic' }}>{item.presentacion}</div>}
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>×{item.cantidad}</div>
                  <div style={{ fontSize: 13, color: '#C9A84C', fontFamily: 'Cinzel, serif', minWidth: 85, textAlign: 'right' }}>{fmt(item.precio_unitario)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, padding: '12px 18px', marginBottom: 22 }}>
          {parseFloat(pedido.descuento) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
              <span>Descuento {pedido.cupon ? `(${pedido.cupon})` : ''}</span>
              <span style={{ color: '#6BC48C' }}>−{fmt(pedido.descuento)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', fontSize: 10, color: 'rgba(201,168,76,0.6)' }}>TOTAL</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#C9A84C', fontWeight: 600 }}>{fmt(pedido.total)}</span>
          </div>
        </div>

        {/* Estado */}
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>Estado del pedido</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {Object.entries(ESTADOS).map(([key, cfg]) => (
              <button key={key} onClick={() => setEstado(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 6, fontSize: 10,
                  fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: estado === key ? `${cfg.color}18` : 'transparent',
                  border: `1px solid ${estado === key ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                  color: estado === key ? cfg.color : 'rgba(255,255,255,0.3)',
                }}>
                <Icon d={cfg.icon} size={11} color="currentColor" sw={2}/>
                {cfg.label}
              </button>
            ))}
          </div>
          <button onClick={guardar} disabled={saving}
            style={{
              width: '100%', padding: '11px', borderRadius: 7, cursor: saving ? 'default' : 'pointer',
              background: 'linear-gradient(135deg, #C9A84C, #A8872E)',
              border: 'none', color: '#0a0a08',
              fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', fontSize: 11, fontWeight: 700,
              opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s',
            }}>
            {saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Pedidos() {
  const [pedidos,      setPedidos]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSel,    setPedidoSel]   = useState(null);

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

  const pedidosFiltrados = pedidos.filter(p => {
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    const matchBusq = !q || p.codigo_seguimiento?.toLowerCase().includes(q)
      || p.nombre?.toLowerCase().includes(q) || p.correo?.toLowerCase().includes(q);
    return matchEstado && matchBusq;
  });

  const counts = pedidos.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + 1;
    return acc;
  }, {});

  /* ── Exportar ── */
  const filtroLabel = filtroEstado === 'todos' ? 'Todos los estados' : (ESTADOS[filtroEstado]?.label || filtroEstado);
  const filasExport = pedidosFiltrados.map(p => [
    p.codigo_seguimiento || '—',
    p.nombre || '—',
    p.correo || '—',
    p.telefono || '—',
    p.ciudad || '—',
    fmtFechaCorta(p.fecha_pedido),
    ESTADOS[p.estado]?.label || p.estado,
    fmt(parseFloat(p.total || 0)),
  ]);
  const colsExport = ['Código', 'Cliente', 'Correo', 'Teléfono', 'Ciudad', 'Fecha', 'Estado', 'Total'];

  function pedidosPDF() {
    exportarPDF({
      titulo: 'Reporte de Pedidos',
      subtitulo: `Filtro: ${filtroLabel} · ${pedidosFiltrados.length} pedidos`,
      archivo: 'pedidos',
      secciones: [
        {
          titulo: 'Resumen por estado',
          columnas: ['Estado', 'Cantidad'],
          filas: Object.entries(ESTADOS).map(([k, v]) => [v.label, counts[k] || 0]),
        },
        { titulo: 'Listado de pedidos', columnas: colsExport, filas: filasExport },
      ],
    });
  }

  function pedidosExcel() {
    exportarExcel({
      archivo: 'pedidos',
      hojas: [
        { nombre: 'Pedidos', columnas: colsExport, filas: filasExport },
        { nombre: 'Resumen', columnas: ['Estado', 'Cantidad'], filas: Object.entries(ESTADOS).map(([k, v]) => [v.label, counts[k] || 0]) },
      ],
    });
  }

  return (
    <div className="admin-ped-page" style={{ padding: '36px 40px', maxWidth: 1280, margin: '0 auto', color: '#E8DCC8' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-ped-page  { padding: 20px 16px !important; }
          .admin-ped-head  { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
          .admin-ped-head-right { display: none !important; }
          .admin-ped-head h1 { font-size: 26px !important; }
          .admin-ped-kpis  { grid-template-columns: repeat(3, 1fr) !important; }
          .admin-ped-table { overflow-x: auto !important; }
        }
        @media (max-width: 480px) {
          .admin-ped-kpis  { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="admin-ped-head" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ height: 1, width: 24, background: 'rgba(201,168,76,0.4)' }}/>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.35em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase' }}>Panel Admin</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 400, margin: 0, lineHeight: 1.1 }}>
            Gestión de <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Pedidos</span>
          </h1>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'rgba(255,255,255,0.25)', marginTop: 6, fontStyle: 'italic' }}>
            {pedidos.length} {pedidos.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
          </p>
        </div>
        <div className="admin-ped-head-right" style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>OrientPerfumes</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Administración</div>
        </div>
      </div>

      {/* ── Exportar ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: -16, marginBottom: 22 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Exportar</span>
        <ExportarBotones onPDF={pedidosPDF} onExcel={pedidosExcel} disabled={loading || pedidosFiltrados.length === 0}/>
      </div>

      {/* ── KPIs ── */}
      <div className="admin-ped-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        {Object.entries(ESTADOS).map(([key, cfg]) => (
          <KpiCard
            key={key}
            label={cfg.label}
            count={counts[key] || 0}
            color={cfg.color}
            iconEl={cfg.icon}
            active={filtroEstado === key}
            onClick={() => setFiltroEstado(filtroEstado === key ? 'todos' : key)}
          />
        ))}
      </div>

      {/* ── Barra de búsqueda ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        gap: 10, marginBottom: 20, alignItems: 'center',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}>
            <Icon d={IC.search} size={15}/>
          </div>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombre o correo…"
            style={{
              width: '100%', padding: '10px 14px 10px 38px',
              background: 'linear-gradient(145deg,#161614,#111110)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, color: '#E8DCC8', fontSize: 13,
              outline: 'none', boxSizing: 'border-box',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(145deg,#161614,#111110)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0 14px',
          height: 42 }}>
          <Icon d={IC.filter} size={13} color="rgba(201,168,76,0.5)" sw={1.6}/>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#E8DCC8', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', outline: 'none', cursor: 'pointer', paddingRight: 4 }}>
            <option value="todos" style={{ background: '#161614' }}>Todos los estados</option>
            {Object.entries(ESTADOS).map(([k, v]) => (
              <option key={k} value={k} style={{ background: '#161614' }}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="admin-ped-table" style={{
        background: 'linear-gradient(145deg,#161614,#111110)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, overflowX: 'auto',
      }}>
        {loading ? (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 28, height: 28, border: '2px solid rgba(201,168,76,0.15)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.28em', color: 'rgba(201,168,76,0.4)', textTransform: 'uppercase' }}>Cargando</span>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={IC.pedido} size={22} color="rgba(201,168,76,0.4)" sw={1.4}/>
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9.5, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', textAlign: 'center' }}>
              {busqueda || filtroEstado !== 'todos' ? 'Sin resultados para este filtro' : 'No hay pedidos registrados aún'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Código',   w: '14%' },
                  { label: 'Cliente',  w: '26%' },
                  { label: 'Fecha',    w: '16%' },
                  { label: 'Total',    w: '14%' },
                  { label: 'Estado',   w: '16%' },
                  { label: 'Acciones', w: '14%' },
                ].map(h => (
                  <th key={h.label} style={{
                    width: h.w, textAlign: 'left', padding: '14px 18px',
                    fontFamily: 'Cinzel, serif', fontSize: 8.5,
                    letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)',
                    textTransform: 'uppercase', fontWeight: 400,
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p, i) => (
                <tr key={p.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#C9A84C', letterSpacing: '0.06em' }}>{p.codigo_seguimiento}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 13, color: i === 0 ? '#E8DCC8' : 'rgba(255,255,255,0.6)' }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{p.correo}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 12, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                    {fmtFechaCorta(p.fecha_pedido)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#6BC48C' }}>{fmt(p.total)}</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <EstadoBadge estado={p.estado}/>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => setPedidoSel(p)} title="Ver detalle"
                        style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 6, padding: '7px 8px', cursor: 'pointer', color: '#C9A84C', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.07)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; }}>
                        <Icon d={IC.eye} size={14}/>
                      </button>
                      <button onClick={() => eliminar(p.id)} title="Eliminar"
                        style={{ background: 'rgba(231,76,60,0.07)', border: '1px solid rgba(231,76,60,0.18)', borderRadius: 6, padding: '7px 8px', cursor: 'pointer', color: '#e74c3c', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.15)'; e.currentTarget.style.borderColor = 'rgba(231,76,60,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.07)'; e.currentTarget.style.borderColor = 'rgba(231,76,60,0.18)'; }}>
                        <Icon d={IC.trash} size={14}/>
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
