import { useState } from 'react';
import { authAPI } from '../../services/api';
import { MensajeEstado } from '../../components/Icons';

const KEY = 'op_admin_settings';
const DEFAULT = {
  storeName:        'OrientPerfumes',
  storeEmail:       'info@orientperfumes.com',
  storePhone:       '+57 300 000 0000',
  storeAddress:     'Rionegro, Antioquia, Colombia',
  storeDesc:        'Fragancias exclusivas de lujo. Tu destino para los mejores perfumes del mundo.',
  whatsappNumber:   '',
  whatsappMessage:  'Hola! Me interesa conocer más sobre sus fragancias.',
  whatsappVisible:  true,
  instagram:        '',
  facebook:         '',
  tiktok:           '',
  freeShippingMin:  150000,
  stockThreshold:   20,
  currency:         'COP',
  notifStock:       true,
  notifOrders:      true,
  notifDaily:       false,
};

/* ── SVG icon paths ─────────────────────────────────────── */
const IC = {
  store:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  mail:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  phone:    'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z',
  location: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4',
  edit:     'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  shipping: 'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z',
  insta:    'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01 M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z',
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  tiktok:   'M9 12a4 4 0 104 4V4a5 5 0 005 5',
  bell:     'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  box:      'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 001 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
  currency: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  warn:     'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  check:    'M20 6L9 17l-5-5',
  lock:     'M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z M7 11V7a5 5 0 0110 0v4',
  key:      'M12.65 10a6 6 0 10-1.41 6.36L15 20l3-3-3.35-3.35A6 6 0 0012.65 10z',
};

function Ic({ d, size = 14, color = '#9A9180', stroke = 1.6 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      width={size} height={size} aria-hidden="true">
      {d.split(' M').map((seg, i) => (
        <path key={i} d={(i === 0 ? '' : 'M') + seg} />
      ))}
    </svg>
  );
}

