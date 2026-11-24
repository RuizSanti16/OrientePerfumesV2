import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { pagosAPI } from '../services/api';

/* Pantalla a la que vuelve el cliente desde Bold.

   Bold añade a la URL ?bold-order-id=...&bold-tx-status=... El estado
   que trae es el que vio el cliente en el comprobante, y la propia
   documentación advierte de que puede no ser el definitivo. Por eso no
   se usa para decidir nada: solo se consulta el estado real al
   servidor, que es quien recibe el aviso firmado.

   El aviso de Bold puede tardar hasta diez minutos, así que lo normal
   es que el cliente llegue aquí antes de que conste el pago. Se
   consulta cada pocos segundos durante un rato y, si no se confirma, se
   le dice la verdad: que está en proceso y que puede seguirlo con su
   código. Afirmar que el pago entró sin que conste sería peor que
   hacerle esperar. */
export default function PagoResultado() {
  const [params] = useSearchParams();
  const [estado, setEstado] = useState(null);
  const [agotado, setAgotado] = useState(false);
  const temporizador = useRef(null);

  /* La referencia que devuelve Bold tiene la forma OP-{codigo}-{sello},
     así que el código del pedido es el segundo tramo. */
  const referencia = params.get('bold-order-id') || '';
  const codigo = referencia.split('-')[1] || '';

  useEffect(() => {
    if (!codigo) return;
    let vigente = true;
    let intentos = 0;
    const MAX = 10;          // ~50 segundos
    const ESPERA = 5000;

    const consultar = () => {
      pagosAPI.estado(codigo)
        .then(r => {
          if (!vigente) return;
          if (r?.ok) {
            setEstado(r);
            if (r.definitivo) return;      // ya no hace falta seguir
          }
          if (++intentos >= MAX) { setAgotado(true); return; }
          temporizador.current = setTimeout(consultar, ESPERA);
        })
        .catch(() => {
          if (!vigente) return;
          if (++intentos >= MAX) { setAgotado(true); return; }
          temporizador.current = setTimeout(consultar, ESPERA);
        });
    };

    consultar();
    return () => { vigente = false; clearTimeout(temporizador.current); };
  }, [codigo]);

  const ep = estado?.estado_pago;
  const aprobado  = ep === 'aprobado';
  const fallido   = ep === 'rechazado' || ep === 'anulado';
  const enProceso = !estado || ep === 'iniciado' || ep === 'pendiente';

  const color = aprobado ? '#9AAB80' : fallido ? '#C4664C' : '#C9A84C';

  const titulo = aprobado  ? 'Pago confirmado'
               : fallido   ? 'El pago no se completó'
               : ep === 'error' ? 'Necesitamos revisar tu pago'
               : 'Estamos confirmando tu pago';

  return (
    <>
      <Header />
      <main style={{
        background: '#0D0D0C', color: '#E8DCC8', minHeight: '70vh',
        padding: '64px 20px 76px', fontFamily: 'Raleway, sans-serif',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>

          <div style={{
            width: 62, height: 62, margin: '0 auto 24px', borderRadius: '50%',
            border: `1px solid ${color}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
                 stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {aprobado ? <path d="M20 6L9 17l-5-5" />
               : fallido ? <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>
               : <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
            fontSize: 'clamp(26px, 5vw, 38px)', margin: '0 0 16px', color,
          }}>
            {titulo}
          </h1>

          <p style={{ color: '#9A9180', fontSize: 14.5, lineHeight: 1.8, margin: '0 0 8px' }}>
            {estado?.mensaje || 'Consultando el estado de tu pago…'}
          </p>

          {enProceso && agotado && (
            <p style={{ color: '#7d7566', fontSize: 13, lineHeight: 1.7, marginTop: 14 }}>
              La confirmación puede tardar unos minutos más. No hace falta que
              esperes aquí: te avisaremos y puedes consultarlo cuando quieras
              con tu código.
            </p>
          )}

          {codigo && (
            <div style={{
              margin: '26px auto 0', padding: '14px 18px', maxWidth: 320,
              background: '#141412', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8,
            }}>
              <div style={{ fontSize: 11, color: '#7d7566', marginBottom: 4 }}>
                Código de seguimiento
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 17, color: '#C9A84C', letterSpacing: '0.1em' }}>
                {codigo}
              </div>
            </div>
          )}

          <div style={{ marginTop: 32, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {codigo && (
              <Link to={`/seguimiento/${codigo}`} style={{
                padding: '11px 22px', border: '1px solid rgba(201,168,76,0.45)',
                borderRadius: 6, color: '#C9A84C', textDecoration: 'none', fontSize: 13,
              }}>
                Seguir mi pedido
              </Link>
            )}
            {fallido && codigo && (
              <Link to={`/pago/${codigo}`} style={{
                padding: '11px 22px', border: '1px solid rgba(201,168,76,0.45)',
                borderRadius: 6, color: '#C9A84C', textDecoration: 'none', fontSize: 13,
              }}>
                Intentar de nuevo
              </Link>
            )}
            <Link to="/" style={{
              padding: '11px 22px', border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 6, color: '#9A9180', textDecoration: 'none', fontSize: 13,
            }}>
              Volver a la tienda
            </Link>
          </div>

          {!codigo && (
            <p style={{ color: '#7d7566', fontSize: 12.5, marginTop: 26, lineHeight: 1.7 }}>
              No pudimos identificar el pedido desde el enlace. Si ya pagaste,
              busca tu código en el correo de confirmación y consúltalo en
              seguimiento.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
