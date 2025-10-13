import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper', 
        py: 6, 
        borderTop: '1px solid', 
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-evenly">
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              TuTienda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('footer.company_slogan')}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>{t('footer.legal')}</Typography>
            <Link component={RouterLink} to="/privacy-policy" variant="body2" display="block" color="text.secondary" sx={{ mb: 1 }}>{t('footer.privacy_policy')}</Link>
            <Link component={RouterLink} to="/terms-of-service" variant="body2" display="block" color="text.secondary" sx={{ mb: 1 }}>{t('footer.terms_of_service')}</Link>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>{t('footer.help')}</Typography>
            <Link component={RouterLink} to="/faq" variant="body2" display="block" color="text.secondary" sx={{ mb: 1 }}>{t('footer.faq')}</Link>
            <Link component={RouterLink} to="/contact" variant="body2" display="block" color="text.secondary" sx={{ mb: 1 }}>{t('footer.contact')}</Link>
            <Link component={RouterLink} to="/shipping-policy" variant="body2" display="block" color="text.secondary" sx={{ mb: 1 }}>{t('footer.shipping_returns')}</Link>
            <Link component={RouterLink} to="/refund-policy" variant="body2" display="block" color="text.secondary">{t('footer.refund_policy')}</Link>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>{t('footer.follow_us')}</Typography>
            <IconButton aria-label="Facebook" color="inherit" component="a" href="https://facebook.com"><FacebookIcon /></IconButton>
            <IconButton aria-label="Twitter" color="inherit" component="a" href="https://twitter.com"><TwitterIcon /></IconButton>
            <IconButton aria-label="Instagram" color="inherit" component="a" href="https://instagram.com"><InstagramIcon /></IconButton>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {t('footer.copyright', { year: currentYear })}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
