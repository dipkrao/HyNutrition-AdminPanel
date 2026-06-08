import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_STYLE = {
  processing:{ bg:'#fef3c7',color:'#92400e' }, confirmed:{ bg:'#dbeafe',color:'#1e40af' },
  shipped:{ bg:'#ede9fe',color:'#5b21b6' }, delivered:{ bg:'#dcfce7',color:'#14532d' }, cancelled:{ bg:'#fee2e2',color:'#991b1b' }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, recentOrders, topProducts, revenueByMonth, ordersByStatus, loading } = useSelector(s => s.dashboard);
  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const chartData = revenueByMonth.map(d => ({ name: MONTHS[(d._id.month - 1)], revenue: Math.round(d.revenue), orders: d.orders }));

  if (loading && !stats) return <div className="spinner" />;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { icon:'💰', label:'Total Revenue', value:`₹${(stats?.totalRevenue || 0).toLocaleString()}`, change:`+${stats?.revenueGrowth || 0}%`, color:'#10b981' },
          { icon:'🛒', label:'Total Orders', value: stats?.totalOrders || 0, change:`${stats?.monthOrders || 0} this month`, color:'#3b82f6' },
          { icon:'👥', label:'Customers', value: stats?.totalUsers || 0, change:`+${stats?.newUsers || 0} this month`, color:'#8b5cf6' },
          { icon:'📦', label:'Products', value: stats?.totalProducts || 0, change:`${stats?.lowStock || 0} low stock`, color:'#f59e0b' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{s.icon}</div>
              <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10 }}>{s.change}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{s.value}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert bar */}
      {stats?.pendingOrders > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontWeight: 600, color: '#92400e' }}>{stats.pendingOrders} orders awaiting processing</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Revenue Overview (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No revenue data yet</div>}
        </div>

        {/* Orders by Status */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Orders by Status</h3>
          {ordersByStatus.map(s => {
            const ss = STATUS_STYLE[s._id] || { bg: '#f3f4f6', color: '#374151' };
            return (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: ss.bg, color: ss.color }}>{s._id?.charAt(0).toUpperCase() + s._id?.slice(1)}</span>
                <span style={{ fontWeight: 800, fontSize: 18 }}>{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Recent Orders</h3>
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              {recentOrders.slice(0,6).map(o => {
                const ss = STATUS_STYLE[o.orderStatus] || { bg:'#f3f4f6', color:'#374151' };
                return (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 700 }}>{o.orderId}</td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{o.user?.name}</td>
                    <td><span className="badge" style={{ background: ss.bg, color: ss.color }}>{o.orderStatus}</span></td>
                    <td style={{ fontWeight: 700 }}>₹{o.totalPrice?.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Top Selling Products</h3>
          {topProducts.map((p, i) => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ width: 28, height: 28, background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#92400e' }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.totalSold} units sold</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>₹{p.revenue?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
