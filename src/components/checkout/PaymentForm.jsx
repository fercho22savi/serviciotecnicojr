
import React from 'react';
import { Typography, Grid, TextField } from '@mui/material';

const PaymentForm = ({ formValues, handleChange, errors }) => {
    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Detalles del Pago
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="cardName"
                        name="cardName"
                        label="Nombre en la tarjeta"
                        fullWidth
                        autoComplete="cc-name"
                        variant="standard"
                        value={formValues.cardName}
                        onChange={handleChange}
                        error={!!errors.cardName}
                        helperText={errors.cardName}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="cardNumber"
                        name="cardNumber"
                        label="Número de tarjeta"
                        fullWidth
                        autoComplete="cc-number"
                        variant="standard"
                        value={formValues.cardNumber}
                        onChange={handleChange}
                        error={!!errors.cardNumber}
                        helperText={errors.cardNumber}
                        inputProps={{ maxLength: 19 }} // To allow for spaces in credit card format
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="expDate"
                        name="expDate"
                        label="Fecha de expiración (MM/AA)"
                        fullWidth
                        autoComplete="cc-exp"
                        variant="standard"
                        value={formValues.expDate}
                        onChange={handleChange}
                        error={!!errors.expDate}
                        helperText={errors.expDate}
                        inputProps={{ maxLength: 5 }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="cvv"
                        name="cvv"
                        label="CVV"
                        fullWidth
                        autoComplete="cc-csc"
                        variant="standard"
                        value={formValues.cvv}
                        onChange={handleChange}
                        error={!!errors.cvv}
                        helperText={errors.cvv || "Los 3 o 4 dígitos en el reverso de la tarjeta"}
                        inputProps={{ maxLength: 4 }}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default PaymentForm;
