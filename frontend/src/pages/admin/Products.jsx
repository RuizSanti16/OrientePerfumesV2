import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI, marcasAPI, categoriasAPI, subirImagen } from '../../services/api';

export default function Products() {
  const [productos,   setProductos]   = useState([]);
  const [marcas,      setMarcas]      = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [modal,       setModal]       = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [form,        setForm]        = useState(defaultForm());
  const [busqueda,    setBusqueda]    = useState('');
  const [imagenB64,   setImagenB64]   = useState('');
  const [subiendo,    setSubiendo]    = useState(false);
  const navigate = useNavigate();

  function defaultForm() {
    return { nombre: '', marca: '', id_categoria: '', precio: '', descripcion: '', imagen: '', presentaciones: [] };
  }

  useEffect(() => {
    cargar();
    marcasAPI.listar().then(r => { if (r.ok) setMarcas(r.data); });
    categoriasAPI.listar().then(r => { if (r.ok) setCategorias(r.data); });
  }, []);

  async function cargar() {
    const r = await productosAPI.listar();
    if (r.ok) setProductos(r.data);
  }

  function abrirNuevo() {
    setEditando(null); setForm(defaultForm()); setImagenB64(''); setModal(true);
  }

  function abrirEditar(p) {
    setEditando(p.id_producto);
    setForm({ nombre: p.nombre || '', marca: p.marca || '', id_categoria: p.id_categoria || '', precio: p.precio || '', descripcion: p.descripcion || '', imagen: p.imagen || '', presentaciones: p.presentaciones || [] });
    setImagenB64(p.imagen || '');
    setModal(true);
  }

  async function guardar() {
    const data = { ...form, imagen: imagenB64 || form.imagen, precio: parseFloat(form.precio) || 0 };
    const res = editando
      ? await productosAPI.actualizar({ ...data, id_producto: editando })
      : await productosAPI.crear(data);
    if (res.ok) { setModal(false); cargar(); }
    else alert('Error: ' + res.mensaje);
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    await productosAPI.eliminar(id);
    cargar();
  }

  async function handleImagen(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setSubiendo(true);
    try {
      const res = await subirImagen(file);
      if (res.ok) {
        setImagenB64(res.url);
      } else {
        alert('Error al subir imagen: ' + (res.mensaje || 'Error desconocido'));
      }
    } catch {
      alert('Error de conexión. Verifica que XAMPP esté activo.');
    }
    setSubiendo(false);
  }

  function agregarPresentacion() {
    setForm(f => ({ ...f, presentaciones: [...f.presentaciones, { etiqueta: '', precio: 0 }] }));
  }

  function updatePres(i, key, val) {
    setForm(f => {
      const p = [...f.presentaciones];
      p[i] = { ...p[i], [key]: val };
      return { ...f, presentaciones: p };
    });
  }

  function quitarPres(i) {
    setForm(f => ({ ...f, presentaciones: f.presentaciones.filter((_, idx) => idx !== i) }));
  }

  const filtrados = productos.filter(p =>
    !busqueda || (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.marca || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', color: '#E8DCC8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#C9A84C', margin: '0 0 4px', letterSpacing: '0.05em' }}>Productos</h1>
          <p style={{ color: '#9A9180', fontSize: '13px', margin: 0 }}>Gestiona el catálogo de fragancias</p>
        </div>
        <button onClick={abrirNuevo} style={btnGold}>+ Nuevo Producto</button>
      </div>

      {/* Alerta: productos sin categoría */}
      {(() => {
        const sinCat = productos.filter(p => !p.id_categoria).length;
        return sinCat > 0 ? (
          <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 6, background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.3)', fontSize: 13, color: '#C9A84C', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={18} height={18} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            <span>
              <strong>{sinCat}</strong> producto{sinCat > 1 ? 's' : ''} sin categoría asignada — no aparecerán en las colecciones. Edítalos y asigna una categoría.
            </span>
          </div>
        ) : null;
      })()}

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar productos..."
        style={{ ...inputStyle, marginBottom: '16px', maxWidth: '300px' }} />

      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              {['Img','ID','Nombre','Marca','Categoría','Precio','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '0.15em', color: '#9A9180' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id_producto} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
                <td style={{ padding: '10px 16px' }}>
                  {p.imagen ? <img src={p.imagen} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} alt="" /> : <div style={{ width: 40, height: 40, background: 'rgba(201,168,76,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>}
                </td>
                <td style={{ padding: '10px 16px', color: '#9A9180', fontSize: '12px' }}>{p.id_producto}</td>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>{p.nombre}</td>
                <td style={{ padding: '10px 16px', color: '#9A9180' }}>{p.marca || '—'}</td>
                <td style={{ padding: '10px 16px' }}>
                  {p.nombre_categoria
                    ? <span style={{ color: '#9A9180' }}>{p.nombre_categoria}</span>
                    : <span style={{ color: '#C9A84C', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 4, padding: '2px 8px' }}>SIN CATEGORÍA</span>}
                </td>
                <td style={{ padding: '10px 16px', color: '#C9A84C' }}>$ {Number(p.precio || 0).toLocaleString('es-CO')}</td>
              <td style={{ padding: '10px 16px' }}>
                <button onClick={() => abrirEditar(p)} style={btnOutline}>Editar</button>
                <button onClick={() => navigate(`/admin/producto/${p.id_producto}`)} style={{ ...btnOutline, color: '#9A9180', borderColor: 'rgba(201,168,76,0.2)', marginLeft: 8 }}>Detalle</button>
                <button onClick={() => eliminar(p.id_producto)} style={{ ...btnOutline, color: '#e05252', borderColor: '#e05252', marginLeft: 8 }}>Eliminar</button>
              </td>
              </tr>
            ))}
            {!filtrados.length && (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9A9180' }}>No hay productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', margin: 0, fontSize: '16px' }}>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            {/* Imagen */}
            <Label>Imagen</Label>
            <label htmlFor="imgInput"
              style={{ display: 'block', border: '2px dashed rgba(201,168,76,0.3)', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: subiendo ? 'wait' : 'pointer', marginBottom: '8px', background: 'rgba(201,168,76,0.02)' }}>
              {subiendo ? (
                <div style={{ color: '#C9A84C', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  Subiendo imagen...
                </div>
              ) : imagenB64 ? (
                <img src={imagenB64} style={{ maxHeight: '120px', borderRadius: '6px' }} alt="Preview" />
              ) : (
                <div style={{ color: '#9A9180', fontSize: '13px' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>↑</div>
                  Clic para subir imagen · JPG, PNG, WEBP, GIF, AVIF...
                </div>
              )}
            </label>
            <input id="imgInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagen} disabled={subiendo} />
            {imagenB64 && !imagenB64.startsWith('data:') && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input readOnly value={imagenB64} style={{ ...inputStyle, fontSize: 11, color: '#9A9180' }} />
                <button onClick={() => setImagenB64('')} style={{ background: 'none', border: '1px solid rgba(224,82,82,0.4)', borderRadius: 4, padding: '0 10px', color: '#e05252', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 11 }}>Quitar</button>
              </div>
            )}
            <input placeholder="O pega una URL de imagen" value={imagenB64.startsWith('data:') || imagenB64.startsWith('/OrientPerfumes') ? '' : imagenB64}
              onChange={e => setImagenB64(e.target.value)}
              style={{ ...inputStyle, marginBottom: '12px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <Label>Nombre *</Label>
            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={{ ...inputStyle, marginBottom: '12px' }} placeholder="Nombre del producto" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <Label>Marca</Label>
                <select value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} style={inputStyle}>
                  <option value="">Sin marca</option>
                  {marcas.map(m => <option key={m.id_marca} value={m.nombre}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <Label>Categoría</Label>
                <select value={form.id_categoria} onChange={e => setForm(f => ({ ...f, id_categoria: e.target.value }))} style={inputStyle}>
                  <option value="">Sin categoría</option>
                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            <Label>Precio (COP) *</Label>
            <input type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
              style={{ ...inputStyle, marginBottom: '12px' }} placeholder="Ej: 320000" />

            <Label>Descripción</Label>
            <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={2} style={{ ...inputStyle, marginBottom: '16px', resize: 'vertical' }} placeholder="Descripción del producto" />

            {/* Presentaciones */}
            <Label>Opciones de Presentación</Label>
            {form.presentaciones.map((pr, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                <input placeholder="Ej: 100ml" value={pr.etiqueta} onChange={e => updatePres(i, 'etiqueta', e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Precio" value={pr.precio} onChange={e => updatePres(i, 'precio', e.target.value)} style={inputStyle} />
                <button onClick={() => quitarPres(i)} style={{ background: 'none', border: '1px solid #e05252', color: '#e05252', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button onClick={agregarPresentacion}
              style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(201,168,76,0.4)', borderRadius: '6px', padding: '8px', color: '#C9A84C', cursor: 'pointer', fontSize: '12px', marginBottom: '20px' }}>
              + Agregar presentación
            </button>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={btnGhost}>Cancelar</button>
              <button onClick={guardar} style={btnGold}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Estilos ── */
const inputStyle = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '8px 12px', color: '#E8DCC8', fontSize: '13px', boxSizing: 'border-box', outline: 'none' };
const btnGold    = { background: '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 16px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.1em' };
const btnGhost   = { background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '8px 16px', color: '#9A9180', cursor: 'pointer', fontSize: '13px' };
const btnOutline = { background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '4px', padding: '4px 10px', color: '#C9A84C', cursor: 'pointer', fontSize: '11px' };
function Label({ children }) { return <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '0.15em', color: '#9A9180', marginBottom: '6px' }}>{children}</div>; }