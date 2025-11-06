import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  const renderSection = (titleKey, contentKey) => (
    <Box sx={{ my: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
        {t(titleKey)}
      </Typography>
      <Typography variant="body1" paragraph dangerouslySetInnerHTML={{ __html: t(contentKey) }} />
    </Box>
  );

  const renderListSection = (titleKey, introKey, pointsKey) => (
    <Box sx={{ my: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600' }}>
        {t(titleKey)}
      </Typography>
      <Typography variant="body1" paragraph>
        {t(introKey)}
      </Typography>
      <Typography variant="body1" component="div">
        <ul>
          {t(pointsKey, { returnObjects: true }).map((point, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
          ))}
        </ul>
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t('privacy_policy_page.title')}
        </Typography>
        <Typography variant="caption" display="block" gutterBottom color="text.secondary">
          {t('privacy_policy_page.last_updated')}
        </Typography>
        <Divider sx={{ my: 3 }} />

        {renderSection('privacy_policy_page.introduction.title', 'privacy_policy_page.introduction.content')}
        {renderListSection('privacy_policy_page.data_we_collect.title', 'privacy_policy_page.data_we_collect.intro', 'privacy_policy_page.data_we_collect.points')}
        {renderListSection('privacy_policy_page.how_we_use_your_information.title', 'privacy_policy_page.how_we_use_your_information.intro', 'privacy_policy_page.how_we_use_your_information.points')}
        {renderListSection('privacy_policy_page.how_we_share_your_information.title', 'privacy_policy_page.how_we_share_your_information.intro', 'privacy_policy_page.how_we_share_your_information.points')}
        {renderSection('privacy_policy_page.your_rights.title', 'privacy_policy_page.your_rights.content')}
        {renderSection('privacy_policy_page.changes_to_this_policy.title', 'privacy_policy_page.changes_to_this_policy.content')}
        {renderSection('privacy_policy_page.apple_app_store_disclosure.title', 'privacy_policy_page.apple_app_store_disclosure.content')}

      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;
