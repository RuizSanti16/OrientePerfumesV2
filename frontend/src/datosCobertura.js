/* Municipios donde se entrega en persona y, por tanto, se puede
   pagar en efectivo.

   Esta lista es el reflejo de la que hay en
   backend/configuracion/cobertura.php. La que manda es la del
   servidor: esta solo llena el desplegable del checkout. Si se añade
   un municipio hay que tocarlas las dos, y la del servidor primero,
   porque si no el cliente vería la opción y el pedido le sería
   rechazado al confirmarlo. */
export const CIUDADES_CON_EFECTIVO = [
  /* Valle de Aburrá */
  'Medellín',
  'Bello',
  'Itagüí',
  'Envigado',
  'Sabaneta',
  'La Estrella',
  'Caldas',
  'Copacabana',
  'Girardota',
  'Barbosa',
  /* Oriente cercano */
  'Rionegro',
  'Guarne',
  'Marinilla',
  'La Ceja',
  'El Retiro',
  'El Carmen de Viboral',
];

/* Valor del desplegable para quien vive fuera de la zona. No es el
   nombre de ninguna ciudad, así que nunca coincide con la lista del
   servidor y el efectivo queda descartado por sí solo. */
export const OTRA_CIUDAD = '__otra__';
