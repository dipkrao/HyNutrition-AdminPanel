import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
export const fetchAdminUsers = createAsyncThunk('users/fetchAll', async (p = {}, { rejectWithValue }) => {
  try { const res = await api.get('/users', { params: p }); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const blockUser = createAsyncThunk('users/block', async ({ id, isBlocked }, { rejectWithValue }) => {
  try { const res = await api.put(`/users/${id}/block`, { isBlocked }); return res.data; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});
const userSlice = createSlice({
  name: 'users', initialState: { users: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchAdminUsers.pending, s => { s.loading = true; })
     .addCase(fetchAdminUsers.fulfilled, (s, a) => { s.loading = false; s.users = a.payload.users; s.total = a.payload.total; })
     .addCase(fetchAdminUsers.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(blockUser.fulfilled, (s, a) => { const i = s.users.findIndex(u => u._id === a.payload.user._id); if (i !== -1) s.users[i] = a.payload.user; });
  },
});
export default userSlice.reducer;
