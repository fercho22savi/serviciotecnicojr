import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Typography, ListItemIcon } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    ShoppingBag as ShoppingBagIcon,
    Favorite as FavoriteIcon,
    AccountCircle as AccountCircleIcon,
    Visibility as VisibilityIcon,
    Settings as SettingsIcon,
    CreditCard as CreditCardIcon
} from '@mui/icons-material';

const AccountLayout = () => {
  const { t } = useTranslation();

  const accountLinks = [
    { text: t('account_menu.dashboard'), to: '/account/dashboard', icon: <DashboardIcon /> },
    { text: t('account_menu.order_history'), to: '/account/orders', icon: <ShoppingBagIcon /> },
    { text: t('account_menu.wishlist'), to: '/wishlist', icon: <FavoriteIcon /> },
    { text: t('account_menu.profile'), to: '/account/profile', icon: <AccountCircleIcon /> },
    { text: t('account_menu.recently_viewed'), to: '/account/recently-viewed', icon: <VisibilityIcon /> },
    { text: t('account_menu.payment_methods'), to: '/account/payment-methods', icon: <CreditCardIcon /> },
    { text: t('account_menu.settings'), to: '/account/settings', icon: <SettingsIcon /> },
  ];

  const navLinkStyle = ({ isActive }) => ({
    backgroundColor: isActive ? '#E3F2FD' : 'transparent',
    color: isActive ? '#0D47A1' : 'inherit',
    '&:hover': {
      backgroundColor: isActive ? '#BBDEFB' : 'rgba(0, 0, 0, 0.04)'
    },
    '& .MuiListItemIcon-root': {
        color: isActive ? '#0D47A1' : 'inherit',
    },
    borderRadius: '8px',
    marginBottom: '4px',
    transition: 'background-color 0.3s, color 0.3s',
  });

  return (
    <Container sx={{ my: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 'bold' }}>
              {t('account_menu.title')}
            </Typography>
            <List component="nav">
              {accountLinks.map((link) => (
                <ListItem key={link.to} disablePadding>
                  <ListItemButton component={NavLink} to={link.to} sx={navLinkStyle}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        {link.icon}
                    </ListItemIcon>
                    <ListItemText primary={link.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
           <Outlet />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccountLayout;
