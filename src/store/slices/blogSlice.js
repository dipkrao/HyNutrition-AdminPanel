import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchBlogs = createAsyncThunk('blogs/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/blogs', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch blogs'); }
});

export const fetchBlogBySlug = createAsyncThunk('blogs/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/blogs/${slug}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Blog not found'); }
});

export const createBlog = createAsyncThunk('blogs/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/blogs', data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create blog'); }
});

export const updateBlog = createAsyncThunk('blogs/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/blogs/${id}`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update blog'); }
});

export const deleteBlog = createAsyncThunk('blogs/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/blogs/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete blog'); }
});

export const fetchPublishedBlogs = createAsyncThunk('blogs/fetchPublished', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/blogs/published', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch blogs'); }
});

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    list: [], current: null, published: [],
    loading: false, error: null, total: 0,
  },
  reducers: {
    clearCurrent: s => { s.current = null; },
    clearError: s => { s.error = null; },
  },
  extraReducers: b => {
    const pending = s => { s.loading = true; s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    b.addCase(fetchBlogs.pending, pending)
     .addCase(fetchBlogs.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.blogs; s.total = a.payload.total; })
     .addCase(fetchBlogs.rejected, rejected)

     .addCase(fetchPublishedBlogs.pending, pending)
     .addCase(fetchPublishedBlogs.fulfilled, (s, a) => { s.loading = false; s.published = a.payload.blogs; s.total = a.payload.total; })
     .addCase(fetchPublishedBlogs.rejected, rejected)

     .addCase(fetchBlogBySlug.pending, pending)
     .addCase(fetchBlogBySlug.fulfilled, (s, a) => { s.loading = false; s.current = a.payload.blog; })
     .addCase(fetchBlogBySlug.rejected, rejected)

     .addCase(createBlog.pending, pending)
     .addCase(createBlog.fulfilled, (s, a) => { s.loading = false; s.list.unshift(a.payload.blog); })
     .addCase(createBlog.rejected, rejected)

     .addCase(updateBlog.pending, pending)
     .addCase(updateBlog.fulfilled, (s, a) => {
       s.loading = false;
       const idx = s.list.findIndex(b => b._id === a.payload.blog._id);
       if (idx !== -1) s.list[idx] = a.payload.blog;
       s.current = a.payload.blog;
     })
     .addCase(updateBlog.rejected, rejected)

     .addCase(deleteBlog.pending, pending)
     .addCase(deleteBlog.fulfilled, (s, a) => { s.loading = false; s.list = s.list.filter(b => b._id !== a.payload); })
     .addCase(deleteBlog.rejected, rejected);
  },
});

export const { clearCurrent, clearError } = blogSlice.actions;
export default blogSlice.reducer;
