import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  Grid
} from '@mui/material';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
        setError('Por favor, ingresa tu correo electrónico.');
        setLoading(false);
        return;
    }

    // --- Placeholder for Firebase/Backend Logic ---
    try {
      // In a real app, you would call a Firebase function like `sendPasswordResetEmail(auth, email)`
      console.log('Enviando enlace de recuperación a:', email);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      setMessage('Si existe una cuenta con este correo, hemos enviado un enlace para restablecer la contraseña.');
    } catch (err) {
      console.error(err);
      setError('No se pudo procesar la solicitud. Por favor, inténtalo de nuevo más tarde.');
    }
    // --- End of Placeholder ---

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography component="h1" variant="h4" fontWeight="bold">
            Recuperar Contraseña
          </Typography>
          <Typography color="text.secondary">
            No te preocupes. Ingresa tu correo y te ayudaremos.
          </Typography>
        </Box>

        {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!message} // Disable field after success
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '12px' }}
            disabled={loading || !!message}
          >
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </Button>

            <Grid container justifyContent="center">
                <Grid item>
                    <Button component={RouterLink} to="/login">
                        Volver a Iniciar Sesión
                    </Button>
                </Grid>
            </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default ForgotPassword;
