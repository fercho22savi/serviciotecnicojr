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
  Alert,
  Paper,
  Container
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

// This is the final, correct implementation to fix the layout issue.
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
    // Step 1: Wrap the entire component in a standard Box with vertical margin.
    // This makes it a normal content block, allowing the main App layout to handle the footer correctly.
    <Box sx={{ my: 4 }}>
      {/* Step 2: Use a Paper component to contain the design and provide a visual card effect. */}
      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {/* Step 3: The two-column grid is now nested inside, so its layout doesn't conflict with the page flow. */}
        <Grid container spacing={0}>
          {/* Columna Izquierda - Imagen y Bienvenida */}
          <Grid
            item
            xs={false}
            sm={5}
            md={6}
            sx={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?q=80&w=2070&auto=format&fit=crop)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: { sm: 4, md: 6 },
              color: 'white',
            }}
          >
            <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', p: 3, borderRadius: 2 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Bienvenido a MiTienda
                </Typography>
                <Typography variant="h6">
                    La mejor tecnología al alcance de tu mano.
                </Typography>
            </Box>
          </Grid>
          
          {/* Columna Derecha - Formulario de Registro */}
          <Grid 
            item 
            xs={12} 
            sm={7} 
            md={6} 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 3, sm: 4, md: 6 },
            }}
          >
            <Box
              sx={{
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
                Únete y descubre productos increíbles.
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
                  <Grid item xs={12} sm={6}>
                    <TextField autoComplete="given-name" name="firstName" required fullWidth id="firstName" label="Nombre" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth id="lastName" label="Apellidos" name="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                  </Grid>
                </Grid>
                 <FormControlLabel
                    control={<Checkbox value={agreesToTerms} onChange={(e) => setAgreesToTerms(e.target.checked)} color="primary" />}
                    label={
                        <Typography variant="body2">
                            Acepto los <RouterLink to="/terms" style={{ textDecoration: 'underline', color: 'inherit' }}>Términos y Condiciones</RouterLink>
                        </Typography>
                    }
                    sx={{ mt: 2, mb: 1, alignSelf: 'flex-start' }}
                  />
                <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.5, borderRadius: '8px', fontWeight: 'bold' }} disabled={loading || !agreesToTerms}>
                  Crear Cuenta
                </Button>
                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                  <Grid item>
                    <Button component={RouterLink} to="/login" disabled={loading}>
                      ¿Ya tienes una cuenta? Inicia sesión
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 3, width: '100%' }}>O continúa con</Divider>
              <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ py: 1.5, borderRadius: '8px' }} onClick={handleGoogleLogin} disabled={loading}>
                Regístrate con Google
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default SignUp;
