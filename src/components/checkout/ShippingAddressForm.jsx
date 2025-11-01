import React from 'react';
import { Grid, TextField, Typography, Box, Paper, Button, CircularProgress, Divider } from '@mui/material';

const ShippingAddressForm = ({ 
    formValues, 
    handleChange, 
    errors, 
    savedAddresses, 
    loadingAddresses, 
    onSelectAddress 
}) => {
    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Dirección de Envío
            </Typography>

            {/* Sección de Direcciones Guardadas */}
            {loadingAddresses ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
            ) : savedAddresses && savedAddresses.length > 0 && (
                <Box mb={4}>
                    <Typography variant="subtitle1" gutterBottom>Tus direcciones guardadas</Typography>
                    <Grid container spacing={2}>
                        {savedAddresses.map((address) => (
                            <Grid item xs={12} md={6} key={address.id}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{address.recipientName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{address.street}, {address.city}</Typography>
                                    <Typography variant="body2" color="text.secondary">{address.country} - {address.postalCode}</Typography>
                                    <Box sx={{ flexGrow: 1, minHeight: '16px' }} />
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={() => onSelectAddress(address)} 
                                        sx={{ mt: 1, alignSelf: 'flex-end' }}
                                    >
                                        Usar esta dirección
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    <Divider sx={{ my: 4 }}>O introduce una nueva dirección</Divider>
                </Box>
            )}
            
            {/* Formulario para Nueva Dirección */}
            <Grid container spacing={3}>
                 <Grid item xs={12}>
                    <TextField
                        required
                        id="recipientName"
                        name="recipientName"
                        label="Nombre del destinatario"
                        fullWidth
                        autoComplete="name"
                        variant="standard"
                        value={formValues.recipientName || ''}
                        onChange={handleChange}
                        error={!!errors.recipientName}
                        helperText={errors.recipientName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="street"
                        name="street"
                        label="Dirección / Calle"
                        fullWidth
                        autoComplete="shipping street-address"
                        variant="standard"
                        value={formValues.street || ''}
                        onChange={handleChange}
                        error={!!errors.street}
                        helperText={errors.street}
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
                        value={formValues.city || ''}
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
                        value={formValues.state || ''}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="postalCode"
                        name="postalCode"
                        label="Código Postal"
                        fullWidth
                        autoComplete="shipping postal-code"
                        variant="standard"
                        value={formValues.postalCode || ''}
                        onChange={handleChange}
                        error={!!errors.postalCode}
                        helperText={errors.postalCode}
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
                        value={formValues.country || ''}
                        onChange={handleChange}
                        error={!!errors.country}
                        helperText={errors.country}
                    />
                </Grid>
                 <Grid item xs={12}>
                    <TextField
                        id="recipientPhone"
                        name="recipientPhone"
                        label="Teléfono de contacto (opcional)"
                        fullWidth
                        autoComplete="tel"
                        variant="standard"
                        value={formValues.recipientPhone || ''}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default ShippingAddressForm;
