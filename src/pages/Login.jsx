import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container, 
  Alert, 
  Grid,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth(); // Get signInWithGoogle from context
  const navigate = useNavigate();

  // --- HANDLERS ---

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); // Redirect on successful login
    } catch (err) {
      setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithGoogle();
      navigate('/'); // Redirect on successful login
    } catch (err) {
      setError('No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.');
      console.error(err);
    }
  };

  // --- RENDER ---

  return (
    <Container component="main" maxWidth="sm" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography component="h1" variant="h4" fontWeight="bold">Iniciar Sesión</Typography>
          <Typography color="text.secondary">Bienvenido de vuelta. ¡Te hemos echado de menos!</Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        
        {/* Email/Password Form */}
        <Box component="form" onSubmit={handleEmailLogin} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Grid>
            <Grid item xs={12} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Recordarme" />
                <Button component={RouterLink} to="/forgot-password" size="small">¿Olvidaste tu contraseña?</Button>
            </Grid>
          </Grid>
          
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '12px' }} disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>

            <Grid container justifyContent="center">
                <Grid item>
                    <Button component={RouterLink} to="/signup">¿No tienes una cuenta? Regístrate</Button>
                </Grid>
            </Grid>
        </Box>

        {/* Divider and Social Login */}
        <Divider sx={{ my: 3 }}>O continúa con</Divider>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ py: 1.5, borderRadius: '12px' }}
              onClick={handleGoogleLogin} // Connect to Google login handler
            >
              Iniciar Sesión con Google
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Login;
