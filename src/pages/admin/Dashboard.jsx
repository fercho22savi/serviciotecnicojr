import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Box, Container, Grid, Paper, Typography, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';

const StatCard = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }} elevation={3}>
    <Box>
      <Typography color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="h4" component="p">{value}</Typography>
    </Box>
    <Box sx={{ color: color, fontSize: 48 }}>
        {icon}
    </Box>
  </Paper>
);

function AdminDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersSnapshot, productsSnapshot, usersSnapshot, recentOrdersSnapshot] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)))
        ]);

        const totalRevenue = ordersSnapshot.docs.reduce((acc, doc) => acc + doc.data().total, 0);
        const totalOrders = ordersSnapshot.size;
        const totalProducts = productsSnapshot.size;
        const totalCustomers = usersSnapshot.size;
        setStats({ totalRevenue, totalOrders, totalProducts, totalCustomers });

        const orders = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentOrders(orders);

        const salesByDay = {};
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        ordersSnapshot.docs.forEach(doc => {
          const order = doc.data();
          if (order.createdAt && order.createdAt.toDate() > sevenDaysAgo) {
            const date = order.createdAt.toDate().toLocaleDateString('en-CA');
            if (!salesByDay[date]) salesByDay[date] = 0;
            salesByDay[date] += order.total;
          }
        });

        const chartData = Object.keys(salesByDay).sort().map(date => ({ 
          date: new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          ingresos: salesByDay[date]
        }));
        setSalesData(chartData);

      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Dashboard</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}><StatCard title="Ingresos Totales" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<MonetizationOnIcon fontSize="inherit"/>} color="success.main" /></Grid>
        <Grid xs={12} sm={6} md={3}><StatCard title="Pedidos Totales" value={stats.totalOrders} icon={<ShoppingCartIcon fontSize="inherit"/>} color="info.main" /></Grid>
        <Grid xs={12} sm={6} md={3}><StatCard title="Clientes Totales" value={stats.totalCustomers} icon={<PeopleIcon fontSize="inherit"/>} color="warning.main" /></Grid>
        <Grid xs={12} sm={6} md={3}><StatCard title="Productos Totales" value={stats.totalProducts} icon={<InventoryIcon fontSize="inherit"/>} color="error.main" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <Paper sx={{ p: 3, height: 400 }} elevation={3}>
            <Typography variant="h6" gutterBottom>Ingresos de los Últimos 7 Días</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Ingresos']}/>
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid xs={12}>
            <Paper sx={{ p: 3 }} elevation={3}>
                <Typography variant="h6" gutterBottom>Últimos Pedidos</Typography>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Pedido</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentOrders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell component="th" scope="row">{order.id}</TableCell>
                                <TableCell>{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip label={order.status} color={order.status === 'Procesando' ? 'warning' : order.status === 'Completado' ? 'success' : 'default'} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDashboard;
