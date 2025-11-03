import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Container, Paper } from '@mui/material';
import CheckoutForm from './CheckoutForm';

// Asegúrate de reemplazar "pk_test_..." con tu clave pública de Stripe
const stripePromise = loadStripe("pk_test_51PbiLgRtxs4pGM2k8e5n5nJtQ7g0g2gJ6p3g2gJ6p3g2gJ6p3g2gJ6p3g2gJ6p3g2gJ6p3g2gJ6p3g2gJ6p3g2gJ6");

const Checkout = () => {
  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </Paper>
    </Container>
  );
};

export default Checkout;
