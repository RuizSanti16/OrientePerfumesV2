/* useSettings.js — Lee la configuración de la tienda desde localStorage */

const KEY = 'op_admin_settings';
const DEFAULT = {
  storeName:       'OrientPerfumes',
  storeEmail:      'info@orientperfumes.com',
  storePhone:      '+57 300 000 0000',
  storeAddress:    'Rionegro, Antioquia, Colombia',
  whatsappNumber:  '',
  whatsappMessage: 'Hola! Me interesa conocer más sobre sus fragancias.',
  whatsappVisible: true,
  instagram:       '',
  facebook:        '',
  tiktok:          '',
  freeShippingMin: 150000,
};

export function useSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function getWhatsappUrl(settings) {
  if (!settings?.whatsappNumber) return null;
  const num = settings.whatsappNumber.replace(/\D/g, '');
  const msg = encodeURIComponent(settings.whatsappMessage || '');
  return `https://wa.me/${num}?text=${msg}`;
}