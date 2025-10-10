import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { 
    Container, Typography, Box, Paper, CircularProgress, Grid, Divider, List, 
    ListItem, ListItemText, ListItemAvatar, Avatar, Select, MenuItem, FormControl, InputLabel, Button 
} from '@mui/material';
import { toast } from 'react-hot-toast';

const orderStatuses = ['Procesando', 'Enviado', 'Completado', 'Cancelado'];

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const orderRef = doc(firestore, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          setOrder(orderData);
          setStatus(orderData.status);
        } else {
          toast.error('Pedido no encontrado.');
          navigate('/admin/orders');
        }
      } catch (error) {
        console.error("Error fetching order details: ", error);
        toast.error('Error al cargar los detalles del pedido.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success(`Estado del pedido actualizado a "${newStatus}".`);
    } catch (error) {
      console.error("Error updating order status: ", error);
      toast.error('Error al actualizar el estado del pedido.');
      // Revert status on UI if update fails
      setStatus(order.status);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (!order) {
    return null; // Or a not found component
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Button onClick={() => navigate('/admin/orders')} sx={{ mb: 2 }}>&larr; Volver a Pedidos</Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Detalles del Pedido
      </Typography>
      <Typography variant="overline" sx={{ fontFamily: 'monospace' }}>ID: {order.id}</Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Left Column: Order Details & Status */}
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3}} elevation={2}>
                <Typography variant="h6" gutterBottom>Resumen</Typography>
                <Typography><b>Fecha:</b> {new Date(order.createdAt.seconds * 1000).toLocaleString()}</Typography>
                <Typography><b>Cliente ID:</b> <code style={{fontSize: 12}}>{order.userId}</code></Typography>
            </Paper>
            <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
                <Typography variant="h6" gutterBottom>Dirección de Envío</Typography>
                <Typography>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</Typography>
                <Typography>{order.shippingAddress.address1}</Typography>
                {order.shippingAddress.address2 && <Typography>{order.shippingAddress.address2}</Typography>}
                <Typography>{order.shippingAddress.city}, {order.shippingAddress.zip}</Typography>
                <Typography>{order.shippingAddress.country}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }} elevation={2}>
                <Typography variant="h6" gutterBottom>Actualizar Estado</Typography>
                <FormControl fullWidth>
                    <InputLabel>Estado del Pedido</InputLabel>
                    <Select value={status} label="Estado del Pedido" onChange={handleStatusChange}>
                        {orderStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
            </Paper>
        </Grid>

        {/* Right Column: Items & Financials */}
        <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }} elevation={2}>
                <Typography variant="h6" gutterBottom>Artículos del Pedido</Typography>
                <List disablePadding>
                    {order.items.map(item => (
                        <React.Fragment key={item.id}>
                            <ListItem disableGutters>
                                <ListItemAvatar>
                                    <Avatar src={item.image} variant="rounded" sx={{ width: 64, height: 64, mr: 2 }} />
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={item.name} 
                                    secondary={`Cantidad: ${item.quantity}`}
                                />
                                <Typography variant="body1">${(item.price * item.quantity).toFixed(2)}</Typography>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
                <Box sx={{ mt: 3, pr: 2, textAlign: 'right' }}>
                    <Typography>Subtotal: <b>${order.subtotal.toFixed(2)}</b></Typography>
                    {order.discount > 0 && <Typography color="success.main">Descuento: <b>-${order.discount.toFixed(2)}</b></Typography>}
                    <Typography>Envío: <b>${order.shippingCost.toFixed(2)}</b></Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>Total: <b>${order.total.toFixed(2)}</b></Typography>
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default OrderDetail;
