import { useState, useEffect, useMemo } from 'react';
import { testimoniosAPI } from '../../services/api';
import { MensajeEstado } from '../../components/Icons';

/* Moderación de los testimonios de la portada.

   Antes se moderaban dentro de Noticias, mezclados con los
   comentarios de las entradas: la misma lista contenía "qué buena
   descripción del perfume" y la opinión de alguien que compró, y
   aprobar un comentario de una noticia lo publicaba en la portada
   como testimonio. Son cosas distintas y se gestionan por separado. */

const ESTRELLA = ({ llena }) => (
  <svg viewBox="0 0 24 24" fill={llena ? '#C9A84C' : 'none'} stroke="#C9A84C"
    strokeWidth="1.4" width="13" height="13" aria-hidden="true">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const COLOR_ESTADO = {
  pendiente: { texto: '#E0A458', fondo: 'rgba(224,164,88,0.1)',  borde: 'rgba(224,164,88,0.3)'  },
  aprobado:  { texto: '#9AAB80', fondo: 'rgba(154,171,128,0.1)', borde: 'rgba(154,171,128,0.3)' },
  rechazado: { texto: '#C4664C', fondo: 'rgba(196,102,76,0.1)',  borde: 'rgba(196,102,76,0.3)'  },
};

export default function Testimonios() {
  const [lista,    setLista]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro,   setFiltro]   = useState('pendiente');
  const [ocupado,  setOcupado]  = useState(null);
  const [msg,      setMsg]      = useState(null);

  function avisar(ok, texto) {
    setMsg({ ok, texto });
    setTimeout(() => setMsg(null), 4000);
  }

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    const r = await testimoniosAPI.listarAdmin();
    if (r?.ok) setLista(r.data || []);
    else avisar(false, r?.mensaje || 'No se pudieron cargar los testimonios');
    setCargando(false);
  }

  async function moderar(t, estado) {
    setOcupado(t.id);
    const r = await testimoniosAPI.moderar({ id: t.id, estado });
    setOcupado(null);
    if (!r?.ok) { avisar(false, r?.mensaje || 'No se pudo guardar'); return; }
    setLista(l => l.map(x => x.id === t.id ? { ...x, estado } : x));
    avisar(true, estado === 'aprobado' ? 'Publicado en la portada' : 'Testimonio ' + estado);
  }

  async function borrar(t) {
    if (!confirm(`¿Eliminar el testimonio de ${t.nombre}?\n\nNo se puede deshacer.`)) return;
    setOcupado(t.id);
    const r = await testimoniosAPI.eliminar(t.id);
    setOcupado(null);
    if (!r?.ok) { avisar(false, r?.mensaje || 'No se pudo eliminar'); return; }
    setLista(l => l.filter(x => x.id !== t.id));
    avisar(true, 'Testimonio eliminado');
  }

  const cuentas = useMemo(() => ({
    pendiente: lista.filter(t => t.estado === 'pendiente').length,
    aprobado:  lista.filter(t => t.estado === 'aprobado').length,
    rechazado: lista.filter(t => t.estado === 'rechazado').length,
    todos:     lista.length,
  }), [lista]);

  const visibles = filtro === 'todos' ? lista : lista.filter(t => t.estado === filtro);

  return (
    <div style={{ padding: 32, color: '#E8DCC8' }}>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>
          Testimonios
        </h1>
        <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>
          Opiniones que dejan los clientes sobre la tienda. Solo las aprobadas
          salen en la portada.
        </p>
        <p style={{ color: '#6B6355', fontSize: 12, margin: '6px 0 0' }}>
          No son los comentarios de las noticias: esos se moderan en su sección.
        </p>
      </div>

      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} style={{ marginBottom: 16 }} />}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          ['pendiente', 'Por revisar'],
          ['aprobado',  'Publicados'],
          ['rechazado', 'Rechazados'],
          ['todos',     'Todos'],
        ].map(([valor, etiqueta]) => (
          <button key={valor} onClick={() => setFiltro(valor)}
            style={{
              background: filtro === valor ? 'rgba(201,168,76,0.12)' : 'transparent',
              border: `1px solid ${filtro === valor ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.15)'}`,
              borderRadius: 20, padding: '7px 16px', cursor: 'pointer',
              color: filtro === valor ? '#C9A84C' : '#9A9180',
              fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em',
            }}>
            {etiqueta.toUpperCase()}
            <span style={{ marginLeft: 7, opacity: 0.75 }}>{cuentas[valor]}</span>
          </button>
        ))}
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em' }}>
          CARGANDO...
        </div>
      ) : visibles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', background: '#111', borderRadius: 8, border: '1px dashed rgba(201,168,76,0.1)', lineHeight: 1.8 }}>
          {lista.length === 0
            ? <>AÚN NO HAY TESTIMONIOS<br/><span style={{ opacity: 0.6, letterSpacing: '0.05em', textTransform: 'none', fontFamily: 'Raleway, sans-serif', fontSize: 12 }}>Los clientes pueden dejarlos desde la portada, con su cuenta iniciada</span></>
            : 'NO HAY TESTIMONIOS EN ESTE ESTADO'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {visibles.map(t => {
            const c = COLOR_ESTADO[t.estado] || COLOR_ESTADO.pendiente;
            return (
              <div key={t.id} style={{
                background: '#111', border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 8, padding: 18, opacity: ocupado === t.id ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#E8DCC8', fontWeight: 600 }}>{t.nombre}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(n => <ESTRELLA key={n} llena={n <= (t.estrellas || 5)} />)}
                      </span>
                      <span style={{ fontSize: 11, color: '#6B6355' }}>
                        {new Date(t.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    background: c.fondo, border: `1px solid ${c.borde}`, color: c.texto,
                    borderRadius: 20, padding: '3px 12px', fontSize: 10,
                    fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                  }}>
                    {t.estado.toUpperCase()}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#C8C0B0', lineHeight: 1.7, margin: '0 0 14px', fontStyle: 'italic' }}>
                  “{t.texto}”
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {t.estado !== 'aprobado' && (
                    <button onClick={() => moderar(t, 'aprobado')} disabled={ocupado === t.id}
                      style={{ background: 'rgba(154,171,128,0.12)', border: '1px solid rgba(154,171,128,0.4)', borderRadius: 5, padding: '6px 14px', color: '#9AAB80', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
                      PUBLICAR
                    </button>
                  )}
                  {t.estado !== 'rechazado' && (
                    <button onClick={() => moderar(t, 'rechazado')} disabled={ocupado === t.id}
                      style={{ background: 'transparent', border: '1px solid rgba(224,164,88,0.35)', borderRadius: 5, padding: '6px 14px', color: '#E0A458', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
                      {t.estado === 'aprobado' ? 'QUITAR DE LA PORTADA' : 'RECHAZAR'}
                    </button>
                  )}
                  <button onClick={() => borrar(t)} disabled={ocupado === t.id}
                    style={{ background: 'transparent', border: '1px solid rgba(196,102,76,0.3)', borderRadius: 5, padding: '6px 14px', color: '#C4664C', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', marginLeft: 'auto' }}>
                    ELIMINAR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
