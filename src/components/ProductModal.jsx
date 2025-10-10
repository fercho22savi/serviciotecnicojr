import React, { useState } from 'react';
import {
    Modal, Box, Typography, Button, IconButton, Grid, Chip, Divider, TextField, Tooltip
} from '@mui/material';
import {
    Close, AddShoppingCart, ShoppingCartCheckout, FavoriteBorder, LocalShipping, Storefront, VerifiedUser, Add, Remove
} from '@mui/icons-material';
import Slider from 'react-slick';
import { styled } from '@mui/material/styles';

// Estilos para el modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '85%',
    maxWidth: '1100px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: { xs: 2, md: 4 },
    borderRadius: 2,
    maxHeight: '90vh', 
    overflowY: 'auto'
};

// Estilo para el contenedor del slider
const SliderContainer = styled(Box)({
  '.slick-dots': {
    bottom: '10px',
    'li button:before': {
      fontSize: '12px',
      color: '#ccc',
    },
    'li.slick-active button:before': {
      color: '#1A2980', 
    },
  },
  '.slick-prev:before, .slick-next:before': {
      color: '#333'
  },
  '.slick-slide img': {
      maxHeight: '500px', 
      width: 'auto',
      margin: '0 auto',
      objectFit: 'contain'
  }
});

const ProductModal = ({ product, open, handleClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true
    };

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleBuyNow = () => {
        onAddToCart(product, quantity);
        // Idealmente, aquí redirigirías al checkout
        console.log(`Comprar ahora: ${quantity} de ${product.name}`);
        handleClose();
    }

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        console.log(`Añadido al carrito: ${quantity} de ${product.name}`);
        handleClose();
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="product-modal-title"
            aria-describedby="product-modal-description"
        >
            <Box sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                >
                    <Close />
                </IconButton>

                <Grid container spacing={4}>
                    {/* Columna de Imagen */}
                    <Grid item xs={12} md={7}>
                        <SliderContainer>
                            <Slider {...sliderSettings}>
                                {product.images && product.images.length > 0 ? (
                                    product.images.map((img, index) => (
                                        <div key={index}>
                                            <img src={img} alt={`${product.name} - ${index + 1}`} />
                                        </div>
                                    ))
                                ) : (
                                    <div><img src='https://via.placeholder.com/500' alt="placeholder" /></div>
                                )}
                            </Slider>
                        </SliderContainer>
                    </Grid>

                    {/* Columna de Información */}
                    <Grid item xs={12} md={5}>
                        <Typography id="product-modal-title" variant="h5" component="h2" fontWeight="600">
                            {product.name}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {product.originalPrice && (
                            <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                ${Number(product.originalPrice).toLocaleString('es-CO')}
                            </Typography>
                        )}
                        <Typography variant="h4" color="text.primary" fontWeight="bold" gutterBottom>
                           ${Number(product.price).toLocaleString('es-CO')}
                        </Typography>
                         {product.installments && (
                            <Typography variant="body1" color="green" sx={{mb: 2}}>
                                en {product.installments}x ${Number(product.price / product.installments).toLocaleString('es-CO')} sin interés
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            Stock disponible: {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Selector de Cantidad */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                            <Typography sx={{ mr: 2 }}>Cantidad:</Typography>
                            <IconButton onClick={() => handleQuantityChange(-1)} size="small">
                                <Remove />
                            </IconButton>
                            <Typography sx={{ mx: 2, fontWeight:'bold' }}>{quantity}</Typography>
                            <IconButton onClick={() => handleQuantityChange(1)} size="small">
                                <Add />
                            </IconButton>
                        </Box>

                        {/* Botones de Acción */}
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 1.5, py: 1.5, fontWeight:'bold' }}
                            startIcon={<ShoppingCartCheckout />}
                            onClick={handleBuyNow}
                        >
                            Comprar ahora
                        </Button>
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            sx={{ py: 1.5, fontWeight:'bold' }}
                            startIcon={<AddShoppingCart />}
                            onClick={handleAddToCart}
                        >
                            Agregar al carrito
                        </Button>

                        {/* Información adicional */}
                        <Box sx={{mt: 3, color: 'text.secondary'}}>
                             <Box sx={{display: 'flex', alignItems: 'center', my: 1}}><LocalShipping fontSize="small" sx={{mr: 1}}/> Envío a todo el país</Box>
                             <Box sx={{display: 'flex', alignItems: 'center', my: 1}}><VerifiedUser fontSize="small" sx={{mr: 1}}/> Compra Protegida, recibe el producto que esperabas.</Box>
                             <Box sx={{display: 'flex', alignItems: 'center', my: 1}}><Storefront fontSize="small" sx={{mr: 1}}/> Vendido por MiTienda</Box>
                        </Box>

                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};

export default ProductModal;
