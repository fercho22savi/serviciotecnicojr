import React from 'react';
import {
    Box,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const OrderDetailView = ({ order }) => {
    const { t, i18n } = useTranslation();

    if (!order) {
        return null;
    }

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return t('order_detail.invalid_amount');
        const locale = i18n.language === 'es' ? 'es-CO' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{t('order_detail.title', { id: order.orderNumber })}</Typography>
            
            <Grid container spacing={4}>
                {/* Columna Izquierda: Items y Resumen de Pago */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('order_detail.items_label')}</Typography>
                    <List disablePadding>
                        {order.items?.map(item => (
                            <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                                <ListItemText 
                                    primary={item.name}
                                    secondary={`${t('order_detail.quantity_label')}: ${item.quantity}`}
                                />
                                <Typography variant="body2">{formatCurrency(item.price * item.quantity)}</Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    
                    <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText primary={t('order_detail.subtotal')} />
                        <Typography variant="body1">{formatCurrency(order.pricing?.subtotal)}</Typography>
                    </ListItem>
                    {order.pricing?.discount > 0 && (
                        <ListItem sx={{ py: 0.5, px: 0 }}>
                            <ListItemText primary={`${t('order_detail.discount')} (${order.coupon?.code || 'N/A'})`} />
                            <Typography variant="body1" color="success.main">{`- ${formatCurrency(order.pricing.discount)}`}</Typography>
                        </ListItem>
                    )}
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                        <ListItemText primary={t('order_detail.shipping_cost')} />
                        <Typography variant="body1">
                            {order.pricing?.shipping === 0 ? t('order_detail.free_shipping') : formatCurrency(order.pricing?.shipping)}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText primary={t('order_detail.total_label')} sx={{ fontWeight: 700 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {formatCurrency(order.pricing?.total)}
                        </Typography>
                    </ListItem>
                </Grid>

                {/* Columna Derecha: Dirección y Pago */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('order_detail.shipping_address')}</Typography>
                    <Box sx={{ mt: 1, mb: 3 }}>
                        <Typography gutterBottom>{order.shippingAddress?.recipientName}</Typography>
                        <Typography gutterBottom>{order.shippingAddress?.street}</Typography>
                        <Typography gutterBottom>{`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}`}</Typography>
                        <Typography gutterBottom>{order.shippingAddress?.country}</Typography>
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('order_detail.payment_method')}</Typography>
                     <Box sx={{ mt: 1 }}>
                        <Typography gutterBottom>{t('order_detail.card_ending_in', { last4: order.payment?.last4 })}</Typography>
                        <Typography gutterBottom textTransform="capitalize">{t('order_detail.brand_label')}: {order.payment?.brand}</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OrderDetailView;
