import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/App.jsx';
import './styles/index.css';

import { attachAuthStore } from './api/client.js';
import { useAuthStore } from './store/authStore.js';

// Connect Zustand auth store with Axios API client
attachAuthStore(useAuthStore);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

