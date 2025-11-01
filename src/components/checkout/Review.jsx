import React from 'react';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next'; // <-- 1. IMPORTAR
import {
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    Grid,
    Box,
    Divider,
    TextField,
    Button,
    CircularProgress
} from '@mui/material';

const Review = ({ 
    formValues, 
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    subtotal, 
    shippingCost, 
    discountAmount,
    finalTotal,
    couponError,
    isApplyingCoupon,
    appliedCoupon 
}) => {
    const { cart } = useCart();
    const { t } = useTranslation(); // <-- 2. INICIALIZAR

    return (
        <Box>
            {/* 3. REEMPLAZAR TEXTOS */}
            <Typography variant="h6" gutterBottom>
                {t('checkout.review.title')}
            </Typography>
            <List disablePadding>
                {cart.map((item) => (
                    <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                        <ListItemText 
                            primary={item.name} 
                            secondary={`${t('checkout.review.quantity')}: ${item.quantity}`}
                        />
                        <Typography variant="body2">{`$${(item.price * item.quantity).toLocaleString('es-CO')}`}</Typography>
                    </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary={t('checkout.review.subtotal')} />
                    <Typography variant="body1">{`$${subtotal.toLocaleString('es-CO')}`}</Typography>
                </ListItem>

                {discountAmount > 0 && (
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                        <ListItemText 
                            primary={t('checkout.review.discount')}
                            secondary={`${t('checkout.review.coupon_code_label')} ${appliedCoupon}`}
                        />
                        <Typography variant="body1" color="success.main">{`- $${discountAmount.toLocaleString('es-CO')}`}</Typography>
                    </ListItem>
                )}

                <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary={t('checkout.review.shipping')} />
                    <Typography variant="body1">
                        {shippingCost === 0 ? t('checkout.review.free_shipping') : `$${shippingCost.toLocaleString('es-CO')}`}
                    </Typography>
                </ListItem>

                <ListItem sx={{ py: 1, px: 0, mt: 1 }}>
                    <ListItemText primary={t('checkout.review.total')} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {`$${finalTotal.toLocaleString('es-CO')}`}
                    </Typography>
                </ListItem>
            </List>
            
            <Box sx={{ my: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('checkout.review.discount_code_title')}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField 
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder={t('checkout.review.coupon_placeholder')}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={isApplyingCoupon || !!appliedCoupon}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleApplyCoupon} 
                        disabled={isApplyingCoupon || !couponCode || !!appliedCoupon}
                        sx={{ minWidth: '100px' }}
                    >
                        {isApplyingCoupon ? <CircularProgress size={24} color="inherit" /> : t('checkout.review.apply_button')}
                    </Button>
                </Box>
                {couponError && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{couponError}</Typography>}
                {appliedCoupon && !couponError && <Typography color="success.main" variant="caption" sx={{ mt: 1 }}>{t('checkout.review.coupon_applied')}</Typography>}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        {t('checkout.review.shipping_to')}
                    </Typography>
                    <Typography gutterBottom>{formValues.recipientName}</Typography>
                    <Typography gutterBottom>{formValues.street}</Typography>
                    <Typography gutterBottom>{`${formValues.city}, ${formValues.state || ''} ${formValues.postalCode}`}</Typography>
                    <Typography gutterBottom>{formValues.country}</Typography>
                </Grid>
                <Grid item container direction="column" xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        {t('checkout.payment.title_simulated')}
                    </Typography>
                    <Grid container>
                        <Grid item xs={6}><Typography gutterBottom>{t('checkout.payment.cardholder')}</Typography></Grid>
                        <Grid item xs={6}><Typography gutterBottom>{formValues.cardName}</Typography></Grid>
                        <Grid item xs={6}><Typography gutterBottom>{t('checkout.payment.card_number_label')}</Typography></Grid>
                        <Grid item xs={6}><Typography gutterBottom>xxxx-xxxx-xxxx-{formValues.cardNumber ? formValues.cardNumber.slice(-4) : ''}</Typography></Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Review;
