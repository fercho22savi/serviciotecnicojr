import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  IconButton,
  Divider,
  Link
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ImageWithFallback from '../components/ImageWithFallback';
import { useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useCart();

  // Convert the Map to an array of items
  const cartItems = Array.from(cart.values());

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
        <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
          Tu carrito está vacío
        </Typography>
        <Typography color="text.secondary" sx={{ my: 2 }}>
          Parece que todavía no has añadido nada. ¡Explora nuestros productos!
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" size="large">
          Explorar Productos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Tu Carrito de Compras
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Paper key={item.id} elevation={2} sx={{ display: 'flex', mb: 2, p: 2, alignItems: 'center' }}>
              <ImageWithFallback 
                src={item.images && item.images.length > 0 ? item.images[0] : ''}
                alt={item.name} 
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />
              <Box sx={{ flexGrow: 1, mx: 2 }}>
                <Link component={RouterLink} to={`/product/${item.id}`} sx={{ textDecoration: 'none', color: 'inherit'}}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                </Link>
                <Typography color="text.secondary">${new Intl.NumberFormat('es-CO').format(item.price)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}><RemoveIcon /></IconButton>
                <Typography sx={{ width: 40, textAlign: 'center' }}>{item.quantity}</Typography>
                <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}><AddIcon /></IconButton>
              </Box>
              <Typography variant="h6" sx={{ width: 100, textAlign: 'right', fontWeight: 'bold' }}>
                  ${new Intl.NumberFormat('es-CO').format(item.price * item.quantity)}
              </Typography>
              <IconButton color="error" onClick={() => removeFromCart(item.id)} sx={{ ml: 2 }}>
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 88 }}>
            <Typography variant="h5" gutterBottom fontWeight="medium">Resumen del Pedido</Typography>
            <Divider sx={{ my: 2 }}/>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography fontWeight="medium">${new Intl.NumberFormat('es-CO').format(subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1, color: 'text.secondary' }}>
              <Typography>Envío</Typography>
              <Typography>Calculado en el checkout</Typography>
            </Box>
            <Divider sx={{ my: 2 }}/>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
              <Typography variant="h6" fontWeight="bold">Total Estimado</Typography>
              <Typography variant="h6" fontWeight="bold">${new Intl.NumberFormat('es-CO').format(subtotal)}</Typography>
            </Box>
            <Button onClick={handleCheckout} variant="contained" size="large" fullWidth>
              Ir al Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Cart;
