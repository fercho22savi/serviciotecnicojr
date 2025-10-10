import React, { useState, useMemo } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { SentimentVeryDissatisfied } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useNavigate } from 'react-router-dom';

// Estilos para el carrusel de imágenes
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// 1. Aceptar las nuevas props: isLoggedIn
const ProductsPage = ({ products, searchTerm, selectedCategory, addToCart, handleWishlist, wishlist, isLoggedIn }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        
        // Crear una copia para no modificar el array original
        let localProducts = [...products];

        // Aplicar filtro de categoría
        if (selectedCategory && selectedCategory !== 'Todas') {
            localProducts = localProducts.filter(p => p.category === selectedCategory);
        }

        // Aplicar filtro de búsqueda
        if (searchTerm) {
            localProducts = localProducts.filter(p => 
                (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return localProducts;
    }, [products, searchTerm, selectedCategory]);


    const handleCardClick = (product) => {
        navigate(`/product/${product.id}`);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleAddToCart = (product, quantity = 1) => {
        if(addToCart) {
            addToCart(product, quantity);
        }
    };

    if (!products) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}><CircularProgress /></Box>;
    }

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                {selectedCategory && selectedCategory !== 'Todas' ? selectedCategory : 'Catálogo de Productos'}
            </Typography>
            
            {filteredProducts.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                    <SentimentVeryDissatisfied sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">
                        {searchTerm || (selectedCategory && selectedCategory !== 'Todas') ? 'No se encontraron productos' : 'Aún no hay productos disponibles'}
                    </Typography>
                    <Typography>
                        {searchTerm || (selectedCategory && selectedCategory !== 'Todas') ? 'Intenta ajustar tu búsqueda o cambiar de categoría.' : 'Vuelve a visitar esta sección más tarde.'}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={4} sx={{mt: 2}}>
                    {filteredProducts.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                            {/* 2. Pasar TODAS las props a ProductCard */}
                            <ProductCard 
                                product={product} 
                                onCardClick={handleCardClick}
                                onAddToCart={handleAddToCart}
                                handleWishlist={handleWishlist} 
                                isInWishlist={wishlist.has(product.id)}
                                isLoggedIn={isLoggedIn}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    open={isModalOpen}
                    handleClose={handleCloseModal}
                    onAddToCart={handleAddToCart}
                />
            )}
        </Container>
    );
};

export default ProductsPage;
