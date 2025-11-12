
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box } from '@mui/material';

const TermsOfServicePage = () => {
    const { t } = useTranslation();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('terms_of_service_page.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('terms_of_service_page.last_updated')}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.introduction.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('terms_of_service_page.introduction.content')}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.user_accounts.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('terms_of_service_page.user_accounts.content')}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.prohibited_conduct.title')}
                </Typography>
                <Typography variant="body1" component="ul" paragraph>
                    <li>{t('terms_of_service_page.prohibited_conduct.items.0')}</li>
                    <li>{t('terms_of_service_page.prohibited_conduct.items.1')}</li>
                    <li>{t('terms_of_service_page.prohibited_conduct.items.2')}</li>
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.intellectual_property.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('terms_of_service_page.intellectual_property.content')}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.disclaimer.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('terms_of_service_page.disclaimer.content')}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.limitation_of_liability.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('terms_of_service_page.limitation_of_liability.content')}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.governing_law.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('terms_of_service_page.governing_law.content')}
                </Typography>
            </Box>

            <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('terms_of_service_page.contact.title')}
                </Typography>
                <Typography variant="body1">
                    {t('terms_of_service_page.contact.content')} <a href="/contact">{t('terms_of_service_page.contact.link')}</a>.
                </Typography>
            </Box>
        </Container>
    );
};

export default TermsOfServicePage;
