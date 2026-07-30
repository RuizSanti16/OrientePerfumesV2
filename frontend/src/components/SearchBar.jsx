import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI, categoriasAPI, marcasAPI } from '../services/api';

/* ── Íconos SVG reutilizables ── */
const IconBottle = ({ size = 18 }) => (
  <svg viewBox="0 0 24 32" fill="none" stroke="#C9A84C" strokeWidth="1.2" width={size} height={size * 1.33} aria-hidden="true" style={{ opacity: 0.5 }}>
    <rect x="5" y="11" width="14" height="20" rx="3"/>
    <rect x="8" y="5" width="8" height="6" rx="1.5"/>
    <line x1="10" y1="2" x2="10" y2="5"/>
    <line x1="14" y1="2" x2="14" y2="5"/>
    <circle cx="12" cy="21" r="2" strokeWidth="0.9"/>
  </svg>
);

const IconCategoria = ({ nombre }) => {
  const s = { stroke: '#C9A84C', fill: 'none', strokeWidth: '1.3', width: 22, height: 22, opacity: 0.75 };
  if (nombre === 'Nicho')      return <svg viewBox="0 0 24 32" {...s} aria-hidden="true"><rect x="5" y="11" width="14" height="19" rx="3"/><rect x="8" y="5" width="8" height="6" rx="1.5"/><line x1="10" y1="2" x2="10" y2="5"/><line x1="14" y1="2" x2="14" y2="5"/></svg>;
  if (nombre === 'Oriental')   return <svg viewBox="0 0 24 24" {...s} aria-hidden="true"><path d="M21 12a9 9 0 1 1-7.8-8.9A7 7 0 1 0 21 12z"/><circle cx="18" cy="6" r="1.5" fill="#C9A84C" strokeWidth="0"/></svg>;
  if (nombre === 'Diseñador')  return <svg viewBox="0 0 24 24" {...s} aria-hidden="true"><path d="M12 3 L21 8.5 L21 15.5 L12 21 L3 15.5 L3 8.5 Z"/><path d="M12 3 L16 8.5 L12 14 L8 8.5 Z" strokeWidth="0.9"/></svg>;
  if (nombre === 'Exclusivos') return <svg viewBox="0 0 24 24" {...s} aria-hidden="true"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>;
  return <svg viewBox="0 0 24 24" {...s} aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8" strokeWidth="1"/></svg>;
};

const IconMarca = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.2" width={size} height={size} aria-hidden="true" style={{ opacity: 0.6 }}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <circle cx="7" cy="7" r="1.5" fill="#C9A84C" strokeWidth="0"/>
  </svg>
);

