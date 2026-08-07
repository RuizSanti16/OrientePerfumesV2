import { Link } from 'react-router-dom';

/* Pantalla que ve el visitante mientras la tienda está cerrada.

   El bloqueo de verdad está en el servidor: los endpoints responden 503
   a quien no traiga sesión de administrador. Esta página es la cara
   amable de esa misma regla, no la regla en sí. */
export default function Proximamente() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0C', color: '#E8DCC8',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 20px', textAlign: 'center',
      fontFamily: 'Raleway, sans-serif',
    }}>
      <img
        src="/favicon.png"
        alt="OrientPerfumes"
        style={{ width: 92, height: 92, marginBottom: 30 }}
      />

      <div style={{
        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.3em',
        color: '#C9A84C', marginBottom: 18, textTransform: 'uppercase',
      }}>
        OrientPerfumes
      </div>

      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
        fontSize: 'clamp(30px, 7vw, 52px)', margin: '0 0 20px',
        lineHeight: 1.15, color: '#E8DCC8',
      }}>
        Próximamente disponible
      </h1>

      {/* Filete dorado, el mismo recurso que separa secciones en la tienda */}
      <div style={{
        width: 64, height: 1, margin: '0 0 24px',
        background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
      }} />

      <p style={{
        fontSize: 15, lineHeight: 1.75, color: '#9A9180',
        maxWidth: 460, margin: '0 0 34px',
      }}>
        Estamos preparando nuestra colección de fragancias orientales,
        nicho y diseñador. Muy pronto podrás descubrirla aquí.
      </p>

      <a
        href="https://wa.me/573244775851"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '12px 26px', border: '1px solid rgba(201,168,76,0.45)',
          borderRadius: 6, color: '#C9A84C', textDecoration: 'none',
          fontSize: 13, letterSpacing: '0.04em', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>
        Escríbenos por WhatsApp
      </a>

      {/* Discreto a propósito: sirve al administrador para entrar, y a un
          visitante no le dice nada que no sepa cualquiera que mire la web. */}
      <Link
        to="/login"
        style={{
          marginTop: 46, fontSize: 11, letterSpacing: '0.14em',
          color: '#4a463d', textDecoration: 'none', textTransform: 'uppercase',
          fontFamily: 'Cinzel, serif',
        }}
      >
        Acceso administrador
      </Link>
    </div>
  );
}
