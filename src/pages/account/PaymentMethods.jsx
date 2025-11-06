import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, Typography, Paper, Box, Button, CircularProgress, Alert, 
    List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Grid, ListItemIcon, useTheme 
} from '@mui/material';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard } from 'react-icons/fa';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const getCardIcon = (brand) => {
    switch (brand) {
        case 'visa': return <FaCcVisa size="2em" />;
        case 'mastercard': return <FaCcMastercard size="2em" />;
        case 'amex': return <FaCcAmex size="2em" />;
        default: return <FaCreditCard size="2em" />;
    }
};

const createSetupIntent = httpsCallable(functions, 'createSetupIntent');

const PaymentMethods = () => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const { currentUser } = useAuth();
    const theme = useTheme();

    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const methodsRef = collection(db, 'users', currentUser.uid, 'payment_methods');
        const unsubscribe = onSnapshot(methodsRef, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMethods(data);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(t('payment_methods.load_error'));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, t]);

    const handleOpen = async () => {
        setOpen(true);
        try {
            const result = await createSetupIntent();
            setClientSecret(result.data.clientSecret);
        } catch (err) {
            console.error("Error creating setup intent:", err);
            setFormError(t('payment_methods.setup_intent_error'));
        }
    };

    const handleClose = () => {
        setOpen(false);
        setFormError('');
        setCardholderName('');
        setClientSecret('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret || !cardholderName.trim()) {
            setFormError(t('payment_methods.form.fill_all_fields'));
            return;
        }

        const cardElement = elements.getElement(CardElement);
        setIsSaving(true);
        setFormError('');

        const { error: setupError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: cardholderName, email: currentUser.email },
            },
        });

        if (setupError) {
            setFormError(setupError.message);
            setIsSaving(false);
            return;
        }

        try {
            const pmDoc = await getDoc(doc(db, 'stripe_customers', currentUser.uid, 'payment_methods', setupIntent.payment_method));
            const paymentMethodData = pmDoc.data();

            await addDoc(collection(db, 'users', currentUser.uid, 'payment_methods'), {
                stripePaymentMethodId: setupIntent.payment_method,
                last4: paymentMethodData.card.last4,
                brand: paymentMethodData.card.brand,
                isDefault: methods.length === 0, 
            });

            toast.success(t('payment_methods.save_success'));
            handleClose();
        } catch (err) {
            console.error("Firestore error:", err);
            setFormError(t('payment_methods.save_error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (methodId) => {
        if (!window.confirm(t('payment_methods.delete_confirm'))) return;
        toast.promise(
            deleteDoc(doc(db, 'users', currentUser.uid, 'payment_methods', methodId)),
            {
                loading: t('payment_methods.deleting_toast'),
                success: t('payment_methods.delete_success'),
                error: t('payment_methods.delete_error'),
            }
        );
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom>{t('payment_methods.title')}</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : methods.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>{t('payment_methods.no_methods_title')}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>{t('payment_methods.no_methods_subtitle')}</Typography>
                    <Button variant="contained" onClick={handleOpen}>{t('payment_methods.add_button')}</Button>
                </Paper>
            ) : (
                <Paper sx={{ p: 2 }}>
                    <List>
                        {methods.map((method) => (
                            <ListItem key={method.id} secondaryAction={<IconButton edge="end" onClick={() => handleDelete(method.id)}><DeleteIcon /></IconButton>}>
                                <ListItemIcon>{getCardIcon(method.brand)}</ListItemIcon>
                                <ListItemText 
                                    primary={`${method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} **** ${method.last4}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={handleOpen}>{t('payment_methods.add_button')}</Button>
                    </Box>
                </Paper>
            )}

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{t('payment_methods.add_dialog_title')}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField fullWidth label={t('payment_methods.form.cardholder_name')} value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} required variant="outlined" />
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                                  <CardElement options={cardElementOptions} />
                                </Paper>
                            </Grid>
                            {formError && <Grid item xs={12}><Alert severity="error">{formError}</Alert></Grid>}
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">{t('payment_methods.form.security_note')}</Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>{t('payment_methods.cancel_button')}</Button>
                        <Button type="submit" variant="contained" disabled={isSaving || !stripe || !clientSecret}>
                            {isSaving ? <CircularProgress size={24} /> : t('payment_methods.save_button')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default PaymentMethods;
