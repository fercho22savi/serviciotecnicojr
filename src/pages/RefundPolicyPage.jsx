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
} from '@mui/material';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import LoopIcon from '@mui/icons-material/Loop';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PolicyIcon from '@mui/icons-material/Policy';

const Section = ({ title, icon, children }) => (
  <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: '12px' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>{icon}</ListItemIcon>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <Typography component="div" color="text.secondary">
        {children}
    </Typography>
  </Paper>
);

function RefundPolicyPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
        {t('refund_policy.title')}
      </Typography>
      <Typography variant="h6" component="p" color="text.secondary" align="center" sx={{ mb: 6 }}>
        {t('refund_policy.subtitle')}
      </Typography>

      <Section title={t('refund_policy.general.title')} icon={<PolicyIcon />}>
        <p>{t('refund_policy.general.timeframe')}</p>
        <p>{t('refund_policy.general.conditions')}</p>
      </Section>

      <Section title={t('refund_policy.process.title')} icon={<LoopIcon />}>
        <p>{t('refund_policy.process.initiate')}</p>
        <p>{t('refund_policy.process.shipping')}</p>
      </Section>
      
      <Section title={t('refund_policy.non_refundable.title')} icon={<MoneyOffIcon />}>
          <p>{t('refund_policy.non_refundable.items')}</p>
      </Section>

      <Section title={t('refund_policy.late_refunds.title')} icon={<HelpOutlineIcon />}>
        <List>
          <ListItem>
            <ListItemText primary={t('refund_policy.late_refunds.check_account')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('refund_policy.late_refunds.contact_card')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('refund_policy.late_refunds.contact_us')} />
          </ListItem>
        </List>
      </Section>

    </Container>
  );
}

export default RefundPolicyPage;
