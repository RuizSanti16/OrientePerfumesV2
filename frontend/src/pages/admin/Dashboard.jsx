import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI, clientesAPI, ventasAPI, inventarioAPI, estadisticasAPI } from '../../services/api';
import { exportarPDF, exportarExcel } from '../../utils/exportar';
import ExportarBotones from '../../components/admin/ExportarBotones';
import { IconSparkle } from '../../components/Icons';

import { PALETA } from '../../theme';

/* ── Helpers ─────────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function fmtCompact(n) {
  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

/* ── SVG Icons ───────────────────────────────────────────────── */
function Icon({ d, size = 20, color = 'currentColor', strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      {d}
    </svg>
  );
}

const ICONS = {
  producto:    <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  cliente:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  venta:       <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></>,
  ingreso:     <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  categoria:   <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  estrella:    <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  inventario:  <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  coleccion:   <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
  carrusel:    <><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></>,
  ajustes:     <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>,
  alerta:      <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  check:       <><polyline points="20 6 9 17 4 12"/></>,
  arrow:       <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  trending:    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  placeholder: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  noticias:    <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/><path d="M4 12h4"/><path d="M4 8h4"/><path d="M4 16h4"/><path d="M10 12h6"/><path d="M10 8h6"/><path d="M10 16h6"/></>,
  pedidos:     <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  cupones:     <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
};

/* ── KPI Card ────────────────────────────────────────────────── */
function KpiCard({ iconEl, label, value, sub, color = PALETA.oro, trend }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #161614, #111110)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '22px 24px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Barra de color superior */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
      }}/>
      {/* Glow de fondo */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}0D 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>
      {/* Label + ícono en la misma fila */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</div>
        <div style={{ opacity: 0.22, flexShrink: 0, marginLeft: 10 }}>
          <Icon d={iconEl} size={22} color={color} strokeWidth={1.2}/>
        </div>
      </div>
      {/* Número */}
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 600, color, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{sub}</div>
      {trend !== undefined && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: trend >= 0 ? 'rgba(154,171,128,0.15)' : 'rgba(196,102,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.trending} size={9} color={trend >= 0 ? PALETA.salvia : PALETA.terracota} strokeWidth={2.5}/>
          </div>
          <span style={{ fontSize: 11, color: trend >= 0 ? PALETA.salvia : PALETA.terracota, fontWeight: 600 }}>
            {trend >= 0 ? '+' : ''}{trend}% vs mes anterior
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Panel (contenedor genérico) ─────────────────────────────── */
function Panel({ children, style }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #161614, #111110)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '22px 24px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Section Title ───────────────────────────────────────────── */
function SectionTitle({ children, color = PALETA.oro }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 3, height: 16, borderRadius: 2, background: color, flexShrink: 0 }}/>
      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', margin: 0 }}>
        {children}
      </h2>
    </div>
  );
}

