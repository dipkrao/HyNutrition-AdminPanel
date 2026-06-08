import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Newsletter() {
  const [data, setData] = useState({ count:0, subscribers:[] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/newsletter').then(r => setData(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = data.subscribers.filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Newsletter</h1>
        <p style={{ color:'#6b7280' }}>{data.count} active subscribers</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:28 }}>
        {[['📧','Total Subscribers', data.count],['✅','Active',data.subscribers.filter(s=>s.isActive).length],['📅','This Month',data.subscribers.filter(s=>new Date(s.createdAt)>new Date(Date.now()-30*24*60*60*1000)).length]].map(([icon,label,val])=>(
          <div key={label} className="stat-card" style={{ display:'flex', alignItems:'center', gap:16 }}>
            <span style={{ fontSize:36 }}>{icon}</span>
            <div><div style={{ fontSize:28, fontWeight:900 }}>{val}</div><div style={{ color:'#6b7280', fontSize:13 }}>{label}</div></div>
          </div>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search email..." className="input" style={{ maxWidth:300, marginBottom:16 }} />
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead><tr><th>Email</th><th>Source</th><th>Subscribed</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight:600 }}>{s.email}</td>
                  <td style={{ fontSize:13, color:'#6b7280' }}>{s.source}</td>
                  <td style={{ fontSize:13, color:'#6b7280' }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className="badge" style={{ background: s.isActive?'#dcfce7':'#fee2e2', color: s.isActive?'#14532d':'#991b1b' }}>{s.isActive?'Active':'Unsubscribed'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
