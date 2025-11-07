import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import {
    Avatar, Box, Typography, TextField, Button, Grid, CircularProgress, IconButton, Paper, 
    useTheme, Card, CardContent, CardActions, Divider, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { colombiaData } from '../../utils/colombia-data';

const GEOCODE_API_KEY = import.meta.env.VITE_GEOCODE_API_KEY;

function Profile() {
    const { t } = useTranslation();
    const theme = useTheme();
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState({
        displayName: '',
        firstName: '',
        lastName: '',
        phone: '',
        birthDate: '',
        photoURL: '',
        address: '',
        country: 'Colombia', // Default country
        department: '',
        city: '',
        postalCode: ''
    });
    const [cities, setCities] = useState([]);
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
                            photoURL: data.photoURL || currentUser.photoURL || '',
                            address: data.address?.text || data.address || '',
                            country: data.country || 'Colombia',
                            department: data.department || '',
                            city: data.city || '',
                            postalCode: data.postalCode || ''
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

    useEffect(() => {
        if (profile.department) {
            const departmentData = colombiaData.find(d => d.departamento === profile.department);
            setCities(departmentData ? departmentData.ciudades : []);
        } else {
            setCities([]);
        }
    }, [profile.department]);


    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        setUploading(true);
        const toastId = toast.loading(t('profile.toast.uploading'));

        try {
            const storageRef = ref(storage, `profile_images/${currentUser.uid}/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(snapshot.ref);

            const auth = getAuth();
            await updateProfile(auth.currentUser, { photoURL });
            
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { photoURL });

            setProfile(prev => ({ ...prev, photoURL }));

            toast.success(t('profile.toast.photo_success'), { id: toastId });
        } catch (error) {
            console.error("Error updating profile photo:", error);
            toast.error(t('profile.errors.upload_photo'), { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevState => {
            const newState = { ...prevState, [name]: value };
            // If department changes, reset city
            if (name === 'department') {
                newState.city = '';
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
    
        const userDocRef = doc(db, 'users', currentUser.uid);
        const toastId = toast.loading(t('profile.toast.updating'));
        const auth = getAuth();
    
        try {
            let addressPayload = { text: profile.address || '' };
            const fullAddressForGeocode = `${profile.address}, ${profile.city}, ${profile.department}, ${profile.country}`.trim();

            if (fullAddressForGeocode && GEOCODE_API_KEY) {
                try {
                    const encodedAddress = encodeURIComponent(fullAddressForGeocode);
                    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GEOCODE_API_KEY}`;
                    
                    const response = await fetch(geocodeUrl);
                    const data = await response.json();

                    if (data.status === 'OK' && data.results[0]) {
                        const { lat, lng } = data.results[0].geometry.location;
                        addressPayload = { text: profile.address, latitude: lat, longitude: lng };
                    } else {
                        console.warn("Geocoding was not successful: " + data.status);
                    }
                } catch (geocodeError) {
                    console.error("Geocoding API call error:", geocodeError);
                }
            }
    
            if (profile.displayName !== currentUser.displayName) {
                await updateProfile(auth.currentUser, { displayName: profile.displayName });
            }
            
            const updatedData = { 
                displayName: profile.displayName,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                birthDate: profile.birthDate,
                address: addressPayload,
                country: profile.country,
                department: profile.department,
                city: profile.city,
                postalCode: profile.postalCode,
                photoURL: profile.photoURL
            };
    
            await updateDoc(userDocRef, updatedData, { merge: true });
            
            toast.success(t('profile.toast.success'), { id: toastId });
    
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(t('profile.errors.update_profile'), { id: toastId });
        }
    };

    const handlePasswordReset = async () => {
        const auth = getAuth();
        if (!auth.currentUser) {
            toast.error(t('profile.errors.not_logged_in'));
            return;
        }
        const toastId = toast.loading(t('profile.toast.sending_email'));
        try {
            await sendPasswordResetEmail(auth, auth.currentUser.email);
            toast.success(t('profile.toast.email_sent'), { id: toastId, duration: 6000 });
        } catch (error) {
            console.error("Password reset error:", error);
            toast.error(t('profile.errors.email_fail'), { id: toastId });
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (!currentUser) {
        return <Alert severity="info">{t('profile.login_prompt')}</Alert>;
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 800, mx: 'auto' }} elevation={3}>
            <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>{t('profile.title')}</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>{t('profile.subtitle')}</Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                         <Box sx={{ position: 'relative', width: 'fit-content' }}>
                            <Avatar src={profile.photoURL} sx={{ width: 128, height: 128, fontSize: '4rem' }}>
                                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : ''}
                            </Avatar>
                            <IconButton aria-label="upload picture" component="label" disabled={uploading} sx={{
                                    position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    color: 'black', boxShadow: theme.shadows[3],
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
                    
                    <Grid item xs={12} sm={6}>
                        <TextField name="country" label={t('profile.form.country')} value={profile.country} onChange={handleChange} fullWidth disabled />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="department-label">{t('profile.form.department')}</InputLabel>
                            <Select
                                labelId="department-label"
                                name="department"
                                value={profile.department}
                                label={t('profile.form.department')}
                                onChange={handleChange}
                            >
                                {colombiaData.map(d => (
                                    <MenuItem key={d.departamento} value={d.departamento}>{d.departamento}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth disabled={!profile.department}>
                            <InputLabel id="city-label">{t('profile.form.city')}</InputLabel>
                            <Select
                                labelId="city-label"
                                name="city"
                                value={profile.city}
                                label={t('profile.form.city')}
                                onChange={handleChange}
                            >
                                {cities.map(c => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="postalCode" label={t('profile.form.postal_code')} value={profile.postalCode} onChange={handleChange} fullWidth />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField name="address" label={t('profile.form.address')} value={profile.address} onChange={handleChange} fullWidth />
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
                    <Typography variant="h6" gutterBottom>{t('profile.security_panel.title')}</Typography>
                    <Typography color="text.secondary">{t('profile.security_panel.subtitle')}</Typography>
                </CardContent>
                <CardActions sx={{p: 2}}>
                    <Button variant="outlined" color="secondary" onClick={handlePasswordReset}>{t('profile.security_panel.action_button')}</Button>
                </CardActions>
            </Card>

        </Paper>
    );
}

export default Profile;
