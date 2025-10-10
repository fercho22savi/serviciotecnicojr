import React from 'react';
import { Container, Typography, Grid, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

function Wishlist({ products, wishlist, addToCart, handleWishlist }) {
  // Filter the full product list to get only the items present in the wishlist Set
  const wishlistItems = products.filter(product => wishlist.has(product.id));

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Lista de Deseos
      </Typography>
      {wishlistItems.length > 0 ? (
        <Grid container spacing={3}>
          {wishlistItems.map((product) => (
            <Grid item key={product.id} xs={12} sm={3} md={3} lg={3} sx={{ display: 'flex' }}> {/* FIX: Use Flexbox for equal height */}
              <ProductCard 
                product={product} 
                addToCart={addToCart} 
                handleWishlist={handleWishlist} 
                wishlist={wishlist} 
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <FavoriteBorderIcon sx={{ fontSize: 80, color: 'grey.400' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Tu lista de deseos está vacía.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            ¿Por qué no exploras nuestro catálogo y guardas los artículos que te gusten?
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Buscar Productos
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Wishlist;
