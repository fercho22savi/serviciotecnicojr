import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Grid, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Wishlist({ wishlist, addToCart, handleWishlist, isLoggedIn }) {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setLoading(true);
      setError(null);
      // If the wishlist is empty, don't make a query
      if (!wishlist || wishlist.size === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      try {
        const wishlistIds = Array.from(wishlist);
        // Firestore 'in' query is limited to 10 items. For a larger wishlist, we would need to batch requests.
        const productsQuery = query(collection(db, "products"), where("__name__", "in", wishlistIds));
        const querySnapshot = await getDocs(productsQuery);
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWishlistProducts(productsList);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setError("No se pudieron cargar los productos de tu lista de deseos.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Lista de Deseos
      </Typography>
      {wishlistProducts.length > 0 ? (
        <Grid container spacing={3}>
          {wishlistProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard 
                product={product} 
                addToCart={addToCart} 
                handleWishlist={handleWishlist} 
                isInWishlist={wishlist.has(product.id)}
                isLoggedIn={isLoggedIn}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
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
