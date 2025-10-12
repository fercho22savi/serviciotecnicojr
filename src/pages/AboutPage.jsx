import React from 'react';
import { Container, Typography, Box, Paper, Grid, Avatar } from '@mui/material';

const teamMembers = [
  {
    name: 'Juan Pérez',
    role: 'Fundador y CEO',
    bio: 'Apasionado por la tecnología y el buen diseño, Juan fundó esta tienda con la misión de ofrecer productos de alta calidad con un servicio excepcional.',
    avatar: 'https://i.pravatar.cc/150?img=68' // Placeholder image
  },
  {
    name: 'Ana García',
    role: 'Directora de Operaciones',
    bio: 'Con más de 10 años de experiencia en logística, Ana se asegura de que cada pedido llegue a tiempo y en perfectas condiciones.',
    avatar: 'https://i.pravatar.cc/150?img=49' // Placeholder image
  },
];

function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ my: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Sobre Nosotros
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Nuestra misión es llevar la mejor tecnología a tus manos, combinando calidad, innovación y un diseño excepcional.
          </Typography>
        </Box>

        {/* Our Story Section */}
        <Box sx={{ my: 6 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>Nuestra Historia</Typography>
              <Typography variant="body1" paragraph>
                Nacimos en 2023 de la idea de un pequeño grupo de entusiastas de la tecnología que creían que los productos de alta calidad no deberían ser un lujo inalcanzable. Empezamos en un pequeño garaje, seleccionando y probando cada artículo para garantizar que cumpliera con nuestros exigentes estándares.
              </Typography>
              <Typography variant="body1" paragraph>
                Hoy, hemos crecido hasta convertirnos en una tienda online de confianza para miles de clientes, pero nuestro compromiso inicial sigue intacto: ofrecer lo mejor, con transparencia y un servicio al cliente cercano y personal.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Box sx={{ height: 300, width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.200' }}>
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" alt="Team working" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Meet the Team Section */}
        <Box sx={{ textAlign: 'center', my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>Conoce a Nuestro Equipo</Typography>
          <Grid container spacing={4} justifyContent="center" sx={{mt: 3}}>
            {teamMembers.map((member) => (
              <Grid item key={member.name} xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    alt={member.name}
                    src={member.avatar}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  <Typography variant="h6" component="h3">{member.name}</Typography>
                  <Typography variant="subtitle1" color="primary" sx={{mb: 1}}>{member.role}</Typography>
                  <Typography variant="body2" color="text.secondary" align="center">{member.bio}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Paper>
    </Container>
  );
}

export default AboutPage;