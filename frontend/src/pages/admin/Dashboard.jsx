import { useEffect, useState } from 'react';
import { productosAPI, clientesAPI, ventasAPI } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ productos: 0, clientes: 0, ventas: 0 });

  useEffect(() => {
    Promise.all([
      productosAPI.listar(),
      clientesAPI.listar(),
      ventasAPI.listar(),
    ]).then(([p, c, v]) => {
      setStats({
        productos: p.ok ? p.data.length : 0,
        clientes:  c.ok ? c.data.length : 0,
        ventas:    v.ok ? v.data.length : 0,
      });
    });
  }, []);

  const KPIS = [
    { label: 'Productos',  value: stats.productos, icon: '📦' },
    { label: 'Clientes',   value: stats.clientes,  icon: '👥' },
    { label: 'Ventas',     value: stats.ventas,    icon: '🛒' },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#C9A84C', marginBottom: '8px', letterSpacing: '0.05em' }}>Dashboard</h1>
      <p style={{ color: '#9A9180', fontSize: '13px', marginBottom: '32px' }}>Resumen de actividad</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '16px', marginBottom: '32px' }}>
        {KPIS.map(kpi => (
          <div key={kpi.label} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{kpi.icon}</div>
            <div style={{ fontSize: '28px', color: '#C9A84C', fontWeight: 700, marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: '#9A9180', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}