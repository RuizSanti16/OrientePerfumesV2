import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI, categoriasAPI, marcasAPI } from '../services/api';

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
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: 600 }}>

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
                    : <div style={{ width: 40, height: 40, background: 'rgba(201,168,76,0.08)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🫙</div>
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
                  <div style={{ width: 40, height: 40, background: 'rgba(201,168,76,0.08)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {{ 'Nicho':'🏺', 'Oriental':'🌙', 'Diseñador':'💎', 'Exclusivos':'✨' }[c.nombre] || '📦'}
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
                  <div style={{ width: 40, height: 40, background: 'rgba(201,168,76,0.08)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏷️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#E8DCC8', fontWeight: 600 }}><Highlight text={m.nombre} query={query} /></div>
                    {m.pais_origen && <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>🌍 {m.pais_origen}</div>}
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