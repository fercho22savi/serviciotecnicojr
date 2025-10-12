import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          setOrder(orderData);
          setStatus(orderData.status);
        } else {
          setError('El pedido no existe.');
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError('Error al cargar el pedido.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status: status });
      setOrder(prevOrder => ({ ...prevOrder, status: status }));
      toast.success('¡Estado del pedido actualizado!');
    } catch (error) {
      console.error("Error updating status: ", error);
      toast.error('No se pudo actualizar el estado.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>Volver a Pedidos</Button>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Detalle del Pedido #{order.id.substring(0, 6).toUpperCase()}</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Typography variant="h6">Información General</Typography>
                <Typography><b>Fecha:</b> {order.createdAt ? format(order.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}</Typography>
                <Typography><b>Cliente ID:</b> {order.userId}</Typography>
                <Typography><b>Total:</b> ${order.totalAmount.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="h6">Actualizar Estado</Typography>
                <FormControl fullWidth sx={{ my: 1 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select value={status} label="Estado" onChange={(e) => setStatus(e.target.value)}>
                        <MenuItem value="Procesando">Procesando</MenuItem>
                        <MenuItem value="Enviado">Enviado</MenuItem>
                        <MenuItem value="Completado">Completado</MenuItem>
                        <MenuItem value="Cancelado">Cancelado</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleStatusChange} disabled={isUpdating} fullWidth>
                    {isUpdating ? <CircularProgress size={24} /> : 'Actualizar Estado'}
                </Button>
            </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Artículos del Pedido</Typography>
        <List disablePadding>
          {order.items.map((item, index) => (
            <ListItem key={index} divider>
              <ListItemText 
                primary={item.name}
                secondary={`Cantidad: ${item.quantity} - Precio Unitario: $${item.price.toFixed(2)}`}
              />
              <Typography variant="body1" fontWeight="bold">${(item.quantity * item.price).toFixed(2)}</Typography>
            </ListItem>
          ))}
           <ListItem>
              <ListItemText primary="Total" />
              <Typography variant="h6" fontWeight="bold">${order.totalAmount.toFixed(2)}</Typography>
            </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default OrderDetailPage;
