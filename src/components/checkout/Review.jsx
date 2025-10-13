
import React from 'react';
import { useCart } from '../../context/CartContext';
import {
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    Grid,
    Box,
    Divider
} from '@mui/material';

const Review = ({ formValues }) => {
    const { cart } = useCart();

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                        <Typography variant="body2">${(item.price * item.quantity).toFixed(2)}</Typography>
                    </ListItem>
                ))}
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        ${totalAmount.toFixed(2)}
                    </Typography>
                </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Dirección de Envío
                    </Typography>
                    <Typography gutterBottom>{formValues.firstName} {formValues.lastName}</Typography>
                    <Typography gutterBottom>{formValues.address}</Typography>
                    <Typography gutterBottom>{`${formValues.city}, ${formValues.state || ''} ${formValues.zip}`}</Typography>
                    <Typography gutterBottom>{formValues.country}</Typography>
                </Grid>
                <Grid item container direction="column" xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Detalles del Pago
                    </Typography>
                    <Grid container>
                        <Grid item xs={6}><Typography gutterBottom>Titular:</Typography></Grid>
                        <Grid item xs={6}><Typography gutterBottom>{formValues.cardName}</Typography></Grid>
                        <Grid item xs={6}><Typography gutterBottom>Número:</Typography></Grid>
                        <Grid item xs={6}><Typography gutterBottom>xxxx-xxxx-xxxx-{formValues.cardNumber.slice(-4)}</Typography></Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Review;
