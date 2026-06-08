import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App';
import './styles/admin.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px' } }} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
