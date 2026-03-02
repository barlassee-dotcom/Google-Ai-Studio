import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Uygulama başlatılırken hata oluştu:", error);
    container.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Uygulama Başlatılamadı</h2>
      <p>Bir yükleme hatası oluştu. Lütfen sayfayı yenileyiniz veya konsol çıktılarını kontrol ediniz.</p>
    </div>`;
  }
} else {
  console.error("Root element bulunamadı");
}