/* useSettings.js — ajustes de la tienda, leídos del servidor.

   Antes esto leía de localStorage, y la pantalla de Ajustes del panel
   guardaba ahí y en ningún otro sitio. Los ajustes vivían entonces en
   el navegador de quien los escribía: el cliente ponía sus redes
   sociales en su portátil, las veía solo él, y no aparecían ni para
   los visitantes de la tienda ni en otro equipo. Al borrar la caché
   se perdían.

   Ahora los sirve ajustes.php. Se piden una vez por carga de página y
   el resultado se comparte: hay tres componentes que los usan y no
   tiene sentido pedirlos tres veces. */

import { useSyncExternalStore } from 'react';
import { ajustesAPI } from '../services/api';

const DEFAULT = {
  storeName:       'OrientPerfumes',
  storeEmail:      'info@orientperfumes.com',
  storePhone:      '+57 300 000 0000',
  storeAddress:    'Rionegro, Antioquia, Colombia',
  storeDesc:       'Fragancias exclusivas de lujo. Tu destino para los mejores perfumes del mundo.',
  whatsappNumber:  '',
  whatsappMessage: 'Hola! Me interesa conocer más sobre sus fragancias.',
  whatsappVisible: true,
  instagram:       '',
  facebook:        '',
  tiktok:          '',
  freeShippingMin: 150000,
  stockThreshold:  20,
  currency:        'COP',
};

let estado   = DEFAULT;
let pedidos  = false;
const oyentes = new Set();

function avisar() { oyentes.forEach(fn => fn()); }

function suscribir(fn) {
  oyentes.add(fn);
  /* La primera suscripción dispara la carga. Mientras llega se
     muestran los valores por defecto, que es mejor que un hueco. */
  if (!pedidos) {
    pedidos = true;
    ajustesAPI.leer()
      .then(r => { if (r?.ok && r.data) { estado = { ...DEFAULT, ...r.data }; avisar(); } })
      .catch(() => { /* sin ajustes la tienda funciona igual */ });
  }
  return () => oyentes.delete(fn);
}

/** Refresca desde el servidor. La usa el panel tras guardar. */
export function recargarAjustes(nuevos) {
  if (nuevos) { estado = { ...DEFAULT, ...nuevos }; avisar(); return Promise.resolve(estado); }
  return ajustesAPI.leer().then(r => {
    if (r?.ok && r.data) { estado = { ...DEFAULT, ...r.data }; avisar(); }
    return estado;
  });
}

export { DEFAULT as AJUSTES_POR_DEFECTO };

export function useSettings() {
  return useSyncExternalStore(suscribir, () => estado);
}

/* Dirección de una red a partir de lo que haya escrito el cliente.

   El campo pide solo el usuario, pero quien lo rellena casi siempre
   pega la dirección entera del perfil, que es lo que tiene a mano. Y
   como el enlace se armaba anteponiendo el dominio sin mirar, salía
   https://instagram.com/https://instagram.com/orientperfumes y no
   llevaba a ninguna parte. Aquí se acepta cualquiera de las formas:
   "orientperfumes", "@orientperfumes", "instagram.com/orientperfumes"
   o la URL completa. */
const DOMINIOS = {
  instagram: { base: 'https://instagram.com/', host: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\// },
  facebook:  { base: 'https://facebook.com/',  host: /^(?:https?:\/\/)?(?:www\.)?facebook\.com\//  },
  tiktok:    { base: 'https://tiktok.com/@',   host: /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?/  },
};

export function getRedUrl(red, valor) {
  const cfg = DOMINIOS[red];
  if (!cfg || !valor) return null;

  let v = String(valor).trim();
  if (!v) return null;

  v = v.replace(cfg.host, '');     // venía la dirección entera
  v = v.replace(/^@/, '');          // venía con arroba
  v = v.replace(/[/?#].*$/, '');    // barra final, parámetros o ancla
  v = v.trim();

  return v ? cfg.base + v : null;
}

export function getWhatsappUrl(settings) {
  if (!settings?.whatsappNumber) return null;
  const num = settings.whatsappNumber.replace(/\D/g, '');
  const msg = encodeURIComponent(settings.whatsappMessage || '');
  return `https://wa.me/${num}?text=${msg}`;
}
