import React, { useState } from 'react';
import {
    Card, CardContent, Typography, Box, IconButton, Chip, Rating
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImageWithFallback from './ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { wishlist, handleWishlist } = useWishlist();
    const [isHovered, setIsHovered] = useState(false);

    if (!product) {
        return null;
    }

    const {
        id,
        stock = 0,
        images = [],
        name = 'Producto Desconocido',
        price = 0,
        averageRating = 0,
        numReviews = 0
    } = product;

    const isInWishlist = wishlist.has(id);
    const imageUrl = images && images.length > 0 ? images[0] : '';

    const handleCardClick = () => {
        if (id) navigate(`/product/${id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        handleWishlist(product);
    };

    return (
        <Card 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={handleCardClick}>
                <Box sx={{ pt: '100%', position: 'relative', overflow:'hidden', borderRadius: '12px 12px 0 0' }}>
                    <ImageWithFallback
                        src={imageUrl}
                        alt={name}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease'}}
                    />
                    {stock === 0 && (
                        <Chip label="Agotado" size="small" sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontWeight: 'bold'}}/>
                    )}
                </Box>

                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}>
                     <IconButton 
                        size="small" 
                        onClick={handleAddToCart} 
                        disabled={stock === 0}
                        sx={{ 
                            bgcolor: 'secondary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'secondary.dark' },
                            mx: 0.5
                        }}
                    > 
                        <AddShoppingCart />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={handleWishlistClick}
                        sx={{ 
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            mx: 0.5
                        }}
                    >
                        {isInWishlist ? <Favorite fontSize="small"/> : <FavoriteBorder fontSize="small"/>}
                    </IconButton>
                </Box>
            </Box>

            <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography 
                    gutterBottom 
                    variant="subtitle1"
                    component="div" 
                    title={name}
                    onClick={handleCardClick}
                    sx={{ 
                        fontWeight: 600, 
                        lineHeight: 1.3,
                        cursor: 'pointer',
                        mb: 1,
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Rating value={averageRating} precision={0.5} readOnly size="small"/>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>({numReviews})</Typography>
                </Box>
                <Box>
                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        ${Number(price).toLocaleString('es-CO')}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
