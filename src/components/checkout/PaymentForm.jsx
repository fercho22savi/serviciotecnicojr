import React from 'react';
import {
    Typography, 
    Grid, 
    TextField, 
    Alert, 
    Box, 
    Paper, 
    Button, 
    CircularProgress, 
    Divider, 
    FormControlLabel, 
    Checkbox,
    Icon
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const PaymentForm = ({ 
    formValues, 
    handleChange, 
    errors, 
    savedPaymentMethods, 
    loadingPaymentMethods, 
    onSelectPaymentMethod, 
    saveCardInfo, 
    onSaveCardChange 
}) => {
    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Método de Pago
            </Typography>

            {/* Sección de Métodos de Pago Guardados */}
            {loadingPaymentMethods ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
            ) : savedPaymentMethods && savedPaymentMethods.length > 0 && (
                <Box mb={4}>
                    <Typography variant="subtitle1" gutterBottom>Tus métodos de pago guardados</Typography>
                    <Grid container spacing={2}>
                        {savedPaymentMethods.map((method) => (
                            <Grid item xs={12} md={6} key={method.id}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5}}>
                                        <CreditCardIcon color="primary"/>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {method.brand} terminada en {method.last4}
                                        </Typography>
                                    </Box>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={() => onSelectPaymentMethod(method)} 
                                        sx={{ mt: 2, alignSelf: 'flex-end' }}
                                    >
                                        Usar este método
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    <Divider sx={{ my: 4 }}>O introduce un nuevo método de pago</Divider>
                </Box>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
                Estás en un entorno de demostración. <strong>No introduzcas datos de tarjeta reales.</strong>
            </Alert>

            {/* Formulario para Nuevo Método de Pago */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField required id="cardName" name="cardName" label="Nombre en la tarjeta" fullWidth autoComplete="cc-name" variant="standard" value={formValues.cardName || ''} onChange={handleChange} error={!!errors.cardName} helperText={errors.cardName} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField required id="cardNumber" name="cardNumber" label="Número de tarjeta" fullWidth autoComplete="cc-number" variant="standard" value={formValues.cardNumber || ''} onChange={handleChange} error={!!errors.cardNumber} helperText={errors.cardNumber} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField required id="expDate" name="expDate" label="Fecha de expiración (MM/AA)" fullWidth autoComplete="cc-exp" variant="standard" value={formValues.expDate || ''} onChange={handleChange} error={!!errors.expDate} helperText={errors.expDate} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField required id="cvv" name="cvv" label="CVV" fullWidth autoComplete="cc-csc" variant="standard" value={formValues.cvv || ''} onChange={handleChange} error={!!errors.cvv} helperText={errors.cvv || "Los 3-4 dígitos del reverso"} />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox color="primary" name="saveCardInfo" checked={saveCardInfo} onChange={onSaveCardChange} />}
                        label="Guardar esta tarjeta para futuras compras"
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default PaymentForm;
