/* En desarrollo se usa '/api', que el proxy de Vite redirige al backend
   local. En produccion el frontend y la API viven en dominios distintos,
   asi que la URL se inyecta al compilar con VITE_API_URL
   (ej: https://api.orientperfumes.com). Ver .env.example. */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAdminToken() {
  try {
    const s = JSON.parse(localStorage.getItem('op_admin_session'));
    return s?.token ?? null;
  } catch { return null; }
}

export function getClienteToken() {
  try {
    const s = JSON.parse(localStorage.getItem('op_session'));
    return s?.token ?? null;
  } catch { return null; }
}

export function haySesionCliente() {
  return getClienteToken() !== null;
}

/* Qué sesión usa cada petición.

   Esto llegó a devolver el token de cliente antes que el de admin, y
   rompía el panel: con una sesión de cliente abierta, los endpoints
   de administración recibían el token equivocado, respondían 401 y
   el 401 cerraba la sesión de administrador. Quien se registrara
   como cliente para probar una compra se quedaba fuera del panel.

   Las dos sesiones pueden convivir, así que la elección va por
   petición: el panel usa la de admin y el checkout pide la de
   cliente a propósito. */
function tokenDeSesion(auth) {
  if (auth === 'cliente') return getClienteToken();
  if (auth === 'admin')   return getAdminToken();
  return getAdminToken() ?? getClienteToken();
}

export async function subirImagen(file) {
  const form = new FormData();
  form.append('imagen', file);
  const token = getAdminToken();
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}/subir_imagen.php`, { method: 'POST', body: form, headers });
  return res.json();
}

export function subirVideo(file, onProgress) {
  return new Promise((resolve) => {
    const token = getAdminToken();
    const form  = new FormData();
    form.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/subir_video.php`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      try { resolve(JSON.parse(xhr.responseText)); }
      catch { resolve({ ok: false, mensaje: 'Respuesta inválida del servidor' }); }
    };
    xhr.onerror = () => resolve({ ok: false, mensaje: 'Error de conexión' });
    xhr.send(form);
  });
}