export default function Ajustes() {
  const [settings, setSettings] = useState(() => {
    try {
      const r = localStorage.getItem(KEY);
      return r ? { ...DEFAULT, ...JSON.parse(r) } : DEFAULT;
    } catch { return DEFAULT; }
  });
  const [msg, setMsg] = useState('');

  function set(key, val) { setSettings(s => ({ ...s, [key]: val })); }

  function guardar() {
    localStorage.setItem(KEY, JSON.stringify(settings));
    setMsg('ok');
    setTimeout(() => setMsg(''), 3000);
  }

  function resetData() {
    if (!confirm('¿Restablecer todos los datos? Esta acción no se puede deshacer.')) return;
    ['op_carrusel','op_productos_destacados','op_lanzamientos','op_video','op_comentarios','op_admin_settings']
      .forEach(k => localStorage.removeItem(k));
    setSettings(DEFAULT);
    setMsg('reset');
    setTimeout(() => setMsg(''), 3000);
  }

  const waUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g,'')}?text=${encodeURIComponent(settings.whatsappMessage)}`
    : '';

  const inp = {
    width: '100%', background: '#151513', border: '1px solid rgba(201,168,76,0.18)',
    borderRadius: 6, padding: '9px 12px', color: '#E8DCC8', fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif',
    transition: 'border-color 0.2s',
  };

  const inpIcon = { ...inp, paddingLeft: 38 };

  return (
    <div className="adm-ajustes" style={{ padding: '28px 32px', color: '#E8DCC8', minHeight: '100vh' }}>
      <style>{`
        /* La pagina se maquetaba con rejillas fijas y sin ningun punto de
           corte: en movil quedaban dos columnas de 380px comprimidas y los
           campos se cortaban. Aqui se colapsan de forma progresiva. */
        @media (max-width: 900px) {
          .adm-ajustes            { padding: 22px 18px !important; }
          .adm-ajustes-grid       { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .adm-ajustes            { padding: 18px 14px !important; }
          .adm-ajustes-head       { flex-direction: column !important;
                                    align-items: stretch !important;
                                    gap: 14px !important; }
          .adm-ajustes-head-acc   { flex-wrap: wrap !important; }
          .adm-ajustes-head-acc button { flex: 1 !important; justify-content: center !important; }
          .adm-ajustes-2col       { grid-template-columns: 1fr !important; }
          .adm-ajustes-3col       { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .adm-ajustes            { padding: 16px 12px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="adm-ajustes-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 20, color: '#C9A84C', margin: 0, letterSpacing: '0.08em' }}>
            AJUSTES
          </h1>
          <p style={{ color: '#9A9180', fontSize: 12, margin: '4px 0 0', letterSpacing: '0.05em' }}>
            Configuración general del panel de administración
          </p>
        </div>
        <div className="adm-ajustes-head-acc" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg === 'ok' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(154,171,128,0.1)', border: '1px solid rgba(154,171,128,0.3)',
              borderRadius: 6, fontSize: 12, color: '#9AAB80' }}>
              <Ic d={IC.check} size={13} color="#9AAB80" stroke={2.5} />
              Cambios guardados
            </div>
          )}
          {msg === 'reset' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(224,164,88,0.1)', border: '1px solid rgba(224,164,88,0.3)',
              borderRadius: 6, fontSize: 12, color: '#E0A458' }}>
              <Ic d={IC.check} size={13} color="#E0A458" stroke={2.5} />
              Datos restablecidos
            </div>
          )}
          <button onClick={guardar} style={{
            background: '#C9A84C', border: 'none', borderRadius: 6,
            padding: '9px 24px', color: '#0a0a08', cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.12em',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Ic d={IC.check} size={13} color="#0a0a08" stroke={2.5} />
            GUARDAR CAMBIOS
          </button>
        </div>
      </div>

      {/* ── Grid principal ── */}
      <div className="adm-ajustes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* ── Columna izquierda ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Información de la tienda */}
          <Card icon={IC.store} titulo="Información de la Tienda">
            <div className="adm-ajustes-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Nombre de la Tienda</Label>
                <FieldIcon icon={IC.store} size={13}>
                  <input style={inpIcon} value={settings.storeName}
                    onChange={e => set('storeName', e.target.value)} />
                </FieldIcon>
              </div>
              <div>
                <Label>Email de Contacto</Label>
                <FieldIcon icon={IC.mail} size={13}>
                  <input style={inpIcon} type="email" value={settings.storeEmail}
                    onChange={e => set('storeEmail', e.target.value)} />
                </FieldIcon>
              </div>
              <div>
                <Label>Teléfono</Label>
                <FieldIcon icon={IC.phone} size={13}>
                  <input style={inpIcon} value={settings.storePhone}
                    onChange={e => set('storePhone', e.target.value)} />
                </FieldIcon>
              </div>
              <div>
                <Label>Mínimo envío gratis (COP)</Label>
                <FieldIcon icon={IC.shipping} size={13}>
                  <input style={inpIcon} type="number" value={settings.freeShippingMin}
                    onChange={e => set('freeShippingMin', parseInt(e.target.value) || 0)} />
                </FieldIcon>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Label>Dirección</Label>
              <FieldIcon icon={IC.location} size={13}>
                <input style={inpIcon} value={settings.storeAddress}
                  onChange={e => set('storeAddress', e.target.value)} />
              </FieldIcon>
            </div>
            <div style={{ marginTop: 12 }}>
              <Label>Descripción de la tienda</Label>
              <textarea style={{ ...inp, resize: 'vertical', marginTop: 0 }} rows={3}
                value={settings.storeDesc}
                onChange={e => set('storeDesc', e.target.value)} />
            </div>
          </Card>

          {/* WhatsApp */}
          <Card icon={IC.whatsapp} titulo="WhatsApp" accentColor="#9AAB80">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
              padding: '10px 14px', background: 'rgba(154,171,128,0.05)', border: '1px solid rgba(154,171,128,0.12)', borderRadius: 6 }}>
              <div>
                <div style={{ fontSize: 13, color: '#E8DCC8' }}>Mostrar botón de WhatsApp</div>
                <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>Visible en el header del sitio</div>
              </div>
              <Toggle value={settings.whatsappVisible} onChange={v => set('whatsappVisible', v)} accentColor="#9AAB80" />
            </div>
            <div className="adm-ajustes-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Número de WhatsApp</Label>
                <FieldIcon icon={IC.phone} size={13}>
                  <input style={inpIcon} value={settings.whatsappNumber}
                    onChange={e => set('whatsappNumber', e.target.value)}
                    placeholder="573001234567" />
                </FieldIcon>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {waUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px',
                    background: 'rgba(154,171,128,0.08)', border: '1px solid rgba(154,171,128,0.25)',
                    borderRadius: 6, fontSize: 11, color: '#9AAB80' }}>
                    <Ic d={IC.check} size={12} color="#9AAB80" stroke={2.5} />
                    Número válido
                  </div>
                ) : (
                  <div style={{ padding: '9px 12px', background: '#151513',
                    border: '1px solid rgba(201,168,76,0.08)', borderRadius: 6, fontSize: 11, color: '#5a5448' }}>
                    Ingresa el número para habilitar
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Label>Mensaje predeterminado al abrir el chat</Label>
              <textarea style={{ ...inp, resize: 'vertical' }} rows={2}
                value={settings.whatsappMessage}
                onChange={e => set('whatsappMessage', e.target.value)}
                placeholder="Mensaje que verá el cliente al abrir el chat" />
            </div>
          </Card>

          {/* Redes sociales */}
          <Card icon={IC.insta} titulo="Redes Sociales">
            <div className="adm-ajustes-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div>
                <Label>Instagram</Label>
                <FieldIcon icon={IC.insta} size={13} color="#E1306C">
                  <input style={{ ...inpIcon }}
                    value={settings.instagram}
                    onChange={e => set('instagram', e.target.value)}
                    placeholder="orientperfumes" />
                </FieldIcon>
                <div style={{ fontSize: 10, color: '#5a5448', marginTop: 4 }}>Sin @</div>
              </div>
              <div>
                <Label>Facebook</Label>
                <FieldIcon icon={IC.facebook} size={13} color="#1877F2">
                  <input style={{ ...inpIcon }}
                    value={settings.facebook}
                    onChange={e => set('facebook', e.target.value)}
                    placeholder="orientperfumes" />
                </FieldIcon>
                <div style={{ fontSize: 10, color: '#5a5448', marginTop: 4 }}>Usuario o página</div>
              </div>
              <div>
                <Label>TikTok</Label>
                <FieldIcon icon={IC.tiktok} size={13} color="#EE1D52">
                  <input style={{ ...inpIcon }}
                    value={settings.tiktok}
                    onChange={e => set('tiktok', e.target.value)}
                    placeholder="orientperfumes" />
                </FieldIcon>
                <div style={{ fontSize: 10, color: '#5a5448', marginTop: 4 }}>Sin @</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Columna derecha ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Notificaciones */}
          <Card icon={IC.bell} titulo="Notificaciones">
            {[
              { key: 'notifStock',  label: 'Alertas de Stock Bajo',  sub: 'Cuando el stock baja del umbral' },
              { key: 'notifOrders', label: 'Nuevos Pedidos',          sub: 'Al recibir pedidos en tiempo real' },
              { key: 'notifDaily',  label: 'Resumen Diario',          sub: 'Informe de ventas cada día' },
            ].map(({ key, label, sub }, i, arr) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '13px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(201,168,76,0.07)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#E8DCC8' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{sub}</div>
                </div>
                <Toggle value={settings[key]} onChange={v => set(key, v)} />
              </div>
            ))}
          </Card>

          {/* Inventario y moneda */}
          <Card icon={IC.box} titulo="Inventario">
            <Label>Umbral de Stock Bajo</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input style={{ ...inp, width: 100 }} type="number" min="1"
                value={settings.stockThreshold}
                onChange={e => set('stockThreshold', parseInt(e.target.value) || 20)} />
              <span style={{ fontSize: 12, color: '#9A9180' }}>unidades</span>
            </div>
            <Label>Moneda</Label>
            <FieldIcon icon={IC.currency} size={13}>
              <select style={{ ...inpIcon, cursor: 'pointer' }}
                value={settings.currency}
                onChange={e => set('currency', e.target.value)}>
                <option value="COP">Peso Colombiano (COP)</option>
              </select>
            </FieldIcon>
            <div style={{ marginTop: 14, padding: '10px 14px',
              background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)',
              borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#9A9180', marginBottom: 6 }}>Estado actual del inventario</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#E8DCC8' }}>Alertar si stock &lt; {settings.stockThreshold}</span>
                <span style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(224,164,88,0.15)',
                  border: '1px solid rgba(224,164,88,0.3)', borderRadius: 4, color: '#E0A458' }}>
                  ACTIVO
                </span>
              </div>
            </div>
          </Card>

          {/* Seguridad: cambio de contraseña */}
          <Card icon={IC.lock} titulo="Seguridad">
            <CambiarClave inp={inp} inpIcon={inpIcon} />
          </Card>

          {/* Zona de peligro */}
          <Card icon={IC.warn} titulo="Zona de Peligro" accentColor="#C4664C">
            <div style={{ padding: '12px 14px', background: 'rgba(196,102,76,0.05)',
              border: '1px solid rgba(196,102,76,0.15)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: '#E8DCC8', marginBottom: 4 }}>Restablecer Datos</div>
              <div style={{ fontSize: 11, color: '#9A9180', marginBottom: 12, lineHeight: 1.5 }}>
                Elimina toda la configuración guardada en localStorage y restaura los valores predeterminados. Esta acción no se puede deshacer.
              </div>
              <button onClick={resetData} style={{
                background: 'transparent', border: '1px solid #C4664C', borderRadius: 6,
                padding: '7px 16px', color: '#C4664C', cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Raleway, sans-serif',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,102,76,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Ic d={IC.warn} size={13} color="#C4664C" />
                Restablecer todo
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-componentes ──────────────────────────────────────── */

/* Hasta ahora no habia forma de cambiar la contrasena desde el panel: la
   unica via era un UPDATE a mano contra la base, donde es facil dejarla
   sin hashear y perder el acceso sin ningun aviso. El resto de esta
   pagina guarda en localStorage; esta tarjeta no, va contra la API. */
function CambiarClave({ inp, inpIcon }) {
  const MINIMO = 10;
  const VACIO  = { actual: '', nueva: '', repetir: '' };

  const [campos,  setCampos]  = useState(VACIO);
  const [ver,     setVer]     = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso,   setAviso]   = useState(null);   // { ok, texto }

  function set(k, v) { setCampos(c => ({ ...c, [k]: v })); }

  /* El backend recorta la contrasena antes de hashearla, igual que hace
     login.php con la que recibe del formulario. Aqui se mide sobre la
     recortada para que el contador no prometa un largo que no sera. */
  const nueva   = campos.nueva.trim();
  const coincide = nueva !== '' && nueva === campos.repetir.trim();
  const listo    = campos.actual.trim() !== '' && nueva.length >= MINIMO && coincide;

  async function enviar(e) {
    e.preventDefault();
    if (!listo || enviando) return;

    setEnviando(true);
    setAviso(null);

    const r = await authAPI.cambiarClave({
      contrasena_actual: campos.actual,
      contrasena_nueva:  campos.nueva,
    });

    setEnviando(false);
    setAviso({ ok: !!r?.ok, texto: r?.mensaje || 'No se pudo cambiar la contraseña.' });
    if (r?.ok) setCampos(VACIO);
  }

  return (
    <form onSubmit={enviar}>
      <div style={{ fontSize: 11, color: '#9A9180', marginBottom: 14, lineHeight: 1.5 }}>
        Al cambiarla se cierran las demás sesiones abiertas. Esta seguirá activa.
      </div>

      {/* aria-label en los tres campos: Label es un div, no un <label>
          asociado, asi que un campo de contraseña vacio se queda sin
          nombre accesible y los lectores de pantalla no lo anuncian. */}
      <Label>Contraseña actual</Label>
      <FieldIcon icon={IC.lock}>
        <input style={inpIcon} type="password" autoComplete="current-password"
          aria-label="Contraseña actual"
          value={campos.actual} onChange={e => set('actual', e.target.value)} />
      </FieldIcon>

      <div style={{ marginTop: 14 }}>
        <Label>Contraseña nueva</Label>
        <FieldIcon icon={IC.key}>
          <input style={inpIcon} type={ver ? 'text' : 'password'} autoComplete="new-password"
            aria-label="Contraseña nueva"
            value={campos.nueva} onChange={e => set('nueva', e.target.value)} />
        </FieldIcon>
        <div style={{
          fontSize: 10.5, marginTop: 5,
          color: nueva.length === 0 ? '#9A9180'
               : nueva.length < MINIMO ? '#E0A458' : '#9AAB80',
        }}>
          {nueva.length === 0
            ? `Mínimo ${MINIMO} caracteres`
            : nueva.length < MINIMO
              ? `Faltan ${MINIMO - nueva.length} caracteres`
              : 'Longitud suficiente'}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Label>Repetir contraseña nueva</Label>
        <FieldIcon icon={IC.key}>
          <input style={inpIcon} type={ver ? 'text' : 'password'} autoComplete="new-password"
            aria-label="Repetir contraseña nueva"
            value={campos.repetir} onChange={e => set('repetir', e.target.value)} />
        </FieldIcon>
        {campos.repetir !== '' && !coincide && (
          <div style={{ fontSize: 10.5, marginTop: 5, color: '#C4664C' }}>
            No coincide con la anterior
          </div>
        )}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
        fontSize: 11.5, color: '#9A9180', cursor: 'pointer' }}>
        <input type="checkbox" checked={ver} onChange={e => setVer(e.target.checked)}
          style={{ accentColor: '#C9A84C', cursor: 'pointer' }} />
        Mostrar las contraseñas nuevas
      </label>

      <button type="submit" disabled={!listo || enviando} style={{
        marginTop: 16, width: '100%',
        background: listo && !enviando ? 'rgba(201,168,76,0.12)' : 'transparent',
        border: `1px solid ${listo && !enviando ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`,
        borderRadius: 6, padding: '9px 16px',
        color: listo && !enviando ? '#C9A84C' : '#5a5448',
        cursor: listo && !enviando ? 'pointer' : 'not-allowed',
        fontSize: 12, fontFamily: 'Raleway, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      }}>
        <Ic d={IC.lock} size={13} color={listo && !enviando ? '#C9A84C' : '#5a5448'} />
        {enviando ? 'Cambiando…' : 'Cambiar contraseña'}
      </button>

      {aviso && (
        <MensajeEstado ok={aviso.ok} texto={aviso.texto} style={{ marginTop: 12 }} />
      )}
    </form>
  );
}

function Card({ icon, titulo, accentColor, children }) {
  const accent = accentColor || '#C9A84C';
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.13)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '11px 18px', background: '#0f0f0d', borderBottom: '1px solid rgba(201,168,76,0.08)',
        display: 'flex', alignItems: 'center', gap: 8 }}>
        <Ic d={icon} size={13} color={accent} />
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: accent }}>
          {titulo.toUpperCase()}
        </span>
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9.5, letterSpacing: '0.15em',
      color: '#9A9180', marginBottom: 6, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function FieldIcon({ icon, size = 13, color, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1, display: 'flex' }}>
        <Ic d={icon} size={size} color={color || '#5a5448'} />
      </span>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, accentColor }) {
  const accent = accentColor || '#C9A84C';
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 22, flexShrink: 0, cursor: 'pointer' }}>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: 'absolute', inset: 0, background: value ? accent : '#2a2a28',
        borderRadius: 22, transition: '0.25s', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ position: 'absolute', height: 15, width: 15,
          left: value ? 21 : 4, bottom: 3,
          background: value ? '#fff' : '#5a5448', borderRadius: '50%', transition: '0.25s' }} />
      </span>
    </label>
  );
}
