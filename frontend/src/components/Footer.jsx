import { useNavigate } from 'react-router-dom';
import SocialButtons from './SocialButtons';
import { IconArrowUp } from './Icons';

export default function Footer() {
  const navigate = useNavigate();
  const session      = JSON.parse(localStorage.getItem('op_session')      || 'null');
  const adminSession = JSON.parse(localStorage.getItem('op_admin_session') || 'null');

  const link = { fontSize: 13, color: '#9A9180', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' };
  const over = e => { e.target.style.color = '#C9A84C'; };
  const out  = e => { e.target.style.color = '#9A9180'; };

  return (
    <footer style={{ background: '#0f0f0d', borderTop: '1px solid rgba(201,168,76,0.1)', padding: '48px 24px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 32, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: '#C9A84C', letterSpacing: '0.1em', marginBottom: 8 }}>
              ORIENTPERFUMES
            </div>
            <p style={{ fontSize: 13, color: '#9A9180', lineHeight: 1.7, maxWidth: 240 }}>
              Fragancias exclusivas de lujo. Tu destino para los mejores perfumes del mundo.
            </p>
            <div style={{ marginTop: 16 }}>
              <SocialButtons />
            </div>
          </div>

          {/* Colecciones */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 16 }}>
              COLECCIONES
            </div>
            {['Nicho', 'Oriental', 'Diseñador', 'Exclusivos'].map(c => (
              <div key={c} style={{ marginBottom: 8 }}>
                <a onClick={() => navigate(`/coleccion?categoria=${encodeURIComponent(c)}`)}
                  style={link} onMouseEnter={over} onMouseLeave={out}>
                  {c}
                </a>
              </div>
            ))}
          </div>

          {/* Información */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 16 }}>
              INFORMACIÓN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Sobre Nosotros',        to: '/nosotros'    },
                { label: 'Quiz Olfativo',          to: '/quiz'        },
                { label: 'Comparador',             to: '/comparador'  },
                { label: 'Seguimiento de Pedido',  to: '/seguimiento' },
                { label: 'Noticias',               to: '/noticias'    },
                { label: 'Preguntas Frecuentes',   to: '/faq'         },
              ].map(({ label, to }) => (
                <a key={to} onClick={() => navigate(to)} style={link} onMouseEnter={over} onMouseLeave={out}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 16 }}>
              CONTACTO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a onClick={() => navigate('/contacto')} style={link} onMouseEnter={over} onMouseLeave={out}>
                Contáctanos
              </a>
              {/* Con sesion iniciada no se ofrece ningun enlace de cuenta:
                  "Mi Cuenta" apuntaba a /perfil, que no existe como ruta
                  y llevaba a la pagina de error. */}
              {!session && (
                <>
                  <a onClick={() => navigate('/login')} style={link} onMouseEnter={over} onMouseLeave={out}>
                    Iniciar Sesión
                  </a>
                  {/* El registro no es una pagina aparte: es una vista
                      dentro de /login, junto al inicio de sesion. */}
                  <a onClick={() => navigate('/login')} style={link} onMouseEnter={over} onMouseLeave={out}>
                    Crear Cuenta
                  </a>
                </>
              )}

              {adminSession && (
                <a onClick={() => navigate('/admin')}
                  style={{ ...link, color: '#C9A84C', opacity: 0.7 }}
                  onMouseEnter={e => { e.target.style.opacity = '1'; }}
                  onMouseLeave={e => { e.target.style.opacity = '0.7'; }}>
                  Panel Admin
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div style={{ borderTop: '1px solid rgba(201,168,76,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#9A9180', margin: 0 }}>
            © {new Date().getFullYear()} OrientPerfumes · Todos los derechos reservados
          </p>
          <a href="#" style={{ fontSize: 12, color: '#9A9180', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={over} onMouseLeave={out}>
            <IconArrowUp size={13}/> Volver Arriba
          </a>
        </div>
      </div>
    </footer>
  );
}
