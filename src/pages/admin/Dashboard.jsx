import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Avatar, Box, Button, Chip } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../firebase/config'; // Corrected path
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, backgroundColor: '#333', color: 'white', borderRadius: '12px' }}>
    <Typography variant="subtitle1" color="#ccc">{title}</Typography>
    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
  </Paper>
);

const RecentOrder = ({ order }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #444' }}>
      <Typography>#{order.id.slice(0, 6)}...</Typography>
      <Typography>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</Typography>
      <Chip label={order.status} size="small" sx={{ backgroundColor: order.status === 'Entregado' ? '#4caf50' : '#ff9800', color: 'white' }} />
      <Typography>${order.total.toFixed(2)}</Typography>
    </Box>
  );

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all orders, not just for the current user
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      } catch (error) {
          console.error("Error fetching all orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalSales = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Procesando' || o.status === 'Enviado').length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Admin Dashboard</Typography>
                <Typography color="#ccc">Overview of your store's performance.</Typography>
            </div>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2 }}>{auth.currentUser?.email?.[0].toUpperCase()}</Avatar>
            <Typography>{auth.currentUser?.email}</Typography>
            <Button onClick={handleLogout} sx={{ ml: 2, color: '#ccc', borderColor: '#ccc', borderRadius: '20px' }} variant="outlined">Log out</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}><StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} /></Grid>
        <Grid item xs={12} md={3}><StatCard title="Total Sales" value={totalSales} /></Grid>
        <Grid item xs={12} md={3}><StatCard title="Pending Orders" value={pendingOrders} /></Grid>
        <Grid item xs={12} md={3}><StatCard title="Average Order Value" value={`$${averageOrderValue.toFixed(2)}`} /></Grid>


        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#2b2b2b', color: 'white', borderRadius: '12px' }}>
            <Typography variant="h6" sx={{mb: 2}}>Recent Orders</Typography>
              {orders.slice(0, 5).map(order => <RecentOrder key={order.id} order={order} />)}
          </Paper>
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
