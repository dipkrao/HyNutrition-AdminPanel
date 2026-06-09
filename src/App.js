import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminGetMe } from './store/slices/authSlice';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Coupons from './pages/Coupons';
import Banners from './pages/Banners';
import Analytics from './pages/Analytics';
import Reviews from './pages/Reviews';
import Newsletter from './pages/Newsletter';
import Settings from './pages/Settings';
import Blogs from './pages/Blogs';
import BlogFrontend from './pages/BlogFrontend';
import BlogDetail from './pages/BlogDetail';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector(s => s.auth);
  return (isAuthenticated || token) ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);
  useEffect(() => { if (token) dispatch(adminGetMe()); }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Public Blog Routes */}
      <Route path="/blog" element={<BlogFrontend />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      {/* Admin Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<Users />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/banners" element={<Banners />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
