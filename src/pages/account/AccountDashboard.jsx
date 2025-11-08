
import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Avatar, Box, Button, Chip, CircularProgress } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../firebase/config';
import { collection, query, where, doc, onSnapshot, collectionGroup } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';

const StatCard = ({ title, value, icon }) => (
    <Paper sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        height: 120,
        backgroundColor: '#f0f2f5',
        color: 'black',
        borderRadius: '16px',
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)'
    }}>
        {icon && <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>}
        <Box>
            <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {value}
            </Typography>
        </Box>
    </Paper>
);

const RecentOrder = ({ order }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
        <Typography component={RouterLink} to={`/account/orders/${order.id}`} sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}>#{order.id.slice(0, 6)}</Typography>
        <Typography color="text.secondary">{new Date((order.createdAt?.seconds || 0) * 1000).toLocaleDateString()}</Typography>
        <Chip label={order.status} size="small" color={order.status === 'Delivered' ? 'success' : 'warning'} />
        <Typography fontWeight="bold">${(order.total || order.amount || 0).toLocaleString('es-CO')}</Typography>
    </Box>
);

const AccountDashboard = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const navigate = useNavigate();
    const { wishlist } = useWishlist();

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Listener for user data
        const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
            if (doc.exists()) {
                setUser(doc.data());
            }
        });

        // Listener for orders
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersData);
        });

        // Listener for reviews
        const reviewsQuery = query(collectionGroup(db, 'reviews'), where('userId', '==', currentUser.uid));
        const unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
            setReviewsCount(snapshot.size);
            setLoading(false); // Stop loading once the first data comes in
        }, (error) => {
            console.error("Error fetching reviews:", error);
            setLoading(false);
        });

        // Cleanup function to unsubscribe from listeners on component unmount
        return () => {
            unsubUser();
            unsubOrders();
            unsubReviews();
        };
    }, [auth]); // Only re-run if auth object changes

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    const totalSpent = orders.reduce((acc, order) => acc + (order.total || order.amount || 0), 0);

    return (
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <div>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Mi Panel</Typography>
                        <Typography color="text.secondary">¡Bienvenido de vuelta, {user?.name || 'Usuario'}!</Typography>
                    </div>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user?.avatarUrl} sx={{ mr: 2 }} />
                        <Typography fontWeight="bold">{user?.name || 'Usuario'}</Typography>
                        <Button onClick={handleLogout} sx={{ ml: 2, color: 'text.secondary', borderColor: 'grey.400', borderRadius: '20px' }} variant="outlined">Cerrar Sesión</Button>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}><StatCard title="Mis Pedidos" value={orders.length} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Gasto Total" value={`$${totalSpent.toLocaleString('es-CO')}`} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="En Mi Lista" value={wishlist.size} /></Grid> {/* Get size directly from context */}
                <Grid item xs={12} sm={6} md={3}><StatCard title="Reseñas Escritas" value={reviewsCount} /></Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: 'white', color: 'black', borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Mis Pedidos Recientes</Typography>
                        {orders.length > 0 ? (
                            orders.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).slice(0, 5).map(order => <RecentOrder key={order.id} order={order} />)
                        ) : (
                            <Typography color="text.secondary">Aún no has realizado ningún pedido.</Typography>
                        )}
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default AccountDashboard;
