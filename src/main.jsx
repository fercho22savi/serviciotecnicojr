import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Toaster } from 'react-hot-toast';
import './i18n';
import './index.css';

// A simple, non-MUI fallback component for Suspense
const GlobalSuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
    <h1>Loading...</h1>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Reordered Providers: Cart and Wishlist now wrap Auth */}
        <CartProvider>
          <WishlistProvider>
            <AuthProvider>
              <Suspense fallback={<GlobalSuspenseFallback />}>
                <App />
              </Suspense>
              <Toaster position="bottom-right" reverseOrder={false} />
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </ThemeContextProvider>
  </React.StrictMode>
);
