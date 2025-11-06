import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AdminLayout = () => {
  const { t } = useTranslation();

  const adminLinks = [
    { text: t('admin_menu.dashboard'), to: '/admin/dashboard' },
    { text: t('admin_menu.products'), to: '/admin/products' },
    { text: t('admin_menu.categories'), to: '/admin/categories' },
    { text: t('admin_menu.orders'), to: '/admin/orders' },
    { text: t('admin_menu.users'), to: '/admin/users' },
    { text: t('admin_menu.coupons'), to: '/admin/coupons' },
    { text: t('admin_menu.reviews'), to: '/admin/reviews' },
  ];

  const navLinkStyle = ({ isActive }) => ({
    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    },
    borderRadius: '4px',
    marginBottom: '4px'
  });

  return (
    <Container sx={{ my: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ pl: 2 }}>
              {t('admin_menu.title')}
            </Typography>
            <List component="nav">
              {adminLinks.map((link) => (
                <ListItem key={link.to} disablePadding>
                  <ListItemButton component={NavLink} to={link.to} sx={navLinkStyle}>
                    <ListItemText primary={link.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminLayout;