/* ── Bar Chart ───────────────────────────────────────────────── */
function BarChart({ data, valueKey = 'ingresos', labelKey = 'mes_label', color = PALETA.oro, height = 100 }) {
  if (!data || data.length === 0) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Sin datos</div>
  );
  const max = Math.max(...data.map(d => parseFloat(d[valueKey]) || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: height + 32, paddingTop: 20 }}>
      {data.map((d, i) => {
        const val = parseFloat(d[valueKey]) || 0;
        const pct = Math.max((val / max) * height, val > 0 ? 3 : 0);
        const isMax = val === max;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {val > 0 && (
              <div style={{ fontSize: 8, color: isMax ? color : 'rgba(255,255,255,0.25)', fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap' }}>
                {fmtCompact(val)}
              </div>
            )}
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%', height: pct,
                background: isMax
                  ? `linear-gradient(180deg, ${color}, ${color}66)`
                  : `linear-gradient(180deg, ${color}55, ${color}22)`,
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.5s ease',
                minHeight: val > 0 ? 3 : 0,
                boxShadow: isMax ? `0 0 12px ${color}40` : 'none',
              }}/>
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'Cinzel, serif', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              {(d[labelKey] || '').slice(0, 3).toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Progress List ───────────────────────────────────────────── */
function ProgressList({ items, nameKey = 'nombre', valueKey = 'total_vendido', color = PALETA.oro, suffix = 'uds' }) {
  if (!items || items.length === 0) return (
    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, padding: '12px 0' }}>Sin datos disponibles</div>
  );
  const max = Math.max(...items.map(d => parseFloat(d[valueKey]) || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => {
        const val = parseFloat(item[valueKey]) || 0;
        const pct = (val / max) * 100;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75%' }}>
                {i === 0 && <span style={{ color, marginRight: 6, fontSize: 10 }}><IconSparkle size={9}/></span>}
                {item[nameKey]}
              </div>
              <div style={{ fontSize: 11, color, fontFamily: 'Cinzel, serif', flexShrink: 0 }}>{val} {suffix}</div>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}66)`, borderRadius: 2, transition: 'width 0.6s ease' }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [productos,  setProductos]  = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [ventas,     setVentas]     = useState([]);
  const [inventario, setInventario] = useState([]);
  const [stats,      setStats]      = useState(null);

  const session = (() => {
    try { return JSON.parse(localStorage.getItem('op_admin_session') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    Promise.all([
      productosAPI.listar(),
      clientesAPI.listar(),
      ventasAPI.listar(),
      inventarioAPI.listar(),
      estadisticasAPI.obtener(),
    ]).then(([p, c, v, i, s]) => {
      setProductos(p.ok ? p.data : []);
      setClientes(c.ok  ? c.data : []);
      setVentas(v.ok    ? v.data : []);
      setInventario(i.ok ? i.data : []);
      if (s.ok) setStats(s.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalIngresos = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0);
  const ultimasVentas = [...ventas].slice(0, 8);
  const stockBajo     = inventario.filter(i => parseInt(i.stock) < 5).slice(0, 5);
  const ultimosProds  = [...productos].slice(0, 5);

  const hora   = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  const trend = (() => {
    if (!stats?.kpis_periodo) return undefined;
    const a = parseFloat(stats.kpis_periodo.ingresos_mes_actual || 0);
    const b = parseFloat(stats.kpis_periodo.ingresos_mes_anterior || 0);
    return b > 0 ? parseFloat(((a - b) / b * 100).toFixed(1)) : undefined;
  })();

  const ACCESOS = [
    { label: 'Productos',   to: '/admin/products',    iconEl: ICONS.producto,   color: PALETA.oro },
    { label: 'Destacados',  to: '/admin/destacados',  iconEl: ICONS.estrella,   color: PALETA.oro },
    { label: 'Pedidos',     to: '/admin/pedidos',     iconEl: ICONS.pedidos,    color: PALETA.champan },
    { label: 'Clientes',    to: '/admin/customers',   iconEl: ICONS.cliente,    color: PALETA.champan },
    { label: 'Inventario',  to: '/admin/inventory',   iconEl: ICONS.inventario, color: PALETA.bronce },
    { label: 'Cupones',     to: '/admin/cupones',     iconEl: ICONS.cupones,    color: PALETA.bronce },
    { label: 'Carrusel',    to: '/admin/carrusel',    iconEl: ICONS.carrusel,   color: PALETA.salvia },
    { label: 'Noticias',    to: '/admin/noticias',    iconEl: ICONS.noticias,   color: PALETA.salvia },
    { label: 'Colecciones', to: '/admin/colecciones', iconEl: ICONS.coleccion,  color: PALETA.ambar },
    { label: 'Ajustes',     to: '/admin/ajustes',     iconEl: ICONS.ajustes,    color: PALETA.ambar },
  ];

  /* ── Exportar reporte general ── */
  function datosReporte() {
    const fmtF = f => f ? new Date(f).toLocaleDateString('es-CO') : '—';
    return {
      resumen: [
        ['Productos en catálogo', productos.length],
        ['Clientes registrados',  clientes.length],
        ['Órdenes totales',       ventas.length],
        ['Ingresos totales',      fmt(totalIngresos)],
        ...(stats?.kpis_periodo ? [
          ['Ingresos este mes', fmt(parseFloat(stats.kpis_periodo.ingresos_mes_actual || 0))],
          ['Ventas este mes',   parseInt(stats.kpis_periodo.ventas_mes_actual || 0)],
        ] : []),
        ...(stats?.pedidos_pendientes !== undefined ? [['Pedidos pendientes', stats.pedidos_pendientes]] : []),
        ...(stats?.stock_bajo_count  !== undefined ? [['Productos con stock bajo', stats.stock_bajo_count]] : []),
      ],
      porMes: (stats?.ventas_por_mes || []).map(m => [m.mes_label, parseInt(m.cantidad || 0), fmt(parseFloat(m.ingresos || 0))]),
      masVendidos: (stats?.productos_mas_vendidos || []).map(p => [p.nombre, parseInt(p.total_vendido || 0)]),
      ventasFilas: ventas.map(v => [`#${v.id_venta}`, v.nombre_cliente || '—', fmtF(v.fecha), fmt(parseFloat(v.total || 0))]),
      inventarioFilas: inventario.map(i => [i.nombre_producto || '—', i.marca || '—', parseInt(i.stock || 0)]),
      clientesFilas: clientes.map(c => [c.id_cliente, c.nombre || '—', c.correo || '—', c.telefono || '—']),
    };
  }

  function reportePDF() {
    const d = datosReporte();
    exportarPDF({
      titulo: 'Reporte General',
      subtitulo: 'Resumen de ventas, inventario y clientes',
      archivo: 'reporte_general',
      secciones: [
        { titulo: 'Resumen',                columnas: ['Indicador', 'Valor'],                    filas: d.resumen },
        { titulo: 'Ventas por mes',         columnas: ['Mes', 'Pedidos', 'Ingresos'],            filas: d.porMes },
        { titulo: 'Productos más vendidos', columnas: ['Producto', 'Unidades vendidas'],         filas: d.masVendidos },
        { titulo: 'Historial de ventas',    columnas: ['#', 'Cliente', 'Fecha', 'Total'],        filas: d.ventasFilas },
        { titulo: 'Inventario',             columnas: ['Producto', 'Marca', 'Stock'],            filas: d.inventarioFilas },
      ],
    });
  }

  function reporteExcel() {
    const d = datosReporte();
    exportarExcel({
      archivo: 'reporte_general',
      hojas: [
        { nombre: 'Resumen',        columnas: ['Indicador', 'Valor'],             filas: d.resumen },
        { nombre: 'Ventas por mes', columnas: ['Mes', 'Pedidos', 'Ingresos'],     filas: d.porMes },
        { nombre: 'Más vendidos',   columnas: ['Producto', 'Unidades vendidas'],  filas: d.masVendidos },
        { nombre: 'Ventas',         columnas: ['#', 'Cliente', 'Fecha', 'Total'], filas: d.ventasFilas },
        { nombre: 'Inventario',     columnas: ['Producto', 'Marca', 'Stock'],     filas: d.inventarioFilas },
        { nombre: 'Clientes',       columnas: ['ID', 'Nombre', 'Correo', 'Teléfono'], filas: d.clientesFilas },
      ],
    });
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(201,168,76,0.15)', borderTopColor: PALETA.oro, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase' }}>Cargando</span>
    </div>
  );

  return (
    <div className="admin-dash" style={{ padding: '36px 40px', maxWidth: 1280, margin: '0 auto', color: '#E8DCC8' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-dash           { padding: 20px 16px !important; }
          .admin-greeting       { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
          .admin-greeting-right { display: none !important; }
          .admin-greeting h1    { font-size: 26px !important; }
          .admin-kpi-grid       { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-access-grid    { grid-template-columns: repeat(3, 1fr) !important; }
          .admin-charts-grid    { grid-template-columns: 1fr !important; }
          .admin-tables-grid    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .admin-dash           { padding: 14px 12px !important; }
          .admin-access-grid    { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="admin-greeting" style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ height: 1, width: 24, background: 'rgba(201,168,76,0.4)' }}/>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.35em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase' }}>Panel de Control</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 400, margin: 0, lineHeight: 1.1 }}>
            {saludo},&nbsp;
            <span style={{ color: PALETA.oro, fontStyle: 'italic' }}>{session.nombre || 'Admin'}</span>
          </h1>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontStyle: 'italic' }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="admin-greeting-right" style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>OrientPerfumes</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Administración</div>
        </div>
      </div>

      {/* ── Exportar reporte general ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: -20, marginBottom: 24 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Descargar reporte</span>
        <ExportarBotones onPDF={reportePDF} onExcel={reporteExcel}/>
      </div>

      {/* ── KPIs principales ── */}
      <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <KpiCard iconEl={ICONS.producto} label="Productos en catálogo" value={productos.length}
          sub={`${productos.length} referencias disponibles`} color={PALETA.oro} />
        <KpiCard iconEl={ICONS.cliente} label="Clientes registrados" value={clientes.length}
          sub="Total de cuentas activas" color={PALETA.champan} />
        <KpiCard iconEl={ICONS.venta} label="Órdenes totales" value={ventas.length}
          sub="Historial completo" color={PALETA.bronce} />
        <KpiCard iconEl={ICONS.ingreso} label="Ingresos totales" value={fmtCompact(totalIngresos)}
          sub={fmt(totalIngresos)} color={PALETA.salvia} trend={trend} />
      </div>

      {/* ── KPIs período ── */}
      {stats?.kpis_periodo && (
        <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          <KpiCard iconEl={ICONS.ingreso} label="Ingresos este mes"
            value={fmtCompact(parseFloat(stats.kpis_periodo.ingresos_mes_actual || 0))}
            sub={fmt(parseFloat(stats.kpis_periodo.ingresos_mes_actual || 0))}
            color={PALETA.oro} trend={trend} />
          <KpiCard iconEl={ICONS.venta} label="Ventas este mes"
            value={parseInt(stats.kpis_periodo.ventas_mes_actual || 0)}
            sub={`${parseInt(stats.kpis_periodo.ventas_mes_anterior || 0)} el mes anterior`}
            color={PALETA.champan} />
          {stats.pedidos_pendientes !== undefined && (
            <KpiCard iconEl={ICONS.alerta} label="Pedidos pendientes"
              value={stats.pedidos_pendientes}
              sub={stats.pedidos_pendientes === 0 ? 'Todo al día' : 'Requieren atención'}
              color={stats.pedidos_pendientes > 0 ? PALETA.ambar : PALETA.salvia} />
          )}
          {stats.stock_bajo_count !== undefined && (
            <KpiCard iconEl={ICONS.inventario} label="Stock bajo"
              value={stats.stock_bajo_count}
              sub={stats.stock_bajo_count === 0 ? 'Inventario al día' : 'Stock ≤ 5 unidades'}
              color={stats.stock_bajo_count > 0 ? PALETA.terracota : PALETA.salvia} />
          )}
        </div>
      )}

      {/* ── Accesos rápidos ── */}
      <Panel style={{ marginBottom: 28 }}>
        <SectionTitle>Accesos rápidos</SectionTitle>
        <div className="admin-access-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {ACCESOS.map(a => (
            <button key={a.to} onClick={() => navigate(a.to)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: '14px 10px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                minHeight: 72,
                transition: 'all 0.2s', color: 'rgba(255,255,255,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${a.color}10`;
                e.currentTarget.style.borderColor = `${a.color}40`;
                e.currentTarget.style.color = a.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              <Icon d={a.iconEl} size={18} color="currentColor" strokeWidth={1.4}/>
              <span style={{ fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </Panel>

      {/* ── Gráficas ── */}
      {stats && (
        <div className="admin-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Panel>
            <SectionTitle color={PALETA.oro}>Ingresos por mes</SectionTitle>
            <BarChart data={stats.ventas_por_mes || []} valueKey="ingresos" labelKey="mes_label" color={PALETA.oro} height={100}/>
          </Panel>
          <Panel>
            <SectionTitle color={PALETA.champan}>Pedidos por mes</SectionTitle>
            <BarChart data={stats.ventas_por_mes || []} valueKey="cantidad" labelKey="mes_label" color={PALETA.champan} height={100}/>
          </Panel>
          <Panel>
            <SectionTitle color={PALETA.bronce}>Productos más vendidos</SectionTitle>
            <ProgressList items={stats.productos_mas_vendidos || []} nameKey="nombre" valueKey="total_vendido" color={PALETA.bronce} suffix="uds"/>
          </Panel>
          <Panel>
            <SectionTitle color={PALETA.ambar}>Movimiento por categoría</SectionTitle>
            <ProgressList items={(stats.por_categoria || []).map(c => ({ ...c, nombre: c.categoria }))} nameKey="nombre" valueKey="total_vendido" color={PALETA.ambar} suffix="uds"/>
          </Panel>
        </div>
      )}

      {/* ── Tablas ── */}
      <div className="admin-tables-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

        {/* Últimas ventas */}
        <Panel>
          <SectionTitle>Últimas ventas</SectionTitle>
          {ultimasVentas.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No hay ventas registradas</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
              <thead>
                <tr>
                  {['#', 'Cliente', 'Fecha', 'Total'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultimasVentas.map((v, i) => (
                  <tr key={v.id_venta} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px 0', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'Cinzel, serif' }}>#{v.id_venta}</td>
                    <td style={{ padding: '10px 12px 10px 0', fontSize: 13, color: i === 0 ? '#E8DCC8' : 'rgba(255,255,255,0.55)' }}>{v.nombre_cliente || '—'}</td>
                    <td style={{ padding: '10px 12px 10px 0', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{fmtFecha(v.fecha)}</td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: PALETA.salvia, fontFamily: 'Cinzel, serif', fontWeight: 600 }}>{fmt(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          {/* No existe una pantalla /admin/ventas: las ventas se
              consultan desde la gestion de pedidos. */}
          {ventas.length > 8 && (
            <button onClick={() => navigate('/admin/pedidos')}
              style={{ marginTop: 14, background: 'none', border: 'none', color: PALETA.oro, fontSize: 10, cursor: 'pointer', padding: 0, fontFamily: 'Cinzel, serif', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              Ver todas <Icon d={ICONS.arrow} size={13} color={PALETA.oro}/>
            </button>
          )}
        </Panel>

        {/* Columna derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stock bajo */}
          <Panel>
            <SectionTitle color={PALETA.terracota}>Stock bajo</SectionTitle>
            {stockBajo.length === 0 ? (
              <div style={{ color: PALETA.salvia, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon d={ICONS.check} size={14} color={PALETA.salvia} strokeWidth={2.5}/>
                Inventario al día
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stockBajo.map(item => (
                  <div key={item.id_inventario} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'rgba(196,102,76,0.04)', borderRadius: 6, border: '1px solid rgba(196,102,76,0.1)' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{item.nombre_producto}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{item.marca}</div>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, background: parseInt(item.stock) === 0 ? 'rgba(196,102,76,0.15)' : 'rgba(224,164,88,0.12)', color: parseInt(item.stock) === 0 ? PALETA.terracota : PALETA.ambar, border: `1px solid ${parseInt(item.stock) === 0 ? 'rgba(196,102,76,0.3)' : 'rgba(224,164,88,0.25)'}` }}>
                      {parseInt(item.stock) === 0 ? 'Sin stock' : `${item.stock} uds`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Últimos productos */}
          <Panel style={{ flex: 1 }}>
            <SectionTitle>Últimos productos</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ultimosProds.map((p, i) => (
                <div key={p.id_producto}
                  onClick={() => navigate(`/admin/producto/${p.id_producto}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: '#1A1A18', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.imagen
                      ? <img src={p.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      : <Icon d={ICONS.placeholder} size={16} color="rgba(255,255,255,0.15)"/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: i === 0 ? '#E8DCC8' : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{p.marca || '—'}</div>
                  </div>
                  <div style={{ fontSize: 12, color: PALETA.oro, fontFamily: 'Cinzel, serif', flexShrink: 0 }}>
                    {p.precio ? fmtCompact(p.precio) : '—'}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/admin/products')}
              style={{ marginTop: 12, background: 'none', border: 'none', color: PALETA.oro, fontSize: 10, cursor: 'pointer', padding: 0, fontFamily: 'Cinzel, serif', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              Ver todos <Icon d={ICONS.arrow} size={13} color={PALETA.oro}/>
            </button>
          </Panel>
        </div>
      </div>

    </div>
  );
}
