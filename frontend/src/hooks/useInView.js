import { useEffect, useRef, useState } from 'react';

/**
 * Detecta si un elemento entró al viewport.
 * Dispara una sola vez y desconecta el observer.
 *
 * @param {number} threshold   Fracción del elemento visible para disparar (0–1)
 * @param {string} rootMargin  Margen adicional (e.g. "0px 0px -60px 0px" adelanta el trigger)
 * @returns {[React.Ref, boolean]}  [ref para el elemento, visible]
 */
export function useInView(threshold = 0.12, rootMargin = '0px 0px -50px 0px') {
  const ref     = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, threshold, rootMargin]);

  return [ref, visible];
}
