/* =============================================================
   components/Icons.jsx
   Iconos SVG compartidos.

   Antes estos simbolos eran caracteres tipograficos sueltos (✕, →,
   ✓, ★...) repartidos por el codigo. Como SVG se controlan el grosor
   del trazo y el tamano, se ven igual en cualquier sistema operativo
   y heredan el color del contenedor mediante currentColor.
============================================================= */

/* Base comun: viewBox de 24, trazo redondeado y color heredado. */
function Svg({ size = 16, sw = 1.8, children, ...resto }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}
      {...resto}>
      {children}
    </svg>
  );
}

/* ── Flechas ── */
export const IconArrowRight = (p) => (
  <Svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Svg>
);

export const IconArrowLeft = (p) => (
  <Svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Svg>
);

export const IconArrowUp = (p) => (
  <Svg {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Svg>
);

/* ── Cerrar ── */
export const IconClose = (p) => (
  <Svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>
);

/* ── Estado ── */
export const IconCheck = (p) => (
  <Svg {...p}><polyline points="20 6 9 17 4 12"/></Svg>
);

/* Aspa dentro de un circulo: se distingue mejor del boton de cerrar
   cuando ambos aparecen en la misma pantalla. */
export const IconError = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Svg>
);

/* ── Valoracion ── */
const PUNTAS = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26";

export const IconStar = (p) => (
  <Svg sw={1.5} {...p}><polygon points={PUNTAS}/></Svg>
);

export const IconStarFilled = ({ size = 16, ...resto }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}
    fill="currentColor" stroke="currentColor" strokeWidth="1.2"
    strokeLinejoin="round" aria-hidden="true"
    style={{ display: 'block', flexShrink: 0 }} {...resto}>
    <polygon points={PUNTAS}/>
  </svg>
);

/* ── Adorno ── */
/* Sustituye al caracter ✦ que se usaba como vineta decorativa. */
export const IconSparkle = ({ size = 10, ...resto }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}
    fill="currentColor" aria-hidden="true"
    style={{ display: 'block', flexShrink: 0 }} {...resto}>
    <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z"/>
  </svg>
);

/* ── Mensaje de estado ────────────────────────────────────────
   Los avisos del panel guardaban el resultado como un prefijo de
   texto ("✓ Guardado", "✗ Error...") y luego decidian el color con
   msg.startsWith('✓'). El simbolo hacia de bandera de estado, de modo
   que no podia cambiarse sin romper la logica del color. Este
   componente recibe el estado como dato aparte y dibuja el icono. */
export function MensajeEstado({ ok, texto, style }) {
  const color  = ok ? '#9AAB80' : '#C4664C';
  const fondo  = ok ? 'rgba(154,171,128,0.1)' : 'rgba(196,102,76,0.1)';
  const borde  = ok ? 'rgba(154,171,128,0.3)' : 'rgba(196,102,76,0.3)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      marginBottom: 16, padding: '10px 16px',
      background: fondo, border: `1px solid ${borde}`,
      borderRadius: 6, fontSize: 13, color: '#E8DCC8',
      ...style,
    }}>
      <span style={{ color, display: 'flex' }}>
        {ok ? <IconCheck size={15} sw={2.4}/> : <IconError size={15} sw={2}/>}
      </span>
      <span>{texto}</span>
    </div>
  );
}
