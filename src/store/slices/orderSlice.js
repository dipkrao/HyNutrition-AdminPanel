import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
export const fetchAdminOrders = createAsyncThunk('orders/fetchAll', async (p = {}, { rejectWithValue }) => {
  try { const res = await api.get('/orders', { params: p }); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/orders/${id}/status`, data); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
const orderSlice = createSlice({
  name: 'orders', initialState: { orders: [], total: 0, totalPages: 1, loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchAdminOrders.pending, s => { s.loading = true; })
     .addCase(fetchAdminOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload.orders; s.total = a.payload.total; s.totalPages = a.payload.totalPages; })
     .addCase(fetchAdminOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(updateOrderStatus.fulfilled, (s, a) => { const i = s.orders.findIndex(o => o._id === a.payload.order._id); if (i !== -1) s.orders[i] = a.payload.order; });
  },
});
export default orderSlice.reducer;
