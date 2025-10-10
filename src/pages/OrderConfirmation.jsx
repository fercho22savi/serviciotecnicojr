import React, { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To get the current user ID
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function OrderConfirmation({ setCart }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Get the order ID passed from the checkout page
  const orderId = location.state?.orderId;

  // Clear the cart when the component mounts
  useEffect(() => {
    if (setCart) {
      setCart([]);
    }
  }, [setCart]);

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px', textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main' }} />
        <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
          ¡Gracias por tu compra!
        </Typography>
        <Typography color="text.secondary" sx={{ my: 2 }}>
          Hemos recibido tu pedido y ya lo estamos procesando. Recibirás una confirmación por correo electrónico en breve.
        </Typography>
        
        {orderId && (
            <Alert severity="info" sx={{ justifyContent: 'center', my: 2, py: 1}}>
                <Typography>Tu número de confirmación es: <strong>#{orderId}</strong></Typography>
            </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button component={RouterLink} to="/" variant="contained">
            Seguir Comprando
          </Button>
          {currentUser && (
             <Button component={RouterLink} to={`/profile/${currentUser.uid}`} variant="outlined">
                Ver Mis Pedidos
             </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default OrderConfirmation;
