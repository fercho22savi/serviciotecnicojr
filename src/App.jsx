import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider as MuiThemeProvider } from './context/ThemeContext';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase/config';
import { seedDatabase } from './firebase/seeder';

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
import OrderHistoryPage from './pages/OrderHistoryPage';

// Admin Pages
import AdminLayout from './layouts/AdminLayout'; 
import UserManagementPage from './pages/admin/UserManagementPage';
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

// Componente principal de contenido que puede acceder al contexto de autenticación
function AppContent() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const isLoggedIn = !!currentUser;

  // Efecto para inicializar productos y seeder
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        await seedDatabase();
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error inicializando la aplicación: ", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Efecto para cargar y sincronizar la lista de deseos desde Firestore
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().wishlist) {
          setWishlist(new Set(docSnap.data().wishlist));
        }
      });
    } else {
      setWishlist(new Set()); // Limpiar wishlist al cerrar sesión
    }
  }, [currentUser]);

  const categories = useMemo(() => {
    if (!products) return [];
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

  // Función de lista de deseos mejorada con persistencia en Firestore
  const handleWishlist = async (productId) => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const newWishlist = new Set(wishlist);
    
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      await updateDoc(userRef, { wishlist: arrayRemove(productId) });
    } else {
      newWishlist.add(productId);
      await updateDoc(userRef, { wishlist: arrayUnion(productId) });
    }
    
    setWishlist(newWishlist);
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
    <>
      <Header 
        cartItemCount={cartItemCount}
        wishlistCount={wishlist.size}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        categories={categories}
        selectedCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
      />
      <main style={{ paddingTop: '1rem' }}>
        <Routes>
          {/* Rutas públicas con props actualizadas */}
          <Route path="/" element={<Home products={products} searchTerm={searchTerm} selectedCategory={selectedCategory} addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} isLoggedIn={isLoggedIn} />} />
          <Route path="/products" element={<ProductsPage products={products} searchTerm={searchTerm} selectedCategory={selectedCategory} addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} isLoggedIn={isLoggedIn} />} />
          <Route path="/product/:productId" element={<ProductDetail products={products} addToCart={handleAddToCart} handleWishlist={handleWishlist} wishlist={wishlist} isLoggedIn={isLoggedIn} />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
          <Route path="/wishlist" element={<Wishlist products={products} wishlist={wishlist} handleWishlist={handleWishlist} addToCart={handleAddToCart} isLoggedIn={isLoggedIn}/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/checkout" element={<Checkout cart={cart} />} />
            <Route path="/order-confirmation" element={<OrderConfirmation setCart={setCart} />} />
            <Route path="/order/:orderId" element={<OrderDetail />} />
            <Route path="/my-orders" element={<OrderHistoryPage />} />
          </Route>

          {/* Rutas de Administrador */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="users" />} /> 
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagementPage />} />
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
    </>
  );
}

// El componente App ahora solo envuelve los proveedores de contexto
function App() {
  return (
    <AuthProvider>
      <MuiThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </MuiThemeProvider>
    </AuthProvider>
  );
}

export default App;
