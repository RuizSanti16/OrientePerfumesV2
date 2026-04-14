import { useEffect, useState } from 'react';
import { categoriasAPI } from '../../services/api';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  useEffect(() => { cargar(); }, []);
  async function cargar() { const r = await categoriasAPI.listar(); if (r.ok) setItems(r.data); }

  function abrirNuevo() { setEditando(null); setForm({ nombre: '', descripcion: '' }); setModal(true); }
  function abrirEditar(c) { setEditando(c.id_categoria); setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setModal(true); }

  async function guardar() {
    const res = editando
      ? await categoriasAPI.actualizar({ ...form, id_categoria: editando })
      : await categoriasAPI.crear(form);
    if (res.ok) { setModal(false); cargar(); } else alert('Error: ' + res.mensaje);
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await categoriasAPI.eliminar(id); cargar();
  }

  const inputStyle = { width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '8px 12px', color: '#E8DCC8', fontSize: '13px', boxSizing: 'border-box', outline: 'none', marginBottom: '12px' };

  return (
    <div style={{ padding: '32px', color: '#E8DCC8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#C9A84C', margin: '0 0 4px' }}>Categorías</h1>
          <p style={{ color: '#9A9180', fontSize: '13px', margin: 0 }}>Gestiona las categorías de fragancias</p>
        </div>
        <button onClick={abrirNuevo} style={{ background: '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 16px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px' }}>+ Nueva Categoría</button>
      </div>

      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              {['ID','Nombre','Descripción','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '0.15em', color: '#9A9180' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id_categoria} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
                <td style={{ padding: '12px 16px', color: '#9A9180', fontSize: '12px' }}>{c.id_categoria}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.nombre}</td>
                <td style={{ padding: '12px 16px', color: '#9A9180' }}>{c.descripcion || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => abrirEditar(c)} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '4px', padding: '4px 10px', color: '#C9A84C', cursor: 'pointer', fontSize: '11px', marginRight: 8 }}>Editar</button>
                  <button onClick={() => eliminar(c.id_categoria)} style={{ background: 'transparent', border: '1px solid #e05252', borderRadius: '4px', padding: '4px 10px', color: '#e05252', cursor: 'pointer', fontSize: '11px' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', margin: 0, fontSize: '16px' }}>{editando ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <input placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} />
            <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '8px 16px', color: '#9A9180', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} style={{ background: '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 16px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}