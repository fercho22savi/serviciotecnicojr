import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Paper,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    AttachMoney as AttachMoneyIcon,
    Receipt as ReceiptIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const getStatusChip = (status) => {
    const chipStyles = {
        Enviado: { backgroundColor: 'warning.light', color: 'warning.dark' },
        Entregado: { backgroundColor: 'success.light', color: 'success.dark' },
        Procesando: { backgroundColor: 'info.light', color: 'info.dark' },
        Cancelado: { backgroundColor: 'error.light', color: 'error.dark' },
    };
    const style = chipStyles[status] || {};
    return <Chip label={status} size="small" sx={{...style, fontWeight: 'bold'}} />;
};

const AccountDashboard = () => {
    const { currentUser } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const ordersQuery = query(
                    collection(db, 'orders'),
                    where('userId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(ordersQuery);

                const orders = [];
                querySnapshot.forEach(doc => {
                    orders.push({ id: doc.id, ...doc.data() });
                });

                let totalSpent = 0;
                const purchaseHistoryMap = {};
                const categoryCount = {};

                orders.forEach(order => {
                    totalSpent += order.total;
                    const month = new Date(order.createdAt.seconds * 1000).toLocaleString('default', { month: 'short', year: '2-digit' });
                    purchaseHistoryMap[month] = (purchaseHistoryMap[month] || 0) + order.total;

                    order.items.forEach(item => {
                        const category = item.category || 'Otros';
                        categoryCount[category] = (categoryCount[category] || 0) + (item.price * item.quantity);
                    });
                });

                const purchaseHistory = Object.entries(purchaseHistoryMap).map(([name, gasto]) => ({ name, gasto })).reverse();
                const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
                const recentOrders = orders.slice(0, 5).map(order => ({
                    id: `#${order.id.substring(0, 6)}...`,
                    date: new Date(order.createdAt.seconds * 1000).toLocaleDateString(),
                    status: order.status,
                    total: `$${order.total.toFixed(2)}`,
                    originalId: order.id,
                }));

                const kpis = [
                    { title: 'Total Gastado', value: `$${totalSpent.toFixed(2)}`, icon: <AttachMoneyIcon fontSize="large" />, color: 'success.light' },
                    { title: 'Compras Realizadas', value: orders.length, icon: <ShoppingCartIcon fontSize="large" />, color: 'info.light' },
                    { title: 'Pedidos en Proceso', value: orders.filter(o => o.status === 'Procesando' || o.status === 'Enviado').length, icon: <ReceiptIcon fontSize="large" />, color: 'warning.light' },
                    { title: 'Calificación Promedio', value: 'N/A', icon: <StarIcon fontSize="large" />, color: 'primary.light' },
                ];

                setDashboardData({ kpis, purchaseHistory, categoryData, recentOrders });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando tu dashboard...</Typography>
            </Box>
        );
    }

    if (!dashboardData || dashboardData.recentOrders.length === 0) {
        return (
            <Box sx={{textAlign: 'center', mt: 5}}>
                 <Typography variant="h5" gutterBottom>¡Bienvenido, {currentUser?.displayName || 'Usuario'}!</Typography>
                 <Typography color="text.secondary">Parece que aún no has realizado ninguna compra.</Typography>
                 <Button variant="contained" color="primary" component="a" href="/products" sx={{mt: 3}}>Explorar productos</Button>
            </Box>
        )
    }

    return (
        <Box sx={{ p: { xs: 1, md: 2} }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                ¡Hola de nuevo, {currentUser?.displayName || 'Usuario'}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Aquí tienes un resumen de tu actividad y compras recientes.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {dashboardData.kpis.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', backgroundColor: item.color }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.value}</Typography>
                                <Typography variant="subtitle2" color="text.secondary">{item.title}</Typography>
                            </Box>
                            {React.cloneElement(item.icon, { sx: { color: `${item.color.split('.')[0]}.dark` }})}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: '12px', height: 350 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Historial de Compras</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardData.purchaseHistory} margin={{ top: 5, right: 20, left: -10, bottom: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="gasto" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                     <Paper sx={{ p: 3, borderRadius: '12px', height: 350 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Categorías Más Compradas</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 30 }}>
                                <Pie data={dashboardData.categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label>
                                    {dashboardData.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Mis Últimos Pedidos</Typography>
            <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>N° de Orden</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dashboardData.recentOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell>{getStatusChip(order.status)}</TableCell>
                                <TableCell>{order.total}</TableCell>
                                <TableCell align="right">
                                    <Button variant="outlined" size="small" component="a" href={`/account/orders/${order.originalId}`}>Ver Detalles</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default AccountDashboard;
