import React from 'react';
import { Container, Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LoopIcon from '@mui/icons-material/Loop';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import { useTranslation } from 'react-i18next';

function ShippingPolicyPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ my: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('shipping_policy.title')}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            {t('shipping_policy.subtitle')}
          </Typography>
        </Box>

        {/* Shipping Options Section */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon color="primary" sx={{ mr: 1, fontSize: '2.5rem' }} /> {t('shipping_policy.shipping_options.title')}
          </Typography>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('shipping_policy.shipping_options.standard.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {t('shipping_policy.shipping_options.standard.description')}
              </Typography>
              <Typography paragraph>
                <strong>{t('shipping_policy.delivery_time_label')}:</strong> {t('shipping_policy.shipping_options.standard.time')}
              </Typography>
              <Typography>
                {t('shipping_policy.shipping_options.standard.tracking')}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('shipping_policy.shipping_options.express.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {t('shipping_policy.shipping_options.express.description')}
              </Typography>
              <Typography>
                <strong>{t('shipping_policy.delivery_time_label')}:</strong> {t('shipping_policy.shipping_options.express.time')}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Returns Policy Section */}
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LoopIcon color="primary" sx={{ mr: 1, fontSize: '2.5rem' }} /> {t('shipping_policy.returns_policy.title')}
            </Typography>
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{t('shipping_policy.returns_policy.conditions.title')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Typography paragraph>
                    {t('shipping_policy.returns_policy.conditions.description')}
                </Typography>
                <Typography>
                    {t('shipping_policy.returns_policy.conditions.exceptions')}
                </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{t('shipping_policy.returns_policy.process.title')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Typography paragraph>
                    {t('shipping_policy.returns_policy.process.description')}
                </Typography>
                <Typography>
                    {t('shipping_policy.returns_policy.process.shipping_costs')}
                </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
        
        {/* General Rules */}
         <Box sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <RuleFolderIcon color="primary" sx={{ mr: 1, fontSize: '2.5rem' }} /> {t('shipping_policy.general_rules.title')}
            </Typography>
             <Typography color="text.secondary">
                {t('shipping_policy.general_rules.description')}
            </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default ShippingPolicyPage;
