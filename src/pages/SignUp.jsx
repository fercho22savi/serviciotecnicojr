import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreesToTerms, setAgreesToTerms] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreesToTerms) {
      setError('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, { firstName, lastName });
      navigate('/products');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso. Intenta iniciar sesión.');
      } else {
        setError('Ocurrió un error al crear la cuenta. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/products');
    } catch (err) {
      setError('No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: 'calc(100vh - 64px)' }}>
       <Grid
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://source.unsplash.com/random?ecommerce)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid
        xs={12}
        sm={8}
        md={5}
        component={Box}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '450px',
          }}
        >
          <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
            Crear una Cuenta
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Únete a nuestra comunidad y descubre productos increíbles.
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSignUp}
            noValidate
            sx={{ mt: 1, width: '100%', opacity: loading ? 0.6 : 1 }}
          >
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="Nombre"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Apellidos"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </Grid>
            </Grid>
             <FormControlLabel
                control={<Checkbox value={agreesToTerms} onChange={(e) => setAgreesToTerms(e.target.checked)} color="primary" />}
                label="Acepto los Términos y Condiciones"
                sx={{ mt: 2, mb: 1, alignSelf: 'flex-start' }}
              />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2, py: 1.5, borderRadius: '8px', fontWeight: 'bold' }}
              disabled={loading || !agreesToTerms}
            >
              Crear Cuenta
            </Button>
            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <Grid>
                <Button component={RouterLink} to="/login" disabled={loading}>
                  ¿Ya tienes una cuenta? Inicia sesión
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ my: 3, width: '100%' }}>O continúa con</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{ py: 1.5, borderRadius: '8px' }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Regístrate con Google
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default SignUp;
