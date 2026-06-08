import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { code:'', description:'', discountType:'percentage', discountValue:'', minOrderValue:0, maxDiscount:'', usageLimit:'', validUntil:'', isActive:true };

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => { setLoading(true); api.get('/coupons').then(r => setCoupons(r.data.coupons)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { toast.error('Code and discount value required'); return; }
    setSaving(true);
    try {
      if (editing) { await api.put(`/coupons/${editing}`, form); toast.success('Coupon updated!'); }
      else { await api.post('/coupons', form); toast.success('Coupon created!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon?')) return;
    await api.delete(`/coupons/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Coupons</h1>
        <button onClick={() => { setEditing(null); setForm(EMPTY); setModal(true); }} className="btn btn-primary">+ Create Coupon</button>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Usage</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td><code style={{ background: '#f3f4f6', padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>{c.code}</code></td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF</td>
                  <td style={{ fontSize: 13 }}>₹{c.minOrderValue?.toLocaleString()}</td>
                  <td style={{ fontSize: 13 }}>{c.usageCount}/{c.usageLimit || '∞'}</td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{c.validUntil ? new Date(c.validUntil).toLocaleDateString('en-IN') : 'No expiry'}</td>
                  <td><span className="badge" style={{ background: c.isActive ? '#dcfce7' : '#fee2e2', color: c.isActive ? '#14532d' : '#991b1b' }}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setEditing(c._id); setForm({ ...c, validUntil: c.validUntil ? c.validUntil.split('T')[0] : '' }); setModal(true); }} className="btn btn-info" style={{ padding: '6px 12px', fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDelete(c._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520 }}>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Code *</label><input value={form.code} onChange={e => setForm(f=>({...f,code:e.target.value.toUpperCase()}))} className="input" placeholder="e.g. SAVE20" /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Type</label><select value={form.discountType} onChange={e => setForm(f=>({...f,discountType:e.target.value}))} className="input"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₹)</option></select></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Value *</label><input type="number" value={form.discountValue} onChange={e => setForm(f=>({...f,discountValue:e.target.value}))} className="input" /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Min Order (₹)</label><input type="number" value={form.minOrderValue} onChange={e => setForm(f=>({...f,minOrderValue:e.target.value}))} className="input" /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm(f=>({...f,usageLimit:e.target.value}))} className="input" placeholder="Unlimited" /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Expiry Date</label><input type="date" value={form.validUntil} onChange={e => setForm(f=>({...f,validUntil:e.target.value}))} className="input" /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Description</label><input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className="input" /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}><input type="checkbox" checked={form.isActive} onChange={e => setForm(f=>({...f,isActive:e.target.checked}))} /> Active</label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              <button onClick={() => setModal(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
