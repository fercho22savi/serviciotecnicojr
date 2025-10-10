import React from 'react';
import { Container, Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LoopIcon from '@mui/icons-material/Loop';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';

function ShippingPolicyPage() {
  return (
    <Container maxWidth="lg" sx={{ my: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Envíos y Devoluciones
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Todo lo que necesitas saber sobre cómo llevamos nuestros productos hasta tu puerta.
          </Typography>
        </Box>

        {/* Shipping Options Section */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon color="primary" sx={{ mr: 1, fontSize: '2.5rem' }} /> Opciones de Envío
          </Typography>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Envío Estándar Nacional</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Nuestro envío estándar es gratuito para todos los pedidos superiores a $50. Para pedidos inferiores, tiene un coste fijo de $5.
              </Typography>
              <Typography paragraph>
                <strong>Tiempo de entrega:</strong> 3-5 días laborables.
              </Typography>
              <Typography>
                Todos los paquetes son enviados con un número de seguimiento que recibirás por correo electrónico tan pronto como el pedido sea despachado.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Envío Express</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                ¿Necesitas tu pedido con urgencia? Ofrecemos un servicio de envío express por un coste adicional de $15.
              </Typography>
              <Typography>
                <strong>Tiempo de entrega:</strong> 1-2 días laborables.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Returns Policy Section */}
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LoopIcon color="primary" sx={{ mr: 1, fontSize: '2.5rem' }} /> Política de Devoluciones
            </Typography>
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Plazo y Condiciones</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Typography paragraph>
                    Aceptamos devoluciones hasta 30 días después de la fecha de entrega. Para que una devolución sea aceptada, el producto debe estar en su embalaje original, sin usar y en las mismas condiciones en que lo recibiste.
                </Typography>
                <Typography>
                    Los productos de software y las tarjetas de regalo no son retornables.
                </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Proceso de Devolución</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Typography paragraph>
                    Para iniciar una devolución, por favor, contacta con nuestro equipo de soporte a través de la página de contacto con tu número de pedido. Te proporcionaremos las instrucciones y la dirección para el envío.
                </Typography>
                <Typography>
                    Los costes de envío de la devolución corren a cargo del cliente, a menos que el motivo de la devolución sea un error por nuestra parte (producto incorrecto o defectuoso).
                </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
        
        {/* General Rules */}
         <Box sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <RuleFolderIcon color="primary" sx={{ mr: 1, fontSize: '2.5rem' }} /> Reglas Generales
            </Typography>
             <Typography color="text.secondary">
                Nos reservamos el derecho de rechazar cualquier devolución que no cumpla con los criterios mencionados. Es importante inspeccionar tu pedido tan pronto como lo recibas. Si encuentras algún problema, contáctanos inmediatamente.
            </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default ShippingPolicyPage;
