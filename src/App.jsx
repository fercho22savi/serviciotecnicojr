
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase/config';
import { Toaster } from 'react-hot-toast';

// Import Pages and Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';

// Account Imports
import Account from './pages/Account';
import Profile from './pages/account/Profile';
import Orders from './pages/account/Orders';
import OrderDetail from './pages/account/OrderDetail';
import Addresses from './pages/account/Addresses';
import PaymentMethods from './pages/account/PaymentMethods';
import Security from './pages/account/Security';
import Preferences from './pages/account/Preferences';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminDashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import ProductForm from './pages/admin/ProductForm';
import OrderManagement from './pages/admin/OrderManagement';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import CouponManagement from './pages/admin/CouponManagement';
import ReviewManagement from './pages/admin/ReviewManagement';

// Import Routes
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import { CircularProgress, Box, Container } from '@mui/material';

// Static categories list
const CATEGORIES = ['Todas', 'Portátiles', 'Smartphones', 'Accesorios', 'Gaming', 'Oficina'];

function AppContent() {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const isLoggedIn = !!user;

  useEffect(() => {
    let isMounted = true;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then(docSnap => {
        if (isMounted && docSnap.exists() && docSnap.data().wishlist) {
          setWishlist(new Set(docSnap.data().wishlist));
        }
      });
    } else {
      setWishlist(new Set());
      setCart([]);
    }
    return () => { isMounted = false; };
  }, [user]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleCategoryChange = (event) => setSelectedCategory(event.target.value);

  const handleAddToCart = (productToAdd, quantity = 1) => {
    setCart(prevCart => {
      const isProductInCart = prevCart.find(item => item.id === productToAdd.id);
      if (isProductInCart) {
        return prevCart.map(item =>
          item.id === productToAdd.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...productToAdd, quantity }];
    });
  };

  const handleWishlist = async (productId) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const newWishlist = new Set(wishlist);
    let updatedWishlist;
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      updatedWishlist = arrayRemove(productId);
    } else {
      newWishlist.add(productId);
      updatedWishlist = arrayUnion(productId);
    }
    setWishlist(newWishlist);
    await updateDoc(userRef, { wishlist: updatedWishlist });
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toaster position="bottom-right" />
      <Header
        cartItemCount={cartItemCount}
        wishlistCount={wishlist.size}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
      />
      <Container component="main" sx={{ flex: '1 0 auto', pt: 4, pb: 4 }}>
        <Routes>
          <Route path="/" element={<Home addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} isLoggedIn={isLoggedIn} />} />
          <Route path="/products" element={<ProductsPage searchTerm={searchTerm} selectedCategory={selectedCategory} addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} isLoggedIn={isLoggedIn} />} />
          <Route path="/product/:productId" element={<ProductDetail addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} isLoggedIn={isLoggedIn} />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} user={user} isLoggedIn={isLoggedIn} />} />
          <Route path="/wishlist" element={<Wishlist wishlist={wishlist} handleWishlist={handleWishlist} addToCart={handleAddToCart} isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="payment-methods" element={<PaymentMethods />} />
              <Route path="security" element={<Security />} />
              <Route path="preferences" element={<Preferences />} />
            </Route>
            <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <AppContent />
    </Suspense>
  );
}

export default App;
