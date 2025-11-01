import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';

const OrderDetailView = ({ orderId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('No se encontraron los detalles de este pedido.');
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError('Ocurrió un error al cargar los detalles del pedido.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    if (!order) {
        return null;
    }

    return (
        <Box sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom>Detalles del Pedido</Typography>
            
            <Grid container spacing={4}>
                {/* Columna Izquierda: Items y Resumen de Pago */}
                <Grid item xs={12} md={6}>
                    {/* Lista de Artículos */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Artículos</Typography>
                    <List disablePadding>
                        {order.items.map(item => (
                            <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                                <ListItemText 
                                    primary={item.name}
                                    secondary={`Cantidad: ${item.quantity}`}
                                />
                                <Typography variant="body2">{`$${(item.price * item.quantity).toLocaleString('es-CO')}`}</Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Resumen de Pago */}
                    <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText primary="Subtotal" />
                        <Typography variant="body1">{`$${order.subtotal.toLocaleString('es-CO')}`}</Typography>
                    </ListItem>
                    {order.discountAmount > 0 && (
                        <ListItem sx={{ py: 0.5, px: 0 }}>
                            <ListItemText primary={`Descuento (${order.appliedCoupon})`} />
                            <Typography variant="body1" color="success.main">{`- $${order.discountAmount.toLocaleString('es-CO')}`}</Typography>
                        </ListItem>
                    )}
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                        <ListItemText primary="Coste de Envío" />
                        <Typography variant="body1">
                            {order.shippingCost === 0 ? 'Gratis' : `$${order.shippingCost.toLocaleString('es-CO')}`}
                        </Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemText primary="Total" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {`$${order.totalAmount.toLocaleString('es-CO')}`}
                        </Typography>
                    </ListItem>
                </Grid>

                {/* Columna Derecha: Dirección de Envío */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Dirección de Envío</Typography>
                    <Box sx={{ mt: 1 }}>
                        <Typography gutterBottom>{order.shippingAddress.recipientName}</Typography>
                        <Typography gutterBottom>{order.shippingAddress.street}</Typography>
                        <Typography gutterBottom>{`${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode}`}</Typography>
                        <Typography gutterBottom>{order.shippingAddress.country}</Typography>
                        <Typography gutterBottom>Tel: {order.shippingAddress.recipientPhone}</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OrderDetailView;
