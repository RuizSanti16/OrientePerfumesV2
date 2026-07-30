import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { productoDetalleAPI } from '../services/api';
import { useCarrito }  from '../hooks/useCarrito';
import Header from '../components/Header';

function formatCOP(v) { return '$ ' + Number(v || 0).toLocaleString('es-CO'); }

const IconBottle = ({ size = 40 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.2" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.2 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" width="14" height="14" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="2" width="14" height="14" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/* Lee los IDs del localStorage */
function leerIds() {
  try { return JSON.parse(localStorage.getItem('op_comparar') || '[]').map(p => String(p.id)); }
  catch { return []; }
}

export default function Comparador() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { agregar } = useCarrito();

  /* Los IDs pueden venir por URL (?ids=1,2,3) o del localStorage */
  const idsParam = params.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : leerIds();

  const [productos, setProductos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [added,     setAdded]     = useState({});

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map(id => productoDetalleAPI.obtener(id)))
      .then(resultados => {
        setProductos(resultados.filter(r => r.ok).map(r => r.data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);   // eslint-disable-line

  function handleCarrito(p) {
    agregar({ id: String(p.id_producto), nombre: p.nombre, marca: p.marca || '', precio: Number(p.precio), imagen: p.imagen || '' });
    setAdded(prev => ({ ...prev, [p.id_producto]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [p.id_producto]: false })), 1500);
  }

  /* Construye las filas de comparación */
  const filas = [
    {
      etiqueta: 'PRECIO',
      render: (p) => {
        const precio = p.precio;
        const min = Math.min(...productos.map(x => Number(x.precio)));
        const esMenor = Number(precio) === min && productos.length > 1;
        return (
          <div style={{ fontSize: 18, fontFamily: 'Cinzel, serif', color: esMenor ? '#4caf50' : '#C9A84C', fontWeight: 600 }}>
            {formatCOP(precio)}
            {esMenor && <span style={{ display: 'block', fontSize: 9, color: '#4caf50', letterSpacing: '0.1em', marginTop: 2 }}>MEJOR PRECIO</span>}
          </div>
        );
      },
    },
    {
      etiqueta: 'CATEGORÍA',
      render: (p) => (
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em', color: '#9A9180', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '3px 12px' }}>
          {p.nombre_categoria || '—'}
        </span>
      ),
    },
    {
      etiqueta: 'NOTAS DE SALIDA',
      render: (p) => {
        const notas = p.notas?.salida || [];
        return notas.length > 0
          ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {notas.map((n, i) => <span key={i} style={{ fontSize: 11, color: '#C8C0B0', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '2px 10px' }}>{n.nota}</span>)}
            </div>
          : <IconMinus />;
      },
    },
    {
      etiqueta: 'NOTAS DE CORAZÓN',
      render: (p) => {
        const notas = p.notas?.corazon || [];
        return notas.length > 0
          ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {notas.map((n, i) => <span key={i} style={{ fontSize: 11, color: '#C8C0B0', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '2px 10px' }}>{n.nota}</span>)}
            </div>
          : <IconMinus />;
      },
    },
    {
      etiqueta: 'NOTAS DE FONDO',
      render: (p) => {
        const notas = p.notas?.fondo || [];
        return notas.length > 0
          ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {notas.map((n, i) => <span key={i} style={{ fontSize: 11, color: '#C8C0B0', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '2px 10px' }}>{n.nota}</span>)}
            </div>
          : <IconMinus />;
      },
    },
    {
      etiqueta: 'PRESENTACIONES',
      render: (p) => {
        const pres = p.presentaciones || [];
        return pres.length > 0
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              {pres.map((pr, i) => (
                <span key={i} style={{ fontSize: 11, color: '#C8C0B0' }}>
                  {pr.etiqueta} — <span style={{ color: '#C9A84C' }}>{formatCOP(pr.precio)}</span>
                </span>
              ))}
            </div>
          : <IconMinus />;
      },
    },
    {
      etiqueta: 'STOCK',
      render: (p) => {
        const s = p.stock_actual;
        if (s === null || s === undefined) return <IconMinus />;
        if (s <= 0) return <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#e05252' }}>AGOTADO</span>;
        if (s <= 5) return <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#e08020' }}>{s} UDS.</span>;
        return <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconCheck /><span style={{ fontSize: 12, color: '#4caf50' }}>Disponible</span></span>;
      },
    },
  ];

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif' }}>

      <Header />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 80px' }}>

        {/* Título */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.25em', color: '#C9A84C', marginBottom: 12 }}>ANÁLISIS LADO A LADO</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 400, color: '#E8DCC8', margin: '0 0 12px' }}>
            Comparador de Fragancias
          </h1>
          <p style={{ fontSize: 14, color: '#9A9180' }}>Compara las características de cada perfume para tomar la mejor decisión.</p>
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', padding: '60px 0' }}>
            CARGANDO PRODUCTOS...
          </p>
        )}

        {!loading && productos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ marginBottom: 20 }}><IconBottle /></div>
            <p style={{ color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', marginBottom: 20 }}>
              NO HAY PRODUCTOS SELECCIONADOS PARA COMPARAR
            </p>
            <p style={{ fontSize: 13, color: '#6A6460', marginBottom: 28 }}>
              Ve a la colección, selecciona 2 o 3 fragancias y pulsa "Comparar".
            </p>
            <a href="/coleccion"
              style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', color: '#0a0a08', textDecoration: 'none', background: '#C9A84C', borderRadius: 4, padding: '10px 28px' }}>
              IR A LA COLECCIÓN
            </a>
          </div>
        )}

        {!loading && productos.length > 0 && (
          <>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {/* Cabecera de productos */}
            <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${productos.length}, 1fr)`, gap: 2, marginBottom: 2, minWidth: `${200 + productos.length * 220}px` }}>
              <div /> {/* espacio de etiquetas */}
              {productos.map(p => (
                <div key={p.id_producto}
                  style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px 10px 0 0', padding: 20, textAlign: 'center' }}>
                  {/* Imagen */}
                  <div style={{ width: 120, height: 120, margin: '0 auto 12px', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.1)', background: '#0d0d0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <IconBottle size={36} />}
                  </div>
                  {/* Marca */}
                  {p.marca && <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 4 }}>{p.marca.toUpperCase()}</div>}
                  {/* Nombre */}
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#E8DCC8', lineHeight: 1.3, marginBottom: 12 }}>{p.nombre}</div>
                  {/* Ver producto */}
                  <a href={`/producto/${p.id_producto}`}
                    style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em', color: '#C9A84C', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 4, padding: '5px 14px', display: 'inline-block', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    VER DETALLE →
                  </a>
                </div>
              ))}
            </div>

            {/* Filas de comparación */}
            {filas.map((fila, fi) => (
              <div key={fi} style={{ display: 'grid', gridTemplateColumns: `200px repeat(${productos.length}, 1fr)`, gap: 2, marginBottom: 2, minWidth: `${200 + productos.length * 220}px` }}>
                {/* Etiqueta */}
                <div style={{ background: '#0d0d0b', border: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', padding: '16px 20px' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', color: '#9A9180' }}>{fila.etiqueta}</span>
                </div>
                {/* Celdas */}
                {productos.map(p => (
                  <div key={p.id_producto}
                    style={{ background: '#111', border: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', textAlign: 'center', minHeight: 56 }}>
                    {fila.render(p)}
                  </div>
                ))}
              </div>
            ))}

            {/* Fila de acciones */}
            <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${productos.length}, 1fr)`, gap: 2, marginTop: 2, minWidth: `${200 + productos.length * 220}px` }}>
              <div style={{ background: '#0d0d0b', border: '1px solid rgba(201,168,76,0.08)', padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', color: '#9A9180' }}>ACCIÓN</span>
              </div>
              {productos.map(p => (
                <div key={p.id_producto}
                  style={{ background: '#111', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '0 0 10px 10px', padding: '16px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <button onClick={() => handleCarrito(p)}
                    disabled={p.stock_actual === 0}
                    style={{ background: added[p.id_producto] ? '#4a7c59' : p.stock_actual === 0 ? '#2a2a28' : '#C9A84C', border: 'none', borderRadius: 6, padding: '10px 20px', color: p.stock_actual === 0 ? '#666' : '#0a0a08', cursor: p.stock_actual === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                    {added[p.id_producto] ? 'AÑADIDO' : p.stock_actual === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
                  </button>
                </div>
              ))}
            </div>

          </div>{/* /overflow-x wrapper */}

            {/* Volver a comparar */}
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <a href="/coleccion"
                style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#C9A84C', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 4, padding: '10px 28px', display: 'inline-block', transition: 'background 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}>
                CAMBIAR FRAGANCIAS
              </a>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function BtnVolver({ onClick, label = 'VOLVER' }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 4, padding: '8px 20px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.12em', transition: 'background 0.2s, border-color 0.2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}
