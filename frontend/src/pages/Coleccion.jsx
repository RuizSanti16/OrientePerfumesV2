import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productosAPI } from '../services/api';
import { useCarrito }   from '../hooks/useCarrito';
import { useWishlist }  from '../hooks/useWishlist';
import SocialButtons   from '../components/SocialButtons';

/* ── Íconos SVG ── */
const IconBottle = ({ size = 32 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.2" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.25 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconHeartFilled = () => (
  <svg viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1.2" width="18" height="18" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const INFO = {
  'Nicho':      { eyebrow: 'Perfumería de Autor',  desc: 'Las más exclusivas casas de nicho en un solo lugar' },
  'Oriental':   { eyebrow: 'Colección Oriental',   desc: 'Oud, Ámbar, Sándalo y Musk en su máxima expresión' },
  'Diseñador':  { eyebrow: 'Grandes Maisons',      desc: 'Las firmas más reconocidas de la perfumería mundial' },
  'Exclusivos': { eyebrow: 'Ediciones Especiales', desc: 'Fragancias únicas y ediciones limitadas de colección' },
};

function formatCOP(v) {
  return '$ ' + Number(v || 0).toLocaleString('es-CO');
}

export default function Coleccion() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const categoria = params.get('categoria') || '';
  const info      = INFO[categoria] || { eyebrow: 'Colección', desc: '' };

  const [productos,    setProductos]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [panelAbierto, setPanelAbierto] = useState(null);

  const { agregar: agregarCarrito, quitar: quitarCarrito, carrito, count: cartCount } = useCarrito();
  const { toggle: toggleWish, estaEn, wishlist, quitar: quitarWish, count: wishCount } = useWishlist();

  const totalCarrito = carrito.reduce((s, i) => s + (i.precio * (i.cantidad || 1)), 0);

  useEffect(() => {
    productosAPI.listar().then(res => {
      if (res.ok) {
        setProductos(res.data.filter(p =>
          (p.nombre_categoria || '').toLowerCase() === categoria.toLowerCase()
        ));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [categoria]);

  useEffect(() => {
    function onScroll() {
      const h = document.getElementById('header-col');
      if (h) h.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.4)' : 'none';
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif' }}>

      {/* Announcement Bar */}
      <div className="announcement-bar" role="banner">
        <div className="announcement-bar__track" aria-hidden="true">
          <span className="announcement-bar__text">
            Envío gratuito en pedidos superiores a $150.000 <span>·</span> Fragancias 100% Originales <span>·</span> Más de 500 referencias exclusivas <span>·</span> Atención personalizada <span>·</span>
          </span>
        </div>
      </div>

      {/* Header */}
      <header id="header-col" className="header" role="banner" style={{ transition: 'box-shadow 0.3s' }}>
        <a onClick={() => navigate('/')} className="header__logo" style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="OrientPerfumes logo" />
          </div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>

        <div className="header__actions">
          <button className="action-btn" onClick={() => setPanelAbierto(p => p === 'wishlist' ? null : 'wishlist')} aria-label={`Lista de deseos (${wishCount})`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span className="action-btn__badge">{wishCount}</span>
          </button>

          <button className="action-btn" onClick={() => setPanelAbierto(p => p === 'carrito' ? null : 'carrito')} aria-label={`Carrito (${cartCount})`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span className="action-btn__badge">{cartCount}</span>
          </button>

          <SocialButtons />

          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '6px 14px', color: '#9A9180', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em' }}>
            ← INICIO
          </button>
        </div>
      </header>

      {/* Colección hero */}
      <div style={{ padding: '80px 24px 48px', textAlign: 'center', background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 12 }}>{info.eyebrow}</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,6vw,64px)', color: '#E8DCC8', margin: '0 0 16px', fontWeight: 400 }}>{categoria}</h1>
        <p style={{ color: '#9A9180', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>{info.desc}</p>
      </div>

      {/* Grid de productos */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', padding: '60px 0' }}>CARGANDO PRODUCTOS...</p>
        )}
        {!loading && !productos.length && (
          <p style={{ textAlign: 'center', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', padding: '60px 0' }}>
            NO HAY PRODUCTOS EN ESTA COLECCIÓN AÚN
          </p>
        )}
        <div className="products-grid">
          {productos.map(p => (
            <ProductCard key={p.id_producto} producto={p}
              enWishlist={estaEn(String(p.id_producto))}
              onWishlist={() => toggleWish({ id: String(p.id_producto), nombre: p.nombre, marca: p.marca || '', precio: p.precio, imagen: p.imagen || '' })}
              onCarrito={(presLabel, precio) => agregarCarrito({ id: String(p.id_producto) + (presLabel ? '_' + presLabel : ''), nombre: p.nombre, marca: p.marca || '', precio: Number(precio || p.precio), imagen: p.imagen || '', presentacion: presLabel })}
              formatCOP={formatCOP}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p className="footer__copy">© 2024 OrientPerfumes · Todos los derechos reservados</p>
        <a href="#" className="footer__back">↑ Volver Arriba</a>
      </footer>

      {/* Overlay */}
      {panelAbierto && (
        <div onClick={() => setPanelAbierto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
      )}

      {/* Panel lateral */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, maxWidth: '100vw', background: '#111', borderLeft: '1px solid rgba(201,168,76,0.2)', zIndex: 1000, transform: panelAbierto ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20, borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.15em', color: '#C9A84C' }}>
            {panelAbierto === 'carrito' ? 'CARRITO DE COMPRAS' : 'LISTA DE DESEOS'}
          </span>
          <button onClick={() => setPanelAbierto(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* Carrito */}
          {panelAbierto === 'carrito' && (
            carrito.length === 0
              ? <p style={{ textAlign: 'center', color: '#9A9180', fontSize: 12, letterSpacing: '0.1em', padding: '20px 0' }}>EL CARRITO ESTÁ VACÍO</p>
              : <>
                  {carrito.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                      {item.imagen
                        ? <img src={item.imagen} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} alt="" />
                        : <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBottle size={26}/></div>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#E8DCC8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</div>
                        {item.presentacion && <div style={{ fontSize: 10, color: '#9A9180' }}>{item.presentacion}</div>}
                        <div style={{ fontSize: 11, color: '#C9A84C', marginTop: 2 }}>{formatCOP(item.precio)} × {item.cantidad || 1}</div>
                      </div>
                      <button onClick={() => quitarCarrito(i)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(201,168,76,0.15)', textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#9A9180', letterSpacing: '0.1em' }}>TOTAL</div>
                    <div style={{ fontSize: 20, color: '#C9A84C', fontWeight: 700 }}>{formatCOP(totalCarrito)}</div>
                  </div>
                </>
          )}

          {/* Wishlist */}
          {panelAbierto === 'wishlist' && (
            wishlist.length === 0
              ? <p style={{ textAlign: 'center', color: '#9A9180', fontSize: 12, letterSpacing: '0.1em', padding: '20px 0' }}>TU LISTA DE DESEOS ESTÁ VACÍA</p>
              : wishlist.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                  {item.imagen
                    ? <img src={item.imagen} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} alt="" />
                    : <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBottle size={26}/></div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#E8DCC8', fontWeight: 600 }}>{item.nombre}</div>
                    <div style={{ fontSize: 11, color: '#9A9180' }}>{item.marca}</div>
                    <div style={{ fontSize: 11, color: '#C9A84C', marginTop: 2 }}>{formatCOP(item.precio)}</div>
                  </div>
                  <button onClick={() => quitarWish(item.id)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>✕</button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de producto ── */
function ProductCard({ producto: p, enWishlist, onWishlist, onCarrito, formatCOP }) {
  const navigate  = useNavigate();
  const [added,   setAdded]   = useState(false);
  const [presIdx, setPresIdx] = useState(0); 
  const pres = p.presentaciones || [];

  function handleCarrito() {
    const pr = pres.length > 0 ? pres[presIdx] : null;
    onCarrito(pr?.etiqueta || '', pr?.precio || 0);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="product-card" role="listitem" tabIndex="0">
  <div className="product-card__img-wrap">
    <div onClick={() => navigate(`/producto/${p.id_producto}`)}
      style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
      {p.imagen
        ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span className="product-card__placeholder" aria-hidden="true"><IconBottle size={48}/></span>}
    </div>

    <button className="product-card__wish" onClick={onWishlist}
      data-active={String(enWishlist)} aria-label="Lista de deseos">
      {enWishlist ? <IconHeartFilled /> : <IconHeart />}
    </button>

    <button className="product-card__add" onClick={handleCarrito}
      style={added ? { background: '#4a7c59', color: '#fff' } : {}}>
      {added ? '✓ Añadido' : 'Añadir al Carrito'}
    </button>
  </div>
  <div className="product-card__name" 
    onClick={() => navigate(`/producto/${p.id_producto}`)}
    style={{ cursor: 'pointer' }}>
    {p.nombre}
  </div>
      <div className="product-card__info">
        <div className="product-card__brand">{p.marca || ''}</div>
        <div className="product-card__name" 
            onClick={() => navigate(`/producto/${p.id_producto}`)}
            style={{ cursor: 'pointer' }}>
            {p.nombre}
          </div>
        <div className="product-card__price">{formatCOP(p.precio)}</div>
        {pres.length > 1 && (
          <select value={presIdx} onChange={e => setPresIdx(Number(e.target.value))}
            style={{ width: '100%', background: '#1a1a18', color: '#C8C0B0', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 4, padding: '6px 8px', fontSize: 11, marginTop: 8, cursor: 'pointer' }}>
            {pres.map((pr, i) => (
              <option key={i} value={i}>{pr.etiqueta} — {formatCOP(pr.precio)}</option>
            ))}
          </select>
        )}
      </div>
    </article>
  );
}