import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home        from './pages/Home';
import Login       from './pages/Login';
import Coleccion   from './pages/Coleccion';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard   from './pages/admin/Dashboard';
import Products    from './pages/admin/Products';
import Categories  from './pages/admin/Categories';
import Brands      from './pages/admin/Brands';
import Customers   from './pages/admin/Customers';
import Suppliers   from './pages/admin/Suppliers';
import Inventory   from './pages/admin/Inventory';

/* ── Proteger rutas del admin ── */
function AdminRoute({ children }) {
  const session = localStorage.getItem('op_admin_session');
  return session ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tienda pública */}
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/coleccion"     element={<Coleccion />} />

        {/* Panel admin */}
        <Route path="/admin" element={
          <AdminRoute><AdminLayout /></AdminRoute>
        }>
          <Route index              element={<Dashboard />} />
          <Route path="products"    element={<Products />} />
          <Route path="categories"  element={<Categories />} />
          <Route path="brands"      element={<Brands />} />
          <Route path="customers"   element={<Customers />} />
          <Route path="suppliers"   element={<Suppliers />} />
          <Route path="inventory"   element={<Inventory />} />
        </Route>

        {/* Redirigir rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}