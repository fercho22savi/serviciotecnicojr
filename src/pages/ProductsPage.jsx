import React, { useMemo } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import ProductCard from '../components/ProductCard';

function ProductsPage({ products, searchTerm, selectedCategory, addToCart, handleWishlist, wishlist }) {
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (selectedCategory && selectedCategory !== 'Todas') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    }, [products, searchTerm, selectedCategory]);

    const getTitle = () => {
        if (searchTerm && selectedCategory) {
            return `Resultados para "${searchTerm}" en ${selectedCategory}`;
        }
        if (searchTerm) {
            return `Resultados para "${searchTerm}"`
        }
        if (selectedCategory) {
            return `Mostrando productos de ${selectedCategory}`;
        }
        return 'Catálogo de Productos';
    }


    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                fontWeight="bold" 
                textAlign="center"
                sx={{ mb: 5, color: '#1A2980' }}
            >
                {getTitle()}
            </Typography>
            {filteredProducts.length > 0 ? (
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
            ) : (
                <Box textAlign="center" sx={{ mt: 8 }}>
                    <Typography variant="h6">No se encontraron productos.</Typography>
                    <Typography color="textSecondary">
                        Intenta con otra búsqueda o revisa nuestro catálogo completo.
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

export default ProductsPage;
