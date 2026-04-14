import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito }  from '../../hooks/useCarrito';
import { useWishlist } from '../../hooks/useWishlist';

export default function Home() {
  const navigate = useNavigate();
  const { carrito, agregar: agregarCarrito, count: cartCount } = useCarrito();
  const { toggle: toggleWish, estaEn, wishlist, quitar: quitarWish, count: wishCount } = useWishlist();

  const [panelAbierto, setPanelAbierto] = useState(null); // 'carrito' | 'wishlist' | null
  const [productosDestacados, setProductosDestacados] = useState([]);

  /* Cargar productos destacados del localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('op_productos_destacados');
      if (raw) {
        const data = JSON.parse(raw);
        const filtrados = data.filter(p => p.nombre);
        setProductosDestacados(filtrados);
      }
    } catch {}
  }, []);

  function formatCOP(v) {
    return '$ ' + Number(v || 0).toLocaleString('es-CO');
  }

  function parsePrecio(v) {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    return parseFloat(String(v).replace(/[$\s.]/g, '').replace(/,/g, '')) || 0;
  }

  const COLECCIONES = [
    { nombre: 'Nicho',      icono: '🏺', count: '+120', color: 'rgba(180,130,30,0.18)' },
    { nombre: 'Oriental',   icono: '🌙', count: '+85',  color: 'rgba(160,100,10,0.2)' },
    { nombre: 'Diseñador',  icono: '💎', count: '+200', color: 'rgba(140,95,15,0.18)' },
    { nombre: 'Exclusivos', icono: '✨', count: '+45',  color: 'rgba(170,120,20,0.2)' },
  ];

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Lato, sans-serif' }}>

      {/* ── Header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0a0a08', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#C9A84C', letterSpacing: '0.1em' }}>ORIENTPERFUMES</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Wishlist */}
          <button onClick={() => setPanelAbierto(p => p === 'wishlist' ? null : 'wishlist')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', padding: '6px 12px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ♡ {wishCount}
          </button>
          {/* Carrito */}
          <button onClick={() => setPanelAbierto(p => p === 'carrito' ? null : 'carrito')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', padding: '6px 12px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🛒 {cartCount}
          </button>
          {/* Login */}
          <button onClick={() => navigate('/login')}
            style={{ background: '#C9A84C', border: 'none', borderRadius: '6px', padding: '6px 16px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.1em' }}>
            Ingresar
          </button>
        </div>
      </header>

      {/* ── Colecciones ── */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '12px' }}>DESCUBRE</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,5vw,48px)', color: '#E8DCC8', margin: '0 0 8px' }}>Nuestras Colecciones</h2>
          <p style={{ color: '#9A9180', fontSize: '14px' }}>Cada fragancia, una historia única</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
          {COLECCIONES.map(col => (
            <div key={col.nombre}
              onClick={() => navigate(`/coleccion?categoria=${encodeURIComponent(col.nombre)}`)}
              style={{ background: `radial-gradient(circle at 50% 30%, ${col.color} 0%, transparent 55%), linear-gradient(to bottom, #1a1510, #0a0a08)`, border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)'}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{col.icono}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#E8DCC8', letterSpacing: '0.1em' }}>{col.nombre}</div>
              <div style={{ fontSize: '12px', color: '#9A9180', marginTop: '4px' }}>{col.count} fragancias</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Productos Destacados ── */}
      {productosDestacados.length > 0 && (
        <section style={{ padding: '0 24px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '12px' }}>SELECCIÓN</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,5vw,48px)', color: '#E8DCC8', margin: '0 0 8px' }}>Productos Destacados</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {productosDestacados.map((p, i) => (
              <ProductCard key={i} producto={p}
                enWishlist={estaEn(String(p.id || p.nombre))}
                onWishlist={() => toggleWish({ id: String(p.id || p.nombre), nombre: p.nombre, marca: p.marca || '', precio: parsePrecio(p.precio), imagen: p.imagen || '' })}
                onCarrito={() => agregarCarrito({ id: String(p.id || p.nombre), nombre: p.nombre, marca: p.marca || '', precio: parsePrecio(p.precio), imagen: p.imagen || '' })}
                formatCOP={formatCOP}
              />
            ))}
          </div>
        </section>
      )}

      {!productosDestacados.length && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.15em' }}>
          PRODUCTOS PRÓXIMAMENTE
        </div>
      )}

      {/* ── Paneles laterales ── */}
      <PanelLateral
        abierto={panelAbierto === 'carrito'}
        titulo="CARRITO DE COMPRAS"
        onCerrar={() => setPanelAbierto(null)}>
        <PanelCarrito carrito={carrito} formatCOP={formatCOP} />
      </PanelLateral>

      <PanelLateral
        abierto={panelAbierto === 'wishlist'}
        titulo="LISTA DE DESEOS"
        onCerrar={() => setPanelAbierto(null)}>
        <PanelWishlist wishlist={wishlist} onQuitar={quitarWish} formatCOP={formatCOP} />
      </PanelLateral>

      {/* Overlay */}
      {panelAbierto && (
        <div onClick={() => setPanelAbierto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
      )}
    </div>
  );
}

