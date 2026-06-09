import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const NAV = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/products', icon: '📦', label: 'Products' },
  { path: '/categories', icon: '🗂️', label: 'Categories' },
  { path: '/orders', icon: '🛒', label: 'Orders' },
  { path: '/users', icon: '👥', label: 'Users' },
  { path: '/coupons', icon: '🏷️', label: 'Coupons' },
  { path: '/banners', icon: '🖼️', label: 'Banners' },
  { path: '/blogs', icon: '📝', label: 'Blog Posts' },
  { path: '/reviews', icon: '⭐', label: 'Reviews' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/newsletter', icon: '📧', label: 'Newsletter' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = () => {
    dispatch(adminLogout());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💪</div>
            <div>
              <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: 14 }}>HY Admin</div>
              <div style={{ color: '#6b7280', fontSize: 10 }}>Management Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map(({ path, icon, label }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link key={path} to={path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2, background: active ? '#1a1a1a' : 'transparent', color: active ? '#f59e0b' : '#9ca3af', fontSize: 13, fontWeight: active ? 700 : 400, transition: 'all 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#111'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontSize: 16 }}>{icon}</span>{label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1a1a1a' }}>
          {user && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{user.name?.[0]}</div>
            <div><div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{user.name}</div><div style={{ color: '#6b7280', fontSize: 10 }}>{user.role}</div></div>
          </div>}
          <button onClick={handleLogout} style={{ width: '100%', background: '#1a1a1a', color: '#9ca3af', border: '1px solid #333', padding: '8px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>← Logout</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
