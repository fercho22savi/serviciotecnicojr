import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const StatCard = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 2, height: '100%', boxShadow: 3 }}>
        <Box sx={{ p: 2.5, borderRadius: '50%', backgroundColor: color, color: 'white', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {icon}
        </Box>
        <Box>
            <Typography color="textSecondary" gutterBottom>{title}</Typography>
            <Typography variant="h5" component="h2" fontWeight="bold">{value}</Typography>
        </Box>
    </Paper>
);

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch orders for revenue and order count
                const ordersSnapshot = await getDocs(collection(db, 'orders'));
                let revenue = 0;
                ordersSnapshot.forEach(doc => {
                    if (doc.data().total) {
                        revenue += doc.data().total;
                    }
                });
                const orderCount = ordersSnapshot.size;

                // Fetch users for customer count
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const customerCount = usersSnapshot.size;

                setStats({
                    totalRevenue: revenue,
                    totalOrders: orderCount,
                    totalCustomers: customerCount,
                });

            } catch (err) {
                console.error("Error fetching admin stats:", err);
                setError("No se pudieron cargar las estadísticas. Con las reglas de seguridad permisivas, esto podría indicar un problema de conexión o un error en el código.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando estadísticas...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
             <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Panel de Administración
             </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Ingresos Totales" 
                        value={`$${stats.totalRevenue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                        icon={<MonetizationOnIcon />} 
                        color="success.main" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Pedidos Totales" 
                        value={stats.totalOrders} 
                        icon={<ShoppingCartIcon />} 
                        color="info.main" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Clientes Registrados" 
                        value={stats.totalCustomers} 
                        icon={<PeopleIcon />} 
                        color="error.main" 
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default AdminDashboard;
