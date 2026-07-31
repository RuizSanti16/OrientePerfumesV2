/* Botones reutilizables "PDF" y "Excel" para el panel admin */

function IconDescarga({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function Btn({ label, color, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} title={`Exportar a ${label}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: `${color}10`, border: `1px solid ${color}40`,
        borderRadius: 6, padding: '8px 14px', color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.12em',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.borderColor = color; } }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}40`; }}>
      <IconDescarga/>
      {label}
    </button>
  );
}

export default function ExportarBotones({ onPDF, onExcel, disabled = false }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Btn label="PDF"   color="#e07a5f" onClick={onPDF}   disabled={disabled}/>
      <Btn label="EXCEL" color="#6BC48C" onClick={onExcel} disabled={disabled}/>
    </div>
  );
}
