import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Derive base URL safely: strip trailing /api suffix only, not substrings
const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const EMPTY = { title: '', highlight: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/shop', bgColor: '#0a0a0a', accentColor: '#f59e0b', isActive: true, sortOrder: 0, image: '' };

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/banners/all').then(r => setBanners(r.data.banners)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const imgSrc = (url) => url ? `${API_BASE}${url}` : '';

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const r = await api.post('/banners/upload', data);
      setForm(f => ({ ...f, image: r.data.url }));
      setPreview(imgSrc(r.data.url));
      toast.success('Image uploaded!');
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      // Send plain JSON — image was already uploaded separately, form.image holds the relative path
      const payload = {
        title: form.title,
        highlight: form.highlight,
        subtitle: form.subtitle,
        ctaText: form.ctaText,
        ctaLink: form.ctaLink,
        bgColor: form.bgColor,
        accentColor: form.accentColor,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
        image: form.image,
      };
      if (editing) {
        await api.put(`/banners/${editing}`, payload);
        toast.success('Banner updated!');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner created!');
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    await api.delete(`/banners/${id}`);
    toast.success('Banner deleted'); load();
  };

  const openEdit = (b) => {
    setEditing(b._id);
    setForm({ title: b.title, highlight: b.highlight || '', subtitle: b.subtitle || '', ctaText: b.ctaText, ctaLink: b.ctaLink, bgColor: b.bgColor, accentColor: b.accentColor, isActive: b.isActive, sortOrder: b.sortOrder, image: b.image || '' });
    setPreview(imgSrc(b.image));
    setModal(true);
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setPreview(''); setModal(true); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Banners</h1><p style={{ color: '#6b7280' }}>Manage homepage hero sliders</p></div>
        <button onClick={openCreate} className="btn btn-primary">+ Add Banner</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {banners.map(b => (
            <div key={b._id} style={{ background: b.bgColor, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              {b.image
                ? <img src={imgSrc(b.image)} alt={b.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} loading="lazy" />
                : <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.15 }}>🖼️</div>
              }
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, marginBottom: 2 }}>{b.title} <span style={{ color: b.accentColor }}>{b.highlight}</span></div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 14 }}>{b.subtitle}</div>
                <div style={{ display: 'inline-block', background: b.accentColor, color: '#000', padding: '4px 12px', borderRadius: 5, fontSize: 11, fontWeight: 700, marginBottom: 14 }}>{b.ctaText}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(b)} style={{ background: b.accentColor, color: '#000', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Edit</button>
                  <button onClick={() => handleDelete(b._id)} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <span style={{ background: b.isActive ? '#dcfce7' : '#fee2e2', color: b.isActive ? '#14532d' : '#991b1b', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{b.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
          {banners.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#9ca3af' }}>No banners yet. Create your first hero banner!</div>}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>{editing ? 'Edit Banner' : 'Create Banner'}</h2>

            {/* Image Upload */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Banner Image</label>
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, overflow: 'hidden', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', position: 'relative' }}>
                {preview
                  ? <>
                      <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                      <button onClick={() => { setPreview(''); setForm(f => ({ ...f, image: '' })); }} style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>×</button>
                    </>
                  : <label style={{ cursor: 'pointer', textAlign: 'center', padding: 20, color: '#9ca3af' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{uploading ? 'Uploading...' : 'Click to upload image'}</div>
                      <div style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP · Max 5MB</div>
                      <input type="file" accept="image/jpg,image/jpeg,image/png,image/webp" style={{ display: 'none' }} disabled={uploading} onChange={e => handleImageUpload(e.target.files[0])} />
                    </label>
                }
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['title', 'Headline Title *', 'text'], ['highlight', 'Highlight Word', 'text'], ['subtitle', 'Subtitle', 'text'], ['ctaText', 'CTA Button Text', 'text'], ['ctaLink', 'CTA Link', 'text'], ['sortOrder', 'Sort Order', 'number']].map(([k, l, t]) => (
                <div key={k} style={{ gridColumn: k === 'subtitle' ? '1/-1' : undefined }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="input" />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Background Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} style={{ width: 40, height: 36, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }} />
                  <input value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} className="input" style={{ flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Accent Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.accentColor} onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} style={{ width: 40, height: 36, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }} />
                  <input value={form.accentColor} onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} className="input" style={{ flex: 1 }} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active
              </label>
            </div>

            {/* Live Preview */}
            <div style={{ background: form.bgColor, borderRadius: 10, padding: '16px 20px', marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{form.title} <span style={{ color: form.accentColor }}>{form.highlight}</span></div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>{form.subtitle}</div>
              </div>
              {preview && <img src={preview} alt="" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 6 }} />}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={handleSave} disabled={saving || uploading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : editing ? 'Update Banner' : 'Create Banner'}</button>
              <button onClick={() => setModal(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
