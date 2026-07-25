// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. Bổ sung import này
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './store/AuthContext.jsx';
import { LanguageProvider } from './store/LanguageContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Bọc BrowserRouter xung quanh toàn bộ ứng dụng */}
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);