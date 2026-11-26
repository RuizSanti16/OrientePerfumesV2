import { useEffect, useState } from 'react';
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
  const [todas, setTodas] = useState([]);

  useEffect(() => {
    let vigente = true;
    marcasAPI.listar()
      .then(r => {
        if (!vigente || !r?.ok) return;
        setTodas(r.data || []);
      })
      .catch(() => {});
    return () => { vigente = false; };
  }, []);

  /* Con logos se muestran los logos. Mientras no haya ninguno se
     muestran los nombres, que es lo que hacía antes esta sección,
     solo que tomándolos de la base en vez de una lista escrita a
     mano en el código que ni siquiera coincidía con el catálogo. */
  const conLogo = todas.filter(m => m.logo);
  const marcas  = conLogo.length > 0 ? conLogo : todas;

  if (marcas.length === 0) return null;

  /* La tira se repite dos veces y la animación recorre justo la
     mitad: al terminar, el segundo juego está donde empezó el
     primero y el salto no se nota. */
  const tira = [...marcas, ...marcas];

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
          animation: franja-marcas-scroll 40s linear infinite;
        }
        .franja-marcas:hover .franja-marcas__tira { animation-play-state: paused; }
        @keyframes franja-marcas-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .franja-marcas__item {
          background: none; border: none; padding: 0; cursor: pointer;
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          height: 46px;
        }
        .franja-marcas__item img {
          max-height: 46px; max-width: 130px; object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.45;
          transition: opacity 0.3s;
        }
        .franja-marcas__item:hover img { opacity: 1; }
        .franja-marcas__nombre {
          font-family: 'Cinzel', serif;
          font-size: 13px;
          letter-spacing: 0.14em;
          color: #9A9180;
          white-space: nowrap;
          transition: color 0.3s;
        }
        .franja-marcas__item:hover .franja-marcas__nombre { color: #C9A84C; }

        /* Quien pide menos movimiento no debería ver una tira
           desplazándose sin parar. */
        @media (prefers-reduced-motion: reduce) {
          .franja-marcas__tira { animation: none; flex-wrap: wrap; justify-content: center; width: auto; }
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
        <div className="franja-marcas__tira">
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
              {m.logo
                ? <img src={m.logo} alt={m.nombre} loading="lazy" />
                : <span className="franja-marcas__nombre">{m.nombre}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
