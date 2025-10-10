import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { 
    Container, 
    Paper, 
    Typography, 
    Box, 
    Grid, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemIcon,
    Avatar,
    Divider,
    Button, 
    CircularProgress, 
    Alert 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No se ha proporcionado un ID de pedido.');
        setLoading(false);
        return;
      }
      
      try {
        const orderDocRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderDocRef);

        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          // Security check: Make sure the user is authorized to see this order
          if (currentUser.uid === orderData.userId || currentUser.role === 'admin') {
              setOrder({ id: orderDoc.id, ...orderData });
          } else {
              setError('No tienes permiso para ver este pedido.');
          }
        } else {
          setError('El pedido no fue encontrado.');
        }
      } catch (e) {
        console.error("Error fetching order:", e);
        setError('Ocurrió un error al cargar el pedido.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, currentUser]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt: 4}}>{error}</Alert></Container>;
  }

  if (!order) {
    return null; 
  }

  const { shippingAddress, items, total, createdAt, status } = order;

  return (
    <Container maxWidth="lg">
      <StyledPaper elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Detalle del Pedido
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(`/profile/${currentUser.uid}`)}
          >
            Volver a Mis Pedidos
          </Button>
        </Box>
        <Typography variant="overline" color="text.secondary">Pedido #{order.id}</Typography>
        
        <Grid container spacing={4} sx={{ mt: 1 }}>
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Resumen</Typography>
            <Typography><strong>Fecha:</strong> {new Date(createdAt.seconds * 1000).toLocaleDateString()}</Typography>
            <Typography><strong>Total:</strong> ${total.toFixed(2)}</Typography>
            <Typography><strong>Estado:</strong> {status}</Typography>
          </Grid>
          
          {/* Shipping Address */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Dirección de Envío</Typography>
            <Typography>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
            <Typography>{shippingAddress.address}</Typography>
            <Typography>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</Typography>
            <Typography>{shippingAddress.country}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Items List */}
        <Typography variant="h6" gutterBottom>Artículos en el Pedido</Typography>
        <List>
          {items.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemIcon>
                <Avatar variant="rounded" src={item.image} sx={{ width: 60, height: 60, mr: 2 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                secondary={`Cantidad: ${item.quantity}`}
              />
              <Typography variant="body1" fontWeight="bold">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
      </StyledPaper>
    </Container>
  );
}

export default OrderDetail;
