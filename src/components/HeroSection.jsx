import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '60vh',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
          zIndex: -1,
        },
      }}
    >
      <Container maxWidth="md">
        <Typography 
          variant="h2" 
          component="h1" 
          fontWeight="bold"
          sx={{ 
            mb: 2, 
            textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
          }}
        >
          {t('home_page.hero_title')}
        </Typography>
        <Typography 
          variant="h6" 
          component="p" 
          sx={{ 
            mb: 4, 
            textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
            fontSize: { xs: '1rem', sm: '1.2rem' }
          }}
        >
          {t('home_page.hero_subtitle')}
        </Typography>
        <Button
          component={RouterLink}
          to="/products"
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            borderRadius: '50px',
            boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: (theme) => `0 0 30px ${theme.palette.primary.main}`,
            }
          }}
        >
          {t('home_page.explore_collection_button')}
        </Button>
      </Container>
    </Box>
  );
};

export default HeroSection;
