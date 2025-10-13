
import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

const ShippingAddressForm = ({ formValues, handleChange, errors }) => {
    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Dirección de Envío
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="firstName"
                        name="firstName"
                        label="Nombre"
                        fullWidth
                        autoComplete="given-name"
                        variant="standard"
                        value={formValues.firstName}
                        onChange={handleChange}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="lastName"
                        name="lastName"
                        label="Apellido"
                        fullWidth
                        autoComplete="family-name"
                        variant="standard"
                        value={formValues.lastName}
                        onChange={handleChange}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="address"
                        name="address"
                        label="Dirección"
                        fullWidth
                        autoComplete="shipping address-line1"
                        variant="standard"
                        value={formValues.address}
                        onChange={handleChange}
                        error={!!errors.address}
                        helperText={errors.address}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="city"
                        name="city"
                        label="Ciudad"
                        fullWidth
                        autoComplete="shipping address-level2"
                        variant="standard"
                        value={formValues.city}
                        onChange={handleChange}
                        error={!!errors.city}
                        helperText={errors.city}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id="state"
                        name="state"
                        label="Estado/Provincia"
                        fullWidth
                        variant="standard"
                        value={formValues.state}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="zip"
                        name="zip"
                        label="Código Postal"
                        fullWidth
                        autoComplete="shipping postal-code"
                        variant="standard"
                        value={formValues.zip}
                        onChange={handleChange}
                        error={!!errors.zip}
                        helperText={errors.zip}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="country"
                        name="country"
                        label="País"
                        fullWidth
                        autoComplete="shipping country"
                        variant="standard"
                        value={formValues.country}
                        onChange={handleChange}
                        error={!!errors.country}
                        helperText={errors.country}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default ShippingAddressForm;
