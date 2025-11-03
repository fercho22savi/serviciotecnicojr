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

const OrderDetailView = ({ order }) => {

    if (!order) {
        return null;
    }

    // Helper para formatear moneda
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return '$0';
        return `$${amount.toLocaleString('es-CO')}`;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Detalles del Pedido #{order.orderNumber}</Typography>
            
            <Grid container spacing={4}>
                {/* Columna Izquierda: Items y Resumen de Pago */}
                <Grid item xs={12} md={6}>
                    {/* Lista de Artículos */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Artículos</Typography>
                    <List disablePadding>
                        {order.items?.map(item => (
                            <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                                <ListItemText 
                                    primary={item.name}
                                    secondary={`Cantidad: ${item.quantity}`}
                                />
                                <Typography variant="body2">{formatCurrency(item.price * item.quantity)}</Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Resumen de Pago */}
                    <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText primary="Subtotal" />
                        <Typography variant="body1">{formatCurrency(order.pricing?.subtotal)}</Typography>
                    </ListItem>
                    {order.pricing?.discount > 0 && (
                        <ListItem sx={{ py: 0.5, px: 0 }}>
                            <ListItemText primary={`Descuento (${order.coupon?.code || 'N/A'})`} />
                            <Typography variant="body1" color="success.main">{`- ${formatCurrency(order.pricing.discount)}`}</Typography>
                        </ListItem>
                    )}
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                        <ListItemText primary="Coste de Envío" />
                        <Typography variant="body1">
                            {order.pricing?.shipping === 0 ? 'Gratis' : formatCurrency(order.pricing?.shipping)}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText primary="Total" sx={{ fontWeight: 700 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {formatCurrency(order.pricing?.total)}
                        </Typography>
                    </ListItem>
                </Grid>

                {/* Columna Derecha: Dirección y Pago */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Dirección de Envío</Typography>
                    <Box sx={{ mt: 1, mb: 3 }}>
                        <Typography gutterBottom>{order.shippingAddress?.recipientName}</Typography>
                        <Typography gutterBottom>{order.shippingAddress?.street}</Typography>
                        <Typography gutterBottom>{`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}`}</Typography>
                        <Typography gutterBottom>{order.shippingAddress?.country}</Typography>
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Método de Pago</Typography>
                     <Box sx={{ mt: 1 }}>
                        <Typography gutterBottom>Tarjeta terminada en **** {order.payment?.last4}</Typography>
                        <Typography gutterBottom textTransform="capitalize">Marca: {order.payment?.brand}</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OrderDetailView;
