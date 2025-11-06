import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    Grid,
    Box,
    Divider
} from '@mui/material';

const Review = ({ 
    formValues, 
    cart,
    subtotal, 
    shippingCost, 
    discountAmount,
    finalTotal,
    appliedCoupon,
    currency,
    formatCurrency,
    convertToUSD
}) => {
    const { t } = useTranslation();

    const displayAmount = (amount) => {
        const value = currency === 'USD' ? convertToUSD(amount) : amount;
        return formatCurrency(value, currency);
    };
    
    const displayAmountWithSign = (amount, sign = '') => {
        const value = currency === 'USD' ? convertToUSD(amount) : amount;
        const formattedValue = formatCurrency(value, currency);
        return `${sign}${formattedValue}`;
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Resumen del Pedido
            </Typography>
            <List disablePadding>
                {cart.map((item) => (
                    <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                        <ListItemText 
                            primary={item.name} 
                            secondary={`Cantidad: ${item.quantity}`}
                        />
                        <Typography variant="body2">{displayAmount(item.price * item.quantity)}</Typography>
                    </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Subtotal" />
                    <Typography variant="body1">{displayAmount(subtotal)}</Typography>
                </ListItem>

                {discountAmount > 0 && (
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                        <ListItemText 
                            primary="Descuento"
                            secondary={appliedCoupon ? `Código: ${appliedCoupon.code}` : ''}
                        />
                        <Typography variant="body1" color="success.main">{displayAmountWithSign(discountAmount, '-')}</Typography>
                    </ListItem>
                )}

                <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText primary="Envío" />
                    <Typography variant="body1">
                        {shippingCost === 0 ? 'GRATIS' : displayAmount(shippingCost)}
                    </Typography>
                </ListItem>

                <ListItem sx={{ py: 1, px: 0, mt: 1 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {displayAmount(finalTotal)}
                    </Typography>
                </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Enviar a
                    </Typography>
                    <Typography gutterBottom>{formValues.recipientName}</Typography>
                    <Typography gutterBottom>{formValues.street}</Typography>
                    <Typography gutterBottom>{`${formValues.city}, ${formValues.postalCode}`}</Typography>
                    <Typography gutterBottom>{formValues.country}</Typography>
                </Grid>
                <Grid item container direction="column" xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Detalles del Pago (Simulado)
                    </Typography>
                    <Typography gutterBottom>Titular: {formValues.recipientName}</Typography>
                    <Typography gutterBottom>Número: xxxx-xxxx-xxxx-....</Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Review;
