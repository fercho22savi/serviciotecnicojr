import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import toast from 'react-hot-toast';

// --- CONTEXTS AND THEME ---
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { createMuiTheme } from './theme';

// --- CORE COMPONENTS ---
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// --- LAZY LOADED PAGES ---
const Home = lazy(() => import('./pages/Home'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage')); // Nueva página
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage')); // Nueva página

// Account Pages
const Account = lazy(() => import('./pages/Account'));
const Profile = lazy(() => import('./pages/account/Profile'));
const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const PaymentMethods = lazy(() => import('./pages/account/PaymentMethods'));
const Security = lazy(() => import('./pages/account/Security'));
const Preferences = lazy(() => import('./pages/account/Preferences'));

// Admin Pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const OrderManagement = lazy(() => import('./pages/admin/OrderManagement'));
const OrderDetailPage = lazy(() => import('./pages/admin/OrderDetailPage'));
const CouponManagement = lazy(() => import('./pages/admin/CouponManagement'));
const ReviewManagement = lazy(() => import('./pages/admin/ReviewManagement'));


const App = () => {
  const { mode } = useTheme();
  const theme = createMuiTheme(mode);
  const navigate = useNavigate();

  // --- CENTRALIZED STATE MANAGEMENT ---
  const { currentUser, isAdmin } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, cartItemCount } = useCart();
  const { wishlistItems, toggleWishlistItem, wishlistItemCount } = useWishlist();

  // State for search, category, and new filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const isLoggedIn = !!currentUser;
  const wishlistSet = new Set(wishlistItems.map(item => item.id));

  const handleWishlistToggle = (product) => {
    if (!isLoggedIn) {
      toast.error('Inicia sesión para agregar productos a tu lista de deseos.');
      navigate('/login', { state: { from: window.location.pathname } });
    } else {
      toggleWishlistItem(product);
    }
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header 
          setSearchTerm={setSearchTerm}
          setSelectedCategory={setSelectedCategory}
          cartItemCount={cartItemCount}
          wishlistItemCount={wishlistItemCount}
        />
        <Container component="main" sx={{ flex: '1 0 auto', pt: 4, pb: 4 }}>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          }>
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<Home addToCart={addToCart} handleWishlist={handleWishlistToggle} wishlist={wishlistSet} isLoggedIn={isLoggedIn} />} />
              <Route path="/products" element={<ProductsPage 
                  searchTerm={searchTerm} 
                  selectedCategory={selectedCategory} 
                  addToCart={addToCart} 
                  handleWishlist={handleWishlistToggle} 
                  wishlist={wishlistSet} 
                  isLoggedIn={isLoggedIn}
                  // Pass filter state and setters
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                />} 
              />
              <Route path="/product/:productId" element={<ProductDetail addToCart={addToCart} handleWishlist={handleWishlistToggle} wishlist={wishlistSet} isLoggedIn={isLoggedIn} />} />
              <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
              <Route path="/wishlist" element={<Wishlist wishlistItems={wishlistItems} addToCart={addToCart} handleWishlist={handleWishlistToggle} wishlist={wishlistSet} isLoggedIn={isLoggedIn} />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Static Pages */}
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />

              {/* --- PROTECTED USER ROUTES --- */}
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
                <Route path="/checkout" element={<Checkout />} />
              </Route>

              {/* --- PROTECTED ADMIN ROUTES --- */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
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
              </Route>

              {/* Not Found Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Container>
        <Footer />
      </Box>
    </MuiThemeProvider>
  );
}

export default App;
