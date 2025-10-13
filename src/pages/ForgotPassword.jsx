import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, TextField, Button, Paper, Avatar, FormHelperText, Alert
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { resetPassword } = useAuth();

    const validate = () => {
        if (!email) {
            setError('El correo electrónico es requerido.');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('El formato del correo es inválido.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setMessage('');

        try {
            await resetPassword(email);
            setMessage('Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.');
            toast.success('Enlace de recuperación enviado.');
            setEmail(''); // Clear the input field
        } catch (err) {
            console.error("Forgot Password error:", err);
            // Do not reveal if the email exists or not for security reasons
            setMessage('Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockResetIcon />
                </Avatar>
                <Typography component="h1" variant="h5">Recuperar Contraseña</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 3 }}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </Typography>
                
                {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                    <TextField
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!error}
                        helperText={error}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                    </Button>
                    <Box textAlign="center">
                         <Button component={RouterLink} to="/login" variant="text">
                            Volver a Iniciar Sesión
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default ForgotPassword;
