import React, { useState, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { Typography, Grid, Box, CircularProgress, Paper, Alert, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { FavoriteBorder } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const WishlistPage = () => {
  const { currentUser } = useAuth();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistLoading || !currentUser) {
        setProducts([]);
        return;
      }
      if (wishlist.size === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const wishlistIds = Array.from(wishlist);
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
        setError(t('wishlist.fetch_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist, wishlistLoading, currentUser, t]);

  const renderContent = () => {
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

    if (!currentUser) {
      return (
        <Alert severity="info" action={
          <Button component={RouterLink} to="/login" color="inherit" size="small">
            {t('wishlist.login_button')}
          </Button>
        }>
          {t('wishlist.login_prompt')}
        </Alert>
      );
    }
    
    if (products.length === 0) {
      return (
         <Box sx={{ textAlign: 'center', mt: 4, p: 4, border: '2px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
            <FavoriteBorder sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                {t('wishlist.empty_title')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                {t('wishlist.empty_subtitle')}
            </Typography>
            <Button component={RouterLink} to="/products" variant="contained">
                {t('wishlist.explore_button')}
            </Button>
        </Box>
      );
    }

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
        {t('wishlist.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('wishlist.subtitle')}
      </Typography>
      {renderContent()}
    </Paper>
  );
};

export default WishlistPage;
