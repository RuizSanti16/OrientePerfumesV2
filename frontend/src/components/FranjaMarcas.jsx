import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marcasAPI } from '../services/api';

/* Franja de logos de las casas, en la portada.

   Los logos ya se podían subir desde el panel, pero no se veían en
   ninguna parte: el componente que los pintaba, CategoryCard.jsx, no
   lo importaba ningún archivo. Esta es esa parte que faltaba.

   Solo salen las marcas que tienen logo. Si no hay ninguna, el
   bloque entero no se dibuja, que es mejor que una banda vacía. */
export default function FranjaMarcas() {
  const navigate = useNavigate();
  const tiraRef  = useRef(null);
  const [marcas, setMarcas] = useState([]);

  useEffect(() => {
    let vigente = true;
    marcasAPI.listar()
      .then(r => {
        if (!vigente || !r?.ok) return;
        /* Solo las que tienen logo. La franja es una selección del
           administrador, no el listado del catálogo: poner las 47
           casas por su nombre llenaba media portada de texto. */
        setMarcas((r.data || []).filter(m => m.logo));
      })
      .catch(() => {});
    return () => { vigente = false; };
  }, []);

  /* La tira se repite y la animación recorre exactamente un juego:
     al terminar, el siguiente está donde empezó el anterior y el
     bucle no da ningún salto.

     Cuántas copias hacen falta no se puede saber de antemano: depende
     del ancho de los logos y del de la pantalla. Con dos logos
     pequeños, un par de copias dejan medio ancho vacío cruzando la
     franja. Así que se mide un juego ya dibujado y se repite hasta
     cubrir el doble de la pantalla. */
  const [copias, setCopias] = useState(2);

  useEffect(() => {
    const tira = tiraRef.current;
    if (!tira || marcas.length === 0) return;

    /* Sin animación no hay nada que rellenar: la tira se queda
       quieta, las copias están ocultas y medirlas daría cero. */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    function recalcular() {
      const hijos = tira.children;
      /* El ancho de un juego se mide entre el primer logo y el primero
         del juego siguiente.

         Dividir el ancho total entre las copias parecía más directo,
         pero no da un número estable: los espacios entre logos no se
         reparten igual al cambiar el número de copias, así que cada
         medida pedía un número distinto, que cambiaba el ancho, que
         pedía otra medida. La página se quedaba colgada recalculando. */
      if (hijos.length <= marcas.length) return;
      const anchoJuego = hijos[marcas.length].offsetLeft - hijos[0].offsetLeft;
      if (anchoJuego <= 0) return;

      /* Tope de 40 juegos: con un logo diminuto y una pantalla muy
         ancha, el cálculo podría pedir cientos de copias. */
      const necesarias = Math.min(40, Math.max(2, Math.ceil((window.innerWidth * 2) / anchoJuego)));
      setCopias(c => (c === necesarias ? c : necesarias));
    }

    recalcular();
    /* Los logos llegan después que el HTML y cambian el ancho, y la
       ventana puede redimensionarse. */
    const observador = new ResizeObserver(recalcular);
    observador.observe(tira);
    window.addEventListener('resize', recalcular);
    return () => { observador.disconnect(); window.removeEventListener('resize', recalcular); };
    /* Sin `copias` en las dependencias: el efecto no necesita
       reinstalarse cuando cambia, y tenerlo ahí era parte del bucle. */
  }, [marcas]);

  const tira = Array.from({ length: copias }, () => marcas).flat();

  /* Velocidad constante, unos 4 segundos por logo, en vez de una
     duración fija que haría volar 20 logos y arrastrarse a 3. */
  const duracion = `${Math.max(marcas.length * 4, 16)}s`;

  /* Sin logos no hay franja: mejor eso que una banda vacía. Va
     después de los hooks, que React exige que se llamen siempre en
     el mismo orden y no pueden quedar detrás de un return. */
  if (marcas.length === 0) return null;

  return (
    <section className="franja-marcas" aria-label="Casas de perfumería">
      <style>{`
        .franja-marcas {
          padding: 44px 0;
          border-top: 1px solid rgba(201,168,76,0.08);
          border-bottom: 1px solid rgba(201,168,76,0.08);
          background: linear-gradient(180deg, transparent, rgba(201,168,76,0.02), transparent);
          overflow: hidden;
        }
        .franja-marcas__titulo {
          text-align: center;
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #9A9180;
          margin-bottom: 28px;
        }
        .franja-marcas__viewport {
          overflow: hidden;
          /* Se difumina en los bordes para que los logos entren y
             salgan en vez de cortarse de golpe. */
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .franja-marcas__tira {
          display: flex;
          align-items: center;
          gap: 56px;
          width: max-content;
          animation: franja-marcas-scroll var(--duracion) linear infinite;
        }
        .franja-marcas:hover .franja-marcas__tira { animation-play-state: paused; }
        /* Recorre un juego completo: -100% dividido entre las copias. */
        @keyframes franja-marcas-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / var(--copias))); }
        }
        .franja-marcas__item {
          background: none; border: none; padding: 0; cursor: pointer;
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          height: 46px;
        }
        /* El logo se muestra tal como se sube.

           Aquí había un filter: brightness(0) invert(1), que pinta de
           blanco todos los píxeles de la imagen, no solo el dibujo.
           Con un PNG de fondo transparente quedaba el logo en blanco,
           que era la idea; con un JPG, o con un PNG de fondo blanco,
           quedaba un rectángulo blanco y el logo desaparecía. Como el
           que sube la imagen no tiene por qué saber eso, ahora manda
           la imagen y no el filtro. */
        .franja-marcas__item img {
          max-height: 46px; max-width: 130px; object-fit: contain;
          opacity: 0.8;
          transition: opacity 0.3s;
        }
        .franja-marcas__item:hover img { opacity: 1; }

        /* Quien pide menos movimiento no debería ver una tira
           desplazándose sin parar: se queda quieta y en varias filas.
           Las copias se esconden, que si no saldría cada logo
           repetido tantas veces como copias tenga la tira. */
        @media (prefers-reduced-motion: reduce) {
          .franja-marcas__tira {
            animation: none; flex-wrap: wrap;
            justify-content: center; width: auto;
            gap: 40px 56px;
          }
          .franja-marcas__item[aria-hidden="true"] { display: none; }
          .franja-marcas__viewport { -webkit-mask-image: none; mask-image: none; }
        }
        @media (max-width: 700px) {
          .franja-marcas { padding: 32px 0; }
          .franja-marcas__tira { gap: 36px; }
          .franja-marcas__item img { max-height: 34px; max-width: 100px; }
        }
      `}</style>

      <div className="franja-marcas__titulo">NUESTRAS CASAS</div>

      <div className="franja-marcas__viewport">
        <div className="franja-marcas__tira" ref={tiraRef}
          style={{ '--copias': copias, '--duracion': duracion }}>
          {tira.map((m, i) => (
            <button
              key={`${m.id_marca}-${i}`}
              className="franja-marcas__item"
              onClick={() => navigate(`/coleccion?marca=${encodeURIComponent(m.nombre)}`)}
              /* La segunda copia es decorativa: para quien navega con
                 lector de pantalla sería la misma lista dos veces. */
              aria-hidden={i >= marcas.length}
              tabIndex={i >= marcas.length ? -1 : 0}
              title={m.nombre}
              aria-label={`Ver fragancias de ${m.nombre}`}>
              <img src={m.logo} alt={m.nombre} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
