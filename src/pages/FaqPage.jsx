import React from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Container } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function FaqPage() {
  const { t } = useTranslation();

  const faqData = [
    {
      id: 'payment-methods',
      question: t('faq_page.payment_q'),
      answer: t('faq_page.payment_a')
    },
    {
      id: 'shipping-time',
      question: t('faq_page.shipping_q'),
      answer: t('faq_page.shipping_a')
    },
    {
      id: 'return-policy',
      question: t('faq_page.returns_q'),
      answer: t('faq_page.returns_a')
    },
    {
      id: 'account-needed',
      question: t('faq_page.account_q'),
      answer: t('faq_page.account_a')
    },
    {
      id: 'international-shipping',
      question: t('faq_page.international_q'),
      answer: t('faq_page.international_a')
    },
    {
      id: 'damaged-product',
      question: t('faq_page.damaged_q'),
      answer: t('faq_page.damaged_a')
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 6 }}>
        {t('faq_page.title')}
      </Typography>
      
      <Box>
        {faqData.map((faq, index) => (
          <Accordion 
            key={faq.id} 
            defaultExpanded={index === 0} 
            sx={{ 
                mb: 1.5, 
                borderRadius: '12px', 
                '&:before': { display: 'none' },
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${faq.id}-content`}
              id={`${faq.id}-header`}
              sx={{ p: '12px 24px' }}
            >
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: '0 24px 20px' }}>
              <Typography color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}

export default FaqPage;
