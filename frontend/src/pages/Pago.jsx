import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { pagosAPI } from '../services/api';
import { MensajeEstado } from '../components/Icons';

/* Pantalla de pago de un pedido.

   El botón de Bold no es un componente ni una llamada: es una etiqueta
   <script data-bold-button> que su biblioteca localiza en el DOM y
   reemplaza por el botón real. En React eso obliga a un orden concreto,
   que la propia documentación de Bold señala: primero el script del
   botón dentro del documento, y solo después la biblioteca en el head.
   Al revés, la biblioteca carga antes de que exista el botón, no
   encuentra nada que reemplazar, y no aparece nada en pantalla.

   El importe y la firma no se calculan aquí. Vienen del servidor, que
   los saca del pedido guardado: si se montaran en el navegador, el
   cliente podría cambiar cuánto paga. */
export default function Pago() {
  const { codigo } = useParams();
  const [datos, setDatos]   = useState(null);
  const [error, setError]   = useState(null);
  const contenedor = useRef(null);

  useEffect(() => {
    let vigente = true;
    pagosAPI.iniciar(codigo)
      .then(r => {
        if (!vigente) return;
        if (r?.ok) setDatos(r);
        else setError(r?.mensaje || 'No se pudo preparar el pago.');
      })
      .catch(() => { if (vigente) setError('No se pudo conectar con el servidor.'); });
    return () => { vigente = false; };
  }, [codigo]);

  useEffect(() => {
    if (!datos?.bold || !contenedor.current) return;
    const b = datos.bold;
    const caja = contenedor.current;
    caja.innerHTML = '';

    /* 1. El script del botón, con los datos de la venta. */
    const boton = document.createElement('script');
    boton.setAttribute('data-bold-button', 'dark-L');
    boton.setAttribute('data-api-key',             b.apiKey);
    boton.setAttribute('data-order-id',            b.orderId);
    boton.setAttribute('data-amount',              b.amount);
    boton.setAttribute('data-currency',            b.currency);
    boton.setAttribute('data-integrity-signature', b.integritySignature);
    boton.setAttribute('data-description',         b.description);
    boton.setAttribute('data-redirection-url',     b.redirectionUrl);
    boton.setAttribute('data-render-mode',         b.renderMode);
    if (b.customerData)   boton.setAttribute('data-customer-data',   b.customerData);
    if (b.billingAddress) boton.setAttribute('data-billing-address', b.billingAddress);
    caja.appendChild(boton);

    /* 2. Y ahora la biblioteca. Si ya estaba cargada de una visita
          anterior se vuelve a añadir para que recorra el DOM otra vez;
          si no, al volver a esta pantalla el botón no se dibujaría. */
    const anterior = document.querySelector(`script[src="${b.script}"]`);
    if (anterior) anterior.remove();

    const lib = document.createElement('script');
    lib.src   = b.script;
    lib.async = true;
    document.head.appendChild(lib);

    return () => { caja.innerHTML = ''; };
  }, [datos]);

  const pesos = n => '$' + Number(n).toLocaleString('es-CO');

  return (
    <>
      <Header />
      <main style={{
        background: '#0D0D0C', color: '#E8DCC8', minHeight: '70vh',
        padding: '56px 20px 72px', fontFamily: 'Raleway, sans-serif',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>

          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.28em',
            color: '#C9A84C', marginBottom: 14, textTransform: 'uppercase',
          }}>
            Pago seguro
          </div>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
            fontSize: 'clamp(26px, 5vw, 38px)', margin: '0 0 26px',
          }}>
            Completa tu pago
          </h1>

          {error && (
            <>
              <MensajeEstado ok={false} texto={error} />
              <div style={{ marginTop: 26 }}>
                <Link to={`/seguimiento/${codigo}`} style={{ color: '#C9A84C', fontSize: 13 }}>
                  Ver el estado de mi pedido
                </Link>
              </div>
            </>
          )}

          {!error && !datos && (
            <p style={{ color: '#9A9180', fontSize: 14 }}>Preparando el pago…</p>
          )}

          {datos && (
            <>
              <div style={{
                background: '#141412', border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 10, padding: '22px 24px', marginBottom: 28, textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: '#9A9180', fontSize: 13 }}>Pedido</span>
                  <span style={{ fontSize: 13 }}>{datos.pedido.codigo}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  paddingTop: 12, borderTop: '1px solid rgba(201,168,76,0.1)',
                }}>
                  <span style={{ color: '#9A9180', fontSize: 13 }}>Total a pagar</span>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#C9A84C',
                  }}>
                    {pesos(datos.pedido.total)}
                  </span>
                </div>
              </div>

              {/* Aquí Bold dibuja su botón */}
              <div ref={contenedor} style={{ display: 'flex', justifyContent: 'center' }} />

              <p style={{ color: '#7d7566', fontSize: 12, lineHeight: 1.7, marginTop: 26 }}>
                El pago lo procesa Bold. No guardamos los datos de tu tarjeta
                en ningún momento.
              </p>

              <p style={{ color: '#7d7566', fontSize: 12, lineHeight: 1.7, marginTop: 10 }}>
                Guarda el código <strong style={{ color: '#9A9180' }}>{datos.pedido.codigo}</strong>:
                con él puedes consultar tu pedido cuando quieras.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
