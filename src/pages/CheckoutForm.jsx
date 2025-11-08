import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { 
    Container, Paper, Stepper, Step, StepLabel, Button, Typography, Box, CircularProgress, Alert, Skeleton, TextField, Grid, useTheme, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import toast from 'react-hot-toast';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import Review from '../components/checkout/Review';
import OrderSuccessModal from '../components/checkout/OrderSuccessModal';
import { useTranslation } from 'react-i18next';

// Firebase API
import { saveOrder, fetchUserAddresses } from '../firebase/api';

const SHIPPING_COST = 10000;
const FREE_SHIPPING_THRESHOLD = 200000;
const MINIMUM_CHARGE_USD = 0.50;

// Cloud Functions URLs
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const region = 'us-central1';
const createPaymentIntentUrl = `https://${region}-${projectId}.cloudfunctions.net/createPaymentIntent`;
const applyCouponUrl = `https://${region}-${projectId}.cloudfunctions.net/applyCoupon`;

const CheckoutForm = () => {
    const { t } = useTranslation();
    const steps = [t('checkout.steps.shipping'), t('checkout.steps.review'), t('checkout.steps.payment')];

    const { currentUser } = useAuth();
    const { cart, clearCart, loading: cartLoading } = useCart();
    const { currency, setCurrency, convertToUSD, formatCurrency } = useCurrency();
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
    const [isAmountTooLow, setIsAmountTooLow] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    const cartItems = useMemo(() => Array.from(cart.values()), [cart]);
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const shippingCost = useMemo(() => subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST, [subtotal]);
    const finalTotal = useMemo(() => Math.max(0, subtotal + shippingCost - discountAmount), [subtotal, shippingCost, discountAmount]);

    useEffect(() => {
        const totalInUSD = convertToUSD(finalTotal);
        setIsAmountTooLow(totalInUSD > 0 && totalInUSD < MINIMUM_CHARGE_USD);
    }, [finalTotal, currency, convertToUSD]);

    useEffect(() => {
        if (currentUser) {
            const [firstName, ...lastName] = (currentUser.displayName || '').split(' ');
            setFormValues(prev => ({ ...prev, recipientName: `${firstName || ''} ${lastName.join(' ') || ''}`.trim() }));
            
            const loadAddresses = async () => {
                console.log("Fetching addresses for user:", currentUser.uid);
                setLoadingAddresses(true);
                try {
                    const addresses = await fetchUserAddresses(currentUser.uid);
                    console.log("Addresses fetched:", addresses);
                    setSavedAddresses(addresses);
                } catch (error) {
                    console.error("Error fetching addresses:", error);
                    toast.error(error.message || t('checkout.errors.load_addresses'));
                } finally {
                    setLoadingAddresses(false);
                    console.log("Finished fetching addresses.");
                }
            };
            loadAddresses();
        } else {
            setLoadingAddresses(false);
            console.log("No user logged in, skipping address fetch.");
        }
    }, [currentUser, t]);

    useEffect(() => {
        const createIntent = async () => {
            if (activeStep !== steps.length - 1 || finalTotal <= 0 || isAmountTooLow) {
                setClientSecret('');
                return;
            }
            setServerError('');
            try {
                const amountForBackend = currency === 'USD' ? convertToUSD(finalTotal) : finalTotal;
                const currencyForBackend = currency.toLowerCase();

                const response = await fetch(createPaymentIntentUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: amountForBackend, currency: currencyForBackend })
                });

                if (!response.ok) throw await response.json();

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error("Error creating payment intent:", error);
                setServerError(error.message || t('checkout.errors.init_payment'));
            }
        };
        createIntent();
    }, [activeStep, finalTotal, currency, convertToUSD, isAmountTooLow, t, steps.length]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError(t('checkout.errors.coupon_code_required'));
            return;
        }
        setIsApplyingCoupon(true);
        setCouponError('');
        try {
            const response = await fetch(applyCouponUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ couponCode })
            });
            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ error: `${t('checkout.errors.server_error')}: ${response.statusText}` }));
                throw new Error(errorResult.error || t('checkout.errors.coupon_invalid'));
            }
            const result = await response.json();
            const coupon = result.data;
            let discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
            setDiscountAmount(discount);
            setAppliedCoupon(coupon);
            toast.success(t('checkout.coupon_applied'));
        } catch (error) {
            setDiscountAmount(0);
            setAppliedCoupon(null);
            setCouponError(error.message);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleChange = (e) => setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectAddress = (address) => { if (address) { setFormValues(prev => ({ ...prev, ...address })); setErrors({}); } };
    const validate = () => {
        const newErrors = {};
        if (activeStep === 0) {
            if (!formValues.recipientName?.trim()) newErrors.recipientName = t('checkout.errors.name_required');
            if (!formValues.street?.trim()) newErrors.street = t('checkout.errors.address_required');
            if (!formValues.city?.trim()) newErrors.city = t('checkout.errors.city_required');
            if (!formValues.postalCode?.trim()) newErrors.postalCode = t('checkout.errors.zip_required');
            if (!formValues.country?.trim()) newErrors.country = t('checkout.errors.country_required');
        }
        setErrors(newErrors); return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => { if (validate()) setActiveStep(activeStep + 1); };
    const handleBack = () => setActiveStep(activeStep - 1);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret || isAmountTooLow) { setServerError(t('checkout.errors.payment_form_not_ready')); return; }
        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) { setServerError(t('checkout.errors.card_details_not_found')); setIsProcessing(false); return; }

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement, billing_details: { name: formValues.recipientName } } });

        if (stripeError) { setServerError(stripeError.message); setIsProcessing(false); return; }

        if (paymentIntent.status === 'succeeded') {
            try {
                const retrievedIntent = await stripe.retrievePaymentIntent(clientSecret);
                const charge = retrievedIntent.paymentIntent?.charges?.data[0];
                const totalForDB = currency === 'USD' ? convertToUSD(finalTotal) : finalTotal;

                const orderData = {
                    userId: currentUser.uid,
                    status: 'Processing',
                    items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.images?.[0] || null })),
                    shippingAddress: { ...formValues },
                    payment: {
                        brand: charge?.payment_method_details?.card?.brand || 'N/A',
                        last4: charge?.payment_method_details?.card?.last4 || 'N/A'
                    },
                    pricing: { subtotal, shipping: shippingCost, discount: discountAmount, total: totalForDB, currency },
                    coupon: appliedCoupon ? { code: appliedCoupon.code, type: appliedCoupon.type, value: appliedCoupon.value } : null
                };

                const newOrderId = await saveOrder(orderData);
                setOrderId(newOrderId);
                setOrderSuccess(true);
                clearCart();

            } catch (dbError) {
                console.error("Error saving order: ", dbError);
                setServerError(dbError.message || t('checkout.errors.order_save_error'));
            }
        }
        setIsProcessing(false);
    };

    const isStepValid = useMemo(() => {
        if (activeStep === 0) return !!(formValues.recipientName && formValues.street && formValues.city && formValues.postalCode && formValues.country);
        if (activeStep === 1) return !isAmountTooLow;
        if (activeStep === 2) return stripe && elements && clientSecret && !isAmountTooLow;
        return false;
    }, [formValues, activeStep, stripe, elements, clientSecret, isAmountTooLow]);

    const cardElementOptions = { style: { base: { color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily, fontSize: '16px', '::placeholder': { color: theme.palette.text.secondary }, iconColor: theme.palette.text.secondary }, invalid: { color: theme.palette.error.main, iconColor: theme.palette.error.main } } };

    function getStepContent(step) {
        switch (step) {
            case 0: 
                console.log("Rendering ShippingAddressForm with props:", { savedAddresses, loadingAddresses });
                return <ShippingAddressForm {...{ formValues, handleChange, errors, savedAddresses, loadingAddresses, onSelectAddress: handleSelectAddress }} />;
            case 1: return (
                    <>
                        {isAmountTooLow && <Alert severity="warning" sx={{ mb: 2 }}>{t('checkout.errors.minimum_amount_warning', { amount: formatCurrency(MINIMUM_CHARGE_USD, 'USD') })}</Alert>}
                        <Box sx={{mb: 3}}>
                            <FormControl fullWidth><InputLabel>Moneda de Pago</InputLabel><Select value={currency} label="Moneda de Pago" onChange={(e) => setCurrency(e.target.value)}><MenuItem value={'COP'}>Pesos Colombianos (COP)</MenuItem><MenuItem value={'USD'}>Dólares Americanos (USD)</MenuItem></Select></FormControl>
                        </Box>
                        <Review {...{ formValues, cart: cartItems, subtotal, shippingCost, discountAmount, finalTotal, appliedCoupon, currency, formatCurrency, convertToUSD }} />
                        <Grid container spacing={2} sx={{ mt: 1 }}><Grid item xs={12} sm={8}><TextField fullWidth label={t('checkout.coupon_code_label')} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} error={!!couponError} helperText={couponError} disabled={!!appliedCoupon} /></Grid><Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !!appliedCoupon} sx={{ height: '100%' }}>{isApplyingCoupon ? <CircularProgress size={24} /> : t('checkout.apply_button')}</Button></Grid></Grid>
                    </>
                );
            case 2: 
                if(isAmountTooLow) return <Alert severity="error">{t('checkout.errors.minimum_amount_warning', { amount: formatCurrency(MINIMUM_CHARGE_USD, 'USD') })}</Alert>
                if(!clientSecret) return <Box sx={{display: 'flex', flexDirection:'column', alignItems:'center', my: 4}}><CircularProgress sx={{mb:2}} /><Typography>{t('checkout.creating_payment_session')}</Typography></Box>
                return <Box sx={{ my: 4 }}><Typography variant="h6" gutterBottom>{t('checkout.payment_method_title')}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('checkout.payment_security_note')}</Typography><Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius, p: 2, backgroundColor: theme.palette.background.paper, '&:hover': { borderColor: theme.palette.text.primary } }}><CardElement options={cardElementOptions} /></Box></Box>;
            default: throw new Error(t('checkout.errors.unknown_step'));
        }
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                {orderSuccess ? (
                    <OrderSuccessModal open={orderSuccess} orderId={orderId} />
                ) : (
                    <>
                        <Typography component="h1" variant="h4" align="center">{t('checkout.title')}</Typography>
                        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>{steps.map(l => (<Step key={l}><StepLabel>{l}</StepLabel></Step>))}</Stepper>
                        <form onSubmit={activeStep === steps.length - 1 ? handlePlaceOrder : (e) => { e.preventDefault(); handleNext(); }}>
                            {cartLoading ? <Skeleton variant="rectangular" width="100%" height={250} /> : getStepContent(activeStep)}
                            {serverError && <Alert severity="error" sx={{mt: 2}}>{serverError}</Alert>}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {activeStep !== 0 && <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>{t('checkout.back_button')}</Button>}
                                <Button type={activeStep === steps.length - 1 ? 'submit' : 'button'} variant="contained" onClick={activeStep !== steps.length - 1 ? handleNext : undefined} sx={{ mt: 3, ml: 1 }} disabled={isProcessing || cartLoading || !isStepValid}>
                                    {isProcessing ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? t('checkout.place_order_button') : t('checkout.next_button'))}
                                </Button>
                            </Box>
                        </form>
                    </>
                )}
            </Paper>
        </Container>
    );
}

export default CheckoutForm;
