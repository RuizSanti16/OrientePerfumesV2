import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { productosAPI, categoriasAPI } from '../services/api';
import { useCarrito }    from '../hooks/useCarrito';
import { useWishlist }   from '../hooks/useWishlist';
import { useInView }     from '../hooks/useInView';
import { useComparador } from '../hooks/useComparador';
import Header            from '../components/Header';
import { IconClose, IconCheck } from '../components/Icons';

/* ── Íconos de vista ── */
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
    <rect x="3" y="4" width="5" height="5" rx="1"/><line x1="11" y1="6" x2="21" y2="6" strokeLinecap="round"/>
    <rect x="3" y="11" width="5" height="5" rx="1"/><line x1="11" y1="13" x2="21" y2="13" strokeLinecap="round"/>
    <rect x="3" y="18" width="5" height="5" rx="1"/><line x1="11" y1="20" x2="21" y2="20" strokeLinecap="round"/>
  </svg>
);
const IconCompare = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" aria-hidden="true">
    <rect x="3"  y="5" width="4" height="14" rx="1"/>
    <rect x="17" y="3" width="4" height="18" rx="1"/>
    <rect x="10" y="8" width="4" height="11" rx="1" opacity="0.6"/>
  </svg>
);
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

function formatCOP(v) { return '$ ' + Number(v || 0).toLocaleString('es-CO'); }

/* Para comparar notas escritas de cualquier forma: "Pachulí",
   "pachuli" y "PACHULI" son la misma. */
