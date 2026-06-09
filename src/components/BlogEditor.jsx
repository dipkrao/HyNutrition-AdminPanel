import React, { useState, useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useDispatch, useSelector } from 'react-redux';
import { createBlog, updateBlog, clearCurrent } from '../store/slices/blogSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Nutrition', 'Fitness', 'Recipes', 'Supplements', 'Wellness', 'Weight Loss'];

const toSlug = str =>
  str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function BlogEditor({ editBlog, onClose }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(s => s.blogs);
  const { user } = useSelector(s => s.auth);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    featuredImage: '', featuredImageAlt: '',
    category: '', tags: '', status: 'draft',
    metaTitle: '', metaDescription: '',
  });
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (editBlog) {
      setForm({
        title: editBlog.title || '',
        slug: editBlog.slug || '',
        excerpt: editBlog.excerpt || '',
        content: editBlog.content || '',
        featuredImage: editBlog.featuredImage || '',
        featuredImageAlt: editBlog.featuredImageAlt || '',
        category: editBlog.category || '',
        tags: Array.isArray(editBlog.tags) ? editBlog.tags.join(', ') : '',
        status: editBlog.status || 'draft',
        metaTitle: editBlog.metaTitle || '',
        metaDescription: editBlog.metaDescription || '',
      });
      setSlugManual(true);
    }
  }, [editBlog]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTitle = e => {
    const val = e.target.value;
    set('title', val);
    if (!slugManual) set('slug', toSlug(val));
    if (!form.metaTitle) set('metaTitle', val);
  };

  const handleSlug = e => {
    setSlugManual(true);
    set('slug', toSlug(e.target.value));
  };

  const handleSubmit = async (status) => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.slug.trim()) return toast.error('Slug is required');
    if (!form.content.trim()) return toast.error('Content is required');

    const payload = {
      ...form,
      status,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: user?.name || 'Admin',
      metaTitle: form.metaTitle || form.title,
      metaDescription: form.metaDescription || form.excerpt,
    };

    const action = editBlog
      ? updateBlog({ id: editBlog._id, data: payload })
      : createBlog(payload);

    const res = await dispatch(action);
    if (res.error) return toast.error(res.payload || 'Failed');

    toast.success(editBlog ? 'Blog updated!' : `Blog ${status === 'published' ? 'published' : 'saved as draft'}!`);
    dispatch(clearCurrent());
    onClose();
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>{editBlog ? 'Edit Blog Post' : 'New Blog Post'}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>✕</button>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input className="input" value={form.title} onChange={handleTitle} placeholder="Blog post title..." />
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>Slug (URL) *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }}>/blog/</span>
            <input className="input" style={{ paddingLeft: 52 }} value={form.slug} onChange={handleSlug} placeholder="auto-generated-from-title" />
          </div>
        </div>

        {/* Category + Tags */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="protein, muscle, diet..." />
          </div>
        </div>

        {/* Featured Image Upload */}
        <div>
          <label style={labelStyle}>Featured Image</label>
          <ImageUploader
            value={form.featuredImage}
            alt={form.featuredImageAlt}
            onUpload={(url) => set('featuredImage', url)}
            onAltChange={(v) => set('featuredImageAlt', v)}
            onRemove={() => { set('featuredImage', ''); set('featuredImageAlt', ''); }}
          />
        </div>

        {/* Excerpt */}
        <div>
          <label style={labelStyle}>Excerpt</label>
          <textarea className="input" rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Short description shown in blog listings..." style={{ resize: 'vertical' }} />
        </div>

        {/* Content - Rich Markdown Editor */}
        <div data-color-mode="light">
          <label style={labelStyle}>Content * (Markdown)</label>
          <MDEditor value={form.content} onChange={v => set('content', v || '')} height={380} preview="edit" />
        </div>

        {/* SEO Section */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔍 SEO Settings</div>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={labelStyle}>Meta Title <span style={{ color: '#9ca3af', fontWeight: 400 }}>(falls back to title)</span></label>
              <input className="input" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} placeholder={form.title || 'SEO title...'} maxLength={60} />
              <div style={{ fontSize: 11, color: form.metaTitle.length > 55 ? '#ef4444' : '#9ca3af', marginTop: 4 }}>{form.metaTitle.length}/60 chars</div>
            </div>
            <div>
              <label style={labelStyle}>Meta Description <span style={{ color: '#9ca3af', fontWeight: 400 }}>(falls back to excerpt)</span></label>
              <textarea className="input" rows={2} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} placeholder={form.excerpt || 'SEO description...'} maxLength={160} style={{ resize: 'none' }} />
              <div style={{ fontSize: 11, color: form.metaDescription.length > 150 ? '#ef4444' : '#9ca3af', marginTop: 4 }}>{form.metaDescription.length}/160 chars</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
          <button onClick={onClose} className="btn" style={{ background: '#f3f4f6', color: '#374151' }}>Cancel</button>
          <button onClick={() => handleSubmit('draft')} className="btn" style={{ background: '#f3f4f6', color: '#374151' }} disabled={loading}>
            {loading ? '...' : '💾 Save Draft'}
          </button>
          <button onClick={() => handleSubmit('published')} className="btn btn-primary" disabled={loading}>
            {loading ? '...' : '🚀 Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

function ImageUploader({ value, alt, onUpload, onAltChange, onRemove }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only image files allowed');
    if (file.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB');

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/uploads/blog', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fullUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${res.data.url}`;
      onUpload(fullUrl);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  if (value) {
    return (
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <img src={value} alt={alt || 'Featured'} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: '10px 12px', background: '#f8fafc', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="input"
            style={{ flex: 1, fontSize: 13, padding: '7px 10px' }}
            placeholder="Alt text (describe the image for SEO)"
            value={alt || ''}
            onChange={e => onAltChange(e.target.value)}
          />
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-danger"
            style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0 }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current.click()}
      style={{
        border: `2px dashed ${dragOver ? '#f59e0b' : '#d1d5db'}`,
        borderRadius: 10,
        padding: '36px 20px',
        textAlign: 'center',
        cursor: uploading ? 'wait' : 'pointer',
        background: dragOver ? '#fffbeb' : '#fafafa',
        transition: 'all 0.2s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => upload(e.target.files[0])}
      />
      {uploading ? (
        <><div className="spinner" style={{ margin: '0 auto 10px' }} /><p style={{ color: '#6b7280', fontSize: 14 }}>Uploading...</p></>
      ) : (
        <>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🖼️</div>
          <p style={{ fontWeight: 600, color: '#374151', fontSize: 14, marginBottom: 4 }}>Click to upload or drag & drop</p>
          <p style={{ color: '#9ca3af', fontSize: 12 }}>JPG, PNG, WEBP — max 5MB</p>
        </>
      )}
    </div>
  );
}
