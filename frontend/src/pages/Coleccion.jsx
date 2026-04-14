import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productosAPI } from '../services/api';
import { useCarrito }   from '../hooks/useCarrito';
import { useWishlist }  from '../hooks/useWishlist';

const INFO = {
  'Nicho':      { eyebrow: 'Perfumería de Autor',  desc: 'Las más exclusivas casas de nicho en un solo lugar' },
  'Oriental':   { eyebrow: 'Colección Oriental',   desc: 'Oud, Ámbar, Sándalo y Musk en su máxima expresión' },
  'Diseñador':  { eyebrow: 'Grandes Maisons',      desc: 'Las firmas más reconocidas de la perfumería mundial' },
  'Exclusivos': { eyebrow: 'Ediciones Especiales', desc: 'Fragancias únicas y ediciones limitadas de colección' },
};

export default function Coleccion() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const categoria  = params.get('categoria') || '';

  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);

  const { agregar: agregarCarrito, count: cartCount } = useCarrito();
  const { toggle: toggleWish, estaEn, wishlist, quitar: quitarWish, count: wishCount } = useWishlist();
  const [panelAbierto, setPanelAbierto] = useState(null);
  const { carrito } = useCarrito();

  const info = INFO[categoria] || { eyebrow: 'Colección', desc: '' };

  useEffect(() => {
    productosAPI.listar().then(res => {
      if (res.ok) {
        const filtrados = res.data.filter(p =>
          (p.nombre_categoria || '').toLowerCase() === categoria.toLowerCase()
        );
        setProductos(filtrados);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [categoria]);

  function formatCOP(v) {
    return '$ ' + Number(v || 0).toLocaleString('es-CO');
  }

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Lato, sans-serif' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0a0a08', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#C9A84C', letterSpacing: '0.1em', cursor: 'pointer' }} onClick={() => navigate('/')}>ORIENTPERFUMES</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setPanelAbierto(p => p === 'wishlist' ? null : 'wishlist')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', padding: '6px 12px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px' }}>
            ♡ {wishCount}
          </button>
          <button onClick={() => setPanelAbierto(p => p === 'carrito' ? null : 'carrito')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', padding: '6px 12px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px' }}>
            🛒 {cartCount}
          </button>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '6px 12px', color: '#9A9180', cursor: 'pointer', fontSize: '11px' }}>
            ← Inicio
          </button>
        </div>
      </header>

      {/* Colección header */}
      <div style={{ padding: '80px 24px 40px', textAlign: 'center', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '12px' }}>{info.eyebrow}</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,6vw,56px)', color: '#E8DCC8', margin: '0 0 12px' }}>{categoria}</h1>
        <p style={{ color: '#9A9180', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>{info.desc}</p>
      </div>

      {/* Productos */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {loading && <p style={{ textAlign: 'center', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.15em' }}>CARGANDO PRODUCTOS...</p>}

        {!loading && !productos.length && (
          <p style={{ textAlign: 'center', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.15em', padding: '60px' }}>
            NO HAY PRODUCTOS EN ESTA COLECCIÓN AÚN
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '20px' }}>
          {productos.map(p => (
            <div key={p.id_producto} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ position: 'relative', paddingBottom: '100%', background: '#1a1a18' }}>
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🫙</div>}
                <button onClick={() => toggleWish({ id: String(p.id_producto), nombre: p.nombre, marca: p.marca || '', precio: p.precio, imagen: p.imagen || '' })}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>
                  {estaEn(String(p.id_producto)) ? '❤️' : '🤍'}
                </button>
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9A9180', marginBottom: '4px' }}>{p.marca || ''}</div>
                <div style={{ fontSize: '14px', color: '#E8DCC8', fontWeight: 600, marginBottom: '8px' }}>{p.nombre}</div>
                <div style={{ fontSize: '14px', color: '#C9A84C', marginBottom: '8px' }}>{formatCOP(p.precio)}</div>

                {/* Selector presentaciones */}
                {p.presentaciones && p.presentaciones.length > 1 && (
                  <select id={`pres-${p.id_producto}`}
                    style={{ width: '100%', background: '#1a1a18', color: '#C8C0B0', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '4px', padding: '6px 8px', fontSize: '11px', marginBottom: '8px' }}>
                    {p.presentaciones.map(pr => (
                      <option key={pr.etiqueta} value={pr.etiqueta} data-precio={pr.precio}>
                        {pr.etiqueta} — $ {Number(pr.precio || 0).toLocaleString('es-CO')}
                      </option>
                    ))}
                  </select>
                )}

                <button onClick={() => {
                  const sel = document.getElementById(`pres-${p.id_producto}`);
                  const presLabel = sel ? sel.value : '';
                  const precio = sel
                    ? parseFloat(sel.options[sel.selectedIndex]?.dataset?.precio) || p.precio
                    : p.precio;
                  agregarCarrito({ id: String(p.id_producto) + (presLabel ? '_' + presLabel : ''), nombre: p.nombre, marca: p.marca || '', precio: Number(precio), imagen: p.imagen || '', presentacion: presLabel });
                }}
                  style={{ width: '100%', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '4px', padding: '8px', color: '#C9A84C', cursor: 'pointer', fontSize: '11px', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                  Añadir al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paneles */}
      {panelAbierto && <div onClick={() => setPanelAbierto(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />}

      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '340px', maxWidth: '100vw', background: '#111', borderLeft: '1px solid rgba(201,168,76,0.2)', zIndex: 1000, transform: panelAbierto ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', letterSpacing: '0.15em', color: '#C9A84C' }}>{panelAbierto === 'carrito' ? 'CARRITO' : 'LISTA DE DESEOS'}</span>
          <button onClick={() => setPanelAbierto(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {panelAbierto === 'carrito' && (
            carrito.length
              ? carrito.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                  {item.imagen ? <img src={item.imagen} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} alt="" /> : <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', borderRadius: 4 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#E8DCC8', fontWeight: 600 }}>{item.nombre}</div>
                    <div style={{ fontSize: 11, color: '#C9A84C' }}>{formatCOP(item.precio)} × {item.cantidad || 1}</div>
                  </div>
                </div>
              ))
              : <p style={{ textAlign: 'center', color: '#9A9180', fontSize: '12px' }}>EL CARRITO ESTÁ VACÍO</p>
          )}
          {panelAbierto === 'wishlist' && (
            wishlist.length
              ? wishlist.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                  {item.imagen ? <img src={item.imagen} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} alt="" /> : <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', borderRadius: 4 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#E8DCC8', fontWeight: 600 }}>{item.nombre}</div>
                    <div style={{ fontSize: 11, color: '#C9A84C' }}>{formatCOP(item.precio)}</div>
                  </div>
                  <button onClick={() => quitarWish(item.id)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer' }}>✕</button>
                </div>
              ))
              : <p style={{ textAlign: 'center', color: '#9A9180', fontSize: '12px' }}>LISTA DE DESEOS VACÍA</p>
          )}
        </div>
      </div>
    </div>
  );
}