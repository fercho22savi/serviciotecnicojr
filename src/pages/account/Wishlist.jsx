
import React from 'react';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext';
import {
    Container, Typography, Box, CircularProgress, Alert, 
    Grid, Paper, IconButton, Button, Tooltip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

const Wishlist = () => {
    const { t } = useTranslation();
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product) => {
        addToCart({ ...product, id: product.productId }, 1);
        removeFromWishlist(product.id);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('wishlist.title')}
            </Typography>
            
            {wishlist.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6">{t('wishlist.empty_title')}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                        {t('wishlist.empty_subtitle')}
                    </Typography>
                    <Button variant="contained" component={RouterLink} to="/products">
                        {t('wishlist.browse_products_button')}
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {wishlist.map((item) => (
                        <Grid item key={item.id} xs={12} sm={6} md={4}>
                            <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                                <RouterLink to={`/product/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Box
                                        component="img"
                                        src={item.imageUrl || 'https://via.placeholder.com/300'}
                                        alt={item.name}
                                        sx={{
                                            height: 200,
                                            width: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease-in-out',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    />
                                </RouterLink>
                                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="h5" color="primary" sx={{ my: 1 }}>
                                        ${item.price.toLocaleString()}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                        <Tooltip title={t('wishlist.add_to_cart_tooltip')}>
                                            <Button 
                                                variant="contained" 
                                                startIcon={<AddShoppingCartIcon />} 
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                {t('wishlist.add_to_cart_button')}
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title={t('wishlist.remove_tooltip')}>
                                            <IconButton onClick={() => removeFromWishlist(item.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Wishlist;
