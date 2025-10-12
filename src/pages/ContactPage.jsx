import React from 'react';
import { Container, Typography, Box, Grid, TextField, Button, Paper } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTranslation } from 'react-i18next';

function ContactPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 6 }}>
        {t('contact_page.title')}
      </Typography>

      <Grid container spacing={5}>
        {/* Columna de Información de Contacto */}
        <Grid item xs={12} md={5}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                {t('contact_page.get_in_touch')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                {t('contact_page.form_intro')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Typography>+1 (555) 123-4567</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmailIcon color="primary" sx={{ mr: 2 }} />
                <Typography>soporte@tutienda.com</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationOnIcon color="primary" sx={{ mr: 2 }} />
                <Typography>123 Calle Falsa, Springfield, SP 12345</Typography>
            </Box>
        </Grid>

        {/* Columna del Formulario */}
        <Grid item xs={12} md={7}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: '12px' }}>
                <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField required id="firstName" name="firstName" label={t('contact_page.form.first_name')} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required id="lastName" name="lastName" label={t('contact_page.form.last_name')} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required id="email" name="email" label={t('contact_page.form.email')} type="email" fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required id="subject" name="subject" label={t('contact_page.form.subject')} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                id="message"
                                name="message"
                                label={t('contact_page.form.message')}
                                fullWidth
                                multiline
                                rows={5}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" size="large" fullWidth>
                                {t('contact_page.form.send_button')}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ContactPage;
