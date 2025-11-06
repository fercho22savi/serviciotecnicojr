import React, { useState, useEffect, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Firebase
import { auth, db } from './firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Context
import { useAuth } from './context/AuthContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { CustomThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/MainLayout';
import AccountLayout from './components/AccountLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
const HomePage = React.lazy(() => import('./pages/HomePage.jsx'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage.jsx'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail.jsx'));
const AboutPage = React.lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'));
const LoginPage = React.lazy(() => import('./pages/Login.jsx'));
const RegisterPage = React.lazy(() => import('./pages/SignUp.jsx'));
const CartPage = React.lazy(() => import('./pages/Cart.jsx'));
const CheckoutForm = React.lazy(() => import('./pages/CheckoutForm.jsx'));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmationPage.jsx'));
const WishlistPage = React.lazy(() => import('./pages/Wishlist.jsx'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage.jsx'));
const ShippingPolicyPage = React.lazy(() => import('./pages/ShippingPolicyPage.jsx'));

// Account Pages
const AccountDashboard = React.lazy(() => import('./pages/account/AccountDashboard.jsx'));
const OrderHistory = React.lazy(() => import('./pages/account/Orders.jsx'));
const OrderDetail = React.lazy(() => import('./pages/account/OrderDetail.jsx'));
const RecentlyViewedPage = React.lazy(() => import('./pages/account/RecentlyViewedPage.jsx'));
const UserProfile = React.lazy(() => import('./pages/account/Profile.jsx'));
const SettingsPage = React.lazy(() => import('./pages/account/SettingsPage.jsx'));
const PaymentMethods = React.lazy(() => import('./pages/account/PaymentMethods.jsx'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard.jsx'));
const ProductManagement = React.lazy(() => import('./pages/admin/ProductManagement.jsx'));
const CategoryManagement = React.lazy(() => import('./pages/admin/CategoryManagement.jsx'));
const OrderManagement = React.lazy(() => import('./pages/admin/OrderManagement.jsx'));
const OrderDetailPage = React.lazy(() => import('./pages/admin/OrderDetailPage.jsx'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagementPage.jsx'));
const CouponManagement = React.lazy(() => import('./pages/admin/CouponManagement.jsx'));
const ReviewManagementPage = React.lazy(() => import('./pages/admin/ReviewManagementPage.jsx'));

const stripePromise = loadStripe('pk_test_51SPG2ACheyYwcT4lBqCBmxCJvvGALzBrQOzkVvtTsdcX19vxrlWSE6Fnyr6iVHvFydne9Y0kAmaFwjahivQLlizk00sccB4WuB');

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

    const AdminRoute = ({ children }) => (isAdmin ? children : <Navigate to="/" />);
    const AuthenticatedRoute = ({ children }) => (currentUser ? children : <Navigate to="/login" />);

    if (loading || checkingAdmin) {
        return <div>Cargando aplicación...</div>;
    }

    const router = createBrowserRouter([
        {
            element: <MainLayout />,
            children: [
                { path: "/", element: <HomePage /> },
                { path: "/products", element: <ProductsPage /> },
                { path: "/product/:productId", element: <ProductDetail /> },
                { path: "/about", element: <AboutPage /> },
                { path: "/contact", element: <ContactPage /> },
                { path: "/cart", element: <CartPage /> },
                {
                    path: "/checkout",
                    element: (
                        <AuthenticatedRoute>
                            <Elements stripe={stripePromise}><CheckoutForm /></Elements>
                        </AuthenticatedRoute>
                    ),
                },
                { path: "/order-confirmation/:orderId", element: <OrderConfirmationPage /> },
                { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
                { path: "/shipping-policy", element: <ShippingPolicyPage /> },
                { path: "/wishlist", element: <WishlistPage /> }, 
            ],
        },
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/register",
            element: <RegisterPage />,
        },
        {
            path: "/account",
            element: <AuthenticatedRoute><AccountLayout /></AuthenticatedRoute>,
            children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <AccountDashboard /> },
                { path: "orders", element: <OrderHistory /> },
                { path: "orders/:orderId", element: <OrderDetail /> },
                { path: "profile", element: <UserProfile /> },
                { path: "recently-viewed", element: <RecentlyViewedPage /> },
                { path: "settings", element: <SettingsPage /> },
                { 
                    path: "payment-methods", 
                    element: <Elements stripe={stripePromise}><PaymentMethods /></Elements> 
                },
                { path: "wishlist", element: <Navigate to="/wishlist" replace /> }, // REDIRECT
            ],
        },
        {
            path: "/admin",
            element: <AdminRoute><AdminLayout /></AdminRoute>,
            children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <AdminDashboard /> },
                { path: "products", element: <ProductManagement /> },
                { path: "categories", element: <CategoryManagement /> },
                { path: "orders", element: <OrderManagement /> },
                { path: "orders/:orderId", element: <OrderDetailPage /> },
                { path: "users", element: <UserManagement /> },
                { path: "coupons", element: <CouponManagement /> },
                { path: "reviews", element: <ReviewManagementPage /> },
            ],
        },
        {
            path: "*",
            element: <Typography variant="h4" align="center" sx={{ mt: 5 }}>404 - Página no encontrada</Typography>,
        },
    ], {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        },
    });

    return (
        <CustomThemeProvider>
            <RecentlyViewedProvider>
                <Suspense fallback={<div>Cargando página...</div>}>
                    <RouterProvider router={router} />
                </Suspense>
            </RecentlyViewedProvider>
        </CustomThemeProvider>
    );
};

export default App;
