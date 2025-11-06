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

import './i18n';
import './index.css';

// Use a public test key from Stripe's documentation
const stripePromise = loadStripe('pk_test_51H5a2XFAB4a4YpQZ3i1d1a1S1s7q1a1s7q1a1s7q1a1s7q1a1s7q1a1s7q1a1s7q1a1s7q1a1S1s7q1a1s7q1a1');

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
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <CurrencyProvider>
                    <App />
                    <Toaster position="bottom-right" reverseOrder={false} />
                  </CurrencyProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CustomThemeProvider>
      </Elements>
    </Suspense>
  </React.StrictMode>
);
