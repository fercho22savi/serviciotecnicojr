import React from 'react';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// --- Wishlist Component Refactored ---
// It is now a "dumb" component that receives all necessary data and functions as props.
// It has no local state and does not fetch its own data, making it more predictable and efficient.

function Wishlist({ wishlistItems, addToCart, handleWishlist, wishlist, isLoggedIn }) {

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Lista de Deseos
      </Typography>
      
      {/* Use the passed wishlistItems prop directly */}
      {wishlistItems && wishlistItems.length > 0 ? (
        <Grid container spacing={3}>
          {wishlistItems.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard 
                product={product} 
                addToCart={addToCart} 
                handleWishlist={handleWishlist} 
                // `wishlist` is the Set of IDs passed from App.jsx for efficient lookups
                isInWishlist={wishlist.has(product.id)}
                isLoggedIn={isLoggedIn}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        // Display this message when the wishlist is empty
        <Box sx={{ textAlign: 'center', mt: 8, p: 4, border: '2px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
          <FavoriteBorderIcon sx={{ fontSize: 80, color: 'grey.400' }} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
            Tu lista de deseos está vacía
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Explora el catálogo y pulsa el corazón para guardar tus productos favoritos.
          </Typography>
          <Button component={RouterLink} to="/products" variant="contained">
            Buscar Productos
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Wishlist;
