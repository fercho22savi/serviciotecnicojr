
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';

const adminLinks = [
  { text: 'Dashboard', to: '/admin/dashboard' },
  { text: 'Productos', to: '/admin/products' },
  { text: 'Categorías', to: '/admin/categories' },
  { text: 'Pedidos', to: '/admin/orders' },
  { text: 'Usuarios', to: '/admin/users' },
  { text: 'Cupones', to: '/admin/coupons' },
  { text: 'Opiniones', to: '/admin/reviews' },
];

const AdminLayout = () => {
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
              Panel de Admin
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
