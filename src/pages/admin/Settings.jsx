import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

function Settings() {
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Configuración de la Tienda
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box>
          <Typography variant="h6">Próximamente</Typography>
          <Typography color="text.secondary">
            Aquí podrás gestionar la configuración general de tu tienda, como los métodos de pago, las opciones de envío y mucho más.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Settings;
