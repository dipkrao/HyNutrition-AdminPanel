import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import toast from 'react-hot-toast';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const EMPTY = { name: '', description: '', icon: '💊', isFeatured: false, isActive: true, parentCategory: '', metaTitle: '', metaDescription: '' };

const imgSrc = (img) => img ? (img.startsWith('http') ? img : `${API_BASE}${img}`) : null;

export default function Categories() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(s => s.categories);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setImagePreview(null); setModal(true); };

  const openEdit = (cat) => {
    setEditing(cat._id);
    setForm({
      name: cat.name, description: cat.description || '', icon: cat.icon || '💊',
      isFeatured: cat.isFeatured, isActive: cat.isActive,
      parentCategory: cat.parentCategory?._id || '',
      metaTitle: cat.metaTitle || '', metaDescription: cat.metaDescription || '',
    });
    setImageFile(null);
    setImagePreview(imgSrc(cat.image));
    setModal(true);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be ≤ 5MB'); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await dispatch(updateCategory({ id: editing, data: fd })).unwrap();
        toast.success('Category updated!');
      } else {
        await dispatch(createCategory(fd)).unwrap();
        toast.success('Category created!');
      }
      setModal(false);
    } catch (err) { toast.error(err || 'Error saving category'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? Products in this category will be uncategorised.`)) return;
    try { await dispatch(deleteCategory(id)).unwrap(); toast.success('Category deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const parentOptions = categories.filter(c => !editing || c._id !== editing);
  const filtered = categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Categories</h1>
          <p style={{ color: '#6b7280' }}>{categories.length} total categories</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">+ Add Category</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..." className="input" style={{ maxWidth: 300 }} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead>
              <tr><th>Category</th><th>Parent</th><th>Products</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(cat => (
                <tr key={cat._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#f8f9fa', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {imgSrc(cat.image)
                          ? <img src={imgSrc(cat.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 22 }}>{cat.icon || '💊'}</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>/category/{cat.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 13, color: '#6b7280' }}>{cat.parentCategory?.name || '—'}</span></td>
                  <td><span style={{ fontWeight: 700 }}>{cat.productCount || 0}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: cat.isActive ? '#dcfce7' : '#fee2e2', color: cat.isActive ? '#14532d' : '#991b1b' }}>{cat.isActive ? 'Active' : 'Inactive'}</span>
                      {cat.isFeatured && <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Featured</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(cat)} className="btn btn-info" style={{ padding: '6px 12px', fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDelete(cat._id, cat.name)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No categories found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>{editing ? 'Edit Category' : 'Add New Category'}</h2>

            {/* Image Upload */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 8 }}>Category Image (jpg, png, webp — max 5MB)</label>
              {imagePreview && (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                  <img src={imagePreview} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              )}
              <div onClick={() => fileRef.current?.click()}
                style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🖼️</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Click to upload image</div>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleFile} />
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Category Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Whey Protein" />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Icon (emoji)</label>
                <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input" placeholder="💊" />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Parent Category</label>
                <select value={form.parentCategory} onChange={e => setForm(f => ({ ...f, parentCategory: e.target.value }))} className="input">
                  <option value="">None (Top Level)</option>
                  {parentOptions.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input" style={{ resize: 'vertical' }} placeholder="Short category description..." />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>SEO Meta Title</label>
                <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="input" placeholder="Buy Whey Protein Online | HY Nutrition" />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>SEO Meta Description</label>
                <textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={2} className="input" style={{ resize: 'vertical' }} placeholder="Shop premium whey protein supplements..." />
              </div>

              <div style={{ display: 'flex', gap: 24, gridColumn: '1/-1' }}>
                {[['isFeatured', 'Featured'], ['isActive', 'Active']].map(([k, l]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <input type="checkbox" checked={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} /> {l}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
              </button>
              <button onClick={() => setModal(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
