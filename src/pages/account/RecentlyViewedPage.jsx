import React, { useState, useEffect } from 'react';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { Typography, Grid, Box, CircularProgress, Paper, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';

const RecentlyViewedPage = () => {
  const { recentlyViewedIds, forceReload } = useRecentlyViewed();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Force a reload from localStorage every time the page is focused
  useEffect(() => {
    const handleFocus = () => {
        forceReload();
    };
    window.addEventListener('focus', handleFocus);
    // Also reload on initial mount
    forceReload(); 
    return () => {
        window.removeEventListener('focus', handleFocus);
    };
  }, [forceReload]);

  useEffect(() => {
    const fetchProducts = async () => {
        if (!recentlyViewedIds || recentlyViewedIds.length === 0) {
            setProducts([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const productChunks = [];
            for (let i = 0; i < recentlyViewedIds.length; i += 30) {
                productChunks.push(recentlyViewedIds.slice(i, i + 30));
            }
            
            const productPromises = productChunks.map(chunk => {
                const productsQuery = query(collection(db, 'products'), where(documentId(), 'in', chunk));
                return getDocs(productsQuery);
            });

            const productSnapshots = await Promise.all(productPromises);
            
            let fetchedProducts = [];
            productSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    fetchedProducts.push({ id: doc.id, ...doc.data() });
                });
            });

            const orderedProducts = recentlyViewedIds
                .map(id => fetchedProducts.find(p => p.id === id))
                .filter(p => p); 

            setProducts(orderedProducts);

        } catch (err) {
            console.error("Error fetching recently viewed products:", err);
            setError("No se pudieron cargar los productos vistos recientemente.");
        } finally {
            setLoading(false);
        }
    };

    fetchProducts();
  }, [recentlyViewedIds]);

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Vistos Recientemente
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Aquí están los últimos productos que has explorado.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : products.length > 0 ? (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
            Aún no has visto ningún producto. ¡Empieza a explorar nuestro <Link component={RouterLink} to="/products">catálogo</Link> para ver algo aquí!
        </Alert>
      )}
    </Paper>
  );
};

export default RecentlyViewedPage;
