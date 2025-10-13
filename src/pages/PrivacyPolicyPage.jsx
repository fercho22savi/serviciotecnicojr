import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Política de Privacidad
        </Typography>
        <Typography variant="caption" display="block" gutterBottom color="text.secondary">
          Última actualización: 1 de Agosto de 2024
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            1. Introducción
          </Typography>
          <Typography variant="body1" paragraph>
            Bienvenido a ElectronicaNr. Tu privacidad es de suma importancia para nosotros. Esta Política de Privacidad describe qué datos personales recopilamos, cómo los usamos, cómo los compartimos y tus derechos con respecto a tus datos.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            2. Datos que Recopilamos
          </Typography>
          <Typography variant="body1" component="div">
            Recopilamos información de varias maneras cuando utilizas nuestros servicios:
            <ul>
              <li><strong>Información que nos proporcionas directamente:</strong> Esto incluye la información que proporcionas al crear una cuenta, realizar un pedido o contactarnos, como tu nombre, dirección de correo electrónico, dirección de envío y número de teléfono.</li>
              <li><strong>Información recopilada automáticamente:</strong> Recopilamos información sobre tu dispositivo y tu uso de nuestro sitio web, como tu dirección IP, tipo de navegador, páginas visitadas y la fecha y hora de tu visita.</li>
              <li><strong>Cookies y tecnologías similares:</strong> Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido.</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            3. Cómo Usamos tu Información
          </Typography>
          <Typography variant="body1" paragraph>
            Utilizamos la información que recopilamos para:
          </Typography>
          <Typography variant="body1" component="div">
            <ul>
                <li>Procesar y gestionar tus pedidos.</li>
                <li>Mejorar y personalizar nuestros servicios y tu experiencia de compra.</li>
                <li>Comunicarnos contigo, incluyendo responder a tus consultas y enviarte información sobre tu pedido.</li>
                <li>Para fines de marketing (con tu consentimiento), como enviarte ofertas y promociones.</li>
                <li>Garantizar la seguridad de nuestro sitio web y prevenir el fraude.</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            4. Cómo Compartimos tu Información
          </Typography>
          <Typography variant="body1" paragraph>
            No vendemos ni alquilamos tu información personal a terceros. Podemos compartir tu información con:
          </Typography>
           <Typography variant="body1" component="div">
            <ul>
              <li>Proveedores de servicios que nos ayudan a operar nuestro negocio (por ejemplo, procesadores de pago y empresas de envío).</li>
              <li>Autoridades legales, si así lo exige la ley o para proteger nuestros derechos.</li>
            </ul>
          </Typography>
        </Box>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            5. Tus Derechos
          </Typography>
          <Typography variant="body1" paragraph>
            Tienes derecho a acceder, corregir o eliminar tu información personal. También puedes oponerte al procesamiento de tus datos. Para ejercer estos derechos, por favor contáctanos a través de nuestra página de contacto.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            6. Cambios a esta Política
          </Typography>
          <Typography variant="body1" paragraph>
            Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva política en esta página.
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;
