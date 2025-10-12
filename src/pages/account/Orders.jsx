import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Paper, Grid, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const statusColors = {
  Pendiente: 'warning',
  Procesando: 'info',
  Enviado: 'primary',
  Entregado: 'success',
  Cancelado: 'error',
};

function Orders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
        toast.error(t('orders.fetch_error'));
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, t]);

  const getStatusLabel = (status) => {
    const key = `orders.status.${status.toLowerCase()}`;
    // Fallback to the original status if the key doesn't exist
    return t(key, { defaultValue: status });
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        {t('orders.title')}
      </Typography>
      
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="h6">{t('orders.no_orders_title')}</Typography>
          <Typography color="text.secondary">{t('orders.no_orders_subtitle')}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/products')}>
            {t('orders.browse_products_button')}
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {orders.map(order => (
            <Paper key={order.id} elevation={2} sx={{ p: 3, borderRadius: '12px', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 4 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('orders.order_number_label')}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.orderId || order.id}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('orders.date_label')}</Typography>
                  <Typography variant="body2" color="text.secondary">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('orders.total_label')}</Typography>
                  <Typography variant="body2" color="text.secondary">${order.totalAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{t('orders.status_label')}</Typography>
                    <Chip 
                        label={getStatusLabel(order.status || 'Pendiente')} 
                        color={statusColors[order.status] || 'default'} 
                        size="small"
                    />
                </Grid>
                <Grid item xs={6} md={2} sx={{ textAlign: 'right' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate(`/account/orders/${order.id}`)}
                  >
                    {t('orders.view_details_button')}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Orders;
