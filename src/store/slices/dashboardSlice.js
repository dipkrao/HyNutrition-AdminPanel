import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/dashboard/stats'); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
const dashboardSlice = createSlice({
  name: 'dashboard', initialState: { stats: null, recentOrders: [], topProducts: [], revenueByMonth: [], ordersByStatus: [], loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchDashboard.pending, s => { s.loading = true; })
     .addCase(fetchDashboard.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload.stats; s.recentOrders = a.payload.recentOrders; s.topProducts = a.payload.topProducts; s.revenueByMonth = a.payload.revenueByMonth; s.ordersByStatus = a.payload.ordersByStatus; })
     .addCase(fetchDashboard.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});
export default dashboardSlice.reducer;
