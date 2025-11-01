import React, { useState, useEffect } from 'react';
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import ProductCard from './ProductCard';

const RecentlyViewedProducts = () => {
    const { recentlyViewedIds } = useRecentlyViewed();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecentlyViewedProducts = async () => {
            if (!recentlyViewedIds || recentlyViewedIds.length === 0) {
                setProducts([]);
                return;
            }
            
            setLoading(true);
            try {
                const productsRef = collection(db, 'products');
                // Firestore 'in' queries are limited to 10 items. If we have more, we need to chunk the requests.
                // For this implementation, we will slice the most recent 10.
                const q = query(productsRef, where(documentId(), 'in', recentlyViewedIds.slice(0, 10)));
                const querySnapshot = await getDocs(q);
                
                const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Preserve the order from recentlyViewedIds
                const orderedProducts = recentlyViewedIds
                    .map(id => fetchedProducts.find(p => p.id === id))
                    .filter(p => p !== undefined);

                setProducts(orderedProducts);

            } catch (error) {
                console.error("Error fetching recently viewed products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyViewedProducts();
    }, [recentlyViewedIds]);

    if (products.length === 0) {
        return null; // Don't render the component if there are no recently viewed items
    }

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                Vistos Recientemente
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ 
                    flexWrap: 'nowrap', 
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { height: 8 },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,.2)', borderRadius: 4 }
                }}>
                    {products.map((product) => (
                        <Grid item key={product.id} sx={{ minWidth: { xs: 280, sm: 300 } }}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default RecentlyViewedProducts;
