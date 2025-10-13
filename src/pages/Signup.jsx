import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { updateProfile } from "firebase/auth";
import { 
    Container, Box, Typography, TextField, Button, Grid, Link, Paper, Avatar, FormControlLabel, Checkbox, FormHelperText
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import toast from 'react-hot-toast';

const Signup = () => {
    const [formValues, setFormValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formValues.firstName) newErrors.firstName = 'El nombre es requerido.';
        if (!formValues.lastName) newErrors.lastName = 'El apellido es requerido.';
        if (!formValues.email) {
            newErrors.email = 'El correo electrónico es requerido.';
        } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
            newErrors.email = 'El formato del correo es inválido.';
        }
        if (!formValues.password) {
            newErrors.password = 'La contraseña es requerida.';
        } else if (formValues.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
        }
        if (formValues.password !== formValues.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden.';
        }
        if (!formValues.termsAccepted) {
            newErrors.termsAccepted = 'Debes aceptar los términos y condiciones.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const displayName = `${formValues.firstName} ${formValues.lastName}`.trim();
        try {
            const userCredential = await signup(formValues.email, formValues.password);
            const user = userCredential.user;

            await updateProfile(user, { displayName });

            await setDoc(doc(db, "users", user.uid), {
                displayName,
                email: formValues.email,
                createdAt: serverTimestamp(),
                role: 'customer',
                wishlist: []
            });
            
            toast.success('¡Cuenta creada con éxito!');
            navigate('/');

        } catch (error) {
            console.error("Error signing up:", error);
            if (error.code === 'auth/email-already-in-use') {
                setErrors(prev => ({ ...prev, email: 'Este correo electrónico ya está en uso.' }));
            } else {
                toast.error('Hubo un problema al crear la cuenta.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlinedIcon /></Avatar>
                <Typography component="h1" variant="h5">Crear una Cuenta</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>Únete y descubre productos increíbles.</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth id="firstName" label="Nombre" name="firstName" autoComplete="given-name" value={formValues.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth id="lastName" label="Apellidos" name="lastName" autoComplete="family-name" value={formValues.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" value={formValues.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required fullWidth name="password" label="Contraseña" type="password" id="password" value={formValues.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required fullWidth name="confirmPassword" label="Repetir Contraseña" type="password" id="confirmPassword" value={formValues.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox value="allowExtraEmails" color="primary" name="termsAccepted" checked={formValues.termsAccepted} onChange={handleChange} />}
                                label={<Typography variant="body2">Acepto los <Link href="#" variant="body2">Términos y Condiciones</Link></Typography>}
                            />
                             {errors.termsAccepted && <FormHelperText error>{errors.termsAccepted}</FormHelperText>}
                        </Grid>
                    </Grid>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>{loading ? 'Creando...' : 'Crear Cuenta'}</Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link component={RouterLink} to="/login" variant="body2">¿Ya tienes una cuenta? Inicia sesión</Link>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default Signup;
