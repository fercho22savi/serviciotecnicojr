import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Avatar, Box, Button, Chip } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../firebase/config'; // Adjust as needed
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import OrderTrackerMap from '../../components/OrderTrackerMap'; // Create this component

const StatCard = ({ title, value }) => (
    <Paper sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', // Center content vertically
        height: 120, 
        backgroundColor: '#333', 
        color: 'white', 
        borderRadius: '12px' 
    }}>
      <Typography variant="subtitle1" color="#ccc">{title}</Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: {
            xs: '1.5rem',
            sm: '2rem',
            md: '2.125rem'
          }
        }}
      >
        {value}
      </Typography>
    </Paper>
  );

  const RecentOrder = ({ order }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: '1px solid #444' }}>
      <Typography>#{order.id.slice(0, 6)}</Typography>
      <Typography>{new Date((order.createdAt?.seconds || 0) * 1000).toLocaleDateString()}</Typography>
      <Chip label={order.status} size="small" sx={{ backgroundColor: order.status === 'Delivered' ? '#4caf50' : '#ff9800', color: 'white' }} />
      <Typography>${(order.total || order.amount || 0).toFixed(2)}</Typography>
    </Box>
  );

const AccountDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  const API_KEY = 'AIzaSyBioa5eRPcSJ_LrndxJJC5FFiaXCbfBHto'; // Replace with your actual key

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }

        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      }
      setLoading(false);
    };

    fetchData();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalSpent = orders.reduce((acc, order) => acc + (order.total || order.amount || 0), 0);
  const averageRating = 4.3; // Placeholder
  const userLocation = user?.address ? { lat: user.address.latitude, lng: user.address.longitude } : null;

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
            <Typography color="#ccc">Welcome, {user?.name || 'User'}! Here is a summary of your recent activity</Typography>
          </div>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={user?.avatarUrl} sx={{ mr: 2 }} />
            <Typography>{user?.name || 'User'}</Typography>
            <Button onClick={handleLogout} sx={{ ml: 2, color: '#ccc', borderColor: '#ccc', borderRadius: '20px' }} variant="outlined">Log out</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}><StatCard title="Total Orders" value={orders.length} /></Grid>
        <Grid item xs={12} md={3}><StatCard title="Total Spent" value={`$${totalSpent.toFixed(2)}`} /></Grid>
        <Grid item xs={12} md={3}><StatCard title="Current Orders" value={orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length} /></Grid>
        <Grid item xs={12} md={3}><StatCard title="Average Rating" value={averageRating} /></Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, backgroundColor: '#2b2b2b', color: 'white', borderRadius: '12px', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
            {orders.slice(0, 4).map(order => <RecentOrder key={order.id} order={order} />)}
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={5}>
           <Paper sx={{ p: 2, backgroundColor: '#2b2b2b', color: 'white', borderRadius: '12px', height: '100%' }}>
             <Typography variant="h6" sx={{ mb: 2 }}>Mi Ubicación</Typography>
             {userLocation ? 
                <OrderTrackerMap apiKey={API_KEY} userLocation={userLocation} /> : 
                <Typography color="#ccc">No se encontró una dirección. Ve a tu perfil para agregar una.</Typography>
             }
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountDashboard;
