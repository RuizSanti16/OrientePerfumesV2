import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI, clientesAPI, ventasAPI, inventarioAPI } from '../../services/api';

/* ── Helpers ─────────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── SVG Icons ───────────────────────────────────────────────── */
function Icon({ d, size = 20, color = 'currentColor', strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
  placeholder: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
};

/* ── Sub-components ──────────────────────────────────────────── */
function KpiCard({ iconEl, label, value, sub, color = '#C9A84C' }) {
  return (
    <div style={{
      background: '#111', border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: 10, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, display: 'flex',
        alignItems: 'center', justifyContent: 'center', color,
      }}>
        <Icon d={iconEl} size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: '#9A9180', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', marginTop: 4, textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#6B6355', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em',
      color: '#C9A84C', textTransform: 'uppercase',
      marginBottom: 16, paddingBottom: 10,
      borderBottom: '1px solid rgba(201,168,76,0.12)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>{children}</h2>
  );
}

function Badge({ children, color = '#C9A84C' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
      background: `${color}18`, color, border: `1px solid ${color}30`,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [productos, setProductos] = useState([]);
  const [clientes,  setClientes]  = useState([]);
  const [ventas,    setVentas]    = useState([]);
  const [inventario, setInventario] = useState([]);

  const session = (() => {
    try { return JSON.parse(localStorage.getItem('op_admin_session') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    Promise.all([
      productosAPI.listar(),
      clientesAPI.listar(),
      ventasAPI.listar(),
      inventarioAPI.listar(),
    ]).then(([p, c, v, i]) => {
      setProductos(p.ok ? p.data : []);
      setClientes(c.ok  ? c.data : []);
      setVentas(v.ok    ? v.data : []);
      setInventario(i.ok ? i.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  /* ── KPIs calculados ── */
  const totalIngresos = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0);
  const ultimasVentas = [...ventas].slice(0, 8);
  const stockBajo     = inventario.filter(i => parseInt(i.stock) < 5).slice(0, 6);
  const ultimosProds  = [...productos].slice(0, 6);

  /* ── Saludo según hora ── */
  const hora   = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  /* ── Accesos rápidos ── */
  const ACCESOS = [
    { label: 'Productos',   to: '/admin/products',    iconEl: ICONS.producto   },
    { label: 'Categorías',  to: '/admin/categories',  iconEl: ICONS.categoria  },
    { label: 'Destacados',  to: '/admin/destacados',  iconEl: ICONS.estrella   },
    { label: 'Clientes',    to: '/admin/customers',   iconEl: ICONS.cliente    },
    { label: 'Inventario',  to: '/admin/inventory',   iconEl: ICONS.inventario },
    { label: 'Colecciones', to: '/admin/colecciones', iconEl: ICONS.coleccion  },
    { label: 'Carrusel',    to: '/admin/carrusel',    iconEl: ICONS.carrusel   },
    { label: 'Ajustes',     to: '/admin/ajustes',     iconEl: ICONS.ajustes    },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#C9A84C', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', fontSize: 13 }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Encabezado ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#F5F0E8', fontWeight: 600, margin: 0 }}>
          {saludo}, <span style={{ color: '#C9A84C' }}>{session.nombre || 'Admin'}</span>
        </h1>
        <p style={{ color: '#6B6355', fontSize: 13, marginTop: 6 }}>Aquí tienes un resumen de tu tienda</p>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16, marginBottom: 36 }}>
        <KpiCard iconEl={ICONS.producto} label="Productos" value={productos.length}
          sub={`${productos.length} artículos en catálogo`} />
        <KpiCard iconEl={ICONS.cliente}  label="Clientes"  value={clientes.length}
          sub="Registrados en el sistema" color="#7EB8C4" />
        <KpiCard iconEl={ICONS.venta}    label="Ventas"    value={ventas.length}
          sub="Total de órdenes" color="#9B8DC8" />
        <KpiCard iconEl={ICONS.ingreso}  label="Ingresos"  value={fmt(totalIngresos)}
          sub="Suma de todas las ventas" color="#6BC48C" />
      </div>

      {/* ── Fila principal ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginBottom: 24 }}>

        {/* Últimas ventas */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '22px 24px' }}>
          <SectionTitle>Últimas ventas</SectionTitle>
          {ultimasVentas.length === 0 ? (
            <p style={{ color: '#6B6355', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No hay ventas registradas aún</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Cliente', 'Fecha', 'Total'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', color: '#6B6355', textTransform: 'uppercase', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultimasVentas.map(v => (
                  <tr key={v.id_venta} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 0', fontSize: 12, color: '#6B6355' }}>#{v.id_venta}</td>
                    <td style={{ padding: '10px 12px 10px 0', fontSize: 13, color: '#E8DCC8' }}>{v.nombre_cliente || '—'}</td>
                    <td style={{ padding: '10px 12px 10px 0', fontSize: 12, color: '#9A9180' }}>{fmtFecha(v.fecha)}</td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: '#6BC48C', fontWeight: 600 }}>{fmt(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {ventas.length > 8 && (
            <button onClick={() => navigate('/admin/ventas')}
              style={{ marginTop: 16, background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
              Ver todas <Icon d={ICONS.arrow} size={14} color="#C9A84C" />
            </button>
          )}
        </div>

        {/* Accesos rápidos */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '22px 24px' }}>
          <SectionTitle>Accesos rápidos</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ACCESOS.map(a => (
              <button key={a.to} onClick={() => navigate(a.to)}
                style={{
                  background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)',
                  borderRadius: 8, padding: '12px 8px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                  transition: 'background 0.2s, border-color 0.2s', color: '#9A9180',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.color = '#C9A84C'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.04)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'; e.currentTarget.style.color = '#9A9180'; }}
              >
                <Icon d={a.iconEl} size={20} color="currentColor" />
                <span style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', textAlign: 'center' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fila secundaria ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Stock bajo */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '22px 24px' }}>
          <SectionTitle>
            <Icon d={ICONS.alerta} size={13} color="#C9A84C" />
            Stock bajo
          </SectionTitle>
          {stockBajo.length === 0 ? (
            <div style={{ color: '#6BC48C', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
              <Icon d={ICONS.check} size={16} color="#6BC48C" strokeWidth={2.5} />
              Todo el inventario está al día
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stockBajo.map(item => (
                <div key={item.id_inventario}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,100,80,0.05)', borderRadius: 6, border: '1px solid rgba(255,100,80,0.12)' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#E8DCC8' }}>{item.nombre_producto}</div>
                    <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{item.marca}</div>
                  </div>
                  <Badge color={parseInt(item.stock) === 0 ? '#e74c3c' : '#E8A94C'}>
                    {parseInt(item.stock) === 0 ? 'Sin stock' : `${item.stock} uds`}
                  </Badge>
                </div>
              ))}
              {inventario.filter(i => parseInt(i.stock) < 5).length > 6 && (
                <button onClick={() => navigate('/admin/inventory')}
                  style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Ver todos <Icon d={ICONS.arrow} size={14} color="#C9A84C" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Últimos productos */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '22px 24px' }}>
          <SectionTitle>Últimos productos</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ultimosProds.length === 0 ? (
              <p style={{ color: '#6B6355', fontSize: 13 }}>No hay productos registrados</p>
            ) : ultimosProds.map(p => (
              <div key={p.id_producto}
                onClick={() => navigate(`/admin/producto/${p.id_producto}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 38, height: 38, borderRadius: 6, background: '#1A1A18', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6355' }}>
                  {p.imagen
                    ? <img src={p.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Icon d={ICONS.placeholder} size={18} color="#6B6355" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#E8DCC8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{p.marca || '—'}</div>
                </div>
                <div style={{ fontSize: 13, color: '#C9A84C', fontWeight: 600, flexShrink: 0 }}>
                  {p.precio ? fmt(p.precio) : '—'}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/admin/products')}
            style={{ marginTop: 12, background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
            Ver todos los productos <Icon d={ICONS.arrow} size={14} color="#C9A84C" />
          </button>
        </div>

      </div>
    </div>
  );
}
