import React from 'react';
import {
    Card, CardContent, Typography, Box, Button, IconButton, Chip
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImageWithFallback from './ImageWithFallback';

const ProductCard = ({ product, addToCart, isInWishlist, handleWishlist }) => {
    const navigate = useNavigate();

    if (!product) {
        return null;
    }

    const {
        id,
        stock = 0,
        images = [],
        category = 'Sin Categoría',
        name = 'Producto Desconocido',
        price = 0,
        originalPrice,
        installments
    } = product;

    const handleCardClick = () => {
        if (id) {
            navigate(`/product/${id}`);
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (product) {
            addToCart(product);
            toast.success('¡Añadido al carrito!');
        } else {
            toast.error('Este producto no se puede añadir.')
        }
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        handleWishlist(product);
    };

    const stockStatus = stock > 0 ? (stock < 5 ? 'Poco Stock' : 'En Stock') : 'Agotado';
    const stockColor = stock > 0 ? (stock < 5 ? 'warning' : 'success') : 'error';
    const imageUrl = images && images.length > 0 ? images[0] : '';

    return (
        <Card sx={{
            height: '100%', // <-- Restored to ensure cards in a row are the same height
            display: 'flex',
            flexDirection: 'column',
            transition: (theme) => theme.transitions.create(['box-shadow', 'transform'], {
                duration: theme.transitions.duration.short,
            }),
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: (theme) => theme.shadows[6],
            },
            opacity: stock === 0 ? 0.7 : 1,
        }}>
            <Box sx={{ position: 'relative', cursor: id ? 'pointer' : 'default' }} onClick={handleCardClick}>
                <Chip 
                    label={stockStatus}
                    color={stockColor}
                    size="small"
                    sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, fontWeight: 'bold', fontSize: '0.7rem' }} 
                />
                <IconButton
                    aria-label="add to wishlist"
                    onClick={handleWishlistClick}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                        color: 'text.secondary'
                    }}
                >
                    {isInWishlist ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
                <Box sx={{ pt: '100%', position: 'relative', bgcolor: 'grey.100' }}>
                    <ImageWithFallback
                        src={imageUrl}
                        alt={name}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                    {category}
                </Typography>
                <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    title={name}
                    sx={{ 
                        fontWeight: 600, 
                        lineHeight: 1.25, 
                        height: '2.5em', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        cursor: id ? 'pointer' : 'default',
                        mb: 1.5
                    }} 
                    onClick={handleCardClick}
                >
                    {name}
                </Typography>
                
                <Box sx={{ mt: 'auto' }}> {/* This Box pushes content below it to the bottom */}
                    <Box sx={{ mb: 1.5 }}>
                        {originalPrice && originalPrice > price && (
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', mr: 1 }}>
                                ${Number(originalPrice).toLocaleString('es-CO')}
                            </Typography>
                        )}
                        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 'bold' }}>
                            ${Number(price).toLocaleString('es-CO')}
                        </Typography>
                        {installments && (
                            <Typography variant="body2" sx={{color: (theme) => theme.palette.success.main}}>
                                Hasta {installments} cuotas sin interés
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth 
                            startIcon={<AddShoppingCart />}
                            onClick={handleAddToCart}
                            disabled={stock === 0}
                            sx={{ fontWeight: 'bold' }}
                        >
                            {stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
