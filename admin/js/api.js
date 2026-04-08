/* =============================================================
   admin/js/api.js
   Conector central de la API PHP para el panel admin.
   Reemplaza las llamadas a AdminDB por fetch a /api/*.php

   USO:
     API.productos.listar()           → GET  api/productos.php
     API.productos.crear(data)        → POST api/productos.php
     API.productos.actualizar(data)   → PUT  api/productos.php
     API.productos.eliminar(id)       → DELETE api/productos.php?id=N
     (igual para clientes, proveedores, inventario, ventas, compras)
============================================================= */

var API_BASE_URL = '/OrientPerfumesV2/api';

/* ── Helper central de fetch ────────────────────────────────── */
async function apiFetch(endpoint, method, data) {
  method = method || 'GET';
  var url  = API_BASE_URL + '/' + endpoint;
  var opts = {
    method:  method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data && (method === 'POST' || method === 'PUT')) {
    opts.body = JSON.stringify(data);
  }
  if (data && method === 'DELETE' && data.id) {
    url += '?id=' + data.id;
  }
  if (data && method === 'GET' && data.id) {
    url += '?id=' + data.id;
  }

  try {
    var res  = await fetch(url, opts);
    var json = await res.json();
    return json;
  } catch (err) {
    console.error('[API] Error en ' + endpoint + ':', err);
    return { ok: false, mensaje: 'Error de conexión con el servidor' };
  }
}

/* ── API de Productos ───────────────────────────────────────── */
var API = {

  productos: {
    listar:      function()     { return apiFetch('productos.php'); },
    obtener:     function(id)   { return apiFetch('productos.php', 'GET', { id: id }); },
    crear:       function(data) { return apiFetch('productos.php', 'POST', data); },
    actualizar:  function(data) { return apiFetch('productos.php', 'PUT',  data); },
    eliminar:    function(id)   { return apiFetch('productos.php', 'DELETE', { id: id }); }
  },

  clientes: {
    listar:      function()     { return apiFetch('clientes.php'); },
    obtener:     function(id)   { return apiFetch('clientes.php', 'GET', { id: id }); },
    crear:       function(data) { return apiFetch('clientes.php', 'POST', data); },
    actualizar:  function(data) { return apiFetch('clientes.php', 'PUT',  data); },
    eliminar:    function(id)   { return apiFetch('clientes.php', 'DELETE', { id: id }); }
  },

  proveedores: {
    listar:      function()     { return apiFetch('proveedores.php'); },
    obtener:     function(id)   { return apiFetch('proveedores.php', 'GET', { id: id }); },
    crear:       function(data) { return apiFetch('proveedores.php', 'POST', data); },
    actualizar:  function(data) { return apiFetch('proveedores.php', 'PUT',  data); },
    eliminar:    function(id)   { return apiFetch('proveedores.php', 'DELETE', { id: id }); }
  },

  inventario: {
    listar:      function()     { return apiFetch('inventario.php'); },
    obtener:     function(id)   { return apiFetch('inventario.php', 'GET', { id: id }); },
    crear:       function(data) { return apiFetch('inventario.php', 'POST', data); },
    actualizar:  function(data) { return apiFetch('inventario.php', 'PUT',  data); },
    eliminar:    function(id)   { return apiFetch('inventario.php', 'DELETE', { id: id }); }
  },

  ventas: {
    listar:      function()     { return apiFetch('ventas.php'); },
    obtener:     function(id)   { return apiFetch('ventas.php', 'GET', { id: id }); },
    crear:       function(data) { return apiFetch('ventas.php', 'POST', data); },
    eliminar:    function(id)   { return apiFetch('ventas.php', 'DELETE', { id: id }); }
  },

  compras: {
    listar:      function()     { return apiFetch('compras.php'); },
    obtener:     function(id)   { return apiFetch('compras.php', 'GET', { id: id }); },
    crear:       function(data) { return apiFetch('compras.php', 'POST', data); },
    eliminar:    function(id)   { return apiFetch('compras.php', 'DELETE', { id: id }); }
  },

  categorias: {
    listar:     function()     { return apiFetch('categorias.php'); },
    crear:      function(data) { return apiFetch('categorias.php', 'POST', data); },
    actualizar: function(data) { return apiFetch('categorias.php', 'PUT',  data); },
    eliminar:   function(id)   { return apiFetch('categorias.php', 'DELETE', { id: id }); }
  },

  marcas: {
    listar:     function()     { return apiFetch('marcas.php'); },
    crear:      function(data) { return apiFetch('marcas.php', 'POST', data); },
    actualizar: function(data) { return apiFetch('marcas.php', 'PUT',  data); },
    eliminar:   function(id)   { return apiFetch('marcas.php', 'DELETE', { id: id }); }
  }
};