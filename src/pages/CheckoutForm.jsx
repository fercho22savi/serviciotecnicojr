import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db, analytics } from '../firebase/config';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { logEvent } from "firebase/analytics";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { 
    Container, Paper, Stepper, Step, StepLabel, Button, Typography, Box, CircularProgress, Alert, Skeleton, TextField, Grid, useTheme 
} from '@mui/material';
import toast from 'react-hot-toast';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import Review from '../components/checkout/Review';

const steps = ['Dirección de Envío', 'Revisar Pedido', 'Método de Pago'];

const SHIPPING_COST = 10000;
const FREE_SHIPPING_THRESHOLD = 200000;

const projectId = 'serviciotecnicojr-187663-9a086';
const region = 'us-central1';
const createPaymentIntentUrl = `https://${region}-${projectId}.cloudfunctions.net/createPaymentIntent`;
const applyCouponUrl = `https://${region}-${projectId}.cloudfunctions.net/applyCoupon`;

const CheckoutForm = () => {
    const { currentUser } = useAuth();
    const { cart, clearCart, loading: cartLoading } = useCart();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const theme = useTheme();

    const [activeStep, setActiveStep] = useState(0);
    const [formValues, setFormValues] = useState({ recipientName: '', street: '', city: '', postalCode: '', country: '' });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [serverError, setServerError] = useState('');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [clientSecret, setClientSecret] = useState('');

    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const cartItems = useMemo(() => Array.from(cart.values()), [cart]);
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const shippingCost = useMemo(() => subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST, [subtotal]);
    const finalTotal = useMemo(() => {
        const total = subtotal + shippingCost - discountAmount;
        return total > 0 ? total : 0;
    }, [subtotal, shippingCost, discountAmount]);

    useEffect(() => {
        if (currentUser) {
            const [firstName, ...lastName] = (currentUser.displayName || '').split(' ');
            setFormValues(prev => ({ ...prev, recipientName: `${firstName || ''} ${lastName.join(' ') || ''}`.trim() }));
            const fetchAddresses = async () => {
                setLoadingAddresses(true);
                try {
                    const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'addresses'));
                    setSavedAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (error) {
                    toast.error('No se pudieron cargar tus direcciones.');
                } finally {
                    setLoadingAddresses(false);
                }
            };
            fetchAddresses();
        }
    }, [currentUser]);

    useEffect(() => {
        if (activeStep === steps.length - 1 && finalTotal > 0) {
            setServerError('');
            fetch(createPaymentIntentUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Math.round(finalTotal * 100), currency: 'cop' }) })
                .then(res => res.ok ? res.json() : Promise.reject(res.json()))
                .then(data => setClientSecret(data.clientSecret))
                .catch(async (errorPromise) => {
                    const error = await errorPromise;
                    console.error("Error creating payment intent:", error);
                    setServerError(error.error || 'No se pudo inicializar el pago.');
                });
        }
    }, [activeStep, finalTotal]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) { setCouponError('Por favor, ingresa un código.'); return; }
        setIsApplyingCoupon(true); setCouponError('');
        try {
            const response = await fetch(applyCouponUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ couponCode }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'El cupón no es válido.');
            const coupon = result.data;
            let discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
            setDiscountAmount(discount); setAppliedCoupon(coupon); toast.success('¡Cupón aplicado!');
        } catch (error) {
            setDiscountAmount(0); setAppliedCoupon(null); setCouponError(error.message);
        } finally { setIsApplyingCoupon(false); }
    };

    const handleChange = (e) => setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectAddress = (address) => { if (address) { setFormValues(prev => ({ ...prev, ...address })); setErrors({}); } };
    const validate = () => {
        const newErrors = {};
        if (activeStep === 0) {
            if (!formValues.recipientName?.trim()) newErrors.recipientName = 'El nombre es requerido.';
            if (!formValues.street?.trim()) newErrors.street = 'La dirección es requerida.';
            if (!formValues.city?.trim()) newErrors.city = 'La ciudad es requerida.';
            if (!formValues.postalCode?.trim()) newErrors.postalCode = 'El código postal es requerido.';
            if (!formValues.country?.trim()) newErrors.country = 'El país es requerido.';
        }
        setErrors(newErrors); return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => { if (validate()) setActiveStep(activeStep + 1); };
    const handleBack = () => setActiveStep(activeStep - 1);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret) { setServerError("El formulario de pago no está listo."); return; }
        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) { setServerError("No se encontraron los detalles de la tarjeta."); setIsProcessing(false); return; }

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement, billing_details: { name: formValues.recipientName } } });

        if (stripeError) { setServerError(stripeError.message); setIsProcessing(false); return; }

        if (paymentIntent.status === 'succeeded') {
            try {
                const { paymentIntent: updatedPaymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
                const orderNumber = `ORD-${Date.now()}`;
                const charge = updatedPaymentIntent?.charges?.data[0];

                await addDoc(collection(db, 'orders'), {
                    userId: currentUser.uid,
                    orderNumber,
                    createdAt: serverTimestamp(),
                    status: 'Procesando', // Changed to Spanish for consistency
                    items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.images?.[0] || null })),
                    shippingAddress: { ...formValues },
                    payment: {
                        brand: charge?.payment_method_details?.card?.brand || 'N/A',
                        last4: charge?.payment_method_details?.card?.last4 || 'N/A'
                    },
                    pricing: { subtotal, shipping: shippingCost, discount: discountAmount, total: finalTotal },
                    coupon: appliedCoupon ? { code: appliedCoupon.code, type: appliedCoupon.type, value: appliedCoupon.value } : null
                });

                logEvent(analytics, 'purchase', { transaction_id: orderNumber, value: finalTotal, currency: 'COP', coupon: appliedCoupon?.code, items: cartItems.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })) });
                clearCart();
                toast.success(`¡Pedido #${orderNumber} realizado!`);
                navigate('/account/orders');
            } catch (dbError) {
                console.error("Error saving order: ", dbError);
                setServerError('El pago fue exitoso, pero hubo un error al guardar tu pedido.');
            }
        }
        setIsProcessing(false);
    };

    const isStepValid = useMemo(() => {
        if (activeStep === 0) return !!(formValues.recipientName && formValues.street && formValues.city && formValues.postalCode && formValues.country);
        if (activeStep === 1) return true;
        if (activeStep === 2) return stripe && elements && clientSecret;
        return false;
    }, [formValues, activeStep, stripe, elements, clientSecret]);

    const cardElementOptions = { style: { base: { color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily, fontSize: '16px', '::placeholder': { color: theme.palette.text.secondary }, iconColor: theme.palette.text.secondary }, invalid: { color: theme.palette.error.main, iconColor: theme.palette.error.main } } };

    function getStepContent(step) {
        switch (step) {
            case 0: return <ShippingAddressForm {...{ formValues, handleChange, errors, savedAddresses, loadingAddresses, onSelectAddress: handleSelectAddress }} />;
            case 1: return (
                    <><Review {...{ formValues, cart: cartItems, subtotal, shippingCost, discountAmount, finalTotal, appliedCoupon }} /><Grid container spacing={2} sx={{ mt: 3 }}><Grid item xs={12} sm={8}><TextField fullWidth label="Código de Cupón" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} error={!!couponError} helperText={couponError} disabled={!!appliedCoupon} /></Grid><Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !!appliedCoupon} sx={{ height: '100%' }}>{isApplyingCoupon ? <CircularProgress size={24} /> : 'Aplicar'}</Button></Grid></Grid></>
                );
            case 2: return (
                    <Box sx={{ my: 4 }}><Typography variant="h6" gutterBottom>Tarjeta de Crédito o Débito</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Tu pago será procesado de forma segura por Stripe.</Typography><Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius, p: 2, backgroundColor: theme.palette.background.paper, '&:hover': { borderColor: theme.palette.text.primary } }}><CardElement options={cardElementOptions} /></Box></Box>
                );
            default: throw new Error('Paso desconocido');
        }
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}><Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}><Typography component="h1" variant="h4" align="center">Proceso de Pago</Typography><Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>{steps.map(l => (<Step key={l}><StepLabel>{l}</StepLabel></Step>))}</Stepper><form onSubmit={activeStep === steps.length - 1 ? handlePlaceOrder : (e) => { e.preventDefault(); handleNext(); }}>{cartLoading ? <Skeleton variant="rectangular" width="100%" height={250} /> : getStepContent(activeStep)}{serverError && <Alert severity="error" sx={{mt: 2}}>{serverError}</Alert>}<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{activeStep !== 0 && <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>Atrás</Button>}<Button type={activeStep === steps.length - 1 ? 'submit' : 'button'} variant="contained" onClick={activeStep !== steps.length - 1 ? handleNext : undefined} sx={{ mt: 3, ml: 1 }} disabled={isProcessing || cartLoading || !isStepValid}>{isProcessing ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Finalizar Compra' : 'Siguiente')}</Button></Box></form></Paper></Container>
    );
}

export default CheckoutForm;
