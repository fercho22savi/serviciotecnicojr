import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  IconButton,
  TextField,
  Divider,
  Link
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function Cart({ cart, setCart }) {

  // --- Handlers for Cart Logic ---
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // --- Calculations ---
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 100 ? 0 : 15; // Free shipping on orders over $100
  const total = subtotal + shippingCost;

  // --- Render Logic ---
  if (cart.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
        <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
          Tu carrito está vacío
        </Typography>
        <Typography color="text.secondary" sx={{ my: 2 }}>
          Parece que todavía no has añadido nada. ¡Explora nuestros productos!
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large">
          Ir a la Tienda
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
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cart.map((item) => (
            <Paper key={item.id} elevation={2} sx={{ display: 'flex', mb: 2, p: 2, alignItems: 'center' }}>
              <img src={item.imageUrl} alt={item.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
              <Box sx={{ flexGrow: 1, mx: 2 }}>
                <Link component={RouterLink} to={`/product/${item.id}`} sx={{ textDecoration: 'none', color: 'inherit'}}>
                    <Typography variant="h6">{item.name}</Typography>
                </Link>
                <Typography color="text.secondary">Precio: ${item.price.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}><RemoveIcon /></IconButton>
                <TextField value={item.quantity} size="small" sx={{ width: 50, mx: 1, textAlign: 'center' }} inputProps={{ readOnly: true }}/>
                <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}><AddIcon /></IconButton>
              </Box>
              <IconButton color="error" onClick={() => handleRemoveItem(item.id)} sx={{ ml: 2 }}>
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="medium">Resumen del Pedido</Typography>
            <Divider sx={{ my: 2 }}/>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography fontWeight="medium">${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography>Envío</Typography>
              <Typography fontWeight="medium">${shippingCost.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }}/>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold">${total.toFixed(2)}</Typography>
            </Box>
            <Button component={RouterLink} to="/checkout" variant="contained" size="large" fullWidth>
              Proceder al Pago
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Cart;
