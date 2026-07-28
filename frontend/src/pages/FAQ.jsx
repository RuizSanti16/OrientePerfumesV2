import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useInView }   from '../hooks/useInView';
import SocialButtons   from '../components/SocialButtons';

const CATEGORIAS = [
  {
    id: 'envios',
    titulo: 'Envíos y Entregas',
    preguntas: [
      {
        q: '¿A dónde hacen envíos?',
        a: 'Realizamos envíos a todo Colombia. Trabajamos con las principales transportadoras nacionales para garantizar que tu pedido llegue en perfectas condiciones a cualquier ciudad o municipio del país.',
      },
      {
        q: '¿Cuánto tiempo tarda en llegar mi pedido?',
        a: 'En ciudades principales (Bogotá, Medellín, Cali, Barranquilla) el tiempo de entrega es de 1 a 3 días hábiles. Para otras ciudades y municipios, puede tardar entre 3 y 7 días hábiles dependiendo de la zona.',
      },
      {
        q: '¿Tienen envío gratis?',
        a: 'Sí. Todos los pedidos superiores a $150.000 COP tienen envío gratuito a cualquier parte de Colombia. Para pedidos menores, el costo de envío se calcula según la ciudad de destino.',
      },
      {
        q: '¿Cómo puedo hacer seguimiento a mi pedido?',
        a: 'Una vez despachado tu pedido, te enviaremos el número de guía por WhatsApp o correo electrónico para que puedas hacer seguimiento en tiempo real con la transportadora asignada.',
      },
    ],
  },
  {
    id: 'productos',
    titulo: 'Productos y Autenticidad',
    preguntas: [
      {
        q: '¿Son 100% originales las fragancias?',
        a: 'Absolutamente. Todos los productos en OrientPerfumes son 100% originales y auténticos. Trabajamos directamente con distribuidores oficiales y maisons reconocidas a nivel mundial. Nunca vendemos imitaciones ni réplicas.',
      },
      {
        q: '¿Qué tipos de fragancias manejan?',
        a: 'Trabajamos con tres grandes categorías: Perfumería Nicho (casas independientes y exclusivas como Xerjoff, Roja Parfums, Byredo), Fragancias Orientales (oud, ambar, musk, sándalo de Medio Oriente y Asia) y Diseñador (Chanel, Dior, Tom Ford, Creed, Amouage y otras grandes maisons).',
      },
      {
        q: '¿Puedo recibir asesoría para elegir mi fragancia?',
        a: 'Sí, con mucho gusto. Nuestro equipo de especialistas olfativos está disponible por WhatsApp y correo para ayudarte a encontrar la fragancia perfecta según tu perfil olfativo, ocasión o preferencias.',
      },
      {
        q: '¿Las fragancias vienen con empaque original?',
        a: 'Sí, todos los productos se entregan en su empaque original de fábrica, con caja, sellos y documentación cuando aplica, tal como salen de la casa de la fragancia.',
      },
    ],
  },
  {
    id: 'pagos',
    titulo: 'Pagos y Precios',
    preguntas: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos transferencias bancarias, pagos por PSE, consignaciones y Nequi/Daviplata. Para más información sobre métodos disponibles, contáctanos directamente a través de nuestros canales de atención.',
      },
      {
        q: '¿Los precios incluyen IVA?',
        a: 'Sí, todos los precios mostrados en nuestra tienda incluyen IVA y demás impuestos aplicables según la ley colombiana.',
      },
      {
        q: '¿Tienen descuentos o promociones?',
        a: 'Frecuentemente ofrecemos descuentos en productos seleccionados, especialmente en temporadas especiales. Te recomendamos suscribirte a nuestras redes sociales y seguir nuestra sección de Noticias para no perderte ninguna oferta.',
      },
    ],
  },
  {
    id: 'devoluciones',
    titulo: 'Devoluciones y Garantías',
    preguntas: [
      {
        q: '¿Puedo devolver un producto?',
        a: 'Aceptamos devoluciones dentro de los 5 días hábiles siguientes a la recepción del producto, siempre que se encuentre sin usar, en su empaque original y en las mismas condiciones en que fue entregado. Productos con el sello roto no aplican para devolución.',
      },
      {
        q: '¿Qué pasa si mi pedido llegó dañado?',
        a: 'Si tu pedido llegó dañado o incompleto, contáctanos inmediatamente (máximo 24 horas después de la entrega) con fotos del producto y el empaque. Gestionaremos el reemplazo o reembolso sin costo adicional para ti.',
      },
      {
        q: '¿Cómo proceso una devolución o reclamo?',
        a: 'Simplemente escríbenos por WhatsApp o correo electrónico con tu número de pedido, el motivo y fotos del producto. Nuestro equipo de atención resolverá tu caso en un plazo máximo de 48 horas hábiles.',
      },
    ],
  },
];

