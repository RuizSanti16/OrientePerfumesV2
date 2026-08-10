/* Datos identificativos del comerciante.

   Estan aqui y no repartidos por las paginas legales a proposito: la
   Politica de Datos y los Terminos los usan en varios sitios cada una,
   y con los valores duplicados es cuestion de tiempo que uno quede
   desactualizado y las paginas se contradigan.

   RELLENAR ANTES DE PUBLICAR LAS PAGINAS LEGALES.
   Mientras alguno conserve el texto entre <>, las paginas muestran un
   aviso en su lugar en vez de fingir que el dato existe: una politica
   de datos con huecos no cumple, y peor aun, aparenta cumplir.

   El Estatuto del Consumidor (Ley 1480 de 2011) obliga a identificar
   quien vende: nombre o razon social, identificacion, direccion y
   canales de contacto. */

export const EMPRESA = {
  /* Razon social si es empresa, o nombre completo si vendes como
     persona natural. */
  nombre: '<RAZON SOCIAL O NOMBRE COMPLETO>',

  /* NIT con digito de verificacion, o cedula. */
  identificacion: '<NIT O CEDULA>',

  direccion: '<DIRECCION>',
  ciudad: 'Rionegro, Antioquia',
  pais: 'Colombia',

  telefono: '+57 324 477 5851',

  /* Correo general de atencion al cliente. */
  correo: '<CORREO DE CONTACTO>',

  /* Correo al que llegan las peticiones sobre datos personales. Puede
     ser el mismo que el anterior, pero conviene separarlo: la ley fija
     plazos de respuesta para consultas y reclamos, y mezclarlos con el
     correo comercial hace facil que uno se pase por alto. */
  correoDatos: '<CORREO PARA DATOS PERSONALES>',

  sitio: 'orientperfumes.com.co',

  /* Fecha de la ultima revision de las paginas legales. Se muestra al
     pie de cada una: sin ella no hay forma de saber que version acepto
     el cliente. */
  vigencia: '<FECHA, ej. 7 de agosto de 2026>',
};

/** ¿Falta algun dato por rellenar? */
export function faltanDatosEmpresa() {
  return Object.values(EMPRESA).some(v => typeof v === 'string' && v.includes('<'));
}

/** Los que siguen sin rellenar, para poder decir cuales son. */
export function datosPendientes() {
  return Object.entries(EMPRESA)
    .filter(([, v]) => typeof v === 'string' && v.includes('<'))
    .map(([k]) => k);
}
