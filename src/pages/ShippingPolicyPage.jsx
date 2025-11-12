import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpressIcon from '@mui/icons-material/RocketLaunch';
import ReturnIcon from '@mui/icons-material/AssignmentReturn';
import PublicIcon from '@mui/icons-material/Public';
import DamageIcon from '@mui/icons-material/ReportProblem';

const Section = ({ title, icon, children }) => (
  <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: '12px' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Paper>
);

function ShippingPolicyPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
        {t('shipping_policy.title')}
      </Typography>
      <Typography variant="h6" component="p" color="text.secondary" align="center" sx={{ mb: 6 }}>
        {t('shipping_policy.subtitle')}
      </Typography>

      <Section title={t('shipping_policy.shipping_options.title')} icon={<LocalShippingIcon />}>
        <Typography variant="h6" gutterBottom>{t('shipping_policy.shipping_options.standard.title')}</Typography>
        <Typography paragraph color="text.secondary">{t('shipping_policy.shipping_options.standard.description')}</Typography>
        <Typography paragraph color="text.secondary"><b>{t('delivery_time_label')}:</b> {t('shipping_policy.shipping_options.standard.time')}</Typography>
        <Typography paragraph color="text.secondary">{t('shipping_policy.shipping_options.standard.tracking')}</Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>{t('shipping_policy.shipping_options.express.title')}</Typography>
        <Typography paragraph color="text.secondary">{t('shipping_policy.shipping_options.express.description')}</Typography>
        <Typography paragraph color="text.secondary"><b>{t('delivery_time_label')}:</b> {t('shipping_policy.shipping_options.express.time')}</Typography>
      </Section>

      <Section title={t('shipping_policy.returns_policy.title')} icon={<ReturnIcon />}>
        <List>
          <ListItem>
            <ListItemText 
              primary={t('shipping_policy.returns_policy.conditions.timeframe.title')} 
              secondary={t('shipping_policy.returns_policy.conditions.timeframe.description')} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={t('shipping_policy.returns_policy.conditions.item_condition.title')} 
              secondary={t('shipping_policy.returns_policy.conditions.item_condition.description')} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={t('shipping_policy.returns_policy.conditions.process.title')} 
              secondary={t('shipping_policy.returns_policy.conditions.process.description')} 
            />
          </ListItem>
        </List>
      </Section>

      <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
              <Section title={t('shipping_policy.international.title')} icon={<PublicIcon />}>
                  <Typography color="text.secondary">{t('shipping_policy.international.body')}</Typography>
              </Section>
          </Grid>
          <Grid item xs={12} md={6}>
              <Section title={t('shipping_policy.damaged_items.title')} icon={<DamageIcon />}>
                  <Typography color="text.secondary">{t('shipping_policy.damaged_items.body')}</Typography>
              </Section>
          </Grid>
      </Grid>

    </Container>
  );
}

export default ShippingPolicyPage;