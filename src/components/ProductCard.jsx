import React from 'react';
import {
    Card, CardContent, CardMedia, Typography, Box, Button, Chip, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 345,
    margin: 'auto',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[8],
    },
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    position: 'relative', // <-- Añadido para el posicionamiento del icono
}));

const ProductCard = ({ 
    product, 
    onCardClick, 
    onAddToCart, 
    isInWishlist, 
    handleWishlist, 
    isLoggedIn 
}) => {
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        onAddToCart(product);
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            handleWishlist(product.id);
        }
    };

    return (
        <StyledCard onClick={() => onCardClick(product)}>
            <IconButton
                aria-label="add to wishlist"
                onClick={handleWishlistClick}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                }}
            >
                {isInWishlist ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>

            <CardMedia
                component="img"
                sx={{ 
                    height: 220, 
                    objectFit: 'contain',
                    p: 2, 
                 }}
                image={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/220'}
                alt={product.name}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 0 }}>
                <Typography gutterBottom variant="body1" component="div" sx={{ fontWeight: '500', height: '3.5em', overflow: 'hidden' }}>
                    {product.name}
                </Typography>
                <Box sx={{ flexGrow: 1 }} /> 
                <Box>
                    {product.originalPrice && (
                        <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${Number(product.originalPrice).toLocaleString('es-CO')}
                        </Typography>
                    )}
                    <Typography variant="h5" color="text.primary" sx={{ fontWeight: 'bold' }}>
                        ${Number(product.price).toLocaleString('es-CO')}
                    </Typography>
                    {product.installments && (
                        <Typography variant="body2" color="green">
                            en {product.installments}x ${Number(product.price / product.installments).toLocaleString('es-CO')} sin interés
                        </Typography>
                    )}
                     <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}
                        startIcon={<AddShoppingCart />}
                        onClick={handleAddToCart}
                    >
                        Añadir al carrito
                    </Button>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default ProductCard;
