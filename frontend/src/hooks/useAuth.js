import { useState } from 'react';

export function useAuth() {
  function getSession(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  const [adminSession, setAdminSession] = useState(() => getSession('op_admin_session'));
  const [clienteSession, setClienteSession] = useState(() => getSession('op_session'));

  function loginAdmin(data) {
    const session = {
      id: data.id, username: data.usuario,
      nombre: data.nombre, name: data.nombre,
      role: 'admin', tipo: 'admin',
      token: data.token   ?? null,
      expiry: data.expiry ?? null,
    };
    localStorage.setItem('op_admin_session', JSON.stringify(session));
    setAdminSession(session);
  }

  function loginCliente(data) {
    const session = {
      id: data.id, username: data.usuario,
      nombre: data.nombre, email: data.correo,
      tipo: 'cliente',
      /* Sin el token la sesión era solo un nombre en el navegador: el
         servidor no podía comprobar nada y el endpoint de pedidos
         rechazaría la compra. */
      token: data.token ?? null,
    };
    localStorage.setItem('op_session', JSON.stringify(session));
    setClienteSession(session);
  }

  function logout() {
    localStorage.removeItem('op_admin_session');
    localStorage.removeItem('op_session');
    setAdminSession(null);
    setClienteSession(null);
  }

  return {
    adminSession,
    clienteSession,
    isAdmin: !!adminSession,
    isCliente: !!clienteSession,
    loginAdmin,
    loginCliente,
    logout,
  };
}