import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { label: 'Dashboard',            to: '/admin' },
  { label: 'Productos',            to: '/admin/products' },
  { label: 'Categorías',           to: '/admin/categories' },
  { label: 'Marcas',               to: '/admin/brands' },
  { label: 'Clientes',             to: '/admin/customers' },
  { label: 'Proveedores',          to: '/admin/suppliers' },
  { label: 'Inventario',           to: '/admin/inventory' },
  { label: 'Prod. Destacados',     to: '/admin/destacados' },
  { label: 'Carrusel',             to: '/admin/carrusel' },
  { label: 'Noticias',             to: '/admin/noticias' },
  { label: 'Ajustes',              to: '/admin/ajustes' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('op_admin_session');
    navigate('/login');
  }

  const session = JSON.parse(localStorage.getItem('op_admin_session') || '{}');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a08', fontFamily: 'Lato, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: '220px', background: '#111', borderRight: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#C9A84C', letterSpacing: '0.1em' }}>ORIENTPERFUMES</div>
          <div style={{ fontSize: '11px', color: '#9A9180', marginTop: '4px' }}>Panel Admin</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'}
              style={({ isActive }) => ({
                display: 'block', padding: '10px 20px',
                color: isActive ? '#C9A84C' : '#9A9180',
                background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                textDecoration: 'none', fontSize: '13px',
                transition: 'all 0.2s'
              })}>
              {item.label}
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

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}