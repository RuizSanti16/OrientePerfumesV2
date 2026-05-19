import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pedidosAPI } from '../services/api';

/* ── helpers ─────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  back:    <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  truck:   <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  clock:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  check:   <><polyline points="20 6 9 17 4 12"/></>,
  package: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  home:    <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
};

/* ── Estado pipeline ─────────────────────────────────────── */
const PIPELINE = [
  { key: 'pendiente',   label: 'Pedido recibido',  icon: IC.clock,   desc: 'Hemos recibido tu pedido y lo estamos procesando.' },
  { key: 'preparacion', label: 'En preparación',   icon: IC.package, desc: 'Tu pedido está siendo preparado con cuidado.' },
  { key: 'enviado',     label: 'En camino',         icon: IC.truck,   desc: 'Tu pedido ha sido enviado y está en camino.' },
  { key: 'entregado',   label: 'Entregado',         icon: IC.check,   desc: 'Tu pedido fue entregado exitosamente.' },
];

const ESTADO_IDX = {
  pendiente: 0, preparacion: 1, enviado: 2, entregado: 3, cancelado: -1,
};

function ProgressPipeline({ estado }) {
  const idx      = ESTADO_IDX[estado] ?? 0;
  const esCancel = estado === 'cancelado';

  if (esCancel) return (
    <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 10, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flexShrink: 0, color: '#e74c3c' }}><Icon d={IC.x} size={22} color="#e74c3c" /></div>
      <div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#e74c3c', letterSpacing: '0.15em' }}>PEDIDO CANCELADO</div>
        <div style={{ fontSize: 12, color: '#9A9180', marginTop: 4 }}>Este pedido fue cancelado. Contáctanos para más información.</div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', padding: '8px 0' }}>
      {/* Línea de fondo */}
      <div style={{ position: 'absolute', top: 26, left: 22, right: 22, height: 2, background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
      {/* Línea de progreso */}
      <div style={{
        position: 'absolute', top: 26, left: 22, height: 2, zIndex: 1,
        background: 'linear-gradient(90deg, #C9A84C, #E8C97A)',
        width: idx === 0 ? '0%' : `${(idx / (PIPELINE.length - 1)) * (100 - 100 / PIPELINE.length)}%`,
        transition: 'width 0.6s ease',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        {PIPELINE.map((step, i) => {
          const done    = i < idx;
          const current = i === idx;
          const future  = i > idx;
          const color   = done || current ? '#C9A84C' : '#3A3830';
          const textC   = done || current ? '#E8DCC8' : '#6B6355';
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: done ? '#C9A84C' : current ? 'rgba(201,168,76,0.15)' : '#1A1A18',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.4s',
                boxShadow: current ? '0 0 16px rgba(201,168,76,0.3)' : 'none',
              }}>
                <Icon d={step.icon} size={18} color={done ? '#0a0a08' : color} sw={done ? 2.2 : 1.6} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: textC, whiteSpace: 'nowrap' }}>{step.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Descripción estado actual */}
      {PIPELINE[idx] && (
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#9A9180', background: 'rgba(201,168,76,0.04)', borderRadius: 8, padding: '12px 16px' }}>
          {PIPELINE[idx].desc}
        </div>
      )}
    </div>
  );
}

/* ── Formulario de búsqueda ──────────────────────────────── */
function FormaBusqueda({ onBuscar }) {
  const [codigo, setCodigo] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Raleway, sans-serif' }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon d={IC.truck} size={26} color="#C9A84C" />
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#6B6355', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10 }}>Seguimiento</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#F5F0E8', fontWeight: 600, margin: '0 0 12px' }}>
          Rastrea tu <span style={{ color: '#C9A84C' }}>pedido</span>
        </h1>
        <p style={{ color: '#9A9180', fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>
          Ingresa el código de seguimiento que recibiste al confirmar tu pedido.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && codigo.trim() && onBuscar(codigo.trim())}
            placeholder="Ej. OPAB3K91"
            style={{ flex: 1, background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '12px 14px', color: '#E8DCC8', fontSize: 14, outline: 'none', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}
          />
          <button
            onClick={() => codigo.trim() && onBuscar(codigo.trim())}
            style={{ padding: '12px 18px', background: '#C9A84C', border: 'none', borderRadius: 6, color: '#0a0a08', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Icon d={IC.search} size={18} color="#0a0a08" />
          </button>
        </div>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, color: '#6B6355', fontSize: 12, textDecoration: 'none', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
          <Icon d={IC.home} size={13} color="#6B6355" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function SeguimientoPedido() {
  const { codigo: codigoParam } = useParams();
  const navigate = useNavigate();

  const [pedido,   setPedido]  = useState(null);
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [buscado,  setBuscado] = useState(false);

  async function buscar(codigo) {
    setLoading(true); setError(''); setPedido(null); setBuscado(true);
    const r = await pedidosAPI.seguimiento(codigo);
    setLoading(false);
    if (r.ok) { setPedido(r.data); navigate(`/seguimiento/${codigo}`, { replace: true }); }
    else { setError(r.mensaje || 'Pedido no encontrado'); }
  }

  /* Auto-búsqueda si hay código en la URL */
  useEffect(() => {
    if (codigoParam) buscar(codigoParam);
  }, []);

  if (!buscado && !codigoParam) return <FormaBusqueda onBuscar={buscar} />;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#C9A84C', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.2em' }}>Buscando pedido...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Raleway, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: '#6B6355' }}>
          <Icon d={IC.x} size={48} color="#e74c3c" />
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#e74c3c', letterSpacing: '0.15em', marginBottom: 10 }}>PEDIDO NO ENCONTRADO</div>
        <p style={{ color: '#9A9180', fontSize: 13, marginBottom: 24 }}>{error}</p>
        <button onClick={() => { setBuscado(false); setError(''); navigate('/seguimiento', { replace: true }); }}
          style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, color: '#C9A84C', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer' }}>
          BUSCAR OTRO CÓDIGO
        </button>
      </div>
    </div>
  );

  if (!pedido) return <FormaBusqueda onBuscar={buscar} />;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', fontFamily: 'Raleway, sans-serif' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9A9180', fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', textDecoration: 'none' }}>
          <Icon d={IC.home} size={15} color="#9A9180" />
          Inicio
        </Link>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: '#C9A84C', letterSpacing: '0.2em' }}>
          ORIENTPERFUMES
        </div>
        <button onClick={() => { setBuscado(false); setPedido(null); navigate('/seguimiento', { replace: true }); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6355', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
          Buscar otro
        </button>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px' }}>

        {/* Header pedido */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8 }}>Seguimiento de pedido</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, color: '#F5F0E8', fontWeight: 600, margin: 0 }}>
                {pedido.codigo_seguimiento}
              </h1>
              <div style={{ fontSize: 12, color: '#9A9180', marginTop: 4 }}>
                Pedido realizado el {fmtFecha(pedido.fecha_pedido)}
              </div>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 6,
              background: pedido.estado === 'entregado' ? 'rgba(107,196,140,0.12)' : pedido.estado === 'cancelado' ? 'rgba(231,76,60,0.12)' : 'rgba(201,168,76,0.1)',
              border: `1px solid ${pedido.estado === 'entregado' ? 'rgba(107,196,140,0.3)' : pedido.estado === 'cancelado' ? 'rgba(231,76,60,0.3)' : 'rgba(201,168,76,0.25)'}`,
              color: pedido.estado === 'entregado' ? '#6BC48C' : pedido.estado === 'cancelado' ? '#e74c3c' : '#C9A84C',
              fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em',
            }}>
              {{ pendiente: 'PENDIENTE', preparacion: 'EN PREPARACIÓN', enviado: 'EN CAMINO', entregado: 'ENTREGADO', cancelado: 'CANCELADO' }[pedido.estado] || pedido.estado.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '24px', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>Estado del pedido</div>
          <ProgressPipeline estado={pedido.estado} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Datos de entrega */}
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>Datos de entrega</div>
            {[
              ['Nombre',    pedido.nombre],
              ['Correo',    pedido.correo],
              ['Teléfono',  pedido.telefono || '—'],
              ['Ciudad',    pedido.ciudad   || '—'],
              ['Dirección', pedido.direccion],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#6B6355', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, color: '#E8DCC8' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Resumen de pago */}
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>Resumen de pago</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#6B6355', marginBottom: 2 }}>MÉTODO</div>
              <div style={{ fontSize: 13, color: '#E8DCC8', textTransform: 'capitalize' }}>{pedido.metodo_pago || '—'}</div>
            </div>
            {parseFloat(pedido.descuento) > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#6B6355', marginBottom: 2 }}>DESCUENTO {pedido.cupon ? `(${pedido.cupon})` : ''}</div>
                <div style={{ fontSize: 13, color: '#6BC48C' }}>-{fmt(pedido.descuento)}</div>
              </div>
            )}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#6B6355', marginBottom: 4 }}>TOTAL</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#C9A84C', fontFamily: 'Cormorant Garamond, serif' }}>{fmt(pedido.total)}</div>
            </div>
          </div>
        </div>

        {/* Productos */}
        {pedido.items && pedido.items.length > 0 && (
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>Productos del pedido</div>
            {pedido.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < pedido.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#E8DCC8' }}>{item.nombre_producto}</div>
                  {item.presentacion && <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{item.presentacion}</div>}
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6B6355' }}>×{item.cantidad}</span>
                  <span style={{ fontSize: 13, color: '#C9A84C', fontWeight: 600 }}>{fmt(item.precio_unitario * item.cantidad)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
