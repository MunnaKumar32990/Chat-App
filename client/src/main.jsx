import React from 'react'
import ReactDOM from "react-dom/client"
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from 'react-hot-toast';
import App from './App.jsx'
import AuthProvider from './context/AuthProvider';
import SocketProvider from './context/SocketProvider';
import { registerSW } from './registerSW';
import './index.css';

// Register service worker for PWA
registerSW();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
            <Toaster position="top-center" />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
