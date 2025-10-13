import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const RefundPolicyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Política de Devoluciones y Reembolsos
        </Typography>
        <Typography variant="caption" display="block" gutterBottom color="text.secondary">
          Última actualización: 1 de Agosto de 2024
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            1. General
          </Typography>
          <Typography variant="body1" paragraph>
            En ElectronicaNr, nuestra prioridad es la satisfacción de nuestros clientes. Si no estás completamente satisfecho con tu compra, estamos aquí para ayudarte. Esta política se aplica a todos los productos comprados a través de nuestro sitio web.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            2. Plazo para Devoluciones
          </Typography>
          <Typography variant="body1" paragraph>
            Tienes un plazo de **30 días calendario** a partir de la fecha en que recibiste el producto para solicitar una devolución. Pasados los 30 días, lamentablemente no podremos ofrecerte un reembolso o cambio.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            3. Condiciones para la Devolución
          </Typography>
          <Typography variant="body1" component="div">
            Para que una devolución sea aceptada, el producto debe cumplir con las siguientes condiciones:
            <ul>
              <li>Debe estar sin usar y en las mismas condiciones en que lo recibiste.</li>
              <li>Debe estar en su empaque original, con todos sus manuales, accesorios y etiquetas intactas.</li>
              <li>Debes presentar el comprobante de compra o factura.</li>
            </ul>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Productos que muestren signos de uso, daño, o que no estén en su empaque original podrán ser rechazados para la devolución.
            </Typography>
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            4. Proceso de Devolución
          </Typography>
          <Typography variant="body1" component="div">
            Para iniciar una devolución, por favor sigue estos pasos:
            <ol>
              <li>Contacta a nuestro servicio de atención al cliente a través de la página <a href="/contact">Contacto</a>, indicando tu número de orden y el motivo de la devolución.</li>
              <li>Nuestro equipo te proporcionará las instrucciones y una etiqueta de envío de devolución (si aplica).</li>
              <li>Empaca el producto de forma segura, preferiblemente en su caja de envío original, e incluye el comprobante de compra.</li>
              <li>Envía el producto a la dirección que te proporcionaremos.</li>
            </ol>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Los costos de envío de la devolución corren por cuenta del cliente, a menos que la devolución se deba a un error nuestro (producto incorrecto o defectuoso).
            </Typography>
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            5. Reembolsos
          </Typography>
          <Typography variant="body1" paragraph>
            Una vez que recibamos e inspeccionemos tu devolución, te enviaremos un correo electrónico para notificarte la aprobación o rechazo de tu reembolso. Si es aprobado, tu reembolso será procesado y un crédito se aplicará automáticamente a tu método de pago original dentro de un plazo de 5 a 10 días hábiles.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            6. Productos no Reembolsables
          </Typography>
           <Typography variant="body1" component="div">
            Algunos artículos no pueden ser devueltos, incluyendo:
            <ul>
              <li>Tarjetas de regalo y software descargable.</li>
              <li>Productos de cuidado personal.</li>
              <li>Artículos en oferta final (marcados como "Venta Final" o "Liquidación").</li>
            </ul>
          </Typography>
        </Box>
        
         <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            7. Contacto
          </Typography>
          <Typography variant="body1" paragraph>
            Si tienes alguna pregunta sobre nuestra política de devoluciones, no dudes en contactarnos.
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
};

export default RefundPolicyPage;
