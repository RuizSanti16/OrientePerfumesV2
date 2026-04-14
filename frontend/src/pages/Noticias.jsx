import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito }  from '../hooks/useCarrito';
import { useWishlist } from '../hooks/useWishlist';

export default function Noticias() {
  const navigate = useNavigate();
  const { count: cartCount } = useCarrito();
  const { count: wishCount } = useWishlist();

  const [video,        setVideo]        = useState({ url: '', titulo: '', descripcion: '' });
  const [lanzamientos, setLanzamientos] = useState([]);
  const [comentarios,  setComentarios]  = useState([]);
  const [nombre,       setNombre]       = useState('');
  const [texto,        setTexto]        = useState('');

  useEffect(() => {
    try { const r = localStorage.getItem('op_video');        if (r) setVideo(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_lanzamientos'); if (r) setLanzamientos(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem('op_comentarios');  if (r) setComentarios(JSON.parse(r)); } catch {}
  }, []);

  function enviarComentario() {
    if (!nombre.trim() || !texto.trim()) return;
    const nuevo = { nombre: nombre.trim(), texto: texto.trim(), fecha: new Date().toLocaleDateString('es-CO') };
    const nuevos = [nuevo, ...comentarios];
    setComentarios(nuevos);
    localStorage.setItem('op_comentarios', JSON.stringify(nuevos));
    setNombre(''); setTexto('');
  }

  const inp = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '10px 14px', color: '#E8DCC8', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Lato, sans-serif' };

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#E8DCC8', fontFamily: 'Lato, sans-serif' }}>

      {/* Announcement bar */}
      <div className="announcement-bar" role="banner">
        <div className="announcement-bar__track" aria-hidden="true">
          <span className="announcement-bar__text">
            Envío gratuito en pedidos superiores a $150.000 <span>·</span> Fragancias 100% Originales <span>·</span> Más de 500 referencias exclusivas <span>·</span> Atención personalizada <span>·</span>
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="header" id="header">
        <a href="/" className="header__logo">
          <div className="logo-icon"><img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="Logo" /></div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>
        <div className="header__actions">
          <button className="action-btn" onClick={() => navigate('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span className="action-btn__badge">{wishCount}</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span className="action-btn__badge">{cartCount}</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="noticias-hero">
        <div className="section__eyebrow">OrientPerfumes</div>
        <h1 className="noticias-hero__title">Noticias <em>&amp; Novedades</em></h1>
        <div className="noticias-hero__ornament" aria-hidden="true">❧</div>
      </div>

      {/* Grid */}
      <main className="noticias-main">
        <div className="noticias-grid">

          {/* Columna izquierda */}
          <div className="col-izquierda">

            {/* Video */}
            <section className="video-section">
              <h2 className="section-label">Video Destacado</h2>
              <div className="video-wrapper">
                {video.url
                  ? <video className="main-video" controls preload="metadata" src={video.url} style={{ width: '100%', borderRadius: 8 }} />
                  : <div className="video-placeholder">
                      <div className="video-placeholder__icon">▶</div>
                      <p className="video-placeholder__text">Video próximamente</p>
                    </div>
                }
              </div>
              {(video.titulo || video.descripcion) && (
                <div className="video-info">
                  {video.titulo     && <h3 className="video-info__title">{video.titulo}</h3>}
                  {video.descripcion && <p className="video-info__desc">{video.descripcion}</p>}
                </div>
              )}
            </section>

            {/* Comentarios */}
            <section className="comentarios-section">
              <h2 className="section-label">Comentarios</h2>
              <div className="comentario-form">
                <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" maxLength={50} />
                <textarea className="form-textarea" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribe tu comentario..." maxLength={300} rows={3} />
                <button className="btn-primary" onClick={enviarComentario}>Enviar Comentario</button>
              </div>
              <div className="comentarios-lista">
                {comentarios.length === 0
                  ? <p style={{ color: '#9A9180', fontSize: 13, padding: '16px 0' }}>Sé el primero en comentar.</p>
                  : comentarios.map((c, i) => (
                    <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                      <div style={{ fontWeight: 600, color: '#C9A84C', marginBottom: 4 }}>{c.nombre}</div>
                      <div style={{ fontSize: 14, color: '#C8C0B0' }}>{c.texto}</div>
                      <div style={{ fontSize: 11, color: '#9A9180', marginTop: 4 }}>{c.fecha}</div>
                    </div>
                  ))
                }
              </div>
            </section>
          </div>

          {/* Columna derecha */}
          <div className="col-derecha">
            <section className="lanzamientos-section">
              <h2 className="lanzamientos-title">Nuevos Lanzamientos</h2>
              <div className="lanzamientos-grid">
                {lanzamientos.length === 0
                  ? <p style={{ color: '#9A9180', fontSize: 13 }}>Próximamente nuevos lanzamientos.</p>
                  : lanzamientos.map((l, i) => (
                    <article key={i} className="launch-card" style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                      {l.imagen
                        ? <img src={l.imagen} alt={l.nombre} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: 160, background: '#1a1a18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🫙</div>}
                      <div style={{ padding: 16 }}>
                        <span style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>{l.badge || 'Nuevo'}</span>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#E8DCC8', marginBottom: 6 }}>{l.nombre}</div>
                        <div style={{ fontSize: 13, color: '#9A9180' }}>{l.descripcion}</div>
                      </div>
                    </article>
                  ))
                }
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p className="footer__copy">© 2024 OrientPerfumes · Todos los derechos reservados</p>
        <a href="#" className="footer__back">↑ Volver Arriba</a>
      </footer>
    </div>
  );
}