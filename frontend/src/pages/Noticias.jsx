import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito }  from '../hooks/useCarrito';
import { useWishlist } from '../hooks/useWishlist';
import SocialButtons   from '../components/SocialButtons';
import WhatsAppButton  from '../components/WhatsAppButton';
import { noticiasAPI } from '../services/api';

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
    try { const r = localStorage.getItem('op_video');        if (r) setVideo(JSON.parse(r)); }        catch {}
    try { const r = localStorage.getItem('op_lanzamientos'); if (r) setLanzamientos(JSON.parse(r)); } catch {}
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

      {/* ── Announcement bar ── */}
      <div className="announcement-bar" role="banner">
        <div className="announcement-bar__track" aria-hidden="true">
          <span className="announcement-bar__text">
            Envío gratuito en pedidos superiores a $150.000 <span>·</span> Fragancias 100% Originales <span>·</span> Más de 500 referencias exclusivas <span>·</span> Atención personalizada <span>·</span>
          </span>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="header" id="header">
        <a href="/" className="header__logo">
          <div className="logo-icon">
            <img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="OrientPerfumes" />
          </div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>

        {/* Navegación */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32 }}>
          {NAV.map(n => (
            <a key={n.to} href={n.to}
              style={{
                fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em',
                color: n.to === '/noticias' ? '#C9A84C' : '#9A9180',
                textDecoration: 'none', padding: '6px 12px', borderRadius: 4,
                transition: 'color 0.2s',
                borderBottom: n.to === '/noticias' ? '1px solid rgba(201,168,76,0.5)' : '1px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.color = n.to === '/noticias' ? '#C9A84C' : '#9A9180'}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          {/* Redes sociales */}
          <div style={{ marginRight: 8 }}><SocialButtons /></div>

          {/* Wishlist */}
          <button className="action-btn" onClick={() => navigate('/')} aria-label="Favoritos">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {wishCount > 0 && <span className="action-btn__badge">{wishCount}</span>}
          </button>

          {/* Carrito */}
          <button className="action-btn" onClick={() => navigate('/')} aria-label="Carrito">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {cartCount > 0 && <span className="action-btn__badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="noticias-hero">
        {/* Breadcrumb / back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '5px 14px', color: '#9A9180', cursor: 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9A9180'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; }}>
            <ArrowLeft />
            Volver al inicio
          </button>
        </div>

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

      {/* ── Footer ── */}
      <footer className="footer" style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 40px' }}>

          {/* Redes sociales */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.25em', color: '#6B6355' }}>SÍGUENOS</span>
            <SocialButtons />
          </div>

          <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.15)' }} />

          <nav style={{ display: 'flex', gap: 24 }}>
            {NAV.map(n => (
              <a key={n.to} href={n.to}
                style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', color: '#6B6355', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B6355'}>
                {n.label.toUpperCase()}
              </a>
            ))}
          </nav>

          <p className="footer__copy" style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} OrientPerfumes · Todos los derechos reservados
          </p>
        </div>
      </footer>

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
