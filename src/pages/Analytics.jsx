import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#ec4899'];

export default function Analytics() {
  const dispatch = useDispatch();
  const { stats, revenueByMonth, ordersByStatus, topProducts, loading } = useSelector(s => s.dashboard);
  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const revenueData = revenueByMonth.map(d => ({ name: MONTHS[d._id.month-1], revenue: Math.round(d.revenue), orders: d.orders }));
  const statusData = ordersByStatus.map(s => ({ name: s._id?.charAt(0).toUpperCase()+s._id?.slice(1), value: s.count }));

  const catData = [
    { name:'Protein', value:38 }, { name:'Performance', value:22 }, { name:'Pre-Workout', value:18 },
    { name:'Recovery', value:15 }, { name:'Others', value:7 },
  ];

  if (loading && !stats) return <div className="spinner" />;

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Analytics & Reports</h1>
        <p style={{ color:'#6b7280' }}>Business performance overview</p>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:32 }}>
        {[
          { label:'Total Revenue', value:`₹${(stats?.totalRevenue||0).toLocaleString()}`, icon:'💰', sub:`₹${(stats?.monthRevenue||0).toLocaleString()} this month` },
          { label:'Avg Order Value', value:`₹${stats?.totalOrders ? Math.round((stats?.totalRevenue||0)/stats.totalOrders).toLocaleString() : 0}`, icon:'📊', sub:'Per order' },
          { label:'Conversion Rate', value:'3.2%', icon:'🎯', sub:'Visitors → Buyers' },
          { label:'Revenue Growth', value:`${stats?.revenueGrowth||0}%`, icon:'📈', sub:'vs last month' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div style={{ fontSize:32, marginBottom:12 }}>{k.icon}</div>
            <div style={{ fontSize:26, fontWeight:900, marginBottom:4 }}>{k.value}</div>
            <div style={{ fontWeight:600, color:'#374151', fontSize:13, marginBottom:2 }}>{k.label}</div>
            <div style={{ color:'#9ca3af', fontSize:12 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
        {/* Revenue Line Chart */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontWeight:800, marginBottom:20 }}>Monthly Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize:12, fill:'#6b7280' }} />
                <YAxis tick={{ fontSize:12, fill:'#6b7280' }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>[`₹${v.toLocaleString()}`,'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill:'#f59e0b', r:4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>No data yet</div>}
        </div>

        {/* Order Status Pie */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontWeight:800, marginBottom:20 }}>Orders by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>No data yet</div>}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Top Products Bar */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontWeight:800, marginBottom:20 }}>Top Products by Revenue</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts.map(p=>({ name:p.name?.split(' ').slice(0,2).join(' '), revenue:p.revenue }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize:11, fill:'#6b7280' }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'#6b7280' }} width={80} />
                <Tooltip formatter={v=>[`₹${v.toLocaleString()}`,'Revenue']} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>No sales data yet</div>}
        </div>

        {/* Category Distribution */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontWeight:800, marginBottom:20 }}>Sales by Category</h3>
          {catData.map((c,i) => (
            <div key={c.name} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
                <span style={{ fontWeight:600 }}>{c.name}</span>
                <span style={{ color:'#6b7280' }}>{c.value}%</span>
              </div>
              <div style={{ background:'#f3f4f6', borderRadius:4, height:8, overflow:'hidden' }}>
                <div style={{ background:COLORS[i%COLORS.length], height:'100%', width:`${c.value}%`, borderRadius:4, transition:'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
