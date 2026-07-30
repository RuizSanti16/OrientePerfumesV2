import { useEffect, useState } from 'react';
import { cuponesAPI } from '../../services/api';

function formatCOP(v) { return '$ ' + Number(v || 0).toLocaleString('es-CO'); }

const EMPTY = {
  codigo: '', tipo: 'porcentaje', valor: '',
  min_compra: '', usos_max: '', fecha_vencimiento: '',
  descripcion: '', activo: 1,
};

export default function Cupones() {
  const [cupones,   setCupones]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState(EMPTY);
  const [editando,  setEditando]  = useState(null);   // id en edición o null
  const [mostrarF,  setMostrarF]  = useState(false);  // mostrar formulario
  const [guardando, setGuardando] = useState(false);
  const [msg,       setMsg]       = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const res = await cuponesAPI.listar();
    if (res.ok) setCupones(res.data || []);
    setLoading(false);
  }

  function abrirCrear() {
    setForm(EMPTY);
    setEditando(null);
    setMostrarF(true);
    setMsg('');
  }

  function abrirEditar(cup) {
    setForm({
      codigo:            cup.codigo,
      tipo:              cup.tipo,
      valor:             cup.valor,
      min_compra:        cup.min_compra || '',
      usos_max:          cup.usos_max   || '',
      fecha_vencimiento: cup.fecha_vencimiento || '',
      descripcion:       cup.descripcion || '',
      activo:            cup.activo,
    });
    setEditando(cup.id);
    setMostrarF(true);
    setMsg('');
  }

  function cancelar() {
    setMostrarF(false);
    setEditando(null);
    setMsg('');
  }

  async function guardar(e) {
    e.preventDefault();
    if (!form.codigo.trim() || !form.valor) {
      setMsg('Código y valor son requeridos');
      return;
    }
    setGuardando(true);
    const payload = {
      ...form,
      codigo:    form.codigo.toUpperCase().trim(),
      valor:     parseFloat(form.valor),
      min_compra: parseFloat(form.min_compra || 0),
      usos_max:  form.usos_max ? parseInt(form.usos_max) : null,
      activo:    form.activo ? 1 : 0,
    };
    if (editando) payload.id = editando;
    const res = editando ? await cuponesAPI.actualizar(payload) : await cuponesAPI.crear(payload);
    setGuardando(false);
    if (res.ok) {
      setMsg('');
      setMostrarF(false);
      setEditando(null);
      cargar();
    } else {
      setMsg(res.mensaje || 'Error al guardar');
    }
  }

  async function eliminar(id, codigo) {
    if (!window.confirm(`¿Eliminar el cupón "${codigo}"?`)) return;
    await cuponesAPI.eliminar(id);
    cargar();
  }

  /* ── Helpers de formato ── */
  const fmtValor = (cup) =>
    cup.tipo === 'porcentaje' ? `${cup.valor}%` : formatCOP(cup.valor);

  const fmtUsos = (cup) =>
    cup.usos_max
      ? `${cup.usos_actuales} / ${cup.usos_max}`
      : `${cup.usos_actuales} / ∞`;

  const fmtFecha = (f) =>
    f ? new Date(f).toLocaleDateString('es-CO') : '—';

  /* ── Estilos reutilizables ── */
  const inputSt = {
    width: '100%', background: '#1a1a18', border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 6, padding: '9px 12px', color: '#E8DCC8', fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Raleway, sans-serif',
  };
  const labelSt = {
    display: 'block', fontFamily: 'Cinzel, serif', fontSize: 10,
    letterSpacing: '0.15em', color: '#9A9180', marginBottom: 5,
  };

  return (
    <div style={{ padding: 32, color: '#E8DCC8', fontFamily: 'Raleway, sans-serif' }}>

      {/* Título */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 6 }}>
            GESTIÓN DE DESCUENTOS
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, margin: 0, color: '#E8DCC8' }}>
            Cupones
          </h1>
        </div>
        <button onClick={abrirCrear}
          style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '10px 20px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.12em' }}>
          + NUEVO CUPÓN
        </button>
      </div>

      {/* Formulario crear / editar */}
      {mostrarF && (
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.15em', color: '#C9A84C', marginBottom: 20 }}>
            {editando ? 'EDITAR CUPÓN' : 'NUEVO CUPÓN'}
          </div>
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>

              {/* Código */}
              <div>
                <label style={labelSt}>CÓDIGO *</label>
                <input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                  placeholder="DESCUENTO20" required style={inputSt} />
              </div>

              {/* Tipo */}
              <div>
                <label style={labelSt}>TIPO *</label>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  style={{ ...inputSt, cursor: 'pointer' }}>
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="fijo">Monto fijo ($)</option>
                </select>
              </div>

              {/* Valor */}
              <div>
                <label style={labelSt}>VALOR * {form.tipo === 'porcentaje' ? '(%)' : '(COP)'}</label>
                <input type="number" min="0" step="any" value={form.valor}
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                  placeholder={form.tipo === 'porcentaje' ? '15' : '25000'} required style={inputSt} />
              </div>

              {/* Compra mínima */}
              <div>
                <label style={labelSt}>COMPRA MÍNIMA (COP)</label>
                <input type="number" min="0" value={form.min_compra}
                  onChange={e => setForm(f => ({ ...f, min_compra: e.target.value }))}
                  placeholder="0 = sin mínimo" style={inputSt} />
              </div>

              {/* Usos máximos */}
              <div>
                <label style={labelSt}>USOS MÁXIMOS</label>
                <input type="number" min="1" value={form.usos_max}
                  onChange={e => setForm(f => ({ ...f, usos_max: e.target.value }))}
                  placeholder="Vacío = ilimitado" style={inputSt} />
              </div>

              {/* Vencimiento */}
              <div>
                <label style={labelSt}>FECHA DE VENCIMIENTO</label>
                <input type="date" value={form.fecha_vencimiento}
                  onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))}
                  style={{ ...inputSt, colorScheme: 'dark' }} />
              </div>

              {/* Descripción */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelSt}>DESCRIPCIÓN (INTERNA)</label>
                <input value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej: Black Friday 2024" style={inputSt} />
              </div>

              {/* Activo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
                <input type="checkbox" id="activo" checked={!!form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked ? 1 : 0 }))}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#C9A84C' }} />
                <label htmlFor="activo" style={{ ...labelSt, marginBottom: 0, cursor: 'pointer' }}>ACTIVO</label>
              </div>
            </div>

            {msg && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: 6, fontSize: 13, color: '#e05252' }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={guardando}
                style={{ background: '#C9A84C', border: 'none', borderRadius: 6, padding: '10px 24px', color: '#0a0a08', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.12em', opacity: guardando ? 0.7 : 1 }}>
                {guardando ? 'GUARDANDO...' : editando ? 'ACTUALIZAR' : 'CREAR CUPÓN'}
              </button>
              <button type="button" onClick={cancelar}
                style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '10px 20px', color: '#9A9180', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.12em' }}>
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <p style={{ color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em' }}>CARGANDO...</p>
      ) : cupones.length === 0 ? (
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#9A9180', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.15em', marginBottom: 16 }}>NO HAY CUPONES CREADOS</p>
          <button onClick={abrirCrear}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 4, padding: '8px 20px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.12em' }}>
            CREAR EL PRIMERO
          </button>
        </div>
      ) : (
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                {['CÓDIGO','TIPO','DESCUENTO','MIN. COMPRA','USOS','ESTADO','VENCE',''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', color: '#9A9180', fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cupones.map(cup => (
                <tr key={cup.id} style={{ borderBottom: '1px solid rgba(201,168,76,0.06)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Código */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#C9A84C', letterSpacing: '0.08em' }}>
                      {cup.codigo}
                    </span>
                    {cup.descripcion && (
                      <div style={{ fontSize: 11, color: '#9A9180', marginTop: 2 }}>{cup.descripcion}</div>
                    )}
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: '13px 16px', fontSize: 12, color: '#C8C0B0' }}>
                    {cup.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto fijo'}
                  </td>

                  {/* Valor */}
                  <td style={{ padding: '13px 16px', fontFamily: 'Cinzel, serif', fontSize: 14, color: '#E8DCC8' }}>
                    {fmtValor(cup)}
                  </td>

                  {/* Min compra */}
                  <td style={{ padding: '13px 16px', fontSize: 12, color: '#C8C0B0' }}>
                    {cup.min_compra > 0 ? formatCOP(cup.min_compra) : '—'}
                  </td>

                  {/* Usos */}
                  <td style={{ padding: '13px 16px', fontSize: 12, color: '#C8C0B0' }}>
                    {fmtUsos(cup)}
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em', padding: '3px 10px', borderRadius: 20, background: cup.activo ? 'rgba(76,175,80,0.12)' : 'rgba(224,82,82,0.1)', color: cup.activo ? '#4caf50' : '#e05252', border: `1px solid ${cup.activo ? 'rgba(76,175,80,0.3)' : 'rgba(224,82,82,0.25)'}` }}>
                      {cup.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>

                  {/* Vencimiento */}
                  <td style={{ padding: '13px 16px', fontSize: 12, color: cup.fecha_vencimiento && cup.fecha_vencimiento < new Date().toISOString().split('T')[0] ? '#e05252' : '#C8C0B0' }}>
                    {fmtFecha(cup.fecha_vencimiento)}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => abrirEditar(cup)}
                        style={{ background: 'none', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 4, padding: '5px 12px', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.1em' }}>
                        EDITAR
                      </button>
                      <button onClick={() => eliminar(cup.id, cup.codigo)}
                        style={{ background: 'none', border: '1px solid rgba(224,82,82,0.3)', borderRadius: 4, padding: '5px 12px', color: '#e05252', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.1em' }}>
                        ELIMINAR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
