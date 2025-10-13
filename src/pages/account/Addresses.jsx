
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Button, CircularProgress, Paper, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslation } from 'react-i18next';

// Standardized to English for consistency
const initialAddressState = {
    recipientName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    recipientPhone: '',
    shippingNotes: ''
};

function Addresses() {
    const { t } = useTranslation();
    const { currentUser } = useAuth(); // Correctly using currentUser
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentAddress, setCurrentAddress] = useState(initialAddressState);
    const [isEditing, setIsEditing] = useState(false);

    const fetchAddresses = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const addressesColRef = collection(db, 'users', currentUser.uid, 'addresses');
            const querySnapshot = await getDocs(addressesColRef);
            const userAddresses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAddresses(userAddresses);
        } catch (error) {
            toast.error(t('addresses.loading_error'));
            console.error("Error fetching addresses: ", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, t]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleOpen = (address = null) => {
        if (address) {
            // Map Firestore data to form state
            setCurrentAddress({
                id: address.id,
                recipientName: address.recipientName || '',
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                postalCode: address.postalCode || '',
                country: address.country || '',
                recipientPhone: address.recipientPhone || '',
                shippingNotes: address.shippingNotes || ''
            });
            setIsEditing(true);
        } else {
            setCurrentAddress(initialAddressState);
            setIsEditing(false);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!currentUser) return;
        const toastId = toast.loading(t(isEditing ? 'addresses.updating_toast' : 'addresses.saving_toast'));
        try {
            const { id, ...addressData } = currentAddress; // Exclude id from data to be saved
            if (isEditing) {
                const addressDocRef = doc(db, 'users', currentUser.uid, 'addresses', id);
                await updateDoc(addressDocRef, addressData);
            } else {
                const addressesColRef = collection(db, 'users', currentUser.uid, 'addresses');
                await addDoc(addressesColRef, addressData);
            }
            toast.success(t(isEditing ? 'addresses.update_success' : 'addresses.save_success'), { id: toastId });
            handleClose();
            fetchAddresses();
        } catch (error) {
            toast.error(t('addresses.save_error'), { id: toastId });
            console.error("Error saving address: ", error);
        }
    };

    const handleDelete = async (addressId) => {
        if (window.confirm(t('addresses.delete_confirm'))) {
            if (!currentUser) return;
            const toastId = toast.loading(t('addresses.deleting_toast'));
            try {
                const addressDocRef = doc(db, 'users', currentUser.uid, 'addresses', addressId);
                await deleteDoc(addressDocRef);
                toast.success(t('addresses.delete_success'), { id: toastId });
                fetchAddresses(); // Refresh list after deleting
            } catch (error) {
                toast.error(t('addresses.delete_error'), { id: toastId });
                console.error("Error deleting address: ", error);
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, minHeight: '200px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>{t('addresses.loading_text')}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('addresses.title')}</Typography>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpen()}>
                    {t('addresses.add_button')}
                </Button>
            </Box>

            {addresses.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
                    <Typography variant="h6">{t('addresses.no_addresses_title')}</Typography>
                    <Typography color="text.secondary">{t('addresses.no_addresses_subtitle')}</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {addresses.map(address => (
                        <Grid item xs={12} md={6} key={address.id}>
                            <Paper sx={{ p: 2, borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontWeight: 'bold' }}>{address.recipientName}</Typography>
                                <Typography color="text.secondary">{address.street}, {address.city}, {address.state}</Typography>
                                <Typography color="text.secondary">{address.country} - {address.postalCode}</Typography>
                                <Typography color="text.secondary">{t('addresses.phone_label')}: {address.recipientPhone}</Typography>
                                <Box sx={{ flexGrow: 1 }} />
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton size="small" onClick={() => handleOpen(address)}><EditIcon /></IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(address.id)}><DeleteIcon /></IconButton>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{t(isEditing ? 'addresses.edit_dialog_title' : 'addresses.add_dialog_title')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{pt: 1}}>
                        <Grid item xs={12}><TextField label={t('addresses.form.recipient_name')} name="recipientName" value={currentAddress.recipientName} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label={t('addresses.form.address')} name="street" value={currentAddress.street} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.city')} name="city" value={currentAddress.city} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.state')} name="state" value={currentAddress.state} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.postal_code')} name="postalCode" value={currentAddress.postalCode} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.country')} name="country" value={currentAddress.country} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label={t('addresses.form.recipient_phone')} name="recipientPhone" value={currentAddress.recipientPhone} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label={t('addresses.form.shipping_notes')} name="shippingNotes" value={currentAddress.shippingNotes} onChange={handleChange} fullWidth multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('addresses.cancel_button')}</Button>
                    <Button onClick={handleSubmit} variant="contained">{t(isEditing ? 'addresses.save_changes_button' : 'addresses.save_button')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Addresses;
