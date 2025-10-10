import React, { useMemo } from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Link as RouterLink } from 'react-router-dom';

function Home({ products, searchTerm, selectedCategory, addToCart, handleWishlist, wishlist }) {
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (selectedCategory && selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );
        }

        if (!searchTerm && !selectedCategory) {
            return filtered.slice(0, 8);
        }

        return filtered;

    }, [products, searchTerm, selectedCategory]);

    const getTitle = () => {
        if (searchTerm && selectedCategory) {
            return `Results for "${searchTerm}" in ${selectedCategory}`;
        }
        if (searchTerm) {
            return `Results for "${searchTerm}"`
        }
        if (selectedCategory) {
            return `Showing products from ${selectedCategory}`;
        }
        return 'Our Catalog';
    }

    return (
        <>
            {/* Hero Section */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: { xs: '50vh', md: '60vh' },
                    color: 'white',
                    textAlign: 'center',
                    p: 4,
                    background: 'linear-gradient(45deg, #1A2980 0%, #26D0CE 100%)',
                    backgroundSize: '400% 400%',
                    animation: 'gradient 15s ease infinite',
                    '@keyframes gradient': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                        '100%': { backgroundPosition: '0% 50%' },
                    },
                    mb: 6,
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom
                        sx={{
                            fontSize: {
                                xs: '2.5rem',
                                sm: '3.5rem',
                                md: '4rem'
                            }
                        }}
                    >
                        Products from Our Catalog
                    </Typography>
                    <Typography variant="h6" component="p" sx={{ my: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Find the perfect piece for your space.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            py: 1.5,
                            px: { xs: 3, sm: 5 },
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            bgcolor: '#FFFFFF',
                            color: '#1A2980',
                            fontWeight: 'bold',
                            '&:hover': {
                                bgcolor: '#f0f0f0',
                                transform: 'scale(1.05)'
                            },
                            transition: 'transform 0.2s ease-in-out'
                        }}
                        component={RouterLink}
                        to="/products"
                    >
                        SHOP NOW
                    </Button>
                </Container>
            </Box>

            {/* Product Catalog */}
            <Container sx={{ pb: 8 }} maxWidth="lg">
                <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                    {getTitle()}
                </Typography>
                <Grid container spacing={4}>
                    {filteredProducts.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                            <ProductCard 
                                product={product} 
                                products={products}
                                addToCart={addToCart} 
                                handleWishlist={handleWishlist} 
                                wishlist={wishlist}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}

export default Home;
