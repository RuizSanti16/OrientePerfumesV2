/* =============================================================
   services/api.js
   Conector central a la API PHP de OrientPerfumes
============================================================= */

const API_BASE = '/api';

async function apiFetch(endpoint, method = 'GET', data = null) {
  const url  = `${API_BASE}/${endpoint}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data && (method === 'POST' || method === 'PUT')) {
    opts.body = JSON.stringify(data);
  }
  const res  = await fetch(url, opts);
  return res.json();
}

export const productosAPI = {
  listar:     ()     => apiFetch('productos.php'),
  obtener:    (id)   => apiFetch(`productos.php?id=${id}`),
  crear:      (data) => apiFetch('productos.php', 'POST', data),
  actualizar: (data) => apiFetch('productos.php', 'PUT',  data),
  eliminar:   (id)   => apiFetch(`productos.php?id=${id}`, 'DELETE'),
};

export const categoriasAPI = {
  listar:     ()     => apiFetch('categorias.php'),
  crear:      (data) => apiFetch('categorias.php', 'POST', data),
  actualizar: (data) => apiFetch('categorias.php', 'PUT',  data),
  eliminar:   (id)   => apiFetch(`categorias.php?id=${id}`, 'DELETE'),
};

export const marcasAPI = {
  listar:     ()     => apiFetch('marcas.php'),
  crear:      (data) => apiFetch('marcas.php', 'POST', data),
  actualizar: (data) => apiFetch('marcas.php', 'PUT',  data),
  eliminar:   (id)   => apiFetch(`marcas.php?id=${id}`, 'DELETE'),
};

export const clientesAPI = {
  listar:     ()     => apiFetch('clientes.php'),
  crear:      (data) => apiFetch('clientes.php', 'POST', data),
  actualizar: (data) => apiFetch('clientes.php', 'PUT',  data),
  eliminar:   (id)   => apiFetch(`clientes.php?id=${id}`, 'DELETE'),
};

export const proveedoresAPI = {
  listar:     ()     => apiFetch('proveedores.php'),
  crear:      (data) => apiFetch('proveedores.php', 'POST', data),
  actualizar: (data) => apiFetch('proveedores.php', 'PUT',  data),
  eliminar:   (id)   => apiFetch(`proveedores.php?id=${id}`, 'DELETE'),
};

export const inventarioAPI = {
  listar:     ()     => apiFetch('inventario.php'),
  crear:      (data) => apiFetch('inventario.php', 'POST', data),
  actualizar: (data) => apiFetch('inventario.php', 'PUT',  data),
};

export const ventasAPI = {
  listar:  ()     => apiFetch('ventas.php'),
  crear:   (data) => apiFetch('ventas.php', 'POST', data),
  eliminar:(id)   => apiFetch(`ventas.php?id=${id}`, 'DELETE'),
};

export const authAPI = {
  loginAdmin:   (data) => apiFetch('login.php',         'POST', data),
  loginCliente: (data) => apiFetch('login-cliente.php', 'POST', data),
  registro:     (data) => apiFetch('registro.php',      'POST', data),
};

export const destacadosAPI = {
  listar:   ()      => apiFetch('destacados.php'),
  // items = [{ id_producto, badge }]
  guardar:  (items) => apiFetch('destacados.php', 'POST', { ids: items }),
};