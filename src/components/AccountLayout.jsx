import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Typography, ListItemIcon } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    ShoppingBag as ShoppingBagIcon,
    Favorite as FavoriteIcon,
    AccountCircle as AccountCircleIcon,
    Visibility as VisibilityIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

const accountLinks = [
  { text: 'Dashboard', to: '/account/dashboard', icon: <DashboardIcon /> },
  { text: 'Historial de Pedidos', to: '/account/orders', icon: <ShoppingBagIcon /> },
  { text: 'Lista de Deseos', to: '/account/wishlist', icon: <FavoriteIcon /> },
  { text: 'Mi Perfil', to: '/account/profile', icon: <AccountCircleIcon /> },
  { text: 'Vistos Recientemente', to: '/account/recently-viewed', icon: <VisibilityIcon /> },
  { text: 'Configuración', to: '/account/settings', icon: <SettingsIcon /> },
];

const AccountLayout = () => {
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
              Mi Cuenta
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
           {/* The Paper component is removed from here to prevent nesting, as pages have their own Paper wrapper */}
           <Outlet />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccountLayout;
