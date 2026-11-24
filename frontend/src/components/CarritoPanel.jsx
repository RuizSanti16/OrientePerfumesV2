import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import { IconClose } from './Icons';

const formatCOP = n => '$' + Number(n || 0).toLocaleString('es-CO');

/* Panel del carrito, compartido por todo el sitio.

   Antes cada página montaba el suyo: Home y Colección tenían uno casi
   idéntico, y el resto de páginas ninguno. Eso causaba dos problemas
   reales. El de la portada no tenía botón de finalizar, así que quien
   añadía desde ahí no podía llegar a pagar; y desde la ficha de un
   producto, que es donde más se añade al carrito, no había ni icono
   para abrirlo.

   Viviendo en el Header, existe en todas las páginas y hay una sola
   copia que mantener.

   No lleva campo de cupón a propósito: el checkout ya tiene uno, y
   tenerlo en los dos sitios obligaba a mantener la misma lógica por
   duplicado. El descuento se aplica un paso más adelante. */
export default function CarritoPanel({ abierto, onCerrar }) {
  const navigate = useNavigate();
  const { carrito, quitar, total } = useCarrito();

  return (
    <>
      {abierto && (
        <div
          onClick={onCerrar}
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      <aside
        aria-hidden={!abierto}
        aria-label="Carrito de compras"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, maxWidth: '100vw',
          background: '#111', borderLeft: '1px solid rgba(201,168,76,0.2)', zIndex: 1000,
          transform: abierto ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          padding: 20, borderBottom: '1px solid rgba(201,168,76,0.15)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'Cinzel,serif', fontSize: 13, letterSpacing: '0.15em', color: '#C9A84C' }}>
            CARRITO DE COMPRAS
          </span>
          <button onClick={onCerrar} aria-label="Cerrar carrito"
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex' }}>
            <IconClose size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {carrito.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#9A9180', fontSize: 12, letterSpacing: '0.1em' }}>
              EL CARRITO ESTÁ VACÍO
            </p>
          ) : (
            <>
              {carrito.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: '1px solid rgba(201,168,76,0.1)',
                }}>
                  {item.imagen
                    ? <img src={item.imagen} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} />
                    : <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', borderRadius: 4 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#E8DCC8', fontWeight: 600 }}>{item.nombre}</div>
                    {item.presentacion && <div style={{ fontSize: 10, color: '#9A9180' }}>{item.presentacion}</div>}
                    <div style={{ fontSize: 11, color: '#C9A84C', marginTop: 2 }}>
                      {formatCOP(item.precio)} × {item.cantidad || 1}
                    </div>
                  </div>
                  <button onClick={() => quitar(i)} aria-label={`Quitar ${item.nombre}`}
                    style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer', padding: '0 4px', flexShrink: 0, display: 'flex' }}>
                    <IconClose size={14} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#9A9180', letterSpacing: '0.1em' }}>TOTAL</div>
                <div style={{ fontSize: 20, color: '#C9A84C', fontWeight: 700 }}>{formatCOP(total)}</div>
              </div>

              <button
                onClick={() => { onCerrar(); navigate('/checkout'); }}
                style={{
                  marginTop: 16, width: '100%', padding: 12, background: '#C9A84C',
                  border: 'none', borderRadius: 6, color: '#0a0a08',
                  fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                FINALIZAR PEDIDO
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
