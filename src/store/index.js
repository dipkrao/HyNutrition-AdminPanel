import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import userSlice from './slices/userSlice';
import categorySlice from './slices/categorySlice';
import blogSlice from './slices/blogSlice';

export default configureStore({
  reducer: { auth: authSlice, dashboard: dashboardSlice, products: productSlice, orders: orderSlice, users: userSlice, categories: categorySlice, blogs: blogSlice },
  middleware: g => g({ serializableCheck: false }),
});
