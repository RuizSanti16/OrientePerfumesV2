import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { estadoAPI } from './services/api';
import Proximamente from './pages/Proximamente';
import Home            from './pages/Home';
import NotFound        from './pages/NotFound';
import Login           from './pages/Login';
import Coleccion       from './pages/Coleccion';
import Noticias        from './pages/Noticias';
import Contacto        from './pages/Contacto';
import AdminLayout     from './pages/admin/AdminLayout';
import Dashboard       from './pages/admin/Dashboard';
import Products        from './pages/admin/Products';
import Categories      from './pages/admin/Categories';
import Brands          from './pages/admin/Brands';
import Customers       from './pages/admin/Customers';
import Suppliers       from './pages/admin/Suppliers';
import Inventory       from './pages/admin/Inventory';
import Destacados      from './pages/admin/Destacados';
import Carrusel        from './pages/admin/Carrusel';
import NoticiasAdmin   from './pages/admin/NoticiasAdmin';
import Ajustes         from './pages/admin/Ajustes';
import ColeccionesAdmin from './pages/admin/ColeccionesAdmin';
import Producto        from './pages/Producto';
import ProductoDetalle from './pages/admin/ProductoDetalle';
import SobreNosotros   from './pages/SobreNosotros';
import FAQ             from './pages/FAQ';
import Comparador      from './pages/Comparador';
import Quiz            from './pages/Quiz';
import Cupones         from './pages/admin/Cupones';
import Pedidos         from './pages/admin/Pedidos';
import Checkout        from './pages/Checkout';
import SeguimientoPedido from './pages/SeguimientoPedido';



function AdminRoute({ children }) {
  let session = null;
  try { session = JSON.parse(localStorage.getItem('op_admin_session')); } catch { /* noop */ }

  if (!session || !session.token) return <Navigate to="/login" replace />;

  /* Verificar expiración del token en el cliente */
  if (session.expiry && new Date(session.expiry) <= new Date()) {
    localStorage.removeItem('op_admin_session');
    return <Navigate to="/login" replace />;
  }

  return children;
}


/* Cierra la tienda al público mientras se prepara el catálogo.

   Quien decide es el servidor: estado.php dice si está cerrada y si
   quien pregunta trae sesión de administrador válida. Aquí no se mira
   localStorage para eso, porque cualquiera podría escribir un token
   inventado y ver la tienda; el servidor comprueba que exista de verdad
   y no haya expirado.

   Mientras se resuelve la consulta no se muestra nada, para que el
   visitante no vea la tienda un instante antes del aviso. */
function PuertaTienda({ children }) {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    let vigente = true;
    estadoAPI.consultar()
      .then(r => { if (vigente) setEstado(r); })
      /* Si estado.php no responde, se deja pasar: es preferible que la
         tienda siga en pie ante un fallo puntual a dejarla cerrada por
         un error de red. Los endpoints siguen protegidos por su cuenta. */
      .catch(() => { if (vigente) setEstado({ mantenimiento: false }); });
    return () => { vigente = false; };
  }, []);

  if (estado === null) return null;
  if (estado.mantenimiento && !estado.es_admin) return <Proximamente />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El acceso y el panel quedan fuera de la puerta: son la vía
            para entrar cuando la tienda está cerrada. */}
        <Route path="/login"     element={<Login />} />

        {/* Tienda pública, toda ella tras la puerta. Se agrupa en una
            ruta sin path para no repetir el envoltorio en cada línea:
            así no se puede olvidar en una nueva página. */}
        <Route element={<PuertaTienda><Outlet /></PuertaTienda>}>
          <Route path="/"          element={<Home />} />
          <Route path="/coleccion" element={<Coleccion />} />
          <Route path="/noticias"  element={<Noticias />} />
          <Route path="/contacto"  element={<Contacto />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/nosotros"     element={<SobreNosotros />} />
          {/* El menu enlazaba a /sobre-nosotros, que no existia como ruta y
              llevaba a la pagina de error. Se mantiene como redireccion para
              que los enlaces antiguos y los marcadores sigan funcionando. */}
          <Route path="/sobre-nosotros" element={<Navigate to="/nosotros" replace />} />
          <Route path="/faq"          element={<FAQ />} />
          <Route path="/comparador"   element={<Comparador />} />
          <Route path="/quiz"         element={<Quiz />} />
          <Route path="/checkout"     element={<Checkout />} />
          <Route path="/seguimiento"         element={<SeguimientoPedido />} />
          <Route path="/seguimiento/:codigo" element={<SeguimientoPedido />} />
        </Route>

        {/* Panel admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index                  element={<Dashboard />} />
          <Route path="products"        element={<Products />} />
          <Route path="categories"      element={<Categories />} />
          <Route path="brands"          element={<Brands />} />
          <Route path="customers"       element={<Customers />} />
          <Route path="suppliers"       element={<Suppliers />} />
          <Route path="inventory"       element={<Inventory />} />
          <Route path="destacados"      element={<Destacados />} />
          <Route path="carrusel"        element={<Carrusel />} />
          <Route path="noticias"        element={<NoticiasAdmin />} />
          <Route path="ajustes"         element={<Ajustes />} />
          <Route path="colecciones"     element={<ColeccionesAdmin />} />
          <Route path="cupones"         element={<Cupones />} />
          <Route path="pedidos"         element={<Pedidos />} />
          <Route path="producto/:id" element={<ProductoDetalle />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}