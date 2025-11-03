import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import {
    Avatar, Box, Typography, TextField, Button, Grid, CircularProgress, IconButton, Paper, 
    useTheme, Card, CardContent, CardActions, Divider
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Profile() {
    const { t } = useTranslation();
    const theme = useTheme();
    const { currentUser, setCurrentUser } = useAuth(); 
    const [profile, setProfile] = useState({
        displayName: '',
        firstName: '',
        lastName: '',
        phone: '',
        birthDate: '',
        photoURL: ''
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            if (!currentUser) {
                if (isMounted) setLoading(false);
                return;
            }
            const userDocRef = doc(db, 'users', currentUser.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                if (isMounted) {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setProfile({
                            displayName: data.displayName || currentUser.displayName || '',
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            phone: data.phone || currentUser.phoneNumber || '',
                            birthDate: data.birthDate || '',
                            photoURL: data.photoURL || currentUser.photoURL || ''
                        });
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast.error(t('profile.errors.load_profile'));
                if (isMounted) setLoading(false);
            }
        };
        fetchProfile();
        return () => { isMounted = false; };
    }, [currentUser, t]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        setUploading(true);
        const toastId = toast.loading('Subiendo imagen...');

        try {
            const storageRef = ref(storage, `profile_images/${currentUser.uid}/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(snapshot.ref);

            const auth = getAuth();
            await updateProfile(auth.currentUser, { photoURL });
            
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { photoURL });

            setProfile(prev => ({ ...prev, photoURL }));
            setCurrentUser(prevUser => ({...prevUser, photoURL}));

            toast.success('¡Foto de perfil actualizada!', { id: toastId });
        } catch (error) {
            console.error("Error updating profile photo:", error);
            toast.error('Error al subir la imagen.', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const toastId = toast.loading(t('profile.toast.updating'));
        const auth = getAuth();

        try {
            if (profile.displayName !== currentUser.displayName) {
                await updateProfile(auth.currentUser, { displayName: profile.displayName });
            }
            await updateDoc(userDocRef, { 
                displayName: profile.displayName, firstName: profile.firstName, lastName: profile.lastName, 
                phone: profile.phone, birthDate: profile.birthDate 
            }, { merge: true });
            
            setCurrentUser(prevUser => ({...prevUser, displayName: profile.displayName}));
            toast.success(t('profile.toast.success'), { id: toastId });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(t('profile.errors.update_profile'), { id: toastId });
        }
    };

    const handlePasswordReset = async () => {
        const auth = getAuth();
        if (!auth.currentUser) {
            toast.error("Debes iniciar sesión para hacer esto.");
            return;
        }
        const toastId = toast.loading("Enviando correo de restablecimiento...");
        try {
            await sendPasswordResetEmail(auth, auth.currentUser.email);
            toast.success("¡Correo enviado! Revisa tu bandeja de entrada.", { id: toastId, duration: 6000 });
        } catch (error) {
            console.error("Password reset error:", error);
            toast.error("No se pudo enviar el correo. Inténtalo de nuevo.", { id: toastId });
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (!currentUser) {
        return <Alert severity="info">Por favor, inicia sesión para ver tu perfil.</Alert>;
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 800, mx: 'auto' }} elevation={3}>
            <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>{t('profile.title')}</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>{t('profile.subtitle')}</Typography>

                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                         <Box sx={{ position: 'relative', width: 'fit-content' }}>
                            <Avatar src={profile.photoURL} sx={{ width: 128, height: 128, fontSize: '4rem' }}>
                                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : ''}
                            </Avatar>
                            <IconButton aria-label="upload picture" component="label" disabled={uploading} sx={{
                                    position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    color: 'black', boxShadow: theme.shadows[3], backdropFilter: 'blur(4px)',
                                    border: `1px solid ${theme.palette.divider}`,
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                                }}>
                                <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                                {uploading ? <CircularProgress size={24} color="inherit" /> : <PhotoCamera sx={{ fontSize: 24 }}/>}
                            </IconButton>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField name="displayName" label={t('profile.form.displayName')} value={profile.displayName} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="firstName" label={t('profile.form.first_name')} value={profile.firstName} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="lastName" label={t('profile.form.last_name')} value={profile.lastName} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="email" label="Email" value={currentUser?.email || ''} fullWidth disabled helperText={t('profile.form.email_helper')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="phone" label={t('profile.form.phone')} value={profile.phone} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="birthDate" label={t('profile.form.birth_date')} type="date" value={profile.birthDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" size="large" disabled={uploading}>
                        {t('profile.button.save')}
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Seguridad de la Cuenta</Typography>
                    <Typography color="text.secondary">Para cambiar tu contraseña, te enviaremos un enlace seguro a tu correo electrónico.</Typography>
                </CardContent>
                <CardActions sx={{p: 2}}>
                    <Button variant="outlined" color="secondary" onClick={handlePasswordReset}>Enviar correo para cambiar contraseña</Button>
                </CardActions>
            </Card>

        </Paper>
    );
}

export default Profile;