async function apiFetch(endpoint, method = 'GET', data = null, auth = 'auto') {
  const url  = `${API_BASE}/${endpoint}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  const token = tokenDeSesion(auth);
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (data && (method === 'POST' || method === 'PUT')) opts.body = JSON.stringify(data);
  const res = await fetch(url, opts);

  if (res.status === 401) {
    /* Dos 401 muy distintos.

       REQUIERE_CUENTA no es una sesión caducada: es un visitante sin
       cuenta pidiendo algo que la necesita. Antes todo 401 borraba la
       sesión del administrador y lo echaba al login, de modo que un
       admin que probara a comprar se quedaba sin su sesión del panel
       por algo que no tenía que ver con ella. Aquí se devuelve el
       cuerpo y que lo resuelva la pantalla que llamó. */
    const cuerpo = await res.json().catch(() => ({}));
    if (cuerpo.code === 'REQUIERE_CUENTA') return cuerpo;

    localStorage.removeItem('op_admin_session');
    window.location.href = '/login';
    return { ok: false, mensaje: 'Sesión expirada' };
  }

  return res.json();
}

/* Dice si la tienda esta cerrada al publico y si quien pregunta es
   administrador. Lo consulta App al arrancar, antes de pintar nada. */
export const estadoAPI = {
  consultar: () => apiFetch('estado.php'),
};

/* Ajustes de la tienda: nombre, contacto, redes y envío gratis.
   Leerlos es público, porque la tienda los necesita para pintar los
   botones; guardarlos exige sesión de administrador. */
export const ajustesAPI = {
  leer:     ()      => apiFetch('ajustes.php'),
  guardar:  (datos) => apiFetch('ajustes.php', 'PUT', datos),
};

/* Pasarela de pago (Bold).

   iniciar() solo manda el codigo del pedido: el importe y la firma los
   calcula el servidor a partir de lo guardado. Enviarlos desde aqui
   dejaria que el cliente eligiera cuanto paga. */
export const pagosAPI = {
  iniciar: (codigo) => apiFetch('pago_iniciar.php', 'POST', { codigo }),
  estado:  (codigo) => apiFetch(`pago_estado.php?codigo=${encodeURIComponent(codigo)}`),
};

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
  listar:   ()     => apiFetch('ventas.php'),
  crear:    (data) => apiFetch('ventas.php', 'POST', data),
  eliminar: (id)   => apiFetch(`ventas.php?id=${id}`, 'DELETE'),
};

export const authAPI = {
  loginAdmin:   (data) => apiFetch('login.php',         'POST', data),
  loginCliente: (data) => apiFetch('login-cliente.php', 'POST', data),
  registro:     (data) => apiFetch('registro.php',      'POST', data),

  /* El backend cierra las demas sesiones al cambiar la contrasena, asi
     que devuelve un token nuevo. Sin guardarlo, la propia pestaña que
     hizo el cambio se quedaria con el token viejo y el siguiente clic
     la mandaria al login. */
  async cambiarClave(data) {
    const r = await apiFetch('cambiar_clave.php', 'POST', data);
    if (r?.ok && r.token) {
      try {
        const s = JSON.parse(localStorage.getItem('op_admin_session')) ?? {};
        localStorage.setItem('op_admin_session', JSON.stringify({
          ...s, token: r.token, expiry: r.expiry,
        }));
      } catch { /* sesion ilegible: el proximo 401 llevara al login */ }
    }
    return r;
  },
};

export const destacadosAPI = {
  listar:  ()      => apiFetch('destacados.php'),
  guardar: (items) => apiFetch('destacados.php', 'POST', { ids: items }),
};

/* Opiniones de clientes sobre la tienda.

   Tienen endpoint propio porque no son lo mismo que los comentarios
   de una noticia: antes compartian tabla y moderacion, y cualquier
   comentario aprobado en una noticia salia en la portada como
   testimonio. */
export const testimoniosAPI = {
  listar:       ()     => apiFetch('testimonios.php'),
  listarAdmin:  ()     => apiFetch('testimonios.php?admin=1'),
  enviar:       (data) => apiFetch('testimonios.php', 'POST', data, 'cliente'),
  moderar:      (data) => apiFetch('testimonios.php', 'PUT',  data),
  eliminar:     (id)   => apiFetch(`testimonios.php?id=${id}`, 'DELETE'),
};

export const noticiasAPI = {
  listarAprobados: ()     => apiFetch('noticias.php'),
  listarAdmin:     ()     => apiFetch('noticias.php?admin=1'),
  enviar:          (data) => apiFetch('noticias.php', 'POST', data),
  moderar:         (data) => apiFetch('noticias.php', 'PUT',  data),
  cambiarEstado:   (data) => apiFetch('noticias.php', 'PUT',  data),
  eliminar:        (id)   => apiFetch(`noticias.php?id=${id}`, 'DELETE'),
};

/* Contenido editable de la portada y de noticias.
   Antes vivia en localStorage, de modo que solo lo veia el navegador
   del administrador; ahora es contenido del sitio. En los tres casos
   el guardado reemplaza el conjunto completo, que es como los edita
   el panel. */
export const carruselAPI = {
  listar:  ()       => apiFetch('carrusel.php'),
  guardar: (slides) => apiFetch('carrusel.php', 'PUT', { slides }),
};

export const lanzamientosAPI = {
  listar:  ()             => apiFetch('lanzamientos.php'),
  guardar: (lanzamientos) => apiFetch('lanzamientos.php', 'PUT', { lanzamientos }),
};

export const videoNoticiasAPI = {
  obtener: ()     => apiFetch('video_noticias.php'),
  guardar: (data) => apiFetch('video_noticias.php', 'PUT', data),
};

export const cuponesAPI = {
  validar:    (codigo, total = 0) => apiFetch(`cupones.php?codigo=${encodeURIComponent(codigo)}&total=${total}`),
  listar:     ()     => apiFetch('cupones.php'),
  crear:      (data) => apiFetch('cupones.php', 'POST', data),
  actualizar: (data) => apiFetch('cupones.php', 'PUT',  data),
  eliminar:   (id)   => apiFetch(`cupones.php?id=${id}`, 'DELETE'),
};

export const productoDetalleAPI = {
  obtener:       (id)   => apiFetch(`producto_detalle.php?id=${id}`),
  guardar:       (data) => apiFetch('producto_detalle.php', 'POST', data),
  eliminarRating:(id)   => apiFetch(`producto_detalle.php?rating_id=${id}`, 'DELETE'),
  calificar:     (data) => apiFetch('producto_rating.php', 'POST', data),
};

export const estadisticasAPI = {
  obtener: () => apiFetch('estadisticas.php'),
};

export const pedidosAPI = {
  listar:          ()       => apiFetch('pedidos.php'),
  obtener:         (id)     => apiFetch(`pedidos.php?id=${id}`),
  seguimiento:     (codigo) => apiFetch(`pedidos.php?codigo=${encodeURIComponent(codigo)}`),
  /* Comprar es siempre como cliente, aunque quien lo haga tenga
     además sesión de administrador: es la única que acepta el
     endpoint, y el pedido queda atribuido a esa cuenta. */
  crear:           (data)   => apiFetch('pedidos.php', 'POST', data, 'cliente'),
  actualizarEstado:(data)   => apiFetch('pedidos.php', 'PUT',  data),
  eliminar:        (id)     => apiFetch(`pedidos.php?id=${id}`, 'DELETE'),
};

export const notificacionesAPI = {
  obtener: () => apiFetch('notificaciones.php'),
};
