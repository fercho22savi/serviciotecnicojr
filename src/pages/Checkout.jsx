import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To get user info
import { db } from '../firebase/config'; // To save the order
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Container, Paper, Stepper, Step, StepLabel, Button, Typography, Box, Grid, TextField, Divider, List, ListItem, ListItemText, CircularProgress, Alert
} from '@mui/material';

const steps = ['Dirección de Envío', 'Detalles de Pago', 'Revisar Pedido'];

// --- Step Content Components (no changes needed here) ---

function ShippingAddressForm({ formValues, handleChange }) {
  return (
    <Grid container spacing={3}>
        <Grid item xs={12} sm={6}><TextField required id="firstName" name="firstName" label="Nombre" fullWidth variant="standard" value={formValues.firstName} onChange={handleChange} /></Grid>
        <Grid item xs={12} sm={6}><TextField required id="lastName" name="lastName" label="Apellido" fullWidth variant="standard" value={formValues.lastName} onChange={handleChange} /></Grid>
        <Grid item xs={12}><TextField required id="address" name="address" label="Dirección" fullWidth variant="standard" value={formValues.address} onChange={handleChange} /></Grid>
        <Grid item xs={12} sm={6}><TextField required id="city" name="city" label="Ciudad" fullWidth variant="standard" value={formValues.city} onChange={handleChange} /></Grid>
        <Grid item xs={12} sm={6}><TextField id="state" name="state" label="Estado/Provincia" fullWidth variant="standard" value={formValues.state} onChange={handleChange} /></Grid>
        <Grid item xs={12} sm={6}><TextField required id="zip" name="zip" label="Código Postal" fullWidth variant="standard" value={formValues.zip} onChange={handleChange} /></Grid>
        <Grid item xs={12} sm={6}><TextField required id="country" name="country" label="País" fullWidth variant="standard" value={formValues.country} onChange={handleChange} /></Grid>
    </Grid>
  );
}

function PaymentForm({ formValues, handleChange }) {
  return (
    <Grid container spacing={3}>
        <Grid item xs={12} md={6}><TextField required id="cardName" name="cardName" label="Nombre en la tarjeta" fullWidth variant="standard" value={formValues.cardName} onChange={handleChange}/></Grid>
        <Grid item xs={12} md={6}><TextField required id="cardNumber" name="cardNumber" label="Número de tarjeta" fullWidth variant="standard" value={formValues.cardNumber} onChange={handleChange} /></Grid>
        <Grid item xs={12} md={6}><TextField required id="expDate" name="expDate" label="Fecha de expiración (MM/AA)" fullWidth variant="standard" value={formValues.expDate} onChange={handleChange} /></Grid>
        <Grid item xs={12} md={6}><TextField required id="cvv" name="cvv" label="CVV" fullWidth variant="standard" helperText="Los 3 dígitos en el reverso" value={formValues.cvv} onChange={handleChange}/></Grid>
    </Grid>
  );
}

function Review({ formValues, cart }) {
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Resumen del Pedido</Typography>
            <List disablePadding>{cart.map((item) => (<ListItem key={item.id} sx={{ py: 1, px: 0 }}><ListItemText primary={item.name} secondary={`Cantidad: ${item.quantity}`} /><Typography variant="body2">${(item.price * item.quantity).toFixed(2)}</Typography></ListItem>))}<ListItem sx={{ py: 1, px: 0 }}><ListItemText primary="Total" /><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>${totalPrice.toFixed(2)}</Typography></ListItem></List>
            <Divider sx={{my: 2}}/>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Dirección de Envío</Typography><Typography gutterBottom>{formValues.firstName} {formValues.lastName}</Typography><Typography gutterBottom>{formValues.address}</Typography></Grid>
                <Grid item container direction="column" xs={12} sm={6}><Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Detalles del Pago</Typography><Grid container><Grid item xs={6}><Typography gutterBottom>Titular:</Typography></Grid><Grid item xs={6}><Typography gutterBottom>{formValues.cardName}</Typography></Grid><Grid item xs={6}><Typography gutterBottom>Número:</Typography></Grid><Grid item xs={6}><Typography gutterBottom>xxxx-xxxx-xxxx-{formValues.cardNumber.slice(-4)}</Typography></Grid></Grid></Grid>
            </Grid>
        </Box>
    )
}

// --- Main Checkout Component ---

function Checkout({ cart }) {
  const { currentUser } = useAuth(); // Get user
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({}); // Initial state is now empty
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ++ NEW: Pre-fill form with user data ++
  useEffect(() => {
      if(currentUser) {
          const [firstName, ...lastName] = (currentUser.displayName || '').split(' ');
          setFormData({
              firstName: firstName || '',
              lastName: lastName.join(' ') || '',
              address: currentUser.address || '',
              city: currentUser.city || '',
              state: currentUser.state || '',
              zip: currentUser.zip || '',
              country: currentUser.country || '',
              cardName: '', cardNumber: '', expDate: '', cvv: '' // Payment details always start empty
          });
      }
  }, [currentUser]);

  const handleChange = (e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));

  // ++ NEW: Save order to Firestore ++
  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
        setIsProcessing(true);
        setError('');
        try {
            const orderData = {
                userId: currentUser.uid,
                items: cart,
                total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
                shippingAddress: {
                    firstName: formData.firstName, lastName: formData.lastName, address: formData.address, city: formData.city, state: formData.state, zip: formData.zip, country: formData.country
                },
                payment: {
                    cardName: formData.cardName,
                    cardNumberLast4: formData.cardNumber.slice(-4),
                },
                status: 'Procesando',
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);
            navigate(`/order-confirmation`, { state: { orderId: docRef.id } });

        } catch (e) {
            console.error("Error al guardar el pedido: ", e);
            setError('Hubo un problema al procesar tu pedido. Inténtalo de nuevo.');
            setIsProcessing(false);
        }
    } else {
        setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  function getStepContent(step) {
    switch (step) {
      case 0: return <ShippingAddressForm formValues={formData} handleChange={handleChange} />;
      case 1: return <PaymentForm formValues={formData} handleChange={handleChange} />;
      case 2: return <Review formValues={formData} cart={cart} />;
      default: throw new Error('Paso desconocido');
    }
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">Proceso de Pago</Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>{steps.map(l => (<Step key={l}><StepLabel>{l}</StepLabel></Step>))}</Stepper>
        <React.Fragment>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {activeStep !== 0 && <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>Atrás</Button>}
              <Button variant="contained" onClick={handleNext} sx={{ mt: 3, ml: 1 }} disabled={isProcessing || (cart.length === 0 && activeStep === steps.length - 1)}>
                {isProcessing ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Confirmar Pedido' : 'Siguiente')}
              </Button>
            </Box>
        </React.Fragment>
      </Paper>
    </Container>
  );
}

export default Checkout;
