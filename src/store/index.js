import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import userSlice from './slices/userSlice';
import categorySlice from './slices/categorySlice';

export default configureStore({
  reducer: { auth: authSlice, dashboard: dashboardSlice, products: productSlice, orders: orderSlice, users: userSlice, categories: categorySlice },
  middleware: g => g({ serializableCheck: false }),
});
