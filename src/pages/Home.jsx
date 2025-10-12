import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, CircularProgress } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Link as RouterLink } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

function Home({ addToCart, handleWishlist, wishlist, isLoggedIn }) {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            setLoading(true);
            try {
                // Create a query to get 8 products, ordered by a specific field (e.g., createdAt or name)
                const productsQuery = query(
                    collection(db, "products"), 
                    orderBy("createdAt", "desc"), // Assuming you have a createdAt field
                    limit(8)
                );
                const querySnapshot = await getDocs(productsQuery);
                const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFeaturedProducts(productsList);
            } catch (error) {
                console.error("Error fetching featured products: ", error);
                toast.error("No se pudieron cargar los productos destacados.");
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <Box
                sx={{
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 8, md: 12 },
                    textAlign: 'center',
                    color: 'primary.contrastText',
                    background: (theme) =>
                        `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundSize: '400% 400%',
                    animation: 'gradient 15s ease infinite',
                    '@keyframes gradient': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                        '100%': { backgroundPosition: '0% 50%' },
                    },
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                        Estilo que Define tu Espacio
                    </Typography>
                    <Typography variant="h6" component="p" sx={{ my: 3, opacity: 0.9 }}>
                        Descubre piezas únicas que transforman tu hogar en un santuario de diseño y confort.
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        component={RouterLink}
                        to="/products"
                        sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            transform: 'scale(1)',
                            transition: (theme) => theme.transitions.create('transform', {
                                duration: theme.transitions.duration.short,
                            }),
                            '&:hover': {
                                transform: 'scale(1.05)'
                            },
                         }}
                    >
                        EXPLORAR COLECCIÓN
                    </Button>
                </Container>
            </Box>

            {/* Featured Products Section */}
            <Container sx={{ py: 8 }} maxWidth="lg">
                <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                    Nuestros Productos Destacados
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                                    <ProductCard
                                        product={product}
                                        addToCart={addToCart}
                                        handleWishlist={handleWishlist}
                                        isInWishlist={wishlist.has(product.id)}
                                        isLoggedIn={isLoggedIn}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                                    No hay productos destacados disponibles en este momento.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Container>
        </>
    );
}

export default Home;
