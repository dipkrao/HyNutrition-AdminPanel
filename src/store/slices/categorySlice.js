import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/categories'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createCategory = createAsyncThunk('categories/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/categories/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { categories: [], loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchCategories.pending, s => { s.loading = true; })
     .addCase(fetchCategories.fulfilled, (s, a) => { s.loading = false; s.categories = a.payload.categories; })
     .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(createCategory.fulfilled, (s, a) => { s.categories.unshift(a.payload.category); })
     .addCase(updateCategory.fulfilled, (s, a) => {
       const i = s.categories.findIndex(c => c._id === a.payload.category._id);
       if (i !== -1) s.categories[i] = a.payload.category;
     })
     .addCase(deleteCategory.fulfilled, (s, a) => { s.categories = s.categories.filter(c => c._id !== a.payload); });
  },
});

export default categorySlice.reducer;
