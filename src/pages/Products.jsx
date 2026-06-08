import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, deleteProduct } from '../store/slices/productSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', sku: '', price: '', discountPrice: '', shortDescription: '', description: '', weight: '', badge: '', isFeatured: false, isBestSeller: false, isActive: true, stock: '', category: '' };
const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getImgSrc = (img) => {
  if (!img) return null;
  const url = typeof img === 'string' ? img : img.url;
  return url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;
};

export default function Products() {
  const dispatch = useDispatch();
  const { products, total, loading } = useSelector(s => s.products);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [existingImages, setExistingImages] = useState([]); // {public_id, url}
  const [newFiles, setNewFiles] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // blob URLs
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(fetchAdminProducts());
    api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
  }, [dispatch]);

  // Clean up blob URLs
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setExistingImages([]); setNewFiles([]); setPreviews([]); setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, sku: p.sku, price: p.price, discountPrice: p.discountPrice || '', shortDescription: p.shortDescription || '', description: p.description || '', weight: p.weight || '', badge: p.badge || '', isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isActive: p.isActive, stock: p.stock, category: p.category?._id || '' });
    setExistingImages(p.images || []);
    setNewFiles([]); setPreviews([]);
    setModal(true);
  };

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.name) && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) toast.error('Some files skipped (must be jpg/png/webp ≤5MB)');
    setNewFiles(prev => [...prev, ...valid]);
    setPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))]);
  };

  const removeNewFile = (i) => {
    URL.revokeObjectURL(previews[i]);
    setNewFiles(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = async (img) => {
    if (!editing) { setExistingImages(imgs => imgs.filter(x => x !== img)); return; }
    try {
      await api.delete(`/products/${editing}/images/${encodeURIComponent(img.public_id || img.url?.split('/').pop())}`);
      setExistingImages(imgs => imgs.filter(x => x !== img));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price || !form.category) { toast.error('Name, SKU, Price and Category are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newFiles.forEach(f => fd.append('images', f));

      if (editing) {
        await api.put(`/products/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      setModal(false);
      dispatch(fetchAdminProducts());
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await dispatch(deleteProduct(id)).unwrap();
    toast.success('Product deleted');
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Products</h1><p style={{ color: '#6b7280' }}>{total} total products</p></div>
        <button onClick={openCreate} className="btn btn-primary">+ Add Product</button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input" style={{ maxWidth: 300 }} />
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, background: '#f8f9fa', borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getImgSrc(p.images?.[0]) ? <img src={getImgSrc(p.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 20 }}>💊</span>}
                      </div>
                      <div><div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>SKU: {p.sku}</div></div>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>{p.category?.name}</span></td>
                  <td><div style={{ fontWeight: 700 }}>₹{p.discountPrice?.toLocaleString() || p.price?.toLocaleString()}</div>{p.discountPrice ? <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>₹{p.price?.toLocaleString()}</div> : null}</td>
                  <td><span style={{ fontWeight: 700, color: p.stock > 20 ? '#10b981' : p.stock > 0 ? '#f59e0b' : '#ef4444' }}>{p.stock}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.isFeatured && <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Featured</span>}
                      {p.isBestSeller && <span className="badge" style={{ background: '#dcfce7', color: '#14532d' }}>Best Seller</span>}
                      {!p.isActive && <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Inactive</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} className="btn btn-info" style={{ padding: '6px 12px', fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 700, maxHeight: '92vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>

            {/* Image Upload Area */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 8 }}>Product Images (jpg, png, webp — max 5MB each)</label>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {existingImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                      <img src={getImgSrc(img)} alt="" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8f9fa' }} />
                      <button onClick={() => removeExistingImage(img)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* New file previews */}
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                      <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '2px solid #f59e0b', background: '#f8f9fa' }} />
                      <button onClick={() => removeNewFile(i)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? '#f59e0b' : '#d1d5db'}`, borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#fffbeb' : '#fafafa', transition: 'all 0.2s' }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Drag & drop images here, or <span style={{ color: '#f59e0b', fontWeight: 700 }}>click to browse</span></div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>JPG, PNG, WebP · Max 5MB · Up to 6 images</div>
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['name', 'Product Name *', 'text'], ['sku', 'SKU *', 'text'], ['price', 'Price (₹) *', 'number'], ['discountPrice', 'Discount Price (₹)', 'number'], ['stock', 'Stock *', 'number'], ['weight', 'Weight/Size', 'text']].map(([k, l, t]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="input" />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Badge</label>
                <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className="input">
                  {['', 'Best Seller', 'New', 'Top Rated', 'Popular', 'Hot', 'Vegan', 'Sale'].map(b => <option key={b} value={b}>{b || 'No Badge'}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Short Description</label>
                <input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} className="input" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Full Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[['isFeatured', 'Featured'], ['isBestSeller', 'Best Seller'], ['isActive', 'Active']].map(([k, l]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <input type="checkbox" checked={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} /> {l}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}</button>
              <button onClick={() => setModal(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
