
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';

// Firebase
import { auth, db } from './firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Context
import { useAuth } from './context/AuthContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'; // <-- Importado

// Layouts
import MainLayout from './components/MainLayout';
import AccountLayout from './components/AccountLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/SignUp.jsx';
import CartPage from './pages/Cart.jsx';
import CheckoutPage from './pages/Checkout.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';

// Account Pages
import AccountDashboard from './pages/account/AccountDashboard.jsx';
import OrderHistory from './pages/account/Orders.jsx';
import OrderDetail from './pages/account/OrderDetail.jsx';
import WishlistPage from './pages/account/WishlistPage.jsx';
import RecentlyViewedPage from './pages/account/RecentlyViewedPage.jsx';
import UserProfile from './pages/UserProfile.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import OrderManagement from './pages/admin/OrderManagement.jsx';
import OrderDetailPage from './pages/admin/OrderDetailPage.jsx';
import UserManagement from './pages/admin/UserManagementPage.jsx';
import CouponManagement from './pages/admin/CouponManagement.jsx';
import ReviewManagementPage from './pages/admin/ReviewManagementPage.jsx';

const App = () => {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          setIsAdmin(userDoc.exists() && userDoc.data().role === 'admin');
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
      setCheckingAdmin(false);
    };
    if (!loading) checkAdminStatus();
  }, [currentUser, loading]);

  if (loading || checkingAdmin) {
    return <div>Cargando...</div>; // Replace with a proper spinner component
  }

  const AdminRoute = ({ children }) => (isAdmin ? children : <Navigate to="/" />);
  const AuthenticatedRoute = ({ children }) => (currentUser ? children : <Navigate to="/login" />);

  return (
    <RecentlyViewedProvider> { /* <-- Envuelve la aplicación */}
      <Routes>
        {/* Main Layout for public pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<AuthenticatedRoute><CheckoutPage /></AuthenticatedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        </Route>

        {/* Standalone pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Account Layout */}
        <Route path="/account" element={<AuthenticatedRoute><AccountLayout /></AuthenticatedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AccountDashboard />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="recently-viewed" element={<RecentlyViewedPage />} />
        </Route>

        {/* Admin Layout */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="reviews" element={<ReviewManagementPage />} />
        </Route>

        {/* Not Found Page */}
        <Route path="*" element={<Typography variant="h4" align="center" sx={{ mt: 5 }}>404 - Página no encontrada</Typography>} />
      </Routes>
    </RecentlyViewedProvider>
  );
};

export default App;
