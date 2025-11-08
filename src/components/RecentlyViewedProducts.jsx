
import React, { useState, useEffect } from 'react';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { Typography, Grid, Box, CircularProgress, Container } from '@mui/material';
import ProductCard from './ProductCard';

const RecentlyViewedProducts = () => {
  const { recentlyViewedIds } = useRecentlyViewed();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentlyViewedProducts = async () => {
      if (!recentlyViewedIds || recentlyViewedIds.length === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Firestore 'in' query is limited to 30 elements. Chunk the array if needed.
        const chunks = [];
        for (let i = 0; i < recentlyViewedIds.length; i += 30) {
            chunks.push(recentlyViewedIds.slice(i, i + 30));
        }
        
        const productPromises = chunks.map(chunk => {
            const productsQuery = query(collection(db, 'products'), where(documentId(), 'in', chunk));
            return getDocs(productsQuery);
        });

        const querySnapshots = await Promise.all(productPromises);
        
        const fetchedProductsMap = new Map();
        querySnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                fetchedProductsMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
        });

        // Restore original order from recentlyViewedIds
        const orderedProducts = recentlyViewedIds
            .map(id => fetchedProductsMap.get(id))
            .filter(Boolean); // Filter out any undefined products

        setProducts(orderedProducts);

      } catch (err) {
        console.error("Error fetching recently viewed products:", err);
        setError('No se pudieron cargar los productos vistos recientemente.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewedProducts();
  }, [recentlyViewedIds]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
     return (
        <Container>
            <Typography color="error">{error}</Typography>
        </Container>
     )
  }

  if (products.length === 0) {
    // If there are no recently viewed products, don't render anything.
    return null;
  }

  return (
    <Box sx={{ my: 5 }}>
      <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Vistos Recientemente
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {products.slice(0, 4).map((product) => ( // Show only the first 4 for a cleaner look on the homepage
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecentlyViewedProducts;
