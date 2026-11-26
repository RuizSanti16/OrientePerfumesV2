import { useState, useEffect, useMemo } from 'react';
import { subirImagen, marcasAPI } from '../../services/api';
import { MensajeEstado } from '../../components/Icons';

/* Logos de las casas de perfumería.

   Antes esta pantalla repartía los logos en cuatro pestañas (Nicho,
   Oriental, Diseñador, Exclusivos) y los guardaba con
   localStorage.setItem: se quedaban en el navegador de quien los
   subía y no los veía nadie más. Daba igual, además, porque el único
   componente que los leía no lo importaba ningún archivo y los logos
   no salían en ninguna parte de la tienda.

   Ahora hay una sola lista, la de las marcas que ya existen en la
   base —las mismas que usan los productos y el buscador—, y el logo
   se guarda contra la API, en la propia marca. */

const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={20} height={20}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export default function ColeccionesAdmin() {
  const [marcas,   setMarcas]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro,   setFiltro]   = useState('');
  const [soloSin,  setSoloSin]  = useState(false);
  const [msg,      setMsg]      = useState(null);
  const [ocupada,  setOcupada]  = useState(null); // id de la marca que se está guardando

  function avisar(ok, texto) {
    setMsg({ ok, texto });
    setTimeout(() => setMsg(null), 4000);
  }

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    const r = await marcasAPI.listar();
    if (r?.ok) setMarcas(r.data || []);
    else avisar(false, r?.mensaje || 'No se pudieron cargar las marcas');
    setCargando(false);
  }

  /* Guarda el logo de una marca. Cada cambio viaja solo: así no hay
     un botón de guardar que se pueda olvidar, que era justo lo que
     dejaba a medias el flujo anterior. */
  async function guardarLogo(marca, logo) {
    setOcupada(marca.id_marca);
    const r = await marcasAPI.actualizar({ id_marca: marca.id_marca, logo });
    setOcupada(null);

    if (!r?.ok) {
      avisar(false, r?.mensaje || `No se pudo guardar el logo de ${marca.nombre}`);
      return false;
    }
    setMarcas(ms => ms.map(m => m.id_marca === marca.id_marca ? { ...m, logo: logo || null } : m));
    avisar(true, logo ? `Logo de ${marca.nombre} guardado` : `Logo de ${marca.nombre} quitado`);
    return true;
  }

  async function subirYGuardar(marca, file) {
    setOcupada(marca.id_marca);
    try {
      const res = await subirImagen(file);
      if (!res.ok) {
        setOcupada(null);
        avisar(false, 'Error al subir: ' + (res.mensaje || 'desconocido'));
        return;
      }
      await guardarLogo(marca, res.url);
    } catch {
      setOcupada(null);
      avisar(false, 'Error de conexión al subir la imagen');
    }
  }

  const visibles = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return marcas
      .filter(m => !soloSin || !m.logo)
      .filter(m => !q || (m.nombre || '').toLowerCase().includes(q));
  }, [marcas, filtro, soloSin]);

  const conLogo = marcas.filter(m => m.logo).length;

  const inp = {
    background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 6, padding: '8px 12px', color: '#E8DCC8', fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif',
  };

  return (
    <div style={{ padding: 32, color: '#E8DCC8' }}>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C9A84C', margin: '0 0 4px' }}>
          Logos de Marcas
        </h1>
        <p style={{ color: '#9A9180', fontSize: 13, margin: 0 }}>
          Se muestran en la franja de marcas de la página de inicio ·{' '}
          <strong style={{ color: '#C9A84C' }}>{conLogo}</strong> de {marcas.length} con logo
        </p>
        <p style={{ color: '#6B6355', fontSize: 12, margin: '6px 0 0' }}>
          Cada cambio se guarda solo, no hace falta pulsar nada al final.
        </p>
        <p style={{ color: '#6B6355', fontSize: 12, margin: '10px 0 0', lineHeight: 1.6 }}>
          Mejor <strong style={{ color: '#9A9180' }}>PNG o SVG con fondo transparente</strong>, y el logo
          en <strong style={{ color: '#9A9180' }}>negro u oscuro</strong>: la franja de la tienda tiene
          fondo claro. Un JPG también vale si su fondo es blanco. La vista previa
          de cada tarjeta usa ese mismo fondo, así que lo que veas ahí es lo que
          verá el cliente.
        </p>
      </div>

      {msg && <MensajeEstado ok={msg.ok} texto={msg.texto} style={{ marginBottom: 16 }} />}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inp, flex: 1, minWidth: 200 }}
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar marca..." />
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#9A9180', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={soloSin} onChange={e => setSoloSin(e.target.checked)}
            style={{ accentColor: '#C9A84C' }} />
          Solo las que faltan
        </label>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em' }}>
          CARGANDO MARCAS...
        </div>
      ) : visibles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', background: '#111', borderRadius: 8, border: '1px dashed rgba(201,168,76,0.1)' }}>
          {marcas.length === 0
            ? 'NO HAY MARCAS REGISTRADAS — CRÉALAS EN LA SECCIÓN MARCAS'
            : 'NINGUNA MARCA COINCIDE CON EL FILTRO'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
          {visibles.map(marca => (
            <TarjetaMarca
              key={marca.id_marca}
              marca={marca}
              inp={inp}
              ocupada={ocupada === marca.id_marca}
              onArchivo={file => subirYGuardar(marca, file)}
              onUrl={url => guardarLogo(marca, url)}
              onQuitar={() => guardarLogo(marca, '')}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Una marca con su logo ── */
function TarjetaMarca({ marca, inp, ocupada, onArchivo, onUrl, onQuitar }) {
  const [imgError, setImgError] = useState(false);
  const [url,      setUrl]      = useState('');
  const [verUrl,   setVerUrl]   = useState(false);

  useEffect(() => { setImgError(false); }, [marca.logo]);

  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 8, overflow: 'hidden', opacity: ocupada ? 0.6 : 1, transition: 'opacity 0.2s' }}>

      {/* Vista previa, o zona para soltar el archivo */}
      {/* El mismo fondo claro que la franja de la tienda: la vista
          previa no sirve de nada si enseña el logo sobre un fondo
          distinto del que va a tener. */}
      <label style={{
        background: marca.logo && !imgError
          ? 'linear-gradient(180deg, #EFE9DD 0%, #F7F3EA 45%, #EFE9DD 100%)'
          : '#0f0f0d',
        height: 100, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 14, cursor: ocupada ? 'wait' : 'pointer',
        borderBottom: '1px solid rgba(201,168,76,0.08)', position: 'relative',
      }}>
        {ocupada ? (
          <div style={{ width: 20, height: 20, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : marca.logo && !imgError ? (
          <img src={marca.logo} alt={marca.nombre}
            onError={() => setImgError(true)}
            /* Sin filtros: la vista previa tiene que enseñar lo que se
               va a ver en la tienda, sobre este mismo fondo oscuro.
               Antes pintaba de blanco toda la imagen, así que un logo
               con fondo blanco se veía aquí como un cuadrado blanco y
               no había forma de saber si estaba bien subido. */
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ textAlign: 'center', color: imgError ? '#C4664C' : '#5a5448' }}>
            <span style={{ opacity: 0.8 }}><IconUpload /></span>
            <div style={{ fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', marginTop: 4 }}>
              {imgError ? 'NO CARGA' : 'SUBIR LOGO'}
            </div>
          </div>
        )}
        <input type="file" accept="image/*" style={{ display: 'none' }} disabled={ocupada}
          onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onArchivo(f); }} />
      </label>

      <div style={{ padding: 10 }}>
        <div style={{ fontSize: 13, color: '#E8DCC8', fontWeight: 600, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {marca.nombre}
        </div>

        {verUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input style={{ ...inp, fontSize: 11, padding: '5px 8px' }} value={url}
              onChange={e => setUrl(e.target.value)} placeholder="https://..." />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={async () => { if (url.trim() && await onUrl(url.trim())) { setUrl(''); setVerUrl(false); } }}
                disabled={!url.trim() || ocupada}
                style={{ flex: 1, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 4, padding: '5px', color: '#C9A84C', cursor: url.trim() ? 'pointer' : 'not-allowed', fontSize: 10, fontFamily: 'Cinzel, serif', opacity: url.trim() ? 1 : 0.5 }}>
                GUARDAR
              </button>
              <button onClick={() => { setVerUrl(false); setUrl(''); }}
                style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, padding: '5px 10px', color: '#9A9180', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif' }}>
                NO
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setVerUrl(true)} disabled={ocupada}
              style={{ flex: 1, background: 'transparent', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 4, padding: '5px', color: '#9A9180', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.06em' }}>
              POR URL
            </button>
            {marca.logo && (
              <button onClick={onQuitar} disabled={ocupada}
                style={{ background: 'transparent', border: '1px solid rgba(196,102,76,0.35)', borderRadius: 4, padding: '5px 10px', color: '#C4664C', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif' }}>
                QUITAR
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
