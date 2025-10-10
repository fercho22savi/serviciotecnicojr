import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as MuiThemeProvider } from './context/ThemeContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

// Import Pages and Components
import Header from './components/Header';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetail from './pages/OrderDetail';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import ProductForm from './pages/admin/ProductForm';
import OrderManagement from './pages/admin/OrderManagement';
import CouponManagement from './pages/admin/CouponManagement';
import ReviewManagement from './pages/admin/ReviewManagement';

// Import Routes
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import { CircularProgress, Box } from '@mui/material';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Estado para la categoría

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
      const allCategories = products.map(p => p.category);
      return ['Todas', ...Array.from(new Set(allCategories))];
  }, [products]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleCategoryChange = (event) => {
      setSelectedCategory(event.target.value);
  };

  const handleAddToCart = (productToAdd, quantity = 1) => {
    setCart(prevCart => {
      const isProductInCart = prevCart.find(item => item.id === productToAdd.id);
      if (isProductInCart) {
        return prevCart.map(item =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...productToAdd, quantity }];
    });
  };

  const handleWishlist = (productId) => {
    setWishlist(prevWishlist => {
      const newWishlist = new Set(prevWishlist);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
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
    <AuthProvider>
      <MuiThemeProvider>
        <Router>
          <Header 
            cartItemCount={cartItemCount}
            wishlistCount={wishlist.size}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            categories={categories} // <-- Pasar categorías
            selectedCategory={selectedCategory} // <-- Pasar categoría seleccionada
            handleCategoryChange={handleCategoryChange} // <-- Pasar manejador
          />
          <main style={{ paddingTop: '1rem' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home products={products} searchTerm={searchTerm} selectedCategory={selectedCategory} addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} />} />
              <Route path="/products" element={<ProductsPage products={products} searchTerm={searchTerm} selectedCategory={selectedCategory} addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} />} />
              <Route path="/product/:productId" element={<ProductDetail products={products} addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} />} />
              <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
              <Route path="/wishlist" element={<Wishlist products={products} wishlist={wishlist} handleWishlist={handleWishlist} addToCart={handleAddToCart} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/account/*" element={<UserProfile />} />
                <Route path="/checkout" element={<Checkout cart={cart} />} />
                <Route path="/order-confirmation" element={<OrderConfirmation setCart={setCart} />} />
                <Route path="/order/:orderId" element={<OrderDetail />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:id" element={<ProductForm />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="coupons" element={<CouponManagement />} />
                  <Route path="reviews" element={<ReviewManagement />} />
              </Route>

              {/* Not Found */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </Router>
      </MuiThemeProvider>
    </AuthProvider>
  );
}

export default App;
