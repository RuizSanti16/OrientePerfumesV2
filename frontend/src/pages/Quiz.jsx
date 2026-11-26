import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { productosAPI } from '../services/api';
import { FAMILIAS_NOTAS } from '../datosNotas';
import { useCarrito }   from '../hooks/useCarrito';
import Header from '../components/Header';

function formatCOP(v) { return '$ ' + Number(v || 0).toLocaleString('es-CO'); }

/* ── Preguntas del quiz ── */
const PREGUNTAS = [
  {
    id: 'ocasion',
    titulo: '¿Para qué ocasión buscas esta fragancia?',
    subtitulo: 'Elige la situación más frecuente en que la usarías.',
    opciones: [
      { valor: 'diario',    label: 'Uso diario',        desc: 'Para el día a día, trabajo y rutina' },
      { valor: 'noche',     label: 'Noche y eventos',   desc: 'Cenas, salidas y reuniones especiales' },
      { valor: 'romantica', label: 'Ocasión romántica',  desc: 'Citas, aniversarios y momentos íntimos' },
      { valor: 'trabajo',   label: 'Ambiente profesional', desc: 'Oficina, presentaciones y networking' },
    ],
  },
  {
    id: 'familia',
    titulo: '¿Qué familia olfativa te atrae más?',
    subtitulo: 'Elige la que más resuene contigo.',
    opciones: [
      { valor: 'oriental',  label: 'Oriental y especiada',  desc: 'Oud, ámbar, incienso, resinas cálidas' },
      { valor: 'floral',    label: 'Floral y romántica',    desc: 'Rosa, jazmín, nardo, peonia' },
      { valor: 'fresca',    label: 'Fresca y cítrica',      desc: 'Bergamota, limón, menta, ozónico' },
      { valor: 'amaderada', label: 'Amaderada y terrosa',   desc: 'Sándalo, cedro, vetiver, musgo' },
    ],
  },
  {
    id: 'intensidad',
    titulo: '¿Qué intensidad prefieres?',
    subtitulo: 'La proyección define cuánto espacio ocupa la fragancia.',
    opciones: [
      { valor: 'muy_ligera', label: 'Muy ligera',  desc: 'Solo tú y quienes estén muy cerca lo notan' },
      { valor: 'moderada',   label: 'Moderada',   desc: 'Presente pero discreta, equilibrada' },
      { valor: 'intensa',    label: 'Intensa',    desc: 'Deja una estela clara y memorable' },
      { valor: 'muy_intensa',label: 'Muy intensa', desc: 'Persistente y envolvente todo el día' },
    ],
  },
  {
    id: 'presupuesto',
    titulo: '¿Cuál es tu rango de presupuesto?',
    subtitulo: 'Filtramos solo fragancias dentro de tu rango.',
    opciones: [
      { valor: 'hasta_100', label: 'Hasta $100.000',        desc: 'Fragancias accesibles y cotidianas' },
      { valor: 'hasta_300', label: '$100.000 – $300.000',   desc: 'Diseñador y referencias populares' },
      { valor: 'hasta_600', label: '$300.000 – $600.000',   desc: 'Alta perfumería y selección premium' },
      { valor: 'mas_600',   label: 'Más de $600.000',       desc: 'Nicho exclusivo y lujo sin compromiso' },
    ],
  },
  {
    id: 'tipo',
    titulo: '¿Tienes preferencia por el tipo de fragancia?',
    subtitulo: 'Esto nos ayuda a afinar la recomendación final.',
    opciones: [
      { valor: 'disenador', label: 'Diseñador',         desc: 'Chanel, Dior, Tom Ford, Creed y grandes maisons' },
      { valor: 'nicho',     label: 'Perfumería Nicho',  desc: 'Casas exclusivas e independientes del mundo' },
      { valor: 'oriental',  label: 'Oriental',          desc: 'Tradición del Medio Oriente y Asia' },
      { valor: 'ninguna',   label: 'Sin preferencia',   desc: 'Sorpréndeme con la mejor opción' },
    ],
  },
];

/* Qué familias de notas busca cada respuesta olfativa.

   El quiz preguntaba por la familia y luego puntuaba mirando la
   categoría del producto: contestar "floral" sumaba puntos a todo lo
   que fuera "Diseñador". Son cosas distintas, y la respuesta no
   tenía nada que ver con a qué huele el perfume. Ahora se compara
   con sus notas reales. */
const FAMILIAS_POR_RESPUESTA = {
  oriental:  ['Orientales y Resinas', 'Especias', 'Dulces y Gourmand'],
  floral:    ['Florales', 'Frutales'],
  fresca:    ['Cítricos', 'Verdes y Aromáticas', 'Marinas y Frescas'],
  amaderada: ['Maderas', 'Almizcles y Animales'],
};

