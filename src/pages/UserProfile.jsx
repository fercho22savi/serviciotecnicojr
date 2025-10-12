import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    CircularProgress, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Chip, 
    Avatar,
    Button
} from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Link as RouterLink } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }} elevation={3}>
    <Box>
      <Typography color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="h4" component="p">{value}</Typography>
    </Box>
    <Box sx={{ color: color, fontSize: 48 }}>{icon}</Box>
  </Paper>
);

const UserProfile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalSpent: 0, totalOrders: 0, averageOrderValue: 0 });
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [salesByDay, setSalesByDay] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    const fetchOrderData = async () => {
      try {
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const ordersSnapshot = await getDocs(ordersQuery);
        const userOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(userOrders);

        const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);
        const totalOrders = userOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        setStats({ totalSpent, totalOrders, averageOrderValue });
        
        const recentOrdersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        setRecentOrders(recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const monthlySales = Array(12).fill(0).map((_, i) => ({ month: new Date(0, i).toLocaleString('es-ES', { month: 'short' }), total: 0 }));
        const dailySales = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => ({ day, total: 0 }));

        userOrders.forEach(order => {
            if (order.createdAt) {
                const date = order.createdAt.toDate();
                const monthIndex = date.getMonth();
                monthlySales[monthIndex].total += order.total;
                const dayIndex = date.getDay();
                dailySales[dayIndex].total += 1;
            }
        });
        
        setSalesByMonth(monthlySales);
        setSalesByDay(dailySales);

      } catch (error) {
        console.error("Error fetching user order data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [user]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (!user) {
    return <Typography>Por favor, inicia sesión para ver tu perfil.</Typography>;
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 3, background: '#f8f9fa' }}>
        <Avatar src={user.photoURL} alt={user.displayName} sx={{ width: 80, height: 80 }} />
        <Box>
            <Typography variant="h5" fontWeight="bold">{user.displayName || 'Usuario'}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={4}><StatCard title="Gasto Total" value={`$${stats.totalSpent.toLocaleString('es-CO')}`} icon={<MonetizationOnIcon fontSize="inherit"/>} color="success.main" /></Grid>
        <Grid xs={12} sm={4}><StatCard title="Pedidos Realizados" value={stats.totalOrders} icon={<ShoppingCartIcon fontSize="inherit"/>} color="info.main" /></Grid>
        <Grid xs={12} sm={4}><StatCard title="Gasto Promedio" value={`$${stats.averageOrderValue.toLocaleString('es-CO', {maximumFractionDigits: 0})}`} icon={<AttachMoneyIcon fontSize="inherit"/>} color="warning.main" /></Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 2, height: 300 }} elevation={3}>
            <Typography variant="h6" gutterBottom>Compras por Mes</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `$${val.toLocaleString('es-CO', {notation: 'compact'})}`} />
                <Tooltip formatter={(value) => `$${value.toLocaleString('es-CO')}`}/>
                <Bar dataKey="total" fill="#8884d8" name="Total Gastado" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
           <Paper sx={{ p: 2, height: 300 }} elevation={3}>
            <Typography variant="h6" gutterBottom>Actividad por Día</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => `${value} pedidos`} />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Nº de Pedidos" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

       <Paper sx={{ p: 3 }} elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Pedidos Recientes</Typography>
                <Button component={RouterLink} to="/account/orders">Ver Todos</Button>
            </Box>
            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>ID Pedido</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                        <TableRow key={order.id} hover>
                            <TableCell><code>{order.id.substring(0, 8)}...</code></TableCell>
                            <TableCell>{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('es-CO') : 'N/A'}</TableCell>
                            <TableCell align="right">${order.total.toLocaleString('es-CO')}</TableCell>
                            <TableCell align="center">
                                <Chip label={order.status || 'Pendiente'} color={order.status === 'Procesando' ? 'warning' : order.status === 'Completado' ? 'success' : 'default'} size="small"/>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">No has realizado ningún pedido todavía.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    </Box>
  );
};

export default UserProfile;
