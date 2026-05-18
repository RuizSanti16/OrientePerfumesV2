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

/* ── Sub-components ──────────────────────────────────────────── */
function KpiCard({ icon, label, value, sub, color = '#C9A84C' }) {
  return (
    <div style={{
      background: '#111', border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: '10px', padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '10px', flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22,
      }}>{icon}</div>
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
      fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.2em',
      color: '#C9A84C', textTransform: 'uppercase',
      marginBottom: 16, paddingBottom: 10,
      borderBottom: '1px solid rgba(201,168,76,0.12)',
    }}>{children}</h2>
  );
}

function Badge({ children, color = '#C9A84C' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>{children}</span>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
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

  /* ── Hora de saludo ── */
  const hora  = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  /* ── Accesos rápidos ── */
  const ACCESOS = [
    { label: 'Productos',    to: '/admin/products',    icon: '🛍️' },
    { label: 'Categorías',   to: '/admin/categories',  icon: '🏷️' },
    { label: 'Destacados',   to: '/admin/destacados',  icon: '⭐' },
    { label: 'Clientes',     to: '/admin/customers',   icon: '👥' },
    { label: 'Inventario',   to: '/admin/inventory',   icon: '📦' },
    { label: 'Colecciones',  to: '/admin/colecciones', icon: '🖼️' },
    { label: 'Carrusel',     to: '/admin/carrusel',    icon: '🎞️' },
    { label: 'Ajustes',      to: '/admin/ajustes',     icon: '⚙️' },
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
        <KpiCard icon="🛍️" label="Productos"    value={productos.length} sub={`${productos.length === 1 ? '1 artículo' : `${productos.length} artículos`} en catálogo`} />
        <KpiCard icon="👥" label="Clientes"     value={clientes.length}  sub="Registrados en el sistema" color="#7EB8C4" />
        <KpiCard icon="🧾" label="Ventas"       value={ventas.length}    sub="Total de órdenes" color="#9B8DC8" />
        <KpiCard icon="💰" label="Ingresos"     value={fmt(totalIngresos)} sub="Suma de todas las ventas" color="#6BC48C" />
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
                {ultimasVentas.map((v, i) => (
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
              style={{ marginTop: 16, background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
              Ver todas →
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
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.04)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'; }}
              >
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <span style={{ fontSize: 10, fontFamily: 'Cinzel, serif', color: '#9A9180', letterSpacing: '0.1em', textAlign: 'center' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fila secundaria ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Stock bajo */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '22px 24px' }}>
          <SectionTitle>⚠ Stock bajo</SectionTitle>
          {stockBajo.length === 0 ? (
            <p style={{ color: '#6BC48C', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
              <span style={{ fontSize: 16 }}>✓</span> Todo el inventario está al día
            </p>
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
                    {item.stock === 0 || item.stock === '0' ? 'Sin stock' : `${item.stock} uds`}
                  </Badge>
                </div>
              ))}
              {inventario.filter(i => parseInt(i.stock) < 5).length > 6 && (
                <button onClick={() => navigate('/admin/inventory')}
                  style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                  Ver todos →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Últimos productos */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '22px 24px' }}>
          <SectionTitle>Últimos productos</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ultimosProds.length === 0 ? (
              <p style={{ color: '#6B6355', fontSize: 13 }}>No hay productos registrados</p>
            ) : ultimosProds.map(p => (
              <div key={p.id_producto}
                onClick={() => navigate(`/admin/producto/${p.id_producto}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Imagen */}
                <div style={{ width: 38, height: 38, borderRadius: 6, background: '#1A1A18', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.12)' }}>
                  {p.imagen ? (
                    <img src={p.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛍️</div>
                  )}
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
            style={{ marginTop: 12, background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
            Ver todos los productos →
          </button>
        </div>

      </div>
    </div>
  );
}
