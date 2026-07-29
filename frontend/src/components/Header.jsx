import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialButtons from './SocialButtons';
import SearchBar from './SearchBar';

const NAV_LINKS = [
  { href: '/',            label: 'Inicio'           },
  { href: '/coleccion',   label: 'Colección'        },
  { href: '/noticias',    label: 'Noticias'         },
  { href: '/contacto',    label: 'Contacto'         },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
  { href: '/faq',         label: 'Preguntas frecuentes' },
  { href: '/quiz',        label: 'Quiz de Fragancia' },
  { href: '/comparador',  label: 'Comparador'       },
];

export default function Header({
  cartCount    = 0,
  wishCount    = 0,
  onCartClick,
  onWishlistClick,
  showSearch   = false,
  showAnnouncement = true,
}) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const session = (() => {
    try { return JSON.parse(localStorage.getItem('op_session')); }
    catch { return null; }
  })();
  const adminSession = (() => {
    try { return JSON.parse(localStorage.getItem('op_admin_session')); }
    catch { return null; }
  })();

  /* Scroll shadow */
  useEffect(() => {
    function onScroll() {
      const h = document.getElementById('site-header');
      if (h) h.classList.toggle('scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Bloquear scroll del body cuando el drawer está abierto */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function closeDrawer() { setDrawerOpen(false); }

  function logout() {
    localStorage.removeItem('op_session');
    localStorage.removeItem('op_admin_session');
    window.location.reload();
  }

  return (
    <>
      {showAnnouncement && (
        <div className="announcement-bar" role="banner" aria-label="Promociones">
          <div className="announcement-bar__track" aria-hidden="true">
            <span className="announcement-bar__text">
              Envío gratuito en pedidos superiores a $150.000 <span>·</span> Fragancias 100% Originales <span>·</span> Más de 500 referencias exclusivas <span>·</span> Atención personalizada <span>·</span>
              Envío gratuito en pedidos superiores a $150.000 <span>·</span> Fragancias 100% Originales <span>·</span> Más de 500 referencias exclusivas <span>·</span> Atención personalizada <span>·</span>
            </span>
          </div>
        </div>
      )}

      <header className="header" id="site-header" role="banner">
        {/* Logo */}
        <a onClick={() => navigate('/')} className="header__logo" style={{ cursor: 'pointer' }} aria-label="OrientPerfumes – Inicio">
          <div className="logo-icon" aria-hidden="true">
            <img src="/assets/Logo Oriente SIN FONDO (1) (1).png" alt="OrientPerfumes logo" />
          </div>
          <div className="logo-text">
            <div className="logo-text__name">OrientPerfumes</div>
            <div className="logo-text__tagline">Fragancias Orientales · Nicho · Diseñador</div>
          </div>
        </a>

        {showSearch && <SearchBar />}

        {/* Acciones */}
        <div className="header__actions" role="navigation">
          {onWishlistClick && (
            <button className="action-btn" onClick={onWishlistClick} aria-label={`Lista de deseos (${wishCount} items)`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {wishCount > 0 && <span className="action-btn__badge" aria-hidden="true">{wishCount}</span>}
            </button>
          )}
          {onCartClick && (
            <button className="action-btn" onClick={onCartClick} aria-label={`Carrito (${cartCount} items)`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {cartCount > 0 && <span className="action-btn__badge" aria-hidden="true">{cartCount}</span>}
            </button>
          )}
          <SocialButtons />
          <button className="menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Abrir menú" aria-expanded={drawerOpen}>
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* Drawer overlay */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
        style={{ opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'all' : 'none' }}
      />

      {/* Drawer */}
      <nav className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen} aria-label="Menú principal">
        <button className="drawer__close" onClick={closeDrawer} aria-label="Cerrar menú">✕</button>
        <div className="drawer__logo" aria-hidden="true">OrientPerfumes</div>

        {/* Sesión */}
        <div className="drawer__session">
          {session || adminSession ? (
            <div className="drawer__session-info">
              <div className="drawer__session-user">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>{(session || adminSession)?.nombre}</span>
              </div>
              <button className="drawer__session-logout" onClick={logout}>Cerrar Sesión</button>
            </div>
          ) : (
            <a href="/login" className="drawer__session-btn" onClick={closeDrawer}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Iniciar Sesión
            </a>
          )}
        </div>

        <div className="drawer__divider" aria-hidden="true"/>

        <ul className="drawer__nav">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} onClick={closeDrawer}>{label}</a>
            </li>
          ))}
          {(session || adminSession) && (
            <li><a href={adminSession ? '/admin' : '/mi-cuenta'} onClick={closeDrawer}>
              {adminSession ? 'Panel Admin' : 'Mi Cuenta'}
            </a></li>
          )}
        </ul>
      </nav>
    </>
  );
}
