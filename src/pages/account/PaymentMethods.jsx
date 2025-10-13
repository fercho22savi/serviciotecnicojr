
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Button, CircularProgress, Paper, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useTranslation } from 'react-i18next';

const initialCardState = {
    cardholderName: '',
    cardNumber: '',
    expiry: '', // MM/YY
    cvc: ''
};

function PaymentMethods() {
    const { t } = useTranslation();
    const { currentUser } = useAuth(); // Correctly using currentUser
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newCard, setNewCard] = useState(initialCardState);

    const createMockToken = (cardDetails) => {
        const last4 = cardDetails.cardNumber.slice(-4);
        let brand = t('payment_methods.unknown_brand');
        if (/^4/.test(cardDetails.cardNumber)) brand = 'Visa';
        if (/^5[1-5]/.test(cardDetails.cardNumber)) brand = 'Mastercard';
        if (/^3[47]/.test(cardDetails.cardNumber)) brand = 'American Express';
        
        return Promise.resolve({
            token: `tok_${Math.random().toString(36).substr(2, 10)}`,
            card: {
                brand,
                last4,
                exp_month: cardDetails.expiry.split('/')[0],
                exp_year: `20${cardDetails.expiry.split('/')[1]}`,
                cardholder_name: cardDetails.cardholderName,
            }
        });
    };

    const fetchPaymentMethods = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const methodsColRef = collection(db, 'users', currentUser.uid, 'payment_methods');
            const querySnapshot = await getDocs(methodsColRef);
            const userMethods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPaymentMethods(userMethods);
        } catch (error) {
            toast.error(t('payment_methods.load_error'));
            console.error("Error fetching payment methods: ", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, t]);

    useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewCard(initialCardState);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCard(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!currentUser) return;
        const toastId = toast.loading(t('payment_methods.saving_toast'));
        try {
            const { token, card } = await createMockToken(newCard);
            const methodsColRef = collection(db, 'users', currentUser.uid, 'payment_methods');
            await addDoc(methodsColRef, {
                ...card,
                tokenId: token,
            });

            toast.success(t('payment_methods.save_success'), { id: toastId });
            handleClose();
            fetchPaymentMethods(); // Refresh the list
        } catch (error) {
            toast.error(t('payment_methods.save_error'), { id: toastId });
            console.error("Error saving payment method: ", error);
        }
    };

    const handleDelete = async (methodId) => {
        if (window.confirm(t('payment_methods.delete_confirm'))) {
            if (!currentUser) return;
            const toastId = toast.loading(t('payment_methods.deleting_toast'));
            try {
                const methodDocRef = doc(db, 'users', currentUser.uid, 'payment_methods', methodId);
                await deleteDoc(methodDocRef);
                toast.success(t('payment_methods.delete_success'), { id: toastId });
                fetchPaymentMethods(); // Refresh the list
            } catch (error) {
                toast.error(t('payment_methods.delete_error'), { id: toastId });
                console.error("Error deleting payment method: ", error);
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, minHeight: '200px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>{t('payment_methods.loading_text')}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('payment_methods.title')}</Typography>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpen}>
                    {t('payment_methods.add_button')}
                </Button>
            </Box>

            {paymentMethods.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
                    <Typography variant="h6">{t('payment_methods.no_methods_title')}</Typography>
                    <Typography color="text.secondary">{t('payment_methods.no_methods_subtitle')}</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {paymentMethods.map(method => (
                        <Grid item xs={12} md={6} key={method.id}>
                            <Paper sx={{ p: 2.5, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CreditCardIcon color="primary" />
                                    <Box>
                                        <Typography sx={{ fontWeight: 'bold' }}>{t('payment_methods.card_ending_in', { brand: method.brand, last4: method.last4 })}</Typography>
                                        <Typography variant="body2" color="text.secondary">{t('payment_methods.expires_label')}: {method.exp_month}/{method.exp_year.slice(2)}</Typography>
                                    </Box>
                                </Box>
                                <IconButton size="small" onClick={() => handleDelete(method.id)}><DeleteIcon /></IconButton>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{t('payment_methods.add_dialog_title')}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ pt: 1 }}>
                        <TextField margin="normal" fullWidth label={t('payment_methods.form.cardholder_name')} name="cardholderName" value={newCard.cardholderName} onChange={handleChange} />
                        <TextField margin="normal" fullWidth label={t('payment_methods.form.card_number')} name="cardNumber" value={newCard.cardNumber} onChange={handleChange} placeholder="0000 0000 0000 0000"/>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField margin="normal" fullWidth label={t('payment_methods.form.expiry')} name="expiry" value={newCard.expiry} onChange={handleChange} placeholder="MM/YY"/></Grid>
                            <Grid item xs={6}><TextField margin="normal" fullWidth label={t('payment_methods.form.cvc')} name="cvc" value={newCard.cvc} onChange={handleChange} placeholder="123"/></Grid>
                        </Grid>
                        <Typography variant="caption" color="text.secondary" sx={{mt: 2, display: 'block'}}>
                            {t('payment_methods.form.security_note')}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '0 24px 20px' }}>
                    <Button onClick={handleClose}>{t('payment_methods.cancel_button')}</Button>
                    <Button onClick={handleSubmit} variant="contained">{t('payment_methods.save_button')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PaymentMethods;
