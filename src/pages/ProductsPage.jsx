import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Button, Stack } from '@mui/material';
import { SentimentVeryDissatisfied } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { db } from '../firebase/config';
import { collection, query, orderBy, startAfter, limit, getDocs, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PAGE_SIZE = 8;

const ProductsPage = ({ searchTerm, selectedCategory, addToCart, handleWishlist, wishlist, isLoggedIn }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisibleStack, setFirstVisibleStack] = useState([]);
    const [page, setPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(false);
    const navigate = useNavigate();

    const fetchProducts = useCallback(async (direction = 'next') => {
        setLoading(true);
        try {
            let productsQuery = query(
                collection(db, "products"),
                orderBy("name"),
                limit(PAGE_SIZE)
            );

            if (direction === 'next' && lastVisible) {
                productsQuery = query(productsQuery, startAfter(lastVisible));
            }
            
            if (direction === 'prev' && firstVisibleStack.length > 1) {
                 const previousFirst = firstVisibleStack[firstVisibleStack.length - 2];
                 productsQuery = query(productsQuery, startAfter(previousFirst));
            }
            
            // Apply filters
            if (selectedCategory && selectedCategory !== 'Todas') {
                productsQuery = query(productsQuery, where('category', '==', selectedCategory));
            }
            if (searchTerm) {
                // Firestore does not support partial string matches natively.
                // A common workaround is to have an array of keywords for each product.
                // For simplicity here, we will filter after fetching, but this is not optimal for large datasets.
            }

            const documentSnapshots = await getDocs(productsQuery);
            const newProducts = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (newProducts.length > 0) {
                setProducts(newProducts);
                const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
                const newFirstVisible = documentSnapshots.docs[0];
                
                setLastVisible(newLastVisible);

                if (direction === 'next') {
                    setPage(p => p + 1);
                    setFirstVisibleStack(stack => [...stack, newFirstVisible]);
                } else { // prev
                    setPage(p => p - 1);
                    setFirstVisibleStack(stack => stack.slice(0, -1));
                }
            } else if (direction === 'next') {
                setIsLastPage(true);
                toast.success("Has llegado al final del catálogo.");
            }

            if (documentSnapshots.docs.length < PAGE_SIZE) {
                setIsLastPage(true);
            }

        } catch (error) {
            console.error("Error fetching products: ", error);
            toast.error("No se pudieron cargar los productos.");
        } finally {
            setLoading(false);
        }
    }, [lastVisible, selectedCategory, searchTerm, firstVisibleStack]);

    useEffect(() => {
        // Reset and fetch when filters change
        setProducts([]);
        setLastVisible(null);
        setFirstVisibleStack([]);
        setPage(1);
        setIsLastPage(false);
        fetchProducts('next');
    }, [selectedCategory, searchTerm]);

    const handleCardClick = (product) => {
        navigate(`/product/${product.id}`);
    };

    const handlePageChange = (direction) => {
        fetchProducts(direction);
    };

    const finalProducts = searchTerm
        ? products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
        : products;

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                {selectedCategory && selectedCategory !== 'Todas' ? selectedCategory : 'Catálogo de Productos'}
            </Typography>
            
            {loading && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
            )}

            {!loading && finalProducts.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                    <SentimentVeryDissatisfied sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">No se encontraron productos</Typography>
                    <Typography>Intenta ajustar tu búsqueda o cambiar de categoría.</Typography>
                </Box>
            ) : (
                <Grid container spacing={4} sx={{mt: 2}}>
                    {finalProducts.map((product) => (
                        <Grid key={product.id} item xs={12} sm={6} md={4} lg={3}>
                            <ProductCard 
                                product={product} 
                                onCardClick={handleCardClick}
                                addToCart={addToCart}
                                handleWishlist={handleWishlist} 
                                isInWishlist={wishlist.has(product.id)}
                                isLoggedIn={isLoggedIn}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
            
            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
                <Button 
                    variant="outlined" 
                    onClick={() => handlePageChange('prev')} 
                    disabled={page <= 1}
                >
                    Anterior
                </Button>
                <Button 
                    variant="contained" 
                    onClick={() => handlePageChange('next')} 
                    disabled={isLastPage || loading}
                >
                    Siguiente
                </Button>
            </Stack>
        </Container>
    );
};

export default ProductsPage;
