import React, { useState, useEffect } from 'react';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { Typography, Grid, Box, CircularProgress, Paper, Alert } from '@mui/material';
import ProductCard from '../../components/ProductCard';

const RecentlyViewedPage = () => {
  const { recentlyViewedIds } = useRecentlyViewed();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
        if (!recentlyViewedIds || recentlyViewedIds.length === 0) {
            setProducts([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Firestore 'in' query can take up to 30 elements. If we have more, we split it.
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

            // The order from Firestore is not guaranteed, so we re-order based on our recentlyViewedIds list.
            const orderedProducts = recentlyViewedIds
                .map(id => fetchedProducts.find(p => p.id === id))
                .filter(p => p); // Filter out any undefined products that might not exist anymore

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
            Aún no has visto ningún producto. ¡Empieza a explorar nuestro catálogo para ver algo aquí!
        </Alert>
      )}
    </Paper>
  );
};

export default RecentlyViewedPage;