export default function SearchBar() {
  const navigate   = useNavigate();
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState({ productos: [], categorias: [], marcas: [] });
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [todos,    setTodos]    = useState({ productos: [], categorias: [], marcas: [] });
  const inputRef   = useRef(null);
  const wrapRef    = useRef(null);

  /* Cargar todos los datos una sola vez */
  useEffect(() => {
    Promise.all([
      productosAPI.listar(),
      categoriasAPI.listar(),
      marcasAPI.listar(),
    ]).then(([p, c, m]) => {
      setTodos({
        productos:  p.ok ? p.data : [],
        categorias: c.ok ? c.data : [],
        marcas:     m.ok ? m.data : [],
      });
    }).catch(() => {});
  }, []);

  /* Cerrar al hacer clic fuera */
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Filtrar en tiempo real */
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults({ productos: [], categorias: [], marcas: [] }); setOpen(false); return; }

    setLoading(true);
    const t = setTimeout(() => {
      const productos  = todos.productos.filter(p =>
        (p.nombre||'').toLowerCase().includes(q) ||
        (p.marca||'').toLowerCase().includes(q) ||
        (p.descripcion||'').toLowerCase().includes(q)
      ).slice(0, 5);

      const categorias = todos.categorias.filter(c =>
        (c.nombre||'').toLowerCase().includes(q) ||
        (c.descripcion||'').toLowerCase().includes(q)
      ).slice(0, 3);

      const marcas = todos.marcas.filter(m =>
        (m.nombre||'').toLowerCase().includes(q) ||
        (m.pais_origen||'').toLowerCase().includes(q)
      ).slice(0, 3);

      setResults({ productos, categorias, marcas });
      setOpen(true);
      setLoading(false);
    }, 200);

    return () => clearTimeout(t);
  }, [query, todos]);

  const total = results.productos.length + results.categorias.length + results.marcas.length;

  function formatCOP(v) { return '$ ' + Number(v||0).toLocaleString('es-CO'); }

  function irAProducto(p) {
    setOpen(false); setQuery('');
    navigate(`/coleccion?categoria=${encodeURIComponent(p.nombre_categoria || '')}`);
  }

  function irACategoria(c) {
    setOpen(false); setQuery('');
    navigate(`/coleccion?categoria=${encodeURIComponent(c.nombre)}`);
  }

  function irAMarca(m) {
    setOpen(false); setQuery('');
    navigate(`/coleccion?marca=${encodeURIComponent(m.nombre)}`);
  }

  function handleKey(e) {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); }
  }

  return (
    <div ref={wrapRef} className="header__search-wrap" style={{ position: 'relative', flex: 1, maxWidth: 600 }}>

      {/* Input */}
      <div className="header__search" style={{ position: 'relative' }}>
        <label htmlFor="search-input" className="sr-only">Buscar</label>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          placeholder="Buscar productos, marcas, colecciones..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKey}
          autoComplete="off"
          aria-label="Buscar productos"
          aria-expanded={open}
          aria-controls="search-dropdown"
        />
        <button aria-label="Buscar" onClick={() => inputRef.current?.focus()}>
          {loading
            ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
          }
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Dropdown */}
      {open && (
        <div
          id="search-dropdown"
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: '#111', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            zIndex: 500, overflow: 'hidden', maxHeight: 480, overflowY: 'auto',
          }}>

          {total === 0 && !loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em' }}>
              SIN RESULTADOS PARA "{query.toUpperCase()}"
            </div>
          )}

          {/* ── Productos ── */}
          {results.productos.length > 0 && (
            <div>
              <GroupLabel>Productos</GroupLabel>
              {results.productos.map(p => (
                <button key={p.id_producto} onClick={() => irAProducto(p)}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  {/* Imagen */}
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, background: 'rgba(201,168,76,0.08)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconBottle size={20}/></div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#E8DCC8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Highlight text={p.nombre} query={query} />
                    </div>
                    <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{p.marca || ''} {p.nombre_categoria ? `· ${p.nombre_categoria}` : ''}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#C9A84C', flexShrink: 0 }}>{formatCOP(p.precio)}</div>
                </button>
              ))}
            </div>
          )}

          {/* ── Categorías ── */}
          {results.categorias.length > 0 && (
            <div style={{ borderTop: results.productos.length ? '1px solid rgba(201,168,76,0.08)' : 'none' }}>
              <GroupLabel>Colecciones</GroupLabel>
              {results.categorias.map(c => (
                <button key={c.id_categoria} onClick={() => irACategoria(c)}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <div style={{ width: 40, height: 40, background: 'rgba(201,168,76,0.08)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCategoria nombre={c.nombre} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#E8DCC8', fontWeight: 600 }}><Highlight text={c.nombre} query={query} /></div>
                    {c.descripcion && <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{c.descripcion}</div>}
                  </div>
                  <div style={{ fontSize: 10, color: '#C9A84C', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', flexShrink: 0 }}>VER →</div>
                </button>
              ))}
            </div>
          )}

          {/* ── Marcas ── */}
          {results.marcas.length > 0 && (
            <div style={{ borderTop: (results.productos.length || results.categorias.length) ? '1px solid rgba(201,168,76,0.08)' : 'none' }}>
              <GroupLabel>Marcas</GroupLabel>
              {results.marcas.map(m => (
                <button key={m.id_marca} onClick={() => irAMarca(m)}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <div style={{ width: 40, height: 40, background: 'rgba(201,168,76,0.08)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconMarca /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#E8DCC8', fontWeight: 600 }}><Highlight text={m.nombre} query={query} /></div>
                    {m.pais_origen && <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>· {m.pais_origen}</div>}
                  </div>
                  <div style={{ fontSize: 10, color: '#C9A84C', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', flexShrink: 0 }}>VER →</div>
                </button>
              ))}
            </div>
          )}

          {/* Footer con total */}
          {total > 0 && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(201,168,76,0.08)', background: 'rgba(201,168,76,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9A9180', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                {total} resultado{total !== 1 ? 's' : ''} para "{query}"
              </span>
              <button onClick={() => { setOpen(false); setQuery(''); }}
                style={{ fontSize: 11, color: '#9A9180', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
                ESC para cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Resalta el texto buscado */
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: '#C9A84C', fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function GroupLabel({ children }) {
  return (
    <div style={{ padding: '8px 16px 4px', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', color: '#C9A84C', background: 'rgba(201,168,76,0.04)', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
      {children.toUpperCase()}
    </div>
  );
}