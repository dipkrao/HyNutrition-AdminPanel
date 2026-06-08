import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
export const fetchAdminProducts = createAsyncThunk('products/fetchAll', async (p = {}, { rejectWithValue }) => {
  try { const res = await api.get('/products', { params: { ...p, limit: 50 } }); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const createProduct = createAsyncThunk('products/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/products', data); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const updateProduct = createAsyncThunk('products/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/products/${id}`, data); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/products/${id}`); return id; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
const productSlice = createSlice({
  name: 'products', initialState: { products: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchAdminProducts.pending, s => { s.loading = true; })
     .addCase(fetchAdminProducts.fulfilled, (s, a) => { s.loading = false; s.products = a.payload.products; s.total = a.payload.total; })
     .addCase(fetchAdminProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(deleteProduct.fulfilled, (s, a) => { s.products = s.products.filter(p => p._id !== a.payload); })
     .addCase(updateProduct.fulfilled, (s, a) => { const i = s.products.findIndex(p => p._id === a.payload.product._id); if (i !== -1) s.products[i] = a.payload.product; })
     .addCase(createProduct.fulfilled, (s, a) => { s.products.unshift(a.payload.product); });
  },
});
export default productSlice.reducer;