/* ── Componentes ── */
function ProductCard({ producto: p, enWishlist, onWishlist, onCarrito, formatCOP }) {
  const [added, setAdded] = useState(false);
  function handleCarrito() {
    onCarrito();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ position: 'relative', paddingBottom: '100%', background: '#1a1a18' }}>
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🫙</div>}
        <button onClick={onWishlist}
          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>
          {enWishlist ? '❤️' : '🤍'}
        </button>
      </div>
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: '11px', color: '#9A9180', marginBottom: '4px' }}>{p.marca}</div>
        <div style={{ fontSize: '14px', color: '#E8DCC8', fontWeight: 600, marginBottom: '8px' }}>{p.nombre}</div>
        <div style={{ fontSize: '14px', color: '#C9A84C', marginBottom: '10px' }}>{p.precio}</div>
        <button onClick={handleCarrito}
          style={{ width: '100%', background: added ? '#4a7c59' : 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '4px', padding: '8px', color: added ? '#fff' : '#C9A84C', cursor: 'pointer', fontSize: '11px', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', transition: 'all 0.2s' }}>
          {added ? '✓ Añadido' : 'Añadir al Carrito'}
        </button>
      </div>
    </div>
  );
}

function PanelLateral({ abierto, titulo, onCerrar, children }) {
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '340px', maxWidth: '100vw', background: '#111', borderLeft: '1px solid rgba(201,168,76,0.2)', zIndex: 1000, transform: abierto ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', letterSpacing: '0.15em', color: '#C9A84C' }}>{titulo}</span>
        <button onClick={onCerrar} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>{children}</div>
    </div>
  );
}

function PanelCarrito({ carrito, formatCOP }) {
  if (!carrito.length) return <p style={{ textAlign: 'center', color: '#9A9180', fontSize: '12px', letterSpacing: '0.1em', padding: '20px' }}>EL CARRITO ESTÁ VACÍO</p>;
  const total = carrito.reduce((s, i) => s + (i.precio * (i.cantidad || 1)), 0);
  return (
    <>
      {carrito.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          {item.imagen ? <img src={item.imagen} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} alt="" /> : <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🫙</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#E8DCC8', fontWeight: 600 }}>{item.nombre}</div>
            {item.presentacion && <div style={{ fontSize: 10, color: '#9A9180' }}>{item.presentacion}</div>}
            <div style={{ fontSize: 11, color: '#C9A84C', marginTop: 2 }}>{formatCOP(item.precio)} × {item.cantidad || 1}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#9A9180', letterSpacing: '0.1em' }}>TOTAL</div>
        <div style={{ fontSize: 18, color: '#C9A84C', fontWeight: 700 }}>{formatCOP(total)}</div>
      </div>
    </>
  );
}

function PanelWishlist({ wishlist, onQuitar, formatCOP }) {
  if (!wishlist.length) return <p style={{ textAlign: 'center', color: '#9A9180', fontSize: '12px', letterSpacing: '0.1em', padding: '20px' }}>TU LISTA DE DESEOS ESTÁ VACÍA</p>;
  return (
    <>
      {wishlist.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          {item.imagen ? <img src={item.imagen} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} alt="" /> : <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🫙</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#E8DCC8', fontWeight: 600 }}>{item.nombre}</div>
            <div style={{ fontSize: 11, color: '#9A9180' }}>{item.marca}</div>
            <div style={{ fontSize: 11, color: '#C9A84C', marginTop: 2 }}>{formatCOP(item.precio)}</div>
          </div>
          <button onClick={() => onQuitar(item.id)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
      ))}
    </>
  );
}