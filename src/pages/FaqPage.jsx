import React from 'react';
import { Container, Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: '¿Cómo puedo realizar un seguimiento de mi pedido?',
    answer: 'Una vez que tu pedido ha sido enviado, recibirás un correo electrónico de confirmación con un número de seguimiento. Puedes usar este número en el sitio web del transportista para ver el estado actual de tu envío.'
  },
  {
    question: '¿Cuáles son los métodos de pago aceptados?',
    answer: 'Aceptamos una amplia variedad de métodos de pago, incluyendo las principales tarjetas de crédito (Visa, MasterCard, American Express), PayPal y transferencias bancarias. Toda la información de pago está encriptada y es segura.'
  },
  {
    question: '¿Cuál es su política de devoluciones?',
    answer: 'Ofrecemos un plazo de 30 días para devoluciones. El producto debe estar sin usar y en su embalaje original. Para más detalles, por favor, consulta nuestra página de Políticas de Envío y Devoluciones.'
  },
  {
    question: '¿Tengo que crear una cuenta para comprar?',
    answer: 'No, puedes realizar una compra como invitado. Sin embargo, crear una cuenta te permite guardar tu información de envío, ver tu historial de pedidos y gestionar tus devoluciones de forma más sencilla.'
  },
  {
    question: '¿Realizan envíos internacionales?',
    answer: 'Actualmente, solo realizamos envíos dentro del territorio nacional. Estamos trabajando para expandir nuestras opciones de envío en el futuro. ¡Mantente atento a las actualizaciones!'
  },
  {
    question: 'Mi producto ha llegado dañado, ¿qué hago?',
    answer: 'Lamentamos mucho oír eso. Por favor, contacta a nuestro equipo de soporte al cliente dentro de las 48 horas posteriores a la recepción de tu pedido con fotos del producto dañado y tu número de pedido. Nos encargaremos de solucionarlo lo antes posible.'
  }
];

function FaqPage() {
  return (
    <Container maxWidth="md" sx={{ my: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Preguntas Frecuentes
          </Typography>
          <Typography variant="h5" color="text.secondary">
            ¿Tienes dudas? ¡Tenemos respuestas! Aquí encontrarás la solución a las preguntas más comunes.
          </Typography>
        </Box>

        {faqs.map((faq, index) => (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
            >
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Container>
  );
}

export default FaqPage;