/* Notas que suelen marcar una fragancia intensa o ligera. La
   intensidad no está en la base, pero los ingredientes la sugieren
   bastante bien: un oud con incienso no es una colonia de verano. */
const NOTAS_INTENSAS = ['Oud', 'Agarwood', 'Incienso', 'Mirra', 'Ámbar', 'Pachulí',
  'Cuero', 'Tuberosa', 'Azafrán', 'Labdanum', 'Benjuí', 'Opoponaco', 'Castóreo'];
const NOTAS_LIGERAS  = ['Bergamota', 'Limón', 'Lima', 'Naranja', 'Mandarina', 'Pomelo',
  'Neroli', 'Menta', 'Té Verde', 'Notas Marinas', 'Notas Acuáticas', 'Ozono',
  'Hierbabuena', 'Yuzu', 'Sal Marina'];

/* El precio más bajo al que se puede comprar: el de la presentación
   más barata, no el del frasco grande.

   Con el precio base, alguien que dijera "hasta 100.000" se quedaba
   sin ver perfumes de 250.000 de los que puede llevarse una muestra
   de 5ml por 25.000. */
function precioMinimo(p) {
  const base = Number(p.precio || 0);
  const pres = Array.isArray(p.presentaciones) ? p.presentaciones : [];
  const precios = pres.map(x => Number(x.precio || 0)).filter(n => n > 0);
  return precios.length ? Math.min(...precios) : base;
}

