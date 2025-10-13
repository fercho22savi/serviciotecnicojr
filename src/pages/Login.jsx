import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Avatar, Button, CssBaseline, TextField, FormControlLabel, Checkbox, Link, Grid, Box, Typography, 
  Container, Paper, Alert, IconButton, CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || (isAdmin ? "/admin/dashboard" : "/");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
        setError("Por favor, completa todos los campos.");
        return;
    }
    setLoading(true);
    setError('');

    try {
      await login(email, password, rememberMe);
      toast.success('¡Bienvenido de vuelta!');
      navigate(from, { replace: true });
    } catch (err) {
        let friendlyError = "Ocurrió un error inesperado. Inténtalo de nuevo.";
        switch (err.code) {
            case 'auth/user-not-found':
                friendlyError = "No se encontró ninguna cuenta con este correo electrónico.";
                break;
            case 'auth/wrong-password':
                friendlyError = "La contraseña es incorrecta. Inténtalo de nuevo.";
                break;
            case 'auth/invalid-email':
                friendlyError = "El formato del correo electrónico no es válido.";
                break;
            case 'auth/too-many-requests':
                friendlyError = "Has intentado iniciar sesión demasiadas veces. Por favor, intenta de nuevo más tarde.";
                break;
            default: console.error("Login error:", err);
        }
        setError(friendlyError);
        toast.error(friendlyError);
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await loginWithGoogle();
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          displayName: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          role: 'customer',
          wishlist: []
        });
        toast.success(`¡Bienvenido, ${user.displayName}!`);
      } else {
        toast.success(`¡Bienvenido de vuelta, ${user.displayName}!`);
      }

      navigate(from, { replace: true });
    } catch (err) {
      // Don't show an error toast if the user simply closed the popup
      if (err.code !== 'auth/popup-closed-by-user') {
          setError("No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.");
          toast.error("No se pudo iniciar sesión con Google.");
      }
      console.error("Google Sign-In error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: 'calc(100vh - 64px)' }}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} sx={{ ...styling.backgroundImage }} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box sx={{ ...styling.formContainer }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlinedIcon /></Avatar>
          <Typography component="h1" variant="h5">Iniciar Sesión</Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }} action={<IconButton size="small" onClick={() => setError('')}><CloseIcon fontSize="inherit" /></IconButton>}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <FormControlLabel control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />} label="Recordarme" />
            
            <Box sx={{ position: 'relative' }}>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                    Iniciar Sesión
                </Button>
                {loading && <CircularProgress size={24} sx={{ ...styling.buttonProgress }} />} 
            </Box>

            <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleSignIn} disabled={loading} sx={{ mb: 2 }}>
              Iniciar sesión con Google
            </Button>

            <Grid container>
              <Grid item xs><Link component={RouterLink} to="/forgot-password" variant="body2">¿Olvidaste tu contraseña?</Link></Grid>
              <Grid item><Link component={RouterLink} to="/signup" variant="body2">{"¿No tienes una cuenta? Regístrate"}</Link></Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

const styling = {
    backgroundImage: {
        backgroundImage: 'url(https://source.unsplash.com/random?tech,ecommerce)',
        backgroundRepeat: 'no-repeat',
        backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    formContainer: {
        my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: '-12px',
        marginLeft: '-12px',
    },
};

export default Login;
