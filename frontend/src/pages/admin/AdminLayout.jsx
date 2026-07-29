import { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { notificacionesAPI } from '../../services/api';

const NAV = [
  { label: 'Dashboard',         to: '/admin' },
  { label: 'Pedidos',           to: '/admin/pedidos' },
  { label: 'Productos',         to: '/admin/products' },
  { label: 'Categorías',        to: '/admin/categories' },
  { label: 'Marcas',            to: '/admin/brands' },
  { label: 'Clientes',          to: '/admin/customers' },
  { label: 'Proveedores',       to: '/admin/suppliers' },
  { label: 'Inventario',        to: '/admin/inventory' },
  { label: 'Prod. Destacados',  to: '/admin/destacados' },
  { label: 'Logos Colecciones', to: '/admin/colecciones' },
  { label: 'Carrusel',          to: '/admin/carrusel' },
  { label: 'Noticias',          to: '/admin/noticias' },
  { label: 'Cupones',           to: '/admin/cupones' },
  { label: 'Ajustes',           to: '/admin/ajustes' },
];

function BellIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

export default function AdminLayout() {
  const navigate  = useNavigate();
  const [notifs,      setNotifs]      = useState(null);
  const [bellOpen,    setBellOpen]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bellRef = useRef(null);

  const session = (() => {
    try { return JSON.parse(localStorage.getItem('op_admin_session') || '{}'); }
    catch { return {}; }
  })();

  /* ── Polling de notificaciones cada 30 s ── */
  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const r = await notificacionesAPI.obtener();
        if (alive && r.ok) setNotifs(r.data);
      } catch { /* silenciar */ }
    }
    poll();
    const id = setInterval(poll, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  /* Cerrar dropdown al hacer click fuera */
  useEffect(() => {
    function handler(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function logout() {
    localStorage.removeItem('op_admin_session');
    navigate('/login');
  }

  const totalNotifs = notifs ? notifs.total : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a08', fontFamily: 'Raleway, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            z-index: 300;
            transform: translateX(-100%);
            transition: transform 0.28s ease;
          }
          .admin-sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0,0,0,0.6);
          }
          .admin-sidebar-overlay {
            display: block !important;
          }
          .admin-topbar {
            display: flex !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
        }
        .admin-sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 299;
        }
        .admin-topbar {
          display: none;
          position: sticky; top: 0; z-index: 200;
          background: #111;
          border-bottom: 1px solid rgba(201,168,76,0.1);
          padding: 12px 16px;
          align-items: center;
          gap: 12px;
        }
      `}</style>

      {/* Overlay móvil */}
      <div className={`admin-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)} style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none', transition: 'opacity 0.25s' }}/>

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ width: '220px', background: '#111', borderRight: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#C9A84C', letterSpacing: '0.1em' }}>ORIENTPERFUMES</div>
            <div style={{ fontSize: '11px', color: '#9A9180', marginTop: '4px' }}>Panel Admin</div>
          </div>

          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setBellOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: totalNotifs > 0 ? '#C9A84C' : '#6B6355', padding: 4, position: 'relative', display: 'flex' }}>
              <BellIcon size={18} color={totalNotifs > 0 ? '#C9A84C' : '#6B6355'} />
              {totalNotifs > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#e74c3c', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #111',
                }}>{totalNotifs > 9 ? '9+' : totalNotifs}</span>
              )}
            </button>

            {/* Dropdown */}
            {bellOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                background: '#1A1A18', border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 8, width: 230, zIndex: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Cinzel, serif', fontSize: 9, color: '#6B6355', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Notificaciones
                </div>
                {notifs && (
                  <div style={{ padding: '8px 0' }}>
                    {[
                      { label: 'Pedidos pendientes',     value: notifs.pedidos_pendientes,     color: '#E8A94C', to: '/admin/pedidos' },
                      { label: 'Comentarios pendientes', value: notifs.comentarios_pendientes, color: '#7EB8C4', to: '/admin/noticias' },
                      { label: 'Productos stock bajo',   value: notifs.stock_bajo,             color: '#e74c3c', to: '/admin/inventory' },
                    ].map(n => (
                      <button key={n.label}
                        onClick={() => { setBellOpen(false); navigate(n.to); }}
                        style={{ width: '100%', background: 'none', border: 'none', padding: '9px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <span style={{ fontSize: 12, color: '#E8DCC8' }}>{n.label}</span>
                        <span style={{
                          minWidth: 22, height: 22, borderRadius: '50%',
                          background: n.value > 0 ? `${n.color}20` : 'transparent',
                          border: `1px solid ${n.value > 0 ? n.color + '40' : 'rgba(255,255,255,0.08)'}`,
                          color: n.value > 0 ? n.color : '#6B6355',
                          fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{n.value}</span>
                      </button>
                    ))}
                  </div>
                )}
                {totalNotifs === 0 && (
                  <div style={{ padding: '16px 14px', fontSize: 12, color: '#6B6355', textAlign: 'center' }}>Todo al día</div>
                )}
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 20px',
                color: isActive ? '#C9A84C' : '#9A9180',
                background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                textDecoration: 'none', fontSize: '13px',
                transition: 'all 0.2s',
              })}>
              <span>{item.label}</span>
              {item.to === '/admin/pedidos' && notifs && notifs.pedidos_pendientes > 0 && (
                <span style={{ background: '#E8A94C', color: '#0a0a08', borderRadius: '50%', width: 18, height: 18, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {notifs.pedidos_pendientes > 9 ? '9+' : notifs.pedidos_pendientes}
                </span>
              )}
              {item.to === '/admin/noticias' && notifs && notifs.comentarios_pendientes > 0 && (
                <span style={{ background: '#7EB8C4', color: '#0a0a08', borderRadius: '50%', width: 18, height: 18, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {notifs.comentarios_pendientes > 9 ? '9+' : notifs.comentarios_pendientes}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#E8DCC8', marginBottom: '8px' }}>{session.nombre}</div>
          <button onClick={logout}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px', padding: '6px 12px', color: '#9A9180', cursor: 'pointer', fontSize: '11px', width: '100%' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Topbar móvil */}
      <div className="admin-topbar" style={{ flex: 'none' }}>
        <button onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 18, height: 2, background: '#C9A84C', borderRadius: 1 }}/>)}
        </button>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#C9A84C', letterSpacing: '0.12em' }}>ORIENTPERFUMES</div>
      </div>

      {/* Contenido */}
      <main className="admin-main" style={{ flex: 1, overflow: 'auto', marginLeft: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}