function normalizar(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/* ── Motor de puntuación ──

   Devuelve la puntuación y los motivos, para poder decirle al
   visitante por qué se le recomienda cada frasco en vez de pedirle
   que se fíe de una lista sin explicación. */
function puntuarProducto(p, respuestas) {
  const cat    = normalizar(p.nombre_categoria);
  const notas  = (p.notas || []).map(normalizar);
  const minimo = precioMinimo(p);
  const motivos = [];
  let score = 0;

  /* Q4 va primero: es el único filtro que descarta. Se mira contra
     el precio más bajo disponible. */
  const topes = { hasta_100: 100000, hasta_300: 300000, hasta_600: 600000 };
  const tope  = topes[respuestas[3]];
  if (tope && minimo > tope) return { score: -1, motivos: [] };
  if (respuestas[3] === 'mas_600' && Number(p.precio || 0) < 600000) score -= 2;

  /* Q2: familia olfativa, contra las notas reales */
  const familias = FAMILIAS_POR_RESPUESTA[respuestas[1]] || [];
  const buscadas = FAMILIAS_NOTAS
    .filter(f => familias.includes(f.familia))
    .flatMap(f => f.notas.map(normalizar));

  const coinciden = notas.filter(n => buscadas.includes(n));
  if (coinciden.length) {
    /* Tres puntos por nota, hasta cuatro notas: a partir de ahí el
       perfume ya es claramente de esa familia y sumar más solo
       aplastaría al resto de criterios. */
    score += Math.min(coinciden.length, 4) * 3;
    const nombres = (p.notas || []).filter(n => buscadas.includes(normalizar(n))).slice(0, 3);
    motivos.push(`Lleva ${nombres.join(', ')}`);
  }

  /* Q3: intensidad, también por notas */
  const intensas = notas.filter(n => NOTAS_INTENSAS.map(normalizar).includes(n)).length;
  const ligeras  = notas.filter(n => NOTAS_LIGERAS.map(normalizar).includes(n)).length;
  const fuerte   = intensas > ligeras;
  const suave    = ligeras > intensas;

  if ((respuestas[2] === 'intensa' || respuestas[2] === 'muy_intensa') && fuerte) {
    score += 4; motivos.push('De estela marcada');
  }
  if ((respuestas[2] === 'muy_ligera' || respuestas[2] === 'moderada') && suave) {
    score += 4; motivos.push('Ligero y fresco');
  }

  /* Q1 y Q5 siguen usando la categoría, que para "dónde encaja" y
     "qué tipo de casa" sí es la información adecuada. */
  const ocasion = respuestas[0];
  if (ocasion === 'diario'    && cat.includes('disenador')) { score += 3; motivos.push('Va bien a diario'); }
  if (ocasion === 'noche'     && (cat.includes('oriental') || cat.includes('exclusiv'))) { score += 3; motivos.push('Pensado para la noche'); }
  if (ocasion === 'romantica' && cat.includes('oriental'))  { score += 3; motivos.push('Cálido y envolvente'); }
  if (ocasion === 'trabajo'   && cat.includes('disenador')) { score += 3; motivos.push('Discreto para la oficina'); }

  const tipo = respuestas[4];
  if (tipo === 'disenador' && cat.includes('disenador')) { score += 5; motivos.push('De casa de diseñador'); }
  if (tipo === 'nicho'     && cat.includes('nicho'))     { score += 5; motivos.push('Perfumería nicho'); }
  if (tipo === 'oriental'  && cat.includes('oriental'))  { score += 5; motivos.push('Oriental'); }
  if (tipo === 'ninguna')  score += 1;

  /* Un perfume sin notas cargadas no puede competir con los que sí
     las tienen, pero tampoco debe quedar fuera: sigue puntuando por
     categoría y precio. */
  if (notas.length === 0) score += 1;

  if (tope && minimo <= tope) {
    score += 2;
    if (minimo < Number(p.precio || 0)) {
      motivos.push(`Desde ${new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(minimo)} en muestra`);
    }
  }

  return { score, motivos: motivos.slice(0, 3) };
}

export default function Quiz() {
  const navigate = useNavigate();
  const { agregar } = useCarrito();

  const [paso,         setPaso]         = useState(0);      // 0..4 = preguntas, 5 = resultados
  const [respuestas,   setRespuestas]   = useState([]);
  const [animando,     setAnimando]     = useState(false);
  const [productos,    setProductos]    = useState([]);
  const [cargandoProd, setCargandoProd] = useState(false);
  const [resultados,   setResultados]   = useState([]);
  const [addedMap,     setAddedMap]     = useState({});

  /* Cargar catálogo una sola vez */
  useEffect(() => {
    /* Con las notas: son la base de la recomendación. */
    productosAPI.listarConNotas().then(res => {
      if (res.ok) setProductos(res.data || []);
    }).catch(() => {});
  }, []);

  function elegir(valor) {
    if (animando) return;
    const nuevas = [...respuestas, valor];
    setRespuestas(nuevas);

    if (paso < PREGUNTAS.length - 1) {
      setAnimando(true);
      setTimeout(() => { setPaso(paso + 1); setAnimando(false); }, 260);
    } else {
      /* Calcular resultados */
      setCargandoProd(true);
      setTimeout(() => {
        const scored = productos
          .map(p => {
            const { score, motivos } = puntuarProducto(p, nuevas);
            return { ...p, _score: score, _motivos: motivos };
          })
          .filter(p => p._score > 0)
          .sort((a, b) => b._score - a._score);
        setResultados(scored.slice(0, 4));
        setPaso(PREGUNTAS.length);
        setCargandoProd(false);
      }, 600);
    }
  }

  function reiniciar() {
    setRespuestas([]);
    setPaso(0);
    setAnimando(false);
    setResultados([]);
  }

  function retroceder() {
    if (paso === 0) { navigate(-1); return; }
    setRespuestas(prev => prev.slice(0, -1));
    setPaso(paso - 1);
  }

  function handleCarrito(p) {
    agregar({ id: String(p.id_producto), nombre: p.nombre, marca: p.marca || '', precio: Number(p.precio), imagen: p.imagen || '' });
    setAddedMap(prev => ({ ...prev, [p.id_producto]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [p.id_producto]: false })), 1500);
  }

  const progreso = Math.round((paso / PREGUNTAS.length) * 100);
  const pregunta = PREGUNTAS[paso];

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif' }}>

      <Header />

      {/* ── Preguntas ── */}
      {paso < PREGUNTAS.length && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px 80px' }}>

          {/* Progreso */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', color: '#9A9180' }}>
                PREGUNTA {paso + 1} DE {PREGUNTAS.length}
              </span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.1em', color: '#C9A84C' }}>{progreso}%</span>
            </div>
            <div style={{ height: 2, background: 'rgba(201,168,76,0.12)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progreso}%`, background: 'linear-gradient(90deg,#8B6914,#C9A84C)', borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Pregunta */}
          <div style={{ opacity: animando ? 0 : 1, transform: animando ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.25s, transform 0.25s', marginBottom: 36 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.25em', color: '#C9A84C', marginBottom: 14 }}>
              ENCUENTRA TU FRAGANCIA
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(24px,4vw,38px)', fontWeight: 400, color: '#E8DCC8', margin: '0 0 10px', lineHeight: 1.2 }}>
              {pregunta.titulo}
            </h2>
            <p style={{ fontSize: 14, color: '#9A9180', margin: 0 }}>{pregunta.subtitulo}</p>
          </div>

          {/* Opciones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, opacity: animando ? 0 : 1, transition: 'opacity 0.25s' }}>
            {pregunta.opciones.map((op, i) => (
              <button key={op.valor} onClick={() => elegir(op.valor)}
                style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, padding: '20px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', animationDelay: `${i * 0.05}s` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)'; e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'; e.currentTarget.style.background = '#111'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.08em', color: '#E8DCC8', marginBottom: 6 }}>{op.label}</div>
                <div style={{ fontSize: 12, color: '#9A9180', lineHeight: 1.6 }}>{op.desc}</div>
              </button>
            ))}
          </div>

          {/* Botón volver pregunta anterior */}
          {paso > 0 && (
            <button onClick={retroceder}
              style={{ marginTop: 28, background: 'none', border: 'none', color: '#9A9180', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              PREGUNTA ANTERIOR
            </button>
          )}
        </div>
      )}

      {/* ── Calculando ── */}
      {cargandoProd && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
          <div style={{ width: 48, height: 48, border: '2px solid rgba(201,168,76,0.2)', borderTop: '2px solid #C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', color: '#9A9180' }}>ANALIZANDO TU PERFIL OLFATIVO...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Resultados ── */}
      {paso === PREGUNTAS.length && !cargandoProd && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px' }}>

          {/* Título resultados */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.25em', color: '#C9A84C', marginBottom: 14 }}>TU PERFIL OLFATIVO</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 400, color: '#E8DCC8', margin: '0 0 16px' }}>
              {resultados.length > 0 ? 'Fragancias Recomendadas para Ti' : 'Sin resultados en tu rango'}
            </h2>
            <p style={{ fontSize: 14, color: '#9A9180', maxWidth: 500, margin: '0 auto' }}>
              {resultados.length > 0
                ? 'Basándonos en tus respuestas, estas fragancias son las que mejor se adaptan a tu perfil.'
                : 'No encontramos productos en ese rango de presupuesto. Prueba ajustando tus respuestas.'}
            </p>
          </div>

          {/* Tarjetas resultado */}
          {resultados.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 48 }}>
              {resultados.map((p, i) => (
                <div key={p.id_producto}
                  style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s', animationDelay: `${i * 0.1}s` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                  {/* Badge de posición */}
                  {i === 0 && (
                    <div style={{ background: 'linear-gradient(90deg,#8B6914,#C9A84C)', padding: '5px 12px', display: 'flex', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', color: '#0a0a08' }}>MEJOR COINCIDENCIA</span>
                    </div>
                  )}

                  {/* Imagen */}
                  <div style={{ height: 180, background: '#0d0d0b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/producto/${p.id_producto}`)}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <IconBottle />}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px 16px 20px' }}>
                    {p.marca && <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 4 }}>{p.marca.toUpperCase()}</div>}
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#E8DCC8', marginBottom: 6, lineHeight: 1.3, cursor: 'pointer' }}
                      onClick={() => navigate(`/producto/${p.id_producto}`)}>
                      {p.nombre}
                    </div>
                    <div style={{ fontSize: 16, color: '#C9A84C', fontWeight: 600, marginBottom: 10 }}>{formatCOP(p.precio)}</div>

                    {/* Por qué se recomienda. Una lista de cuatro
                        frascos sin explicación pide que te fíes; con
                        el motivo delante, la recomendación se puede
                        juzgar. */}
                    {p._motivos?.length > 0 && (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {p._motivos.map((m, k) => (
                          <li key={k} style={{ fontSize: 11, color: '#9A9180', display: 'flex', gap: 6, alignItems: 'flex-start', lineHeight: 1.45 }}>
                            <span style={{ color: '#C9A84C', flexShrink: 0 }}>·</span>{m}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleCarrito(p)}
                        style={{ flex: 1, background: addedMap[p.id_producto] ? '#4a7c59' : '#C9A84C', border: 'none', borderRadius: 6, padding: '9px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em', transition: 'background 0.2s' }}>
                        {addedMap[p.id_producto] ? 'AÑADIDO' : 'AL CARRITO'}
                      </button>
                      <button onClick={() => navigate(`/producto/${p.id_producto}`)}
                        style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, padding: '9px 14px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.1em', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        VER
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reiniciar}
              style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', color: '#C9A84C', background: 'none', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 4, padding: '11px 28px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              REPETIR EL QUIZ
            </button>
            <a href="/coleccion"
              style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', color: '#0a0a08', textDecoration: 'none', background: '#C9A84C', borderRadius: 4, padding: '11px 28px', display: 'inline-block', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              VER TODA LA COLECCIÓN
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const IconBottle = ({ size = 48 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.2" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.2 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);

function BtnVolver({ onClick, label = 'VOLVER' }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 4, padding: '8px 20px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.12em', transition: 'background 0.2s, border-color 0.2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}
