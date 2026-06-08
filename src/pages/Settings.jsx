import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Section = ({ title, children, onSave, saving }) => (
  <div className="card" style={{ padding:28, marginBottom:20 }}>
    <h3 style={{ fontWeight:800, marginBottom:20, fontSize:18 }}>{title}</h3>
    {children}
    <button onClick={onSave} disabled={saving} className="btn btn-primary" style={{ marginTop:20 }}>
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
  </div>
);

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState({ siteName:'', tagline:'', email:'', phone:'', address:'' });
  const [social, setSocial] = useState({ instagram:'', facebook:'', youtube:'', twitter:'' });
  const [shipping, setShipping] = useState({ freeShippingThreshold:999, defaultShipping:99, taxRate:5 });

  useEffect(() => {
    api.get('/settings').then(res => {
      const s = res.data.settings;
      setGeneral({ siteName: s.siteName, tagline: s.tagline, email: s.email, phone: s.phone, address: s.address });
      if (s.social) setSocial(s.social);
      if (s.shipping) setShipping(s.shipping);
    }).catch(() => toast.error('Failed to load settings'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { ...general, social, shipping });
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Settings</h1>
        <p style={{ color:'#6b7280' }}>Manage your store configuration</p>
      </div>
      <Section title="🏪 General Information" onSave={handleSave} saving={saving}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {Object.entries(general).map(([k,v]) => (
            <div key={k} style={{ gridColumn: k==='address'?'1/-1':undefined }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'capitalize' }}>{k.replace(/([A-Z])/g,' $1')}</label>
              <input value={v} onChange={e=>setGeneral(g=>({...g,[k]:e.target.value}))} className="input" />
            </div>
          ))}
        </div>
      </Section>
      <Section title="📱 Social Media Links" onSave={handleSave} saving={saving}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {Object.entries(social).map(([k,v]) => (
            <div key={k}>
              <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'capitalize' }}>{k}</label>
              <input value={v} onChange={e=>setSocial(s=>({...s,[k]:e.target.value}))} className="input" />
            </div>
          ))}
        </div>
      </Section>
      <Section title="🚚 Shipping & Tax" onSave={handleSave} saving={saving}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          <div><label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4 }}>Free Shipping Above (₹)</label><input type="number" value={shipping.freeShippingThreshold} onChange={e=>setShipping(s=>({...s,freeShippingThreshold:e.target.value}))} className="input" /></div>
          <div><label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4 }}>Default Shipping (₹)</label><input type="number" value={shipping.defaultShipping} onChange={e=>setShipping(s=>({...s,defaultShipping:e.target.value}))} className="input" /></div>
          <div><label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4 }}>Tax Rate (%)</label><input type="number" value={shipping.taxRate} onChange={e=>setShipping(s=>({...s,taxRate:e.target.value}))} className="input" /></div>
        </div>
      </Section>
      <div className="card" style={{ padding:28, background:'#0a0a0a' }}>
        <h3 style={{ fontWeight:800, fontSize:18, color:'#fff', marginBottom:16 }}>⚠️ Danger Zone</h3>
        <p style={{ color:'#6b7280', fontSize:14, marginBottom:16 }}>These actions are irreversible. Proceed with extreme caution.</p>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={()=>toast.error('Export not configured yet')} style={{ background:'#1a1a1a', color:'#9ca3af', border:'1px solid #333', padding:'10px 20px', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>Export Database</button>
          <button onClick={()=>toast.error('Clear cache not configured')} style={{ background:'#1a1a1a', color:'#9ca3af', border:'1px solid #333', padding:'10px 20px', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>Clear Cache</button>
        </div>
      </div>
    </div>
  );
}
