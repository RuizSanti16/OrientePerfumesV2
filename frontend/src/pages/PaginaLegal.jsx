import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { EMPRESA, faltanDatosEmpresa, datosPendientes } from '../datosEmpresa';

/* Envoltorio comun de las paginas legales: mismo encabezado, mismo
   ancho de lectura y misma tipografia, para no repetirlo en cada una.

   Si faltan datos de la empresa muestra un aviso en lugar del texto.
   Publicar una politica de datos con huecos del tipo <NIT> no cumple la
   ley y ademas aparenta cumplirla, que es peor que no tenerla. */
export default function PaginaLegal({ titulo, actualizado, children }) {
  const faltan = faltanDatosEmpresa();

  return (
    <>
      <Header />

      <main style={{
        background: '#0D0D0C', color: '#E8DCC8', minHeight: '70vh',
        padding: '56px 20px 72px', fontFamily: 'Raleway, sans-serif',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.28em',
            color: '#C9A84C', marginBottom: 14, textTransform: 'uppercase',
          }}>
            Información legal
          </div>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
            fontSize: 'clamp(28px, 5vw, 42px)', margin: '0 0 10px', lineHeight: 1.2,
          }}>
            {titulo}
          </h1>

          <div style={{ fontSize: 12.5, color: '#7d7566', marginBottom: 34 }}>
            Última actualización: {EMPRESA.vigencia}
            {actualizado ? ` · ${actualizado}` : ''}
          </div>

          {faltan ? (
            <div style={{
              padding: '18px 20px', borderRadius: 8,
              background: 'rgba(196,102,76,0.07)',
              border: '1px solid rgba(196,102,76,0.3)',
            }}>
              <div style={{ color: '#C4664C', fontSize: 14, marginBottom: 8 }}>
                Esta página aún no está publicada
              </div>
              <div style={{ fontSize: 13.5, color: '#9A9180', lineHeight: 1.7 }}>
                Faltan los datos identificativos del comerciante, que la ley exige
                que aparezcan. Complétalos en <code style={{ color: '#C9A84C' }}>
                frontend/src/datosEmpresa.js</code> y el contenido aparecerá solo.
                <br /><br />
                Pendientes: {datosPendientes().join(', ')}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14.5, lineHeight: 1.85, color: '#C9C1B2' }}>
              {children}
            </div>
          )}

          <div style={{ marginTop: 44, paddingTop: 22, borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <Link to="/" style={{ fontSize: 13, color: '#C9A84C', textDecoration: 'none' }}>
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* Sub-componentes de maquetacion, para que el texto de cada pagina se
   lea como texto y no como una maraña de estilos. */

export function Seccion({ titulo, children }) {
  return (
    <section style={{ marginBottom: 30 }}>
      <h2 style={{
        fontFamily: 'Cormorant Garamond, serif', fontWeight: 400,
        fontSize: 21, color: '#E8DCC8', margin: '0 0 12px',
      }}>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function P({ children }) {
  return <p style={{ margin: '0 0 13px' }}>{children}</p>;
}

export function Lista({ items }) {
  return (
    <ul style={{ margin: '0 0 13px', paddingLeft: 20 }}>
      {items.map((t, i) => (
        <li key={i} style={{ marginBottom: 7 }}>{t}</li>
      ))}
    </ul>
  );
}

export function Dato({ etiqueta, valor }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
      <span style={{ color: '#9A9180', minWidth: 130 }}>{etiqueta}</span>
      <span>{valor}</span>
    </div>
  );
}