export default function FAQ() {
  const navigate  = useNavigate();
  const [abierta, setAbierta] = useState({});
  const [catActiva, setCatActiva] = useState('envios');

  const [refHero,  visHero]  = useInView(0.1);
  const [refBody,  visBody]  = useInView(0.05);

  function toggle(catId, idx) {
    const key = `${catId}-${idx}`;
    setAbierta(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const catData = CATEGORIAS.find(c => c.id === catActiva) || CATEGORIAS[0];

  return (
    <div style={{ background:'#0a0a08', minHeight:'100vh', color:'#E8DCC8', fontFamily:'Raleway,sans-serif' }}>

      {/* Header */}
      <header className="header">
        <a onClick={() => navigate('/')} className="header__logo" style={{ cursor:'pointer' }}>
          <div className="logo-icon"><img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="Logo" /></div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>

        <nav style={{ display:'flex', alignItems:'center', gap:4, marginLeft:32 }}>
          {[
            { label:'Inicio',    to:'/'          },
            { label:'Colección', to:'/coleccion' },
            { label:'Noticias',  to:'/noticias'  },
            { label:'Contacto',  to:'/contacto'  },
          ].map(n => (
            <a key={n.to} href={n.to}
              style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.18em', color:'#9A9180',
                textDecoration:'none', padding:'6px 12px', borderRadius:4, transition:'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.color='#9A9180'}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <div style={{ marginRight:4 }}><SocialButtons /></div>
          <BtnVolver onClick={() => navigate('/')} label="INICIO" />
        </div>
      </header>

      {/* ── Hero ── */}
      <section ref={refHero} className={`fade-up${visHero ? ' visible' : ''}`}
        style={{ position:'relative', padding:'100px 24px 72px', textAlign:'center', overflow:'hidden' }}>
        <div aria-hidden="true" style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div aria-hidden="true" style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)' }}/>

        <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.3em', color:'#C9A84C', marginBottom:18 }}>AYUDA</div>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(36px,6vw,68px)', fontWeight:400, color:'#E8DCC8', margin:'0 0 20px', lineHeight:1.15 }}>
          Preguntas Frecuentes
        </h1>
        <p style={{ fontSize:15, color:'#9A9180', maxWidth:520, margin:'0 auto', lineHeight:1.8 }}>
          Todo lo que necesitas saber sobre envíos, productos, pagos y devoluciones.
        </p>
      </section>

      {/* ── Contenido ── */}
      <div ref={refBody} className={`fade-up${visBody ? ' visible' : ''}`}
        style={{ maxWidth:900, margin:'0 auto', padding:'0 24px 80px', display:'grid', gridTemplateColumns:'200px 1fr', gap:40, alignItems:'start' }}>

        {/* Sidebar de categorías */}
        <nav style={{ position:'sticky', top:100 }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.2em', color:'#9A9180', marginBottom:12 }}>CATEGORÍAS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {CATEGORIAS.map(cat => (
              <button key={cat.id} onClick={() => setCatActiva(cat.id)}
                style={{
                  background: catActiva===cat.id ? 'rgba(201,168,76,0.1)' : 'none',
                  border: `1px solid ${catActiva===cat.id ? 'rgba(201,168,76,0.4)' : 'transparent'}`,
                  borderRadius:6, padding:'10px 14px', cursor:'pointer', textAlign:'left',
                  color: catActiva===cat.id ? '#C9A84C' : '#9A9180',
                  fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.1em',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => { if (catActiva!==cat.id) { e.currentTarget.style.color='#C9A84C'; e.currentTarget.style.borderColor='rgba(201,168,76,0.2)'; }}}
                onMouseLeave={e => { if (catActiva!==cat.id) { e.currentTarget.style.color='#9A9180'; e.currentTarget.style.borderColor='transparent'; }}}>
                {cat.titulo}
              </button>
            ))}
          </div>
        </nav>

        {/* Acordeón */}
        <div>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(20px,3vw,30px)', color:'#E8DCC8', fontWeight:400, marginBottom:28, paddingBottom:16, borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
            {catData.titulo}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {catData.preguntas.map((item, idx) => {
              const key = `${catData.id}-${idx}`;
              const open = !!abierta[key];
              return (
                <div key={idx} style={{ border:'1px solid rgba(201,168,76,0.12)', borderRadius:10, overflow:'hidden', transition:'border-color 0.2s', ...(open && { borderColor:'rgba(201,168,76,0.35)' }) }}>
                  {/* Pregunta */}
                  <button onClick={() => toggle(catData.id, idx)}
                    style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', gap:16,
                      padding:'18px 20px', background: open ? 'rgba(201,168,76,0.06)' : '#111',
                      border:'none', cursor:'pointer', textAlign:'left', transition:'background 0.2s' }}>
                    <span style={{ fontSize:14, color:'#E8DCC8', fontWeight:600, lineHeight:1.5 }}>{item.q}</span>
                    <span style={{ flexShrink:0, width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center',
                      color:'#C9A84C', transition:'transform 0.3s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </span>
                  </button>
                  {/* Respuesta */}
                  {open && (
                    <div style={{ padding:'4px 20px 20px', background:'rgba(201,168,76,0.03)' }}>
                      <p style={{ fontSize:14, color:'#C8C0B0', lineHeight:1.85, margin:0 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Más ayuda ── */}
      <section style={{ background:'#0d0d0b', borderTop:'1px solid rgba(201,168,76,0.07)', padding:'56px 24px', textAlign:'center' }}>
        <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.25em', color:'#C9A84C', marginBottom:14 }}>¿NO ENCONTRASTE TU RESPUESTA?</div>
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(22px,3.5vw,36px)', color:'#E8DCC8', fontWeight:400, margin:'0 0 16px' }}>
          Estamos aquí para ayudarte
        </h2>
        <p style={{ fontSize:14, color:'#9A9180', marginBottom:32 }}>Nuestro equipo responde en menos de 24 horas hábiles.</p>
        <a href="/contacto" style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.18em', color:'#0a0a08', textDecoration:'none', background:'#C9A84C', borderRadius:4, padding:'12px 32px', display:'inline-block', transition:'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          CONTACTAR SOPORTE
        </a>
      </section>

      <Footer />
    </div>
  );
}

/* ── Botón de volver estándar ── */
function BtnVolver({ onClick, label = 'INICIO' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:8,
        background:'none',
        border:'1px solid rgba(201,168,76,0.45)',
        borderRadius:4,
        padding:'8px 20px',
        color:'#C9A84C',
        cursor:'pointer',
        fontFamily:'Cinzel, serif',
        fontSize:12,
        letterSpacing:'0.12em',
        transition:'background 0.2s, border-color 0.2s',
        whiteSpace:'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}
