import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useCarrito }  from '../hooks/useCarrito';
import { useWishlist } from '../hooks/useWishlist';
import Header from '../components/Header';
import SocialButtons   from '../components/SocialButtons';
import WhatsAppButton  from '../components/WhatsAppButton';
import { noticiasAPI, lanzamientosAPI, videoNoticiasAPI } from '../services/api';

/* ── Detecta tipo de video y devuelve {type, src} ─────────────── */
function parseVideoUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: 'video', src: url };
}

/* ── Icono SVG de play para el placeholder ─────────────────────── */
function PlayIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

/* ── Icono flecha atrás ────────────────────────────────────────── */
function ArrowLeft() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

/* ── Inicial de avatar ────────────────────────────────────────── */
function Avatar({ nombre }) {
  const letra = (nombre || '?')[0].toUpperCase();
  return (
    <div className="comentario-avatar" aria-hidden="true"
      style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700 }}>
      {letra}
    </div>
  );
}

export default function Noticias() {
  const navigate = useNavigate();
  const { count: cartCount } = useCarrito();
  const { count: wishCount } = useWishlist();

  const [video,        setVideo]        = useState({ url: '', titulo: '', descripcion: '' });
  const [lanzamientos, setLanzamientos] = useState([]);
  const [comentarios,  setComentarios]  = useState([]);
  const [nombre,       setNombre]       = useState('');
  const [texto,        setTexto]        = useState('');
  const [enviando,     setEnviando]     = useState(false);
  const [toast,        setToast]        = useState(null); // { ok, msg }
  const [reactions,    setReactions]    = useState({});   // { [id]: 'like'|'dislike' }

  const NAV = [
    { label: 'Inicio',    to: '/'          },
    { label: 'Colección', to: '/coleccion' },
    { label: 'Noticias',  to: '/noticias'  },
    { label: 'Contacto',  to: '/contacto'  },
  ];

  useEffect(() => {
    /* El video y las novedades se leen del servidor. Antes salian de
       localStorage y por eso esta pagina aparecia vacia para cualquiera
       que no fuese el administrador que los habia configurado. */
    videoNoticiasAPI.obtener()
      .then(r => {
        if (r.ok && r.data) {
          setVideo({
            url:           r.data.url            || '',
            titulo:        r.data.titulo         || '',
            descripcion:   r.data.descripcion    || '',
            nombreArchivo: r.data.nombre_archivo || '',
          });
        }
      })
      .catch(() => {});

    lanzamientosAPI.listar()
      .then(r => { if (r.ok && r.data) setLanzamientos(r.data); })
      .catch(() => {});

    /* Las reacciones si son preferencia local de cada visitante. */
    try { const r = localStorage.getItem('op_reactions');    if (r) setReactions(JSON.parse(r)); }    catch {}
    /* Cargar comentarios aprobados desde la API */
    noticiasAPI.listarAprobados().then(r => { if (r.ok) setComentarios(r.data); });
  }, []);

  async function enviarComentario() {
    if (!nombre.trim() || !texto.trim()) return;
    setEnviando(true);
    const res = await noticiasAPI.enviar({ nombre: nombre.trim(), texto: texto.trim() });
    setEnviando(false);
    if (res.ok) {
      setNombre(''); setTexto('');
      showToast(true, 'Tu comentario fue enviado y está pendiente de revisión');
    } else {
      showToast(false, res.mensaje || 'Error al enviar el comentario');
    }
  }

  function showToast(ok, msg) {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function reaccionar(id, tipo) {
    const prev = reactions[id];
    const updated = { ...reactions, [id]: prev === tipo ? null : tipo };
    setReactions(updated);
    localStorage.setItem('op_reactions', JSON.stringify(updated));
  }

  const parsed = parseVideoUrl(video.url);

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Raleway, sans-serif' }}>

      <Header />

      {/* ── Hero ── */}
      <div className="noticias-hero">
        <div className="section__eyebrow">OrientPerfumes</div>
        <h1 className="noticias-hero__title">Noticias <em>&amp; Novedades</em></h1>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#9A9180', marginTop: 12, letterSpacing: '0.04em' }}>
          Mantente al tanto de nuestros lanzamientos, videos y novedades
        </p>
        <div className="noticias-hero__ornament" aria-hidden="true" style={{ letterSpacing: 8 }}>— —</div>
      </div>

      {/* ── Contenido principal ── */}
      <main className="noticias-main">
        <div className="noticias-grid">

          {/* ── Columna izquierda: Video + Comentarios ── */}
          <div className="col-izquierda">

            {/* Video */}
            <section className="video-section">
              <h2 className="section-label">Video Destacado</h2>

              <div className="video-wrapper">
                {!parsed ? (
                  <div className="video-placeholder">
                    <div className="video-placeholder__icon"><PlayIcon /></div>
                    <p className="video-placeholder__text">Video próximamente</p>
                  </div>
                ) : parsed.type === 'iframe' ? (
                  <iframe className="video-iframe" src={parsed.src}
                    title={video.titulo || 'Video destacado'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                ) : (
                  <video className="main-video" controls preload="metadata" src={parsed.src} />
                )}
              </div>

              {(video.titulo || video.descripcion) && (
                <div className="video-info">
                  {video.titulo      && <h3 className="video-info__title">{video.titulo}</h3>}
                  {video.descripcion && <p  className="video-info__desc">{video.descripcion}</p>}
                </div>
              )}

              {/* Compartir en redes */}
              {video.url && (
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em', color: '#6B6355' }}>COMPARTIR</span>
                  <SocialButtons />
                </div>
              )}
            </section>

            {/* Comentarios */}
            <section className="comentarios-section">
              <h2 className="section-label">Comentarios ({comentarios.length})</h2>

              <div className="comentario-form">
                <input className="form-input" value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre" maxLength={50} />
                <textarea className="form-textarea" value={texto}
                  onChange={e => setTexto(e.target.value)}
                  placeholder="Escribe tu comentario..." maxLength={300} rows={3} />
                <button className="btn-primary" onClick={enviarComentario} disabled={enviando}
                  style={{ alignSelf: 'flex-end', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', opacity: enviando ? 0.7 : 1 }}>
                  {enviando ? 'Enviando...' : 'Publicar Comentario'}
                </button>
              </div>

              <div className="comentarios-lista">
                {comentarios.length === 0 ? (
                  <p className="comentarios-empty">Sé el primero en comentar</p>
                ) : comentarios.map(c => (
                  <div key={c.id} className="comentario-card">
                    <Avatar nombre={c.nombre} />
                    <div>
                      <div className="comentario-nombre">{c.nombre}</div>
                      <div className="comentario-texto">{c.texto}</div>
                      <div style={{ fontSize: 10, color: 'rgba(201,168,76,0.4)', marginTop: 6 }}>
                        {new Date(c.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="comentario-acciones">
                      <button
                        className={`reaction-btn reaction-btn--like${reactions[c.id] === 'like' ? ' active' : ''}`}
                        onClick={() => reaccionar(c.id, 'like')} title="Me gusta">
                        <svg width={12} height={12} viewBox="0 0 24 24" fill={reactions[c.id]==='like'?'currentColor':'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                      </button>
                      <button
                        className={`reaction-btn reaction-btn--dislike${reactions[c.id] === 'dislike' ? ' active' : ''}`}
                        onClick={() => reaccionar(c.id, 'dislike')} title="No me gusta">
                        <svg width={12} height={12} viewBox="0 0 24 24" fill={reactions[c.id]==='dislike'?'currentColor':'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Columna derecha: Lanzamientos ── */}
          <div className="col-derecha">
            <section className="lanzamientos-section">
              <h2 className="lanzamientos-title">Nuevos Lanzamientos</h2>
              <div className="lanzamientos-grid">
                {lanzamientos.length === 0 ? (
                  <p className="lanzamientos-empty">Próximamente nuevos lanzamientos</p>
                ) : lanzamientos.map((l, i) => (
                  <article key={i} className="launch-card">
                    {l.imagen
                      ? <img src={l.imagen} alt={l.nombre} className="launch-card__img" />
                      : <div className="launch-card__img-placeholder">Sin imagen</div>}
                    <div className="launch-card__header">{l.nombre}</div>
                    <div>
                      <span className="launch-card__badge">{l.badge || 'Nuevo'}</span>
                    </div>
                    {l.descripcion && <p className="launch-card__desc">{l.descripcion}</p>}
                  </article>
                ))}
              </div>
            </section>
          </div>

        </div>
      </main>

      <Footer />

      {/* ── WhatsApp flotante ── */}
      <WhatsAppButton />

      {/* ── Toast ── */}
      <div className={`toast${toast ? ' show' : ''}`}
        style={{ background: toast?.ok === false ? '#c0392b' : undefined }}>
        {toast?.msg}
      </div>

    </div>
  );
}

/* ── Botón de volver estándar ── */
function BtnVolver({ onClick, label = 'INICIO' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'none',
        border: '1px solid rgba(201,168,76,0.45)',
        borderRadius: 4,
        padding: '8px 20px',
        color: '#C9A84C',
        cursor: 'pointer',
        fontFamily: 'Cinzel, serif',
        fontSize: 12,
        letterSpacing: '0.12em',
        transition: 'background 0.2s, border-color 0.2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        width="14" height="14" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}
