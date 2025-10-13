import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const TermsOfServicePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Términos de Servicio
        </Typography>
        <Typography variant="caption" display="block" gutterBottom color="text.secondary">
          Última actualización: 1 de Agosto de 2024
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            1. Aceptación de los Términos
          </Typography>
          <Typography variant="body1" paragraph>
            Al acceder y utilizar nuestro sitio web ElectronicaNr (el "Servicio"), aceptas cumplir y estar sujeto a los siguientes términos y condiciones. Si no estás de acuerdo con estos términos, no debes utilizar nuestro Servicio.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            2. Uso del Servicio
          </Typography>
          <Typography variant="body1" component="div">
            Te comprometes a utilizar el Servicio únicamente para fines lícitos y de acuerdo con estos Términos. Aceptas no utilizar el Servicio:
            <ul>
              <li>De ninguna manera que viole cualquier ley o regulación aplicable.</li>
              <li>Para explotar, dañar o intentar explotar o dañar a menores de cualquier manera.</li>
              <li>Para transmitir o procurar el envío de cualquier material publicitario o promocional no solicitado (spam).</li>
              <li>Para suplantar o intentar suplantar a la Empresa, un empleado de la Empresa, otro usuario o cualquier otra persona o entidad.</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            3. Propiedad Intelectual
          </Typography>
          <Typography variant="body1" paragraph>
            El Servicio y todo su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de ElectronicaNr y sus licenciantes. El Servicio está protegido por derechos de autor, marcas registradas y otras leyes tanto de nuestro país como de países extranjeros.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            4. Cuentas de Usuario
          </Typography>
          <Typography variant="body1" paragraph>
            Cuando creas una cuenta con nosotros, debes proporcionarnos información que sea precisa, completa y actual en todo momento. El no hacerlo constituye una violación de los Términos, lo que puede resultar en la terminación inmediata de tu cuenta en nuestro Servicio.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            5. Limitación de Responsabilidad
          </Typography>
          <Typography variant="body1" paragraph>
            En ningún caso ElectronicaNr, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo, entre otros, la pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de tu acceso o uso o incapacidad para acceder o utilizar el Servicio.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            6. Cambios a los Términos
          </Typography>
          <Typography variant="body1" paragraph>
            Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigencia.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
            7. Contáctanos
          </Typography>
          <Typography variant="body1" paragraph>
            Si tienes alguna pregunta sobre estos Términos, por favor contáctanos a través de nuestra página de contacto.
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
};

export default TermsOfServicePage;
