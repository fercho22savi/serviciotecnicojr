import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, CircularProgress, Paper, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslation } from 'react-i18next'; // <-- 1. IMPORTAR

const initialAddressState = {
    nombre_receptor: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigo_postal: '',
    pais: '',
    telefono_receptor: '',
    notas_envio: ''
};

function Addresses() {
    const { t } = useTranslation(); // <-- 2. INICIALIZAR
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentAddress, setCurrentAddress] = useState(initialAddressState);
    const [isEditing, setIsEditing] = useState(false);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const addressesColRef = collection(db, 'users', user.uid, 'addresses');
            const querySnapshot = await getDocs(addressesColRef);
            const userAddresses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAddresses(userAddresses);
        } catch (error) {
            toast.error(t('addresses.loading_error'));
            console.error("Error fetching addresses: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [user, t]);

    const handleOpen = (address = null) => {
        if (address) {
            setCurrentAddress(address);
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
        const toastId = toast.loading(t(isEditing ? 'addresses.updating_toast' : 'addresses.saving_toast'));
        try {
            const addressesColRef = collection(db, 'users', user.uid, 'addresses');
            if (isEditing) {
                const addressDocRef = doc(db, 'users', user.uid, 'addresses', currentAddress.id);
                await updateDoc(addressDocRef, currentAddress);
            } else {
                await addDoc(addressesColRef, currentAddress);
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
            const toastId = toast.loading(t('addresses.deleting_toast'));
            try {
                const addressDocRef = doc(db, 'users', user.uid, 'addresses', addressId);
                await deleteDoc(addressDocRef);
                toast.success(t('addresses.delete_success'), { id: toastId });
                fetchAddresses();
            } catch (error) {
                toast.error(t('addresses.delete_error'), { id: toastId });
                console.error("Error deleting address: ", error);
            }
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
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
                                <Typography sx={{ fontWeight: 'bold' }}>{address.nombre_receptor}</Typography>
                                <Typography color="text.secondary">{address.direccion}, {address.ciudad}, {address.departamento}</Typography>
                                <Typography color="text.secondary">{address.pais} - {address.codigo_postal}</Typography>
                                <Typography color="text.secondary">{t('addresses.phone_label')}: {address.telefono_receptor}</Typography>
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
                        <Grid item xs={12}><TextField label={t('addresses.form.recipient_name')} name="nombre_receptor" value={currentAddress.nombre_receptor} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label={t('addresses.form.address')} name="direccion" value={currentAddress.direccion} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.city')} name="ciudad" value={currentAddress.ciudad} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.state')} name="departamento" value={currentAddress.departamento} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.postal_code')} name="codigo_postal" value={currentAddress.codigo_postal} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label={t('addresses.form.country')} name="pais" value={currentAddress.pais} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label={t('addresses.form.recipient_phone')} name="telefono_receptor" value={currentAddress.telefono_receptor} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label={t('addresses.form.shipping_notes')} name="notas_envio" value={currentAddress.notas_envio} onChange={handleChange} fullWidth multiline rows={2} /></Grid>
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
