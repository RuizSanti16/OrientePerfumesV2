import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import { pedidosAPI, cuponesAPI, haySesionCliente } from '../services/api';
import { CIUDADES_CON_EFECTIVO, OTRA_CIUDAD } from '../datosCobertura';
import { useSettings } from '../hooks/useSettings';

/* ── helpers ────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

/* ── SVG Icons ───────────────────────────────────────────── */
function Icon({ d, size = 18, color = 'currentColor', sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const IC = {
  back:    <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  check:   <><polyline points="20 6 9 17 4 12"/></>,
  tag:     <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
  truck:   <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  lock:    <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  copy:    <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  home:    <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
};

/* ── Field component ─────────────────────────────────────── */
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', color: '#9A9180', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#C9A84C', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_STYLE = {
  background: '#1A1A18',
  border: '1px solid rgba(201,168,76,0.18)',
  borderRadius: 6,
  padding: '10px 14px',
  color: '#E8DCC8',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'Raleway, sans-serif',
};

/* ── Éxito screen ────────────────────────────────────────── */
function PantallaBienvenida({ codigo, nombre, navigate }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Check circle */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(107,196,140,0.12)', border: '1px solid rgba(107,196,140,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <Icon d={IC.check} size={32} color="#6BC48C" sw={2.5} />
        </div>

        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#6B6355', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10 }}>Pedido confirmado</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, color: '#F5F0E8', fontWeight: 600, margin: '0 0 12px' }}>
          ¡Gracias, {nombre}!
        </h1>
        <p style={{ color: '#9A9180', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Tu pedido ha sido recibido correctamente.<br />
          Te enviaremos una confirmación a tu correo.
        </p>

        {/* Código */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Código de seguimiento</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', letterSpacing: '0.2em' }}>{codigo}</span>
            <button onClick={copiar}
              style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: copiado ? '#6BC48C' : '#C9A84C', display: 'flex', alignItems: 'center' }}>
              <Icon d={IC.copy} size={15} color={copiado ? '#6BC48C' : '#C9A84C'} />
            </button>
          </div>
          {copiado && <div style={{ fontSize: 11, color: '#6BC48C', marginTop: 6 }}>Copiado al portapapeles</div>}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/seguimiento/${codigo}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#C9A84C', border: 'none', borderRadius: 6, color: '#0a0a08', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer', fontWeight: 700 }}>
            <Icon d={IC.truck} size={14} color="#0a0a08" />
            VER SEGUIMIENTO
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, color: '#C9A84C', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer' }}>
            <Icon d={IC.home} size={14} color="#C9A84C" />
            VOLVER AL INICIO
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Checkout ───────────────────────────────────────── */
export default function Checkout() {
  const navigate = useNavigate();
  const { carrito, vaciar, total: totalCarrito } = useCarrito();
  const ajustes = useSettings();

  const [form, setForm] = useState({
    nombre: '', correo: '', telefono: '',
    direccion: '', ciudad: '', notas: '',
    metodo_pago: 'bold',
  });

  /* El desplegable de ciudad y el campo para escribirla van por
     separado: "Otra ciudad" no es el nombre de ningún municipio, así
     que form.ciudad guarda siempre lo que de verdad se envía. */
  const [ciudadSelect, setCiudadSelect] = useState('');

  /* Ver la tienda es libre, comprar no. Se comprueba al entrar y no
     al pulsar confirmar: rellenar seis campos para que al final te
     digan que hace falta cuenta es la peor forma de pedirla.
     El servidor lo exige igual, que es lo que de verdad cierra. */
  const conCuenta = haySesionCliente();

  function irARegistro(vista) {
    navigate('/login', { state: { volverA: '/checkout', vista } });
  }
  const [errores,      setErrores]      = useState({});
  const [cuponInput,   setCuponInput]   = useState('');
  const [cuponData,    setCuponData]    = useState(null);
  const [cuponError,   setCuponError]   = useState('');
  const [aplicando,    setAplicando]    = useState(false);
  const [enviando,     setEnviando]     = useState(false);
  const [codigoOk,     setCodigoOk]     = useState(null);

  /* Al mandar a la pasarela se vacía el carrito, y eso dejaba a este
     efecto creyendo que el cliente había llegado aquí sin nada: lo
     devolvía a /coleccion y pisaba la navegación a /pago. El pedido
     quedaba creado y sin cobrar. */
  const [saliendoAPagar, setSaliendoAPagar] = useState(false);

  /* Si el carrito está vacío, redirigir */
  useEffect(() => {
    if (carrito.length === 0 && !codigoOk && !saliendoAPagar) {
      navigate('/coleccion', { replace: true });
    }
  }, [carrito, codigoOk, saliendoAPagar, navigate]);

  const descuento  = cuponData?.descuento || 0;
  const productos  = Math.max(0, totalCarrito - descuento);

  /* El envío se calcula igual que en el servidor, que es quien manda:
     esto solo sirve para que el cliente vea lo que va a pagar antes
     de confirmar, no para decidir el importe. Las tarifas vienen de
     los Ajustes del panel. */
  const minimoGratis = Number(ajustes.freeShippingMin) || 0;
  const envioGratis  = minimoGratis > 0 && productos >= minimoGratis;

  /* Sin ciudad todavía no se sabe cuánto cuesta, así que no se suma:
     mostrar un total que cambia al elegir la ciudad, sin avisar de
     por qué, es peor que mostrarlo incompleto y decirlo. */
  const envio = (!form.ciudad || envioGratis)
    ? 0
    : Number(CIUDADES_CON_EFECTIVO.includes(form.ciudad) ? ajustes.envioLocal : ajustes.envioNacional) || 0;

  const totalFinal = productos + envio;

  function cambiar(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errores[name]) setErrores(er => ({ ...er, [name]: '' }));
  }

  /* ¿Se puede pagar en efectivo con la ciudad elegida?
     Esto decide solo lo que se ve; quien manda es el servidor. */
  const hayEfectivo = CIUDADES_CON_EFECTIVO.includes(form.ciudad);

  function cambiarCiudad(e) {
    const elegida = e.target.value;
    setCiudadSelect(elegida);
    /* Con "Otra ciudad" la escribe el cliente, así que se parte de
       vacío en vez de arrastrar la anterior. */
    setForm(f => ({ ...f, ciudad: elegida === OTRA_CIUDAD ? '' : elegida }));
    setErrores(er => ({ ...er, ciudad: '' }));
  }

  /* Si estaba elegido el efectivo y la nueva ciudad no lo admite, el
     método vuelve a pago en línea. Sin esto el pedido se enviaría con
     un método que el servidor rechaza, y el cliente vería un error
     sin entender de dónde sale. */
  useEffect(() => {
    if (form.metodo_pago === 'efectivo' && !hayEfectivo) {
      setForm(f => ({ ...f, metodo_pago: 'bold' }));
    }
  }, [hayEfectivo, form.metodo_pago]);

  async function aplicarCupon() {
    if (!cuponInput.trim()) return;
    setAplicando(true); setCuponError(''); setCuponData(null);
    const r = await cuponesAPI.validar(cuponInput.trim(), totalCarrito);
    setAplicando(false);
    if (r.ok) { setCuponData(r.data); }
    else { setCuponError(r.mensaje || 'Cupón no válido'); }
  }

  function validar() {
    const err = {};
    if (!form.nombre.trim())    err.nombre    = 'Requerido';
    if (!form.correo.trim())    err.correo    = 'Requerido';
    if (!/\S+@\S+\.\S+/.test(form.correo)) err.correo = 'Correo inválido';
    if (!form.direccion.trim()) err.direccion = 'Requerido';
    /* La ciudad era opcional, pero ahora decide si cabe el efectivo
       y hasta dónde se entrega: sin ella no se puede despachar. */
    if (!form.ciudad.trim())    err.ciudad    = 'Requerido';
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validar();
    if (Object.keys(err).length) { setErrores(err); return; }
    setEnviando(true);

    const items = carrito.map(item => ({
      id_producto:    item.id_producto,
      nombre:         item.nombre,
      cantidad:       item.cantidad,
      precio_unitario:item.precio,
      presentacion:   item.presentacion || null,
    }));

    const r = await pedidosAPI.crear({
      ...form,
      items,
      total:     totalFinal,
      descuento: descuento,
      cupon:     cuponData?.codigo || null,
    });

    setEnviando(false);

    if (r.ok) {
      /* Si eligió pagar en línea, va directo a la pasarela. El pedido
         ya está creado, que es lo que exige Bold y además deja rastro
         aunque el cliente abandone el pago a medias. */
      if (form.metodo_pago === 'bold') {
        setSaliendoAPagar(true);
        vaciar();
        navigate(`/pago/${r.codigo}`);
        return;
      }
      vaciar();
      setCodigoOk({ codigo: r.codigo, nombre: form.nombre });
    } else if (r.code === 'REQUIERE_CUENTA') {
      /* Red de seguridad: el aviso de arriba ya pide la cuenta, pero
         una sesión puede caducar con el formulario abierto. El
         carrito no se toca, así que al volver sigue todo puesto. */
      irARegistro('login');
    } else {
      alert(r.mensaje || 'Error al procesar el pedido. Inténtalo de nuevo.');
    }
  }

  /* Pantalla de éxito */
  if (codigoOk) return (
    <PantallaBienvenida codigo={codigoOk.codigo} nombre={codigoOk.nombre} navigate={navigate} />
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', fontFamily: 'Raleway, sans-serif' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A9180', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
          <Icon d={IC.back} size={16} color="#9A9180" />
          Volver
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: '#C9A84C', letterSpacing: '0.2em' }}>
          ORIENTPERFUMES
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B6355' }}>
          <Icon d={IC.lock} size={13} color="#6B6355" />
          Pago seguro
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: '#F5F0E8', marginBottom: 24 }}>
            Datos de <span style={{ color: '#C9A84C' }}>entrega</span>
          </div>

          {!conCuenta && (
            <div style={{
              marginBottom: 24, padding: '18px 20px',
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8,
            }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', color: '#C9A84C', marginBottom: 8 }}>
                NECESITAS UNA CUENTA
              </div>
              <p style={{ fontSize: 13, color: '#9A9180', lineHeight: 1.6, marginBottom: 14 }}>
                Para completar tu pedido tienes que entrar con tu cuenta. Así
                puedes seguir tus compras y consultar tus pedidos anteriores.
                Tu carrito se conserva.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => irARegistro('register')}
                  style={{ padding: '10px 18px', background: '#C9A84C', border: 'none', borderRadius: 6, color: '#0a0a08', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', fontWeight: 700, cursor: 'pointer' }}>
                  CREAR CUENTA
                </button>
                <button type="button" onClick={() => irARegistro('login')}
                  style={{ padding: '10px 18px', background: 'none', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 6, color: '#C9A84C', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', cursor: 'pointer' }}>
                  YA TENGO CUENTA
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Nombre completo" required>
              <input name="nombre" value={form.nombre} onChange={cambiar} placeholder="Tu nombre" style={{ ...INPUT_STYLE, borderColor: errores.nombre ? '#e74c3c' : 'rgba(201,168,76,0.18)' }} />
              {errores.nombre && <span style={{ fontSize: 11, color: '#e74c3c' }}>{errores.nombre}</span>}
            </Field>
            <Field label="Correo electrónico" required>
              <input name="correo" type="email" value={form.correo} onChange={cambiar} placeholder="tu@correo.com" style={{ ...INPUT_STYLE, borderColor: errores.correo ? '#e74c3c' : 'rgba(201,168,76,0.18)' }} />
              {errores.correo && <span style={{ fontSize: 11, color: '#e74c3c' }}>{errores.correo}</span>}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Teléfono">
              <input name="telefono" value={form.telefono} onChange={cambiar} placeholder="+57 300 000 0000" style={INPUT_STYLE} />
            </Field>
            <Field label="Ciudad" required>
              <select value={ciudadSelect} onChange={cambiarCiudad}
                style={{ ...INPUT_STYLE, borderColor: errores.ciudad ? '#e74c3c' : 'rgba(201,168,76,0.18)' }}>
                <option value="">Selecciona tu ciudad</option>
                {CIUDADES_CON_EFECTIVO.map(c => <option key={c} value={c}>{c}</option>)}
                <option value={OTRA_CIUDAD}>Otra ciudad</option>
              </select>
              {ciudadSelect === OTRA_CIUDAD && (
                <input name="ciudad" value={form.ciudad} onChange={cambiar}
                  placeholder="Escribe tu ciudad"
                  style={{ ...INPUT_STYLE, marginTop: 8, borderColor: errores.ciudad ? '#e74c3c' : 'rgba(201,168,76,0.18)' }} />
              )}
              {errores.ciudad && <span style={{ fontSize: 11, color: '#e74c3c' }}>{errores.ciudad}</span>}
            </Field>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Field label="Dirección de entrega" required>
              <input name="direccion" value={form.direccion} onChange={cambiar} placeholder="Calle, número, barrio, apartamento..." style={{ ...INPUT_STYLE, borderColor: errores.direccion ? '#e74c3c' : 'rgba(201,168,76,0.18)' }} />
              {errores.direccion && <span style={{ fontSize: 11, color: '#e74c3c' }}>{errores.direccion}</span>}
            </Field>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Field label="Notas adicionales">
              <textarea name="notas" value={form.notas} onChange={cambiar}
                placeholder="Instrucciones especiales para la entrega (opcional)"
                rows={3}
                style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 72 }} />
            </Field>
          </div>

          {/* Método de pago */}
          <div style={{ marginBottom: 28 }}>
            <Field label="Método de pago">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  /* Pagar en línea va primero: es el único método que
                     se confirma solo, sin que nadie tenga que revisar
                     un comprobante a mano, y el único disponible en
                     todo el país.

                     El efectivo solo aparece donde se entrega en
                     persona. Contraentrega y transferencia ya no
                     existen. */
                  { value: 'bold',     label: 'Pagar en línea' },
                  ...(hayEfectivo ? [{ value: 'efectivo', label: 'Efectivo al recibir' }] : []),
                ].map(opt => (
                  <label key={opt.value}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: form.metodo_pago === opt.value ? 'rgba(201,168,76,0.1)' : '#1A1A18', border: `1px solid ${form.metodo_pago === opt.value ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.12)'}`, borderRadius: 6, cursor: 'pointer', fontSize: 13, color: form.metodo_pago === opt.value ? '#C9A84C' : '#9A9180' }}>
                    <input type="radio" name="metodo_pago" value={opt.value} checked={form.metodo_pago === opt.value} onChange={cambiar} style={{ accentColor: '#C9A84C' }} />
                    {opt.label}
                  </label>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#6B6355', marginTop: 8, lineHeight: 1.5 }}>
                {!form.ciudad
                  ? 'Elige tu ciudad para ver los métodos de pago disponibles.'
                  : hayEfectivo
                    ? `En ${form.ciudad} puedes pagar en efectivo al recibir el pedido.`
                    : 'El pago en efectivo solo está disponible en Medellín, Rionegro y municipios cercanos, donde entregamos en persona.'}
              </p>
            </Field>
          </div>

          <button type="submit" disabled={enviando || !conCuenta}
            title={conCuenta ? undefined : 'Entra con tu cuenta para completar el pedido'}
            style={{ width: '100%', padding: '14px', background: '#C9A84C', border: 'none', borderRadius: 6, color: '#0a0a08', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', fontWeight: 700, cursor: (enviando || !conCuenta) ? 'default' : 'pointer', opacity: (enviando || !conCuenta) ? 0.5 : 1 }}>
            {enviando ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO'}
          </button>
        </form>

        {/* ── Resumen del pedido ── */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, padding: '22px 20px' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#6B6355', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>Resumen del pedido</div>

            {/* Items */}
            <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
              {carrito.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 6, background: '#1A1A18', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.1)' }}>
                    {item.imagen
                      ? <img src={item.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6355', fontSize: 18 }}>◈</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#E8DCC8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
                    {item.presentacion && <div style={{ fontSize: 11, color: '#9A9180', marginTop: 1 }}>{item.presentacion}</div>}
                    <div style={{ fontSize: 11, color: '#6B6355', marginTop: 2 }}>×{item.cantidad}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, flexShrink: 0 }}>
                    {fmt(item.precio * item.cantidad)}
                  </div>
                </div>
              ))}
            </div>

            {/* Cupón */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginBottom: 14 }}>
              {cuponData ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(107,196,140,0.08)', border: '1px solid rgba(107,196,140,0.2)', borderRadius: 6, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon d={IC.tag} size={13} color="#6BC48C" />
                    <span style={{ fontSize: 12, color: '#6BC48C', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>{cuponData.codigo}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#6BC48C', fontWeight: 600 }}>-{fmt(descuento)}</span>
                    <button onClick={() => { setCuponData(null); setCuponInput(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6355', fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      value={cuponInput}
                      onChange={e => { setCuponInput(e.target.value.toUpperCase()); setCuponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && aplicarCupon()}
                      placeholder="Código de descuento"
                      style={{ ...INPUT_STYLE, flex: 1 }}
                    />
                    <button onClick={aplicarCupon} disabled={aplicando}
                      style={{ padding: '10px 14px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 6, color: '#C9A84C', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em', cursor: aplicando ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
                      {aplicando ? '...' : 'APLICAR'}
                    </button>
                  </div>
                  {cuponError && <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 5 }}>{cuponError}</div>}
                </div>
              )}
            </div>

            {/* Totales */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9A9180', marginBottom: 6 }}>
                <span>Subtotal</span><span>{fmt(totalCarrito)}</span>
              </div>
              {descuento > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6BC48C', marginBottom: 6 }}>
                  <span>Descuento</span><span>-{fmt(descuento)}</span>
                </div>
              )}

              {/* Envío. Sin ciudad elegida todavía no se puede saber
                  cuánto cuesta, y decir una cifra que luego cambia es
                  peor que decir que falta un dato. */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: envioGratis ? '#6BC48C' : '#9A9180', marginBottom: 6 }}>
                <span>Envío</span>
                <span>
                  {!form.ciudad
                    ? <span style={{ color: '#6B6355' }}>Elige tu ciudad</span>
                    : envioGratis ? 'Gratis' : fmt(envio)}
                </span>
              </div>

              {/* Cuánto falta para que salga gratis: es el empujón más
                  barato que tiene una tienda. */}
              {form.ciudad && !envioGratis && minimoGratis > 0 && (
                <div style={{ fontSize: 11, color: '#C9A84C', background: 'rgba(201,168,76,0.07)', borderRadius: 5, padding: '7px 10px', marginBottom: 8, lineHeight: 1.45 }}>
                  Te faltan {fmt(minimoGratis - productos)} para el envío gratis
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#C9A84C', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                <span style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', fontSize: 11 }}>TOTAL</span>
                <span>{fmt(totalFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
