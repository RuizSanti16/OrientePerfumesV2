import { useState } from 'react';

const KEY = 'op_admin_settings';
const DEFAULT = {
  storeName:      'OrientPerfumes',
  storeEmail:     'info@orientperfumes.com',
  storePhone:     '+57 300 000 0000',
  storeAddress:   'Rionegro, Antioquia, Colombia',
  storeDesc:      'Fragancias exclusivas de lujo. Tu destino para los mejores perfumes del mundo.',
  // WhatsApp
  whatsappNumber: '',        // ej: 573001234567
  whatsappMessage: 'Hola! Me interesa conocer más sobre sus fragancias 🌹',
  whatsappVisible: true,
  // Redes sociales
  instagram: '',
  facebook:  '',
  tiktok:    '',
  // Envío
  freeShippingMin: 150000,
  // Inventario
  stockThreshold: 20,
  currency: 'COP',
  // Notificaciones
  notifStock: true, notifOrders: true, notifDaily: false,
};

export default function Ajustes() {
  const [settings, setSettings] = useState(() => {
    try { const r = localStorage.getItem(KEY); return r ? { ...DEFAULT, ...JSON.parse(r) } : DEFAULT; } catch { return DEFAULT; }
  });
  const [msg, setMsg] = useState('');

  function set(key, val) { setSettings(s => ({ ...s, [key]: val })); }

  function guardar() {
    localStorage.setItem(KEY, JSON.stringify(settings));
    setMsg('✅ Ajustes guardados correctamente');
    setTimeout(() => setMsg(''), 3000);
  }

  function resetData() {
    if (!confirm('¿Restablecer todos los datos? Esta acción no se puede deshacer.')) return;
    ['op_carrusel','op_productos_destacados','op_lanzamientos','op_video','op_comentarios','op_admin_settings'].forEach(k => localStorage.removeItem(k));
    setSettings(DEFAULT);
    setMsg('✅ Datos restablecidos');
    setTimeout(() => setMsg(''), 3000);
  }

  // Preview URL de WhatsApp
  const waUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g,'')}?text=${encodeURIComponent(settings.whatsappMessage)}`
    : '';

  const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '8px 12px', color: '#E8DCC8', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 };

  return (
    <div style={{ padding: 32, color: '#E8DCC8', maxWidth: 680 }}>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>Ajustes</h1>
      <p style={{ color: '#9A9180', fontSize: 13, marginBottom: 24 }}>Configuración del panel de administración</p>

      {msg && <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 6, fontSize: 13 }}>{msg}</div>}

      {/* ── Tienda ── */}
      <Card titulo="Información de la Tienda">
        <Label>Nombre de la Tienda</Label>
        <input style={inp} value={settings.storeName} onChange={e => set('storeName', e.target.value)} />
        <Label>Email de Contacto</Label>
        <input style={inp} type="email" value={settings.storeEmail} onChange={e => set('storeEmail', e.target.value)} />
        <Label>Teléfono</Label>
        <input style={inp} value={settings.storePhone} onChange={e => set('storePhone', e.target.value)} />
        <Label>Dirección</Label>
        <input style={inp} value={settings.storeAddress} onChange={e => set('storeAddress', e.target.value)} />
        <Label>Descripción</Label>
        <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={settings.storeDesc} onChange={e => set('storeDesc', e.target.value)} />
        <Label>Mínimo para envío gratis (COP)</Label>
        <input style={{ ...inp, maxWidth: 220 }} type="number" value={settings.freeShippingMin} onChange={e => set('freeShippingMin', parseInt(e.target.value)||0)} />
      </Card>

      {/* ── WhatsApp ── */}
      <Card titulo="WhatsApp">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <Label>Mostrar botón de WhatsApp en el header</Label>
          <Toggle value={settings.whatsappVisible} onChange={v => set('whatsappVisible', v)} />
        </div>
        <Label>Número de WhatsApp</Label>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input style={{ ...inp, marginBottom: 0, paddingLeft: 44 }}
            value={settings.whatsappNumber}
            onChange={e => set('whatsappNumber', e.target.value)}
            placeholder="Ej: 573001234567 (con código de país, sin + ni espacios)" />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>📱</span>
        </div>
        <Label>Mensaje predeterminado</Label>
        <textarea style={{ ...inp, resize: 'vertical' }} rows={2}
          value={settings.whatsappMessage}
          onChange={e => set('whatsappMessage', e.target.value)}
          placeholder="Mensaje que verá el cliente al abrir el chat" />
        {waUrl && (
          <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#9A9180', marginBottom: 12 }}>
            <span style={{ color: '#25D366', marginRight: 6 }}>✓</span>
            Vista previa:{' '}
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: '#25D366', wordBreak: 'break-all' }}>{waUrl}</a>
          </div>
        )}
      </Card>

      {/* ── Redes sociales ── */}
      <Card titulo="Redes Sociales">
        <Label>Instagram (usuario sin @)</Label>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input style={{ ...inp, marginBottom: 0, paddingLeft: 44 }}
            value={settings.instagram}
            onChange={e => set('instagram', e.target.value)}
            placeholder="orientperfumes" />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📸</span>
        </div>
        <Label>Facebook (usuario o página)</Label>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input style={{ ...inp, marginBottom: 0, paddingLeft: 44 }}
            value={settings.facebook}
            onChange={e => set('facebook', e.target.value)}
            placeholder="orientperfumes" />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
        </div>
        <Label>TikTok (usuario sin @)</Label>
        <div style={{ position: 'relative', marginBottom: 0 }}>
          <input style={{ ...inp, marginBottom: 0, paddingLeft: 44 }}
            value={settings.tiktok}
            onChange={e => set('tiktok', e.target.value)}
            placeholder="orientperfumes" />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🎵</span>
        </div>
      </Card>

      {/* ── Notificaciones ── */}
      <Card titulo="Notificaciones">
        {[
          ['notifStock',  'Alertas de Stock Bajo',  'Notificar cuando el stock sea menor al umbral'],
          ['notifOrders', 'Nuevos Pedidos',          'Notificar al recibir nuevos pedidos'],
          ['notifDaily',  'Resumen Diario',          'Recibir resumen de ventas cada día'],
        ].map(([key, label, sub]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
            <div>
              <div style={{ fontSize: 13, color: '#E8DCC8' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{sub}</div>
            </div>
            <Toggle value={settings[key]} onChange={v => set(key, v)} />
          </div>
        ))}
      </Card>

      {/* ── Inventario ── */}
      <Card titulo="Inventario">
        <Label>Umbral de Stock Bajo (unidades)</Label>
        <input style={{ ...inp, maxWidth: 160 }} type="number" min="1" value={settings.stockThreshold} onChange={e => set('stockThreshold', parseInt(e.target.value)||20)} />
        <Label>Moneda</Label>
        <select style={{ ...inp, maxWidth: 220 }} value={settings.currency} onChange={e => set('currency', e.target.value)}>
          <option value="COP">Peso Colombiano (COP)</option>
        </select>
      </Card>

      {/* ── Zona peligro ── */}
      <Card titulo="Zona de Peligro" titleColor="#e05252">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#E8DCC8' }}>Restablecer Datos</div>
            <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>Borra la configuración del localStorage</div>
          </div>
          <button onClick={resetData} style={{ background: 'transparent', border: '1px solid #e05252', borderRadius: 6, padding: '6px 14px', color: '#e05252', cursor: 'pointer', fontSize: 12 }}>Restablecer</button>
        </div>
      </Card>

      <button onClick={guardar} style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '10px 28px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em', marginTop: 8 }}>
        Guardar Cambios
      </button>
    </div>
  );
}

function Card({ titulo, titleColor, children }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: titleColor || '#C9A84C' }}>{titulo.toUpperCase()}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: '#9A9180', marginBottom: 6 }}>{children}</div>;
}

function Toggle({ value, onChange }) {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 22, flexShrink: 0, cursor: 'pointer' }}>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: 'absolute', inset: 0, background: value ? '#C9A84C' : '#333', borderRadius: 22, transition: '0.3s' }}>
        <span style={{ position: 'absolute', height: 16, width: 16, left: value ? 20 : 3, bottom: 3, background: 'white', borderRadius: '50%', transition: '0.3s' }} />
      </span>
    </label>
  );
}