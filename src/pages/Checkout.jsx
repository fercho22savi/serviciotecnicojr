import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db, analytics } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { logEvent } from "firebase/analytics";
import { 
    Container, Paper, Stepper, Step, StepLabel, Button, Typography, Box, CircularProgress, Alert 
} from '@mui/material';
import toast from 'react-hot-toast';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import PaymentForm from '../components/checkout/PaymentForm';
import Review from '../components/checkout/Review';

const steps = ['Dirección de Envío', 'Método de Pago (Simulado)', 'Revisar Pedido'];

const SHIPPING_COST = 10000;
const FREE_SHIPPING_THRESHOLD = 200000;

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

    // --- Nuevos Estados para Métodos de Pago ---
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
    const [saveCardInfo, setSaveCardInfo] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [shippingCost, setShippingCost] = useState(SHIPPING_COST);
    const [finalTotal, setFinalTotal] = useState(subtotal + shippingCost);

    useEffect(() => {
        const subtotalAfterDiscount = subtotal - discountAmount;
        if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) setShippingCost(0);
        else setShippingCost(SHIPPING_COST);
    }, [subtotal, discountAmount]);

    useEffect(() => {
        setFinalTotal(subtotal - discountAmount + shippingCost);
    }, [subtotal, discountAmount, shippingCost]);

    // --- UseEffect Extendido para Cargar Direcciones y Métodos de Pago ---
    useEffect(() => {
        if (currentUser) {
            const [firstName, ...lastName] = (currentUser.displayName || '').split(' ');
            setFormValues(prev => ({ ...prev, firstName: firstName || '', lastName: lastName.join(' ') || '' }));

            const fetchData = async () => {
                // Fetch Addresses
                setLoadingAddresses(true);
                try {
                    const addressesColRef = collection(db, 'users', currentUser.uid, 'addresses');
                    const addrSnapshot = await getDocs(addressesColRef);
                    setSavedAddresses(addrSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (error) { toast.error("No se pudieron cargar tus direcciones."); }
                finally { setLoadingAddresses(false); }

                // Fetch Payment Methods
                setLoadingPaymentMethods(true);
                try {
                    const paymentsColRef = collection(db, 'users', currentUser.uid, 'payment_methods');
                    const pmSnapshot = await getDocs(paymentsColRef);
                    setSavedPaymentMethods(pmSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (error) { toast.error("No se pudieron cargar tus métodos de pago."); }
                finally { setLoadingPaymentMethods(false); }
            };
            fetchData();
        }
    }, [currentUser]);

    const validate = (step) => { /* ... (sin cambios) */ return true; };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setSaveCardInfo(checked);
        } else {
            setFormValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectAddress = (address) => { /* ... (sin cambios) */ };

    // --- Nueva Función para Seleccionar Tarjeta ---
    const handleSelectPaymentMethod = (method) => {
        if (method) {
            setFormValues(prev => ({
                ...prev,
                cardName: method.cardholder_name || '',
                cardNumber: `**** **** **** ${method.last4}`,
                expDate: `${method.exp_month}/${String(method.exp_year).slice(2)}`,
                cvv: '***' // Placeholder
            }));
            setErrors({}); // Limpiar errores
        }
    };

    const handleApplyCoupon = async () => { /* ... (sin cambios) */ };

    const handleNext = async () => {
        if (!validate(activeStep)) return;

        if (activeStep === steps.length - 1) {
            setIsProcessing(true);
            setServerError('');
            try {
                // --- Lógica para Guardar Tarjeta --- 
                if (saveCardInfo) {
                    const last4 = formValues.cardNumber.slice(-4);
                    const isNewCard = !savedPaymentMethods.some(pm => pm.last4 === last4);

                    if(isNewCard) {
                        const newPaymentMethod = {
                            cardholder_name: formValues.cardName,
                            brand: 'Visa', // Simulado
                            last4: last4,
                            exp_month: formValues.expDate.split('/')[0],
                            exp_year: `20${formValues.expDate.split('/')[1]}`,
                            tokenId: `tok_${Math.random().toString(36).substr(2, 10)}` // Simulado
                        };
                        await addDoc(collection(db, 'users', currentUser.uid, 'payment_methods'), newPaymentMethod);
                    }
                }

                const orderNumber = generateOrderNumber();
                const orderData = { /* ... (sin cambios) */ };
                await addDoc(collection(db, 'orders'), orderData);
                logEvent(analytics, 'purchase', { /* ... (sin cambios) */ });

                toast.success(`¡Pedido realizado! N°: ${orderNumber}`)
                clearCart();
                navigate('/account/orders');

            } catch (e) {
                setServerError('Hubo un problema al procesar tu pedido.');
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
            case 0: return <ShippingAddressForm {...{ formValues, handleChange, errors, savedAddresses, loadingAddresses, onSelectAddress: handleSelectAddress }} />;
            case 1: return <PaymentForm 
                            {...{ 
                                formValues, 
                                handleChange, 
                                errors, 
                                savedPaymentMethods, 
                                loadingPaymentMethods, 
                                onSelectPaymentMethod: handleSelectPaymentMethod, 
                                saveCardInfo, 
                                onSaveCardChange: handleChange // Reutilizamos el handler general
                            }} 
                        />;
            case 2: return <Review {...{ formValues, couponCode, setCouponCode, handleApplyCoupon, subtotal, shippingCost, discountAmount, finalTotal, couponError, isApplyingCoupon, appliedCoupon }} />;
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
