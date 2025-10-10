import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Grid, Paper, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// A simple list of countries for the dropdown
const countries = ['Estados Unidos', 'Canadá', 'México', 'España', 'Colombia', 'Argentina', 'Perú', 'Chile'];

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    agreesToTerms: false,
    subscribes: false,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    tempErrors.firstName = formData.firstName ? '' : 'El nombre es obligatorio.';
    tempErrors.lastName = formData.lastName ? '' : 'El apellido es obligatorio.';
    tempErrors.email = (/$^|.+@.+..+/).test(formData.email) ? '' : 'El correo electrónico no es válido.';
    tempErrors.phone = formData.phone ? '' : 'El teléfono es obligatorio.';
    tempErrors.password = formData.password.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.';
    tempErrors.confirmPassword = formData.password === formData.confirmPassword ? '' : 'Las contraseñas no coinciden.';
    tempErrors.address = formData.address ? '' : 'La dirección es obligatoria.';
    tempErrors.city = formData.city ? '' : 'La ciudad es obligatoria.';
    tempErrors.zip = formData.zip ? '' : 'El código postal es obligatorio.';
    tempErrors.country = formData.country ? '' : 'Debes seleccionar un país.';
    tempErrors.agreesToTerms = formData.agreesToTerms ? '' : 'Debes aceptar los términos y condiciones.';

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Formulario de registro enviado:', formData);
      // Here you would typically send the data to your backend
      alert('¡Registro exitoso! Serás redirigido a la página de inicio.');
      navigate('/');
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography component="h1" variant="h4" fontWeight="bold">
            Crear una Cuenta
          </Typography>
          <Typography color="text.secondary">
            Completa el formulario para empezar a comprar.
          </Typography>
        </Box>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* --- Personal Information --- */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="Nombre"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Apellidos"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            
            {/* --- Shipping Address --- */}
             <Grid item xs={12}>
                <Typography variant="h6" sx={{mt: 2, mb: 1}}>Dirección de Envío</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="address" label="Dirección (Calle y Número)" value={formData.address} onChange={handleChange} error={!!errors.address} helperText={errors.address} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth name="address2" label="Información Adicional (Apto, suite, etc.)" value={formData.address2} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="city" label="Ciudad" value={formData.city} onChange={handleChange} error={!!errors.city} helperText={errors.city} />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="zip" label="Código Postal" value={formData.zip} onChange={handleChange} error={!!errors.zip} helperText={errors.zip} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.country}>
                    <InputLabel>País</InputLabel>
                    <Select name="country" label="País" value={formData.country} onChange={handleChange}>
                        {countries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                    {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
                </FormControl>
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField name="state" label="Estado / Provincia" fullWidth value={formData.state} onChange={handleChange} />
            </Grid>

            {/* --- Account Details --- */}
            <Grid item xs={12}>
                <Typography variant="h6" sx={{mt: 2, mb: 1}}>Datos de la Cuenta</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="email" label="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="phone" label="Teléfono" type="tel" value={formData.phone} onChange={handleChange} error={!!errors.phone} helperText={errors.phone} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="confirmPassword" label="Confirmar Contraseña" type="password" value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
            </Grid>

            {/* --- Legal & Marketing --- */}
            <Grid item xs={12}>
              <FormControl required error={!!errors.agreesToTerms}>
                <FormControlLabel
                  control={<Checkbox name="agreesToTerms" checked={formData.agreesToTerms} onChange={handleChange} />}
                  label="Acepto los Términos y Condiciones y la Política de Privacidad"
                />
                {!!errors.agreesToTerms && <FormHelperText sx={{ml: 0}}>Debes aceptar para continuar</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox name="subscribes" checked={formData.subscribes} onChange={handleChange} />}
                label="Quiero recibir ofertas y noticias por correo."
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: '12px' }}
            disabled={!formData.agreesToTerms}
          >
            Crear Cuenta
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button component={RouterLink} to="/login">
                ¿Ya tienes una cuenta? Inicia sesión
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default SignUp;
