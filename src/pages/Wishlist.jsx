import React, { useState, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { Typography, Grid, Box, CircularProgress, Paper, Alert, Link, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { FavoriteBorder } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
  const { currentUser } = useAuth();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      // Wait for the initial wishlist from context to be loaded, and ensure the user is logged in.
      if (wishlistLoading || !currentUser) {
        setProducts([]);
        return;
      }
      // If wishlist is empty, no need to query.
      if (wishlist.size === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const wishlistIds = Array.from(wishlist);
        // Firestore 'in' query is limited. Chunk the IDs into arrays of 30.
        const chunks = [];
        for (let i = 0; i < wishlistIds.length; i += 30) {
          chunks.push(wishlistIds.slice(i, i + 30));
        }

        const productPromises = chunks.map(chunk => {
          const productsQuery = query(collection(db, 'products'), where(documentId(), 'in', chunk));
          return getDocs(productsQuery);
        });

        const querySnapshots = await Promise.all(productPromises);

        const fetchedProducts = [];
        querySnapshots.forEach(snapshot => {
          snapshot.forEach(doc => {
            fetchedProducts.push({ id: doc.id, ...doc.data() });
          });
        });

        setProducts(fetchedProducts);

      } catch (err) {
        console.error("Error fetching wishlist products:", err);
        setError("No se pudieron cargar los productos de tu lista de deseos.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist, wishlistLoading, currentUser]);

  const renderContent = () => {
    // While context is loading user/wishlist data or we are fetching products
    if (loading || wishlistLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    // User is logged out
    if (!currentUser) {
      return (
        <Alert severity="info" action={
          <Button component={RouterLink} to="/login" color="inherit" size="small">
            Iniciar Sesión
          </Button>
        }>
          Inicia sesión para ver tu lista de deseos.
        </Alert>
      );
    }
    
    // Wishlist is empty
    if (products.length === 0) {
      return (
         <Box sx={{ textAlign: 'center', mt: 4, p: 4, border: '2px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
            <FavoriteBorder sx={{ fontSize: 60, color: 'grey.400' }} />
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
      );
    }

    // Display products
    return (
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Lista de Deseos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tus productos favoritos, guardados en un solo lugar.
      </Typography>
      {renderContent()}
    </Paper>
  );
};

export default WishlistPage;
