import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const load = (status) => {
    setLoading(true);
    const endpoint = status === 'pending' ? '/reviews/pending' : '/reviews/pending';
    api.get(endpoint).then(r => setReviews(r.data.reviews)).catch(()=>setReviews([])).finally(()=>setLoading(false));
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleApprove = async (id) => {
    await api.put(`/reviews/${id}`, { isApproved: true });
    toast.success('Review approved!');
    setReviews(prev => prev.filter(r => r._id !== id));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    toast.success('Review deleted');
    setReviews(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Reviews</h1>
        <p style={{ color:'#6b7280' }}>Manage customer product reviews</p>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['pending','⏳ Pending Approval'],['approved','✅ Approved']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'8px 20px', borderRadius:8, border:'1px solid', borderColor: tab===id ? '#f59e0b':'#e5e7eb', background: tab===id?'#f59e0b':'#fff', color: tab===id?'#000':'#374151', fontWeight:700, fontSize:13, cursor:'pointer' }}>{label}</button>
        ))}
      </div>
      {loading ? <div className="spinner" /> : reviews.length === 0 ? (
        <div style={{ textAlign:'center', padding:80, color:'#9ca3af' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>⭐</div>
          <p>{tab==='pending' ? 'No pending reviews!' : 'No approved reviews yet.'}</p>
        </div>
      ) : (
        <div>
          {reviews.map(r => (
            <div key={r._id} className="card" style={{ padding:20, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:40, height:40, background:'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, flexShrink:0 }}>{r.user?.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{r.user?.name}</div>
                    <div style={{ color:'#9ca3af', fontSize:12 }}>{r.user?.email}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'#f59e0b', fontSize:16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  <div style={{ color:'#9ca3af', fontSize:12, marginTop:2 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              <div style={{ background:'#fafafa', borderRadius:8, padding:'8px 12px', marginBottom:12, fontSize:12, color:'#6b7280' }}>
                Product: <strong style={{ color:'#374151' }}>{r.product?.name}</strong>
                {r.isVerifiedPurchase && <span style={{ marginLeft:12, background:'#dcfce7', color:'#14532d', padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:700 }}>✓ Verified Purchase</span>}
              </div>
              <div style={{ fontWeight:700, marginBottom:6, fontSize:15 }}>{r.title}</div>
              <p style={{ color:'#374151', fontSize:14, lineHeight:1.6, marginBottom:16 }}>{r.comment}</p>
              <div style={{ display:'flex', gap:10 }}>
                {!r.isApproved && <button onClick={()=>handleApprove(r._id)} className="btn" style={{ background:'#dcfce7', color:'#14532d', padding:'8px 16px', fontSize:13 }}>✓ Approve</button>}
                <button onClick={()=>handleDelete(r._id)} className="btn btn-danger" style={{ padding:'8px 16px', fontSize:13 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