function sinTildes(s) {
  return String(s || '').trim().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function Coleccion() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const categoria = params.get('categoria') || '';
  /* La búsqueda ya mandaba ?marca= al elegir una casa, pero aquí solo
     se leía ?categoria=: el filtro se ignoraba y salía el catálogo
     entero, como si la búsqueda no hubiera hecho nada. */
  const marca     = params.get('marca') || '';
  /* Buscar por ingrediente: quien busca "vainilla" quiere todos los
     perfumes que la lleven, estén en la categoría que estén. */
  const nota      = params.get('nota') || '';

  const info = nota
    ? { eyebrow: 'Nota Olfativa', desc: `Fragancias con ${nota}` }
    : marca
      ? { eyebrow: 'Casa de Perfumería', desc: `Todas las fragancias de ${marca}` }
      : (INFO[categoria] || { eyebrow: 'Colección', desc: '' });

  const [productos,    setProductos]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [panelAbierto, setPanelAbierto] = useState(null);
  const [vista,        setVista]        = useState(() => localStorage.getItem('op_vista_col') || 'grid');

  /* Carrito + Wishlist.

     De aqui solo queda "agregar": el panel del carrito, con su total y
     su cupon, vive ahora en el Header. */
  const { agregar: agregarCarrito } = useCarrito();
  const { toggle: toggleWish, estaEn, wishlist, quitar: quitarWish, count: wishCount } = useWishlist();

  /* Comparador */
  const {
    items:   comparar,
    agregar: agregarComparar,
    quitar:  quitarComparar,
    limpiar: limpiarComparar,
    estaEn:  estaEnComparar,
  } = useComparador();

  /* Carga de productos */
  useEffect(() => {
    Promise.all([productosAPI.listarConNotas(), categoriasAPI.listar()])
      .then(([resProd, resCat]) => {
        if (resProd.ok) {
          if (nota) {
            /* Sin tildes y sin distinguir mayúsculas: la nota llega
               de la URL y puede venir escrita de cualquier forma. */
            const buscada = sinTildes(nota);
            setProductos(resProd.data.filter(
              p => (p.notas || []).some(n => sinTildes(n) === buscada)
            ));
          } else if (marca) {
            /* Por casa: se compara el nombre de la marca sin
               distinguir mayúsculas ni espacios de sobra, porque
               viene de la URL y puede llegar de cualquier forma. */
            const buscada = marca.trim().toLowerCase();
            setProductos(resProd.data.filter(
              p => (p.marca || '').trim().toLowerCase() === buscada
            ));
          } else if (!categoria) {
            /* Sin filtro → mostrar todos */
            setProductos(resProd.data);
          } else {
            const cats = resCat.ok ? (resCat.data || []) : [];
            const catMatch = cats.find(c => (c.nombre || '').toLowerCase() === categoria.toLowerCase());
            setProductos(resProd.data.filter(p => {
              if (catMatch && p.id_categoria != null && String(p.id_categoria) === String(catMatch.id_categoria)) return true;
              if ((p.nombre_categoria || '').toLowerCase() === categoria.toLowerCase()) return true;
              return false;
            }));
          }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [categoria, marca, nota]);

  /* Sombra de header al scroll */
  useEffect(() => {
    function onScroll() {
      const h = document.getElementById('header-col');
      if (h) h.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.4)' : 'none';
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif',
      paddingBottom: comparar.length > 0 ? 80 : 0 }}>

      <Header
        wishCount={wishCount}
        onWishlistClick={() => setPanelAbierto(p => p === 'wishlist' ? null : 'wishlist')}
      />

      {/* Hero */}
      <div style={{ padding: '80px 24px 48px', textAlign: 'center', background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 12 }}>{info.eyebrow}</div>
        {/* El título mostraba solo la categoría, así que al filtrar
            por casa, o al entrar sin filtro, quedaba en blanco. */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,6vw,64px)', color: '#E8DCC8', margin: '0 0 16px', fontWeight: 400 }}>
          {nota || marca || categoria || 'Todas las fragancias'}
        </h1>
        <p style={{ color: '#9A9180', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>{info.desc}</p>

        {/* Con un filtro puesto hay que poder quitarlo sin tener que
            borrar la dirección a mano. */}
        {(nota || marca || categoria) && (
          <button onClick={() => navigate('/coleccion')}
            style={{ marginTop: 20, background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '7px 16px', color: '#9A9180', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', cursor: 'pointer' }}>
            VER TODO EL CATÁLOGO
          </button>
        )}
      </div>

      {/* Área de productos */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* Barra de controles */}
        {!loading && productos.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em', color: '#9A9180' }}>
              {productos.length} {productos.length === 1 ? 'FRAGANCIA' : 'FRAGANCIAS'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Quiz CTA */}
              <a href="/quiz" style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.14em', color: 'rgba(201,168,76,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 4, transition: 'all 0.2s', marginRight: 4 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.background = 'rgba(201,168,76,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.55)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'; e.currentTarget.style.background = 'transparent'; }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="12" height="12" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m0 4h.01"/>
                </svg>
                QUIZ OLFATIVO
              </a>
              {/* Vistas */}
              {[{ key: 'grid', Icon: IconGrid }, { key: 'list', Icon: IconList }].map(({ key, Icon }) => (
                <button key={key} onClick={() => { setVista(key); localStorage.setItem('op_vista_col', key); }}
                  aria-label={key === 'grid' ? 'Vista cuadrícula' : 'Vista lista'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: vista === key ? 'rgba(201,168,76,0.1)' : 'none', border: `1px solid ${vista === key ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`, borderRadius: 4, color: vista === key ? '#C9A84C' : '#9A9180', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Icon />
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <p style={{ textAlign: 'center', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', padding: '60px 0' }}>CARGANDO PRODUCTOS...</p>
        )}

        {!loading && !productos.length && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ marginBottom: 20 }}><IconBottle size={48} /></div>
            <p style={{ color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em', marginBottom: 8 }}>PRÓXIMAMENTE EN ESTA COLECCIÓN</p>
            <p style={{ color: '#6A6460', fontSize: 13, marginBottom: 28 }}>Estamos seleccionando las mejores fragancias para ti</p>
            <button onClick={() => navigate('/')}
              style={{ background: 'none', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 4, padding: '10px 28px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em' }}>
              VER TODAS LAS COLECCIONES
            </button>
          </div>
        )}

        {/* Vista cuadrícula */}
        {vista === 'grid' && (
          <div className="products-grid">
            {productos.map((p, i) => (
              <ProductCard key={p.id_producto} producto={p} index={i}
                enWishlist={estaEn(String(p.id_producto))}
                onWishlist={() => toggleWish({ id: String(p.id_producto), nombre: p.nombre, marca: p.marca || '', precio: p.precio, imagen: p.imagen || '' })}
                onCarrito={(presLabel, precioPres) => {
                  const esDecant   = label => /^(5|10)\s*ml$/i.test((label || '').trim());
                  const precioBase = Number(p.precio_oferta || p.precio || 0);
                  const precioOrig = Number(p.precio || 0);
                  let precioFinal;
                  if (precioPres && p.badge === 'sale' && precioBase < precioOrig && precioOrig > 0 && !esDecant(presLabel)) {
                    precioFinal = Math.round(Number(precioPres) * (precioBase / precioOrig));
                  } else {
                    precioFinal = Number(precioPres || precioBase);
                  }
                  agregarCarrito({ id: String(p.id_producto) + (presLabel ? '_' + presLabel : ''), nombre: p.nombre, marca: p.marca || '', precio: precioFinal, imagen: p.imagen || '', presentacion: presLabel });
                }}
                formatCOP={formatCOP}
                enComparar={estaEnComparar(String(p.id_producto))}
                onComparar={() => estaEnComparar(String(p.id_producto))
                  ? quitarComparar(String(p.id_producto))
                  : agregarComparar({ id: String(p.id_producto), nombre: p.nombre, imagen: p.imagen || '', precio: p.precio })}
              />
            ))}
          </div>
        )}

        {/* Vista lista */}
        {vista === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {productos.map((p, i) => (
              <ProductCardList key={p.id_producto} producto={p} index={i}
                enWishlist={estaEn(String(p.id_producto))}
                onWishlist={() => toggleWish({ id: String(p.id_producto), nombre: p.nombre, marca: p.marca || '', precio: p.precio, imagen: p.imagen || '' })}
                onCarrito={(presLabel, precioPres) => {
                  const esDecant   = label => /^(5|10)\s*ml$/i.test((label || '').trim());
                  const precioBase = Number(p.precio_oferta || p.precio || 0);
                  const precioOrig = Number(p.precio || 0);
                  let precioFinal;
                  if (precioPres && p.badge === 'sale' && precioBase < precioOrig && precioOrig > 0 && !esDecant(presLabel)) {
                    precioFinal = Math.round(Number(precioPres) * (precioBase / precioOrig));
                  } else {
                    precioFinal = Number(precioPres || precioBase);
                  }
                  agregarCarrito({ id: String(p.id_producto) + (presLabel ? '_' + presLabel : ''), nombre: p.nombre, marca: p.marca || '', precio: precioFinal, imagen: p.imagen || '', presentacion: presLabel });
                }}
                formatCOP={formatCOP}
                enComparar={estaEnComparar(String(p.id_producto))}
                onComparar={() => estaEnComparar(String(p.id_producto))
                  ? quitarComparar(String(p.id_producto))
                  : agregarComparar({ id: String(p.id_producto), nombre: p.nombre, imagen: p.imagen || '', precio: p.precio })}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* ── Barra flotante de comparación ── */}
      {comparar.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '1px solid rgba(201,168,76,0.35)', zIndex: 990, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 -6px 24px rgba(0,0,0,0.5)' }}>
          {/* Label */}
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', color: '#9A9180', flexShrink: 0, marginRight: 4 }}>
            COMPARAR {comparar.length}/3
          </div>
          {/* Slots */}
          <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {comparar.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 6, padding: '6px 10px', flexShrink: 0 }}>
                {p.imagen
                  ? <img src={p.imagen} alt="" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                  : <div style={{ width: 28, height: 28, background: 'rgba(201,168,76,0.1)', borderRadius: 3, flexShrink: 0 }} />}
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#E8DCC8', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</span>
                <button onClick={() => quitarComparar(p.id)} style={{ background: 'none', border: 'none', color: 'rgba(201,168,76,0.5)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0, display: 'flex' }}><IconClose size={13}/></button>
              </div>
            ))}
            {/* Slots vacíos */}
            {comparar.length < 3 && Array.from({ length: 3 - comparar.length }).map((_, i) => (
              <div key={i} style={{ width: 130, height: 44, border: '1px dashed rgba(201,168,76,0.18)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, color: 'rgba(201,168,76,0.3)', letterSpacing: '0.1em' }}>+ AÑADIR</span>
              </div>
            ))}
          </div>
          {/* Botones */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={limpiarComparar}
              style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, padding: '7px 14px', color: '#9A9180', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.1em', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'}>
              LIMPIAR
            </button>
            <a href={`/comparador?ids=${comparar.map(p => p.id).join(',')}`}
              style={{ background: comparar.length >= 2 ? '#C9A84C' : 'rgba(201,168,76,0.18)', border: 'none', borderRadius: 4, padding: '7px 20px', color: comparar.length >= 2 ? '#0a0a08' : '#9A9180', cursor: comparar.length >= 2 ? 'pointer' : 'default', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'opacity 0.2s' }}
              onClick={e => comparar.length < 2 && e.preventDefault()}>
              COMPARAR AHORA
            </a>
          </div>
        </div>
      )}

      {/* Overlay de paneles */}
      {panelAbierto && (
        <div onClick={() => setPanelAbierto(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
      )}

      {/* Panel lateral */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, maxWidth: '100vw', background: '#111', borderLeft: '1px solid rgba(201,168,76,0.2)', zIndex: 1000, transform: panelAbierto ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20, borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.15em', color: '#C9A84C' }}>
            LISTA DE DESEOS
          </span>
          <button onClick={() => setPanelAbierto(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20, display:'flex' }}><IconClose size={16}/></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* El carrito ya no se monta aqui: vive en el Header,
              para que este en todas las paginas y haya una sola
              copia. El cupon que habia en este panel duplicaba el
              del checkout, que es donde se sigue aplicando. */}


          {/* ── Wishlist ── */}
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
                  <button onClick={() => quitarWish(item.id)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0, display: 'flex' }}><IconClose size={14}/></button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta cuadrícula ── */
function ProductCard({ producto: p, enWishlist, onWishlist, onCarrito, formatCOP, index = 0, enComparar, onComparar }) {
  const navigate  = useNavigate();
  const [added,   setAdded]   = useState(false);
  const [presIdx, setPresIdx] = useState(0);
  const [ref, visible]        = useInView(0.1);
  const pres  = p.presentaciones || [];
  const delay = `${Math.min(index % 4, 3) * 0.08}s`;

  function handleCarrito() {
    const pr = pres.length > 0 ? pres[presIdx] : null;
    onCarrito(pr?.etiqueta || '', pr?.precio || 0);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const BADGE_CFG = {
    new:  { cls: 'badge--new',  label: 'Nuevo',
      icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/></svg> },
    excl: { cls: 'badge--excl', label: 'Exclusivo',
      icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    sale: { cls: 'badge--sale', label: 'Oferta',
      icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
    none: { cls: '', label: '', icon: null },
  };
  const badge = BADGE_CFG[p.badge] || BADGE_CFG.none;

  return (
    <article ref={ref} className={`product-card fade-up${visible ? ' visible' : ''}`}
      role="listitem" tabIndex="0" style={{ transitionDelay: delay }}>
      <div className="product-card__img-wrap">
        <div onClick={() => navigate(`/producto/${p.id_producto}`)} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
          {p.imagen
            ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="product-card__placeholder" aria-hidden="true"><IconBottle size={48}/></span>}
        </div>

        {/* Badge */}
        {badge.label && (
          <span className={`product-card__badge ${badge.cls}`}>
            {badge.icon}{badge.label}
          </span>
        )}

        {/* Botón wishlist */}
        <button className="product-card__wish" onClick={onWishlist}
          data-active={String(enWishlist)} aria-label="Lista de deseos">
          {enWishlist ? <IconHeartFilled /> : <IconHeart />}
        </button>

        {/* Botón comparar — esquina inferior izquierda */}
        <button
          onClick={e => { e.stopPropagation(); onComparar?.(); }}
          title={enComparar ? 'Quitar de comparación' : 'Añadir a comparación'}
          style={{ position: 'absolute', bottom: 48, left: 10, zIndex: 3, width: 34, height: 34, background: enComparar ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: `1px solid ${enComparar ? '#C9A84C' : 'rgba(255,255,255,0.25)'}`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: enComparar ? '#C9A84C' : '#fff', transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
          aria-label={enComparar ? 'Quitar de comparación' : 'Comparar fragancia'}>
          <IconCompare />
        </button>

        <button className="product-card__add" onClick={handleCarrito}
          style={added ? { background: '#4a7c59', color: '#fff' } : {}}>
          {added ? <><IconCheck size={12} sw={2.6}/> Añadido</> : 'Añadir al Carrito'}
        </button>
      </div>

      <div className="product-card__info">
        <div className="product-card__brand">{p.marca || ''}</div>
        {p.nombre_categoria && (
          <div className="product-card__category">{p.nombre_categoria}</div>
        )}
        <div className="product-card__name" onClick={() => navigate(`/producto/${p.id_producto}`)} style={{ cursor: 'pointer' }}>
          {p.nombre}
        </div>

        {/* Pills de presentación */}
        {pres.length > 1 && (
          <div className="product-card__pres-wrap" onClick={e => e.stopPropagation()}>
            {pres.map((pr, i) => (
              <button key={i}
                className={`product-card__pres-pill${presIdx === i ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); setPresIdx(i); }}>
                {pr.etiqueta}
              </button>
            ))}
          </div>
        )}

        {/* Precio con soporte de oferta */}
        <div className="product-card__price">
          {(() => {
            const etiqueta   = pres[presIdx]?.etiqueta || '';
            const esDecant   = /^(5|10)\s*ml$/i.test(etiqueta.trim());
            const precioBase = pres[presIdx]?.precio || p.precio;
            const precioOrig = Number(p.precio || 0);
            const precioOferta = Number(p.precio_oferta || 0);
            if (!esDecant && p.badge === 'sale' && precioOferta > 0 && precioOferta < precioOrig) {
              const ratio = precioOferta / precioOrig;
              const precioFinal = pres[presIdx] ? Math.round(pres[presIdx].precio * ratio) : precioOferta;
              return <>
                <s className="product-card__price-old">{formatCOP(pres[presIdx]?.precio || precioOrig)}</s>
                <span className="product-card__price-new">{formatCOP(precioFinal)}</span>
              </>;
            }
            return formatCOP(precioBase);
          })()}
        </div>
      </div>
    </article>
  );
}

/* ── Tarjeta lista ── */
function ProductCardList({ producto: p, enWishlist, onWishlist, onCarrito, formatCOP, index = 0, enComparar, onComparar }) {
  const navigate  = useNavigate();
  const [added,   setAdded]   = useState(false);
  const [presIdx, setPresIdx] = useState(0);
  const [ref, visible]        = useInView(0.08);
  const pres = p.presentaciones || [];

  function handleCarrito() {
    const pr = pres.length > 0 ? pres[presIdx] : null;
    onCarrito(pr?.etiqueta || '', pr?.precio || 0);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div ref={ref} className={`product-list-card fade-up${visible ? ' visible' : ''}`}
      style={{ transitionDelay: `${Math.min(index, 5) * 0.06}s` }}>

      <div onClick={() => navigate(`/producto/${p.id_producto}`)} style={{ cursor: 'pointer', flexShrink: 0 }}>
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre} className="product-list-card__img" />
          : <div className="product-list-card__placeholder"><IconBottle size={36} /></div>}
      </div>

      <div className="product-list-card__info">
        <div className="product-list-card__brand">{p.marca || ''}</div>
        <div className="product-list-card__name" onClick={() => navigate(`/producto/${p.id_producto}`)}>{p.nombre}</div>
        <div className="product-list-card__price">{formatCOP(pres[presIdx]?.precio || p.precio)}</div>
        {pres.length > 1 && (
          <select value={presIdx} onChange={e => setPresIdx(Number(e.target.value))}
            style={{ marginTop: 10, background: '#1a1a18', color: '#C8C0B0', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 4, padding: '5px 8px', fontSize: 11, cursor: 'pointer' }}>
            {pres.map((pr, i) => <option key={i} value={i}>{pr.etiqueta} — {formatCOP(pr.precio)}</option>)}
          </select>
        )}
      </div>

      <div className="product-list-card__actions">
        <button onClick={onWishlist}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, background: 'rgba(0,0,0,0.4)', border: `1px solid ${enWishlist ? '#C9A84C' : 'rgba(201,168,76,0.25)'}`, borderRadius: '50%', color: enWishlist ? '#C9A84C' : '#9A9180', cursor: 'pointer', transition: 'all 0.2s' }}
          aria-label="Lista de deseos">
          {enWishlist ? <IconHeartFilled /> : <IconHeart />}
        </button>
        {/* Botón comparar en vista lista */}
        <button onClick={() => onComparar?.()}
          title={enComparar ? 'Quitar de comparación' : 'Añadir a comparación'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, background: enComparar ? 'rgba(201,168,76,0.15)' : 'rgba(0,0,0,0.4)', border: `1px solid ${enComparar ? '#C9A84C' : 'rgba(201,168,76,0.25)'}`, borderRadius: '50%', color: enComparar ? '#C9A84C' : '#9A9180', cursor: 'pointer', transition: 'all 0.2s' }}
          aria-label={enComparar ? 'Quitar de comparación' : 'Comparar fragancia'}>
          <IconCompare />
        </button>
        <button onClick={handleCarrito}
          style={{ padding: '9px 20px', background: added ? '#4a7c59' : '#C9A84C', border: 'none', borderRadius: 4, color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', transition: 'background 0.2s', whiteSpace: 'nowrap' }}>
          {added ? 'AÑADIDO' : 'AÑADIR AL CARRITO'}
        </button>
      </div>
    </div>
  );
}

/* ── Botón de volver estándar ── */
function BtnVolver({ onClick, label = 'INICIO' }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 4, padding: '8px 20px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.12em', transition: 'background 0.2s, border-color 0.2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}
