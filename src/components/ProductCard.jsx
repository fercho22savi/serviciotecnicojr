import React, { useState } from 'react';
import {
    Card, CardContent, CardMedia, Typography, Box, IconButton, Rating, Button, TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ProductDetailModal from './ProductDetailModal';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[8],
    },
    cursor: 'pointer',
}));

const CardActionsContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    marginTop: 'auto', // Pushes actions to the bottom
});

function ProductCard({ product, products, addToCart, handleWishlist, wishlist }) {
    const [quantity, setQuantity] = useState(1);
    const [open, setOpen] = useState(false);
    const isWishlisted = wishlist.has(product.id);

    const onAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, quantity);
    };

    const onToggleWishlist = (e) => {
        e.stopPropagation();
        handleWishlist(product.id);
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <StyledCard onClick={handleOpen}>
                <CardMedia
                    component="img"
                    image={product.imageUrl}
                    alt={product.name}
                    sx={{ height: 200, backgroundSize: 'contain', objectFit: 'contain' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating name="read-only" value={product.averageRating || 0} precision={0.5} readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({product.reviewCount || 0})
                        </Typography>
                    </Box>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                        ${product.price.toFixed(2)}
                    </Typography>
                </CardContent>

                {/* Quantity Selector */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1 }} onClick={e => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <RemoveIcon />
                    </IconButton>
                    <TextField 
                        size="small" 
                        value={quantity} 
                        InputProps={{ readOnly: true }} 
                        sx={{ width: '50px', textAlign: 'center', '& .MuiInputBase-input': { textAlign: 'center' } }}
                    />
                    <IconButton size="small" onClick={() => setQuantity(quantity + 1)}>
                        <AddIcon />
                    </IconButton>
                </Box>

                <CardActionsContainer>
                    <IconButton onClick={onToggleWishlist} color={isWishlisted ? 'error' : 'default'}>
                        {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={onAddToCart}>
                        Add to Cart
                    </Button>
                </CardActionsContainer>
            </StyledCard>
            <ProductDetailModal
                open={open}
                handleClose={handleClose}
                product={product}
                products={products}
                addToCart={addToCart}
                wishlist={wishlist}
                handleWishlist={handleWishlist}
            />
        </>
    );
}

export default ProductCard;
