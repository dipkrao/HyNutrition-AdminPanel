import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, deleteBlog, updateBlog } from '../store/slices/blogSlice';
import BlogEditor from '../components/BlogEditor';
import toast from 'react-hot-toast';

const STATUS_COLORS = { published: { bg: '#dcfce7', color: '#166534' }, draft: { bg: '#fef9c3', color: '#854d0e' } };

export default function Blogs() {
  const dispatch = useDispatch();
  const { list, loading, total } = useSelector(s => s.blogs);
  const [view, setView] = useState('list'); // 'list' | 'editor'
  const [editBlog, setEditBlog] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchBlogs({ search, status: statusFilter, page, limit }));
  }, [dispatch, search, statusFilter, page]);

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return;
    const res = await dispatch(deleteBlog(blog._id));
    if (!res.error) toast.success('Blog deleted');
    else toast.error(res.payload);
  };

  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    const res = await dispatch(updateBlog({ id: blog._id, data: { ...blog, status: newStatus } }));
    if (!res.error) toast.success(`Moved to ${newStatus}`);
  };

  const handleEdit = (blog) => {
    setEditBlog(blog);
    setView('editor');
  };

  const handleClose = () => {
    setEditBlog(null);
    setView('list');
    dispatch(fetchBlogs({ search, status: statusFilter, page, limit }));
  };

  if (view === 'editor') {
    return <BlogEditor editBlog={editBlog} onClose={handleClose} />;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Blog Posts</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{total} total posts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditBlog(null); setView('editor'); }}>
          + New Post
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="🔍 Search posts..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input" style={{ width: 160 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner" />
        ) : list.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <div>No blog posts found. Create your first post!</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(blog => (
                <tr key={blog._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {blog.featuredImage && (
                        <img src={blog.featuredImage} alt={blog.featuredImageAlt || blog.title} style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, maxWidth: 280 }}>{blog.title}</div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>/blog/{blog.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 13, color: '#374151' }}>{blog.category || '—'}</span></td>
                  <td>
                    <span className="badge" style={STATUS_COLORS[blog.status] || STATUS_COLORS.draft}>
                      {blog.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{blog.author || '—'}</td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-info" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleEdit(blog)}>Edit</button>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: 12, background: blog.status === 'published' ? '#fef9c3' : '#dcfce7', color: blog.status === 'published' ? '#854d0e' : '#166534' }} onClick={() => handleToggleStatus(blog)}>
                        {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleDelete(blog)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn" style={{ background: '#f3f4f6', padding: '8px 16px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ padding: '8px 16px', fontSize: 14, color: '#6b7280' }}>Page {page} of {totalPages}</span>
          <button className="btn" style={{ background: '#f3f4f6', padding: '8px 16px' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
