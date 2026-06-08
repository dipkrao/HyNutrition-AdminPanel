import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, blockUser } from '../store/slices/userSlice';
import toast from 'react-hot-toast';

export default function Users() {
  const dispatch = useDispatch();
  const { users, total, loading } = useSelector(s => s.users);
  const [search, setSearch] = useState('');
  useEffect(() => { dispatch(fetchAdminUsers()); }, [dispatch]);

  const handleBlock = async (id, isBlocked) => {
    await dispatch(blockUser({ id, isBlocked })).unwrap();
    toast.success(`User ${isBlocked ? 'blocked' : 'unblocked'}`);
  };

  const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Users</h1>
        <p style={{ color: '#6b7280' }}>{total} registered customers</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input" style={{ maxWidth: 320, marginBottom: 20 }} />
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead><tr><th>User</th><th>Phone</th><th>Joined</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{u.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div><div style={{ fontSize: 12, color: '#9ca3af' }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className="badge" style={{ background: u.role === 'admin' || u.role === 'superadmin' ? '#dbeafe' : '#f3f4f6', color: u.role === 'admin' || u.role === 'superadmin' ? '#1e40af' : '#374151' }}>{u.role}</span></td>
                  <td><span className="badge" style={{ background: u.isBlocked ? '#fee2e2' : '#dcfce7', color: u.isBlocked ? '#991b1b' : '#14532d' }}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                  <td>
                    <button onClick={() => handleBlock(u._id, !u.isBlocked)} className={u.isBlocked ? 'btn' : 'btn btn-danger'} style={{ padding: '6px 12px', fontSize: 12, background: u.isBlocked ? '#dcfce7' : undefined, color: u.isBlocked ? '#14532d' : undefined }}>
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
