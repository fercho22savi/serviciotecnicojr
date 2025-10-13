import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db, analytics } from '../firebase/config'; // Import analytics
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logEvent } from "firebase/analytics"; // Import logEvent
import { 
    Container, Paper, Stepper, Step, StepLabel, Button, Typography, Box, CircularProgress, Alert 
} from '@mui/material';
import toast from 'react-hot-toast';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import PaymentForm from '../components/checkout/PaymentForm';
import Review from '../components/checkout/Review';

const steps = ['Dirección de Envío', 'Detalles de Pago', 'Revisar Pedido'];

// Generates a short, human-readable, unique order number (e.g., AB12CD)
const generateOrderNumber = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const Checkout = () => {
    const { currentUser } = useAuth();
    const { cart, clearCart } = useCart();
    const [activeStep, setActiveStep] = useState(0);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            const [firstName, ...lastName] = (currentUser.displayName || '').split(' ');
            setFormValues(prev => ({ ...prev, firstName: firstName || '', lastName: lastName.join(' ') || '' }));
        }
    }, [currentUser]);

    const validate = (step) => {
        const newErrors = {};
        if (step === 0) { // Shipping Address
            if (!formValues.firstName) newErrors.firstName = 'El nombre es requerido.';
            if (!formValues.lastName) newErrors.lastName = 'El apellido es requerido.';
            if (!formValues.address) newErrors.address = 'La dirección es requerida.';
            if (!formValues.city) newErrors.city = 'La ciudad es requerida.';
            if (!formValues.zip) newErrors.zip = 'El código postal es requerido.';
            if (!formValues.country) newErrors.country = 'El país es requerido.';
        } else if (step === 1) { // Payment Form
            if (!formValues.cardName) newErrors.cardName = 'El nombre en la tarjeta es requerido.';
            if (!formValues.cardNumber || !/^(\d{4}\s?){3}\d{4}$/.test(formValues.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Número de tarjeta inválido.';
            if (!formValues.expDate || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formValues.expDate)) newErrors.expDate = 'Fecha de expiración inválida (MM/AA).';
            if (!formValues.cvv || !/^\d{3,4}$/.test(formValues.cvv)) newErrors.cvv = 'CVV inválido.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = async () => {
        if (!validate(activeStep)) return;

        if (activeStep === steps.length - 1) {
            setIsProcessing(true);
            setServerError('');
            try {
                const orderNumber = generateOrderNumber();
                const orderTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

                // 1. Save order to Firestore
                const orderData = {
                    userId: currentUser.uid,
                    orderNumber: orderNumber,
                    items: cart,
                    totalAmount: orderTotal,
                    customerDetails: { firstName: formValues.firstName, lastName: formValues.lastName, address: formValues.address, city: formValues.city, state: formValues.state, postalCode: formValues.zip, country: formValues.country, email: currentUser.email },
                    payment: { cardName: formValues.cardName, cardNumberLast4: formValues.cardNumber.slice(-4) },
                    status: 'Procesando',
                    createdAt: serverTimestamp()
                };
                await addDoc(collection(db, 'orders'), orderData);
                
                // 2. Log Firebase Analytics purchase event
                logEvent(analytics, 'purchase', {
                    transaction_id: orderNumber,
                    value: orderTotal,
                    currency: 'COP',
                    shipping: 0, // Assuming free shipping
                    tax: 0, // Assuming no tax calculation
                    affiliation: 'MiTienda',
                    items: cart.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                });

                // 3. Clear cart and navigate
                toast.success(`¡Pedido realizado con éxito! Tu N° de pedido es: ${orderNumber}`)
                clearCart();
                navigate('/account/orders');

            } catch (e) {
                console.error("Error placing order: ", e);
                setServerError('Hubo un problema al procesar tu pedido. Inténtalo de nuevo.');
                toast.error('Error al procesar el pedido.');
            } finally {
                setIsProcessing(false);
            }
        } else {
            setActiveStep(activeStep + 1);
        }
    };

    const handleBack = () => setActiveStep(activeStep - 1);

    function getStepContent(step) {
        switch (step) {
            case 0: return <ShippingAddressForm formValues={formValues} handleChange={handleChange} errors={errors} />;
            case 1: return <PaymentForm formValues={formValues} handleChange={handleChange} errors={errors} />;
            case 2: return <Review formValues={formValues} />;
            default: throw new Error('Paso desconocido');
        }
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">Proceso de Pago</Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>{steps.map(l => (<Step key={l}><StepLabel>{l}</StepLabel></Step>))}</Stepper>
                <React.Fragment>
                    {serverError && <Alert severity="error" sx={{mb: 2}}>{serverError}</Alert>}
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {activeStep !== 0 && <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>Atrás</Button>}
                        <Button variant="contained" onClick={handleNext} sx={{ mt: 3, ml: 1 }} disabled={isProcessing || cart.length === 0}>
                            {isProcessing ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Finalizar Compra' : 'Siguiente')}
                        </Button>
                    </Box>
                </React.Fragment>
            </Paper>
        </Container>
    );
}

export default Checkout;
