
import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Context
import { useAuth } from './context/AuthContext';

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
const FaqPage = React.lazy(() => import('./pages/FaqPage.jsx'));
const RefundPolicyPage = React.lazy(() => import('./pages/RefundPolicyPage.jsx'));
const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage.jsx'));

// Account Pages
const AccountDashboard = React.lazy(() => import('./pages/account/AccountDashboard.jsx'));
const OrderHistory = React.lazy(() => import('./pages/account/Orders.jsx'));
const OrderDetailPage = React.lazy(() => import('./pages/account/OrderDetailPage.jsx'));
const RecentlyViewedPage = React.lazy(() => import('./pages/account/RecentlyViewedPage.jsx'));
const UserProfile = React.lazy(() => import('./pages/account/Profile.jsx'));
const SettingsPage = React.lazy(() => import('./pages/account/SettingsPage.jsx'));
const PaymentMethods = React.lazy(() => import('./pages/account/PaymentMethods.jsx'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard.jsx'));
const ProductManagement = React.lazy(() => import('./pages/admin/ProductManagement.jsx'));
const CategoryManagement = React.lazy(() => import('./pages/admin/CategoryManagement.jsx'));
const OrderManagement = React.lazy(() => import('./pages/admin/OrderManagement.jsx'));
const AdminOrderDetailPage = React.lazy(() => import('./pages/admin/OrderDetailPage.jsx'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagementPage.jsx'));
const CouponManagement = React.lazy(() => import('./pages/admin/CouponManagement.jsx'));
const ReviewManagementPage = React.lazy(() => import('./pages/admin/ReviewManagementPage.jsx'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/Settings.jsx')); // Importa la nueva página de configuración

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const App = () => {
    const { currentUser, isAdmin, loading } = useAuth();

    const AdminRoute = ({ children }) => (isAdmin ? children : <Navigate to="/" />);
    const AuthenticatedRoute = ({ children }) => (currentUser ? children : <Navigate to="/login" />);

    if (loading) {
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
                { path: "/faq", element: <FaqPage /> },
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
                { path: "/refund-policy", element: <RefundPolicyPage /> },
                { path: "/terms-of-service", element: <TermsOfServicePage /> },
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
                { path: "order/:orderId", element: <OrderDetailPage /> },
                { path: "profile", element: <UserProfile /> },
                { path: "recently-viewed", element: <RecentlyViewedPage /> },
                { path: "settings", element: <SettingsPage /> },
                {
                    path: "payment-methods", 
                    element: <PaymentMethods />
                },
                { path: "wishlist", element: <WishlistPage /> },
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
                { path: "orders/:orderId", element: <AdminOrderDetailPage /> },
                { path: "users", element: <UserManagement /> },
                { path: "coupons", element: <CouponManagement /> },
                { path: "reviews", element: <ReviewManagementPage /> },
                { path: "settings", element: <AdminSettingsPage /> }, // Añade la nueva ruta
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
        <Suspense fallback={<div>Cargando página...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    );
};

export default App;
