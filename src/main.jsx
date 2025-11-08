import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ProductProvider } from './context/ProductContext';

import './i18n';
import './index.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const GlobalSuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
    <h1>Cargando...</h1>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<GlobalSuspenseFallback />}>
      <Elements stripe={stripePromise}>
        <CustomThemeProvider>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    <CurrencyProvider>
                      <App />
                    </CurrencyProvider>
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
          <Toaster position="bottom-right" reverseOrder={false} />
        </CustomThemeProvider>
      </Elements>
    </Suspense>
  </React.StrictMode>
);
