import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
export const adminLogin = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    if (!['admin','superadmin'].includes(res.data.user.role)) return rejectWithValue('Access denied: Admins only');
    localStorage.setItem('admin_token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});
export const adminGetMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/auth/me'); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const adminLogout = createAsyncThunk('auth/logout', async () => { localStorage.removeItem('admin_token'); });
const authSlice = createSlice({
  name: 'auth', initialState: { user: null, token: localStorage.getItem('admin_token'), isAuthenticated: false, loading: false, error: null },
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: b => {
    b.addCase(adminLogin.pending, s => { s.loading = true; s.error = null; })
     .addCase(adminLogin.fulfilled, (s, a) => { s.loading = false; s.isAuthenticated = true; s.user = a.payload.user; s.token = a.payload.token; })
     .addCase(adminLogin.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(adminGetMe.fulfilled, (s, a) => { s.isAuthenticated = true; s.user = a.payload.user; })
     .addCase(adminGetMe.rejected, s => { s.isAuthenticated = false; s.user = null; s.token = null; localStorage.removeItem('admin_token'); })
     .addCase(adminLogout.fulfilled, s => { s.user = null; s.token = null; s.isAuthenticated = false; });
  },
});
export const { clearError } = authSlice.actions;
export default authSlice.reducer;
