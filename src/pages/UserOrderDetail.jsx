import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Paper, CircularProgress, Box, Grid, List, ListItem, ListItemText, Divider, Button, Alert, Breadcrumbs, Link } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function UserOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Debes iniciar sesión para ver tus pedidos.");
        }

        const orderRef = doc(firestore, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          // Security check: ensure the order belongs to the current user
          if (orderData.userId !== currentUser.uid) {
            throw new Error("No tienes permiso para ver este pedido.");
          }
          setOrder(orderData);
        } else {
          throw new Error("Pedido no encontrado.");
        }
      } catch (err) {
        console.error("Error fetching order: ", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, navigate]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
        <Container sx={{mt:2}}>
             <Alert severity="error">{error}</Alert>
             <Button component={RouterLink} to="/account/orders" sx={{mt: 2}} variant="outlined">Volver a Mis Pedidos</Button>
        </Container>
    );
  }

  if (!order) {
    return null; // Should be handled by error state
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{mb: 2}}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/account">
                Mi Cuenta
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/account/orders">
                Mis Pedidos
            </Link>
            <Typography color="text.primary">Pedido #{order.id.substring(0, 8)}...</Typography>
        </Breadcrumbs>

      <Typography variant="h4" gutterBottom>Detalle del Pedido</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                  <Typography variant="h6">Estado</Typography>
                  <Typography>{order.status}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                  <Typography variant="h6">Fecha</Typography>
                  <Typography>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</Typography>
              </Grid>
               <Grid item xs={12} sm={4}>
                  <Typography variant="h6">Total</Typography>
                  <Typography sx={{fontWeight: 'bold'}}>${order.total.toFixed(2)}</Typography>
              </Grid>
          </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
             <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Dirección de Envío</Typography>
                <Typography>{order.shippingAddress?.name}</Typography>
                <Typography>{order.shippingAddress?.address}</Typography>
                <Typography>{`${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}`}</Typography>
                <Typography>{order.shippingAddress?.country}</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Resumen de Artículos</Typography>
                <List disablePadding>
                {order.items.map((item) => (
                    <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                    <ListItemText primary={item.name} secondary={`Cantidad: ${item.quantity}`} />
                    <Typography variant="body2">${(item.price * item.quantity).toFixed(2)}</Typography>
                    </ListItem>
                ))}
                <Divider sx={{my: 1}}/>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Subtotal" />
                    <Typography variant="subtitle1">
                    ${order.total.toFixed(2)}
                    </Typography>
                </ListItem>
                 <ListItem sx={{ py: 1, px: 0, color: 'text.secondary' }}>
                    <ListItemText primary="Envío" />
                    <Typography variant="body2">Gratis</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" sx={{fontWeight: 'bold'}} primaryTypographyProps={{fontWeight: 'bold'}}/>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ${order.total.toFixed(2)}
                    </Typography>
                </ListItem>
                </List>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserOrderDetail;
