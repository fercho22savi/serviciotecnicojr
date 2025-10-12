import React from 'react';
import { useTranslation } from 'react-i18next'; // <-- IMPORTADO
import { Grid, Paper, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Outlet, NavLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';

function Account() {
  const { t } = useTranslation(); // <-- INICIALIZADO

  // El array ahora se define aquí para usar t()
  const navLinks = [
    { text: t('account_menu.profile'), path: '/account/profile', icon: <AccountCircleIcon /> },
    { text: t('account_menu.orders'), path: '/account/orders', icon: <ShoppingBasketIcon /> },
    { text: t('account_menu.addresses'), path: '/account/addresses', icon: <LocationOnIcon /> },
    { text: t('account_menu.payment_methods'), path: '/account/payment-methods', icon: <CreditCardIcon /> },
    { text: t('account_menu.security'), path: '/account/security', icon: <SecurityIcon /> },
    { text: t('account_menu.preferences'), path: '/account/preferences', icon: <SettingsIcon /> },
  ];

  return (
    <Grid container spacing={4} sx={{ p: { xs: 1, md: 3 } }}>
      <Grid item xs={12} md={3}>
        <Paper elevation={2} sx={{ borderRadius: '12px', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, p: 1, fontWeight: 'bold' }}>
            {t('account_menu.title')} {/* <-- TRADUCIDO */}
          </Typography>
          <List component="nav">
            {navLinks.map((link) => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton 
                  component={NavLink} 
                  to={link.path} 
                  sx={{
                    borderRadius: '8px',
                    '&.active': {
                      backgroundColor: 'action.selected',
                      fontWeight: 'bold',
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  {/* El texto ya viene traducido del array */}
                  <ListItemText primary={link.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={9}>
        <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: '12px' }}>
          <Outlet />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Account;