import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings, getWhatsappUrl } from '../hooks/useSettings';

/* Botón de WhatsApp que acompaña al visitante por todo el sitio.

   Ya había un WhatsAppButton, pero es un icono pequeño en línea y
   solo estaba puesto en Noticias: quien estuviera mirando un perfume
   o dudando en el checkout no tenía a mano cómo preguntar.

   El número y el mensaje salen de los Ajustes del panel, así que si
   el administrador no ha puesto número, o ha ocultado el WhatsApp, el
   botón no se dibuja. */
export default function WhatsAppFlotante() {
  const location = useLocation();
  const settings = useSettings();
  const url      = getWhatsappUrl(settings);
  const [visible, setVisible] = useState(false);

  /* Entra con un segundo de retraso. Apareciendo a la vez que la
     página se sentiría como un anuncio que salta encima. */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  /* En el panel y en el login no pinta nada: ahí no hay visitantes a
     los que atender, y taparía los botones de la pantalla. */
  const ruta = location.pathname;
  if (ruta.startsWith('/admin') || ruta === '/login') return null;

  if (!url || !settings.whatsappVisible) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`wa-flotante${visible ? ' wa-flotante--visible' : ''}`}
      aria-label="Escríbenos por WhatsApp"
    >
      <style>{`
        .wa-flotante {
          position: fixed;
          right: 22px;
          bottom: 22px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25D366;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 0 0 rgba(37,211,102,0.5);
          /* Por encima del contenido, por debajo del carrito y del
             menú lateral, que están en 999 y 1000. */
          z-index: 900;
          opacity: 0;
          transform: translateY(14px) scale(0.9);
          transition: opacity 0.35s ease, transform 0.35s ease,
                      box-shadow 0.25s ease, background 0.25s ease;
          pointer-events: none;
        }
        .wa-flotante--visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
          animation: wa-latido 2.6s ease-out 1.2s 3;
        }
        .wa-flotante:hover {
          background: #1FBE59;
          transform: translateY(0) scale(1.07);
          animation: none;
        }
        .wa-flotante:focus-visible {
          outline: 3px solid #fff;
          outline-offset: 3px;
        }

        /* Dos o tres pulsos al llegar y para: una onda que no deja de
           repetirse acaba siendo un mosquito en la pantalla. */
        @keyframes wa-latido {
          0%   { box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 0 0 rgba(37,211,102,0.55); }
          70%  { box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 0 16px rgba(37,211,102,0); }
          100% { box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 0 0 rgba(37,211,102,0); }
        }

        /* En móvil se sube un poco: ahí abajo suelen estar la barra
           del navegador y el botón de volver del sistema. */
        @media (max-width: 700px) {
          .wa-flotante {
            right: 16px;
            bottom: 18px;
            width: 52px;
            height: 52px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wa-flotante { transition: none; animation: none; }
          .wa-flotante--visible { animation: none; }
          .wa-flotante:hover { transform: none; }
        }
      `}</style>

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        width="29" height="29" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}
