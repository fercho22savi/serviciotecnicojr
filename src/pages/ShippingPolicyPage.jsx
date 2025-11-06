import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ShippingPolicyPage = () => {
  const { t } = useTranslation();

  // Split the content by newlines to create paragraphs
  const contentParagraphs = t('shipping_policy.content', { returnObjects: true }) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t('shipping_policy.title')}
        </Typography>
        <Typography variant="caption" display="block" gutterBottom color="text.secondary">
          {t('shipping_policy.last_updated')}
        </Typography>
        <Divider sx={{ my: 3 }} />

        {Array.isArray(contentParagraphs) && contentParagraphs.map((paragraph, index) => {
          if (typeof paragraph === 'string') {
            // Simple paragraph
            return <Typography key={index} variant="body1" paragraph>{paragraph}</Typography>;
          } else if (typeof paragraph === 'object' && paragraph.title) {
            // Section with a title and points
            return (
              <Box key={index} sx={{ my: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
                  {paragraph.title}
                </Typography>
                {paragraph.points && (
                  <Typography variant="body1" component="div">
                    <ul>
                      {paragraph.points.map((point, pIndex) => (
                        <li key={pIndex}><Typography variant="body1">{point}</Typography></li>
                      ))}
                    </ul>
                  </Typography>
                )}
              </Box>
            );
          }
          return null;
        })}
      </Paper>
    </Container>
  );
};

export default ShippingPolicyPage;
