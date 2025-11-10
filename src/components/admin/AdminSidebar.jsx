import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Box, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StoreIcon from '@mui/icons-material/Store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

const mainMenuItems = [
  { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { text: 'Usuarios', path: '/admin/users', icon: <PeopleIcon /> },
  { text: 'Productos', path: '/admin/products', icon: <ShoppingBagIcon /> },
  { text: 'Pedidos', path: '/admin/orders', icon: <ReceiptLongIcon /> },
  { text: 'Cupones', path: '/admin/coupons', icon: <ConfirmationNumberIcon /> },
  { text: 'Reseñas', path: '/admin/reviews', icon: <RateReviewIcon /> },
  { text: 'Configuración', path: '/admin/settings', icon: <SettingsIcon /> },
];

const secondaryMenuItems = [
    { text: 'Volver a la Tienda', path: '/', icon: <StoreIcon /> },
    { text: 'Perfil', path: '/profile', icon: <AccountCircleIcon /> }
];

const AdminSidebar = () => {
  const location = useLocation();

  const renderList = (items) => items.map((item) => (
    <ListItem
      button
      component={RouterLink}
      to={item.path}
      key={item.text}
      sx={{
        backgroundColor: location.pathname.startsWith(item.path) && item.path !== '/' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <ListItemIcon sx={{ color: '#FFFFFF' }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText primary={item.text} />
    </ListItem>
  ));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1E1E1E', color: '#FFFFFF' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div">
          Panel de administración
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>{renderList(mainMenuItems)}</List>
        <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
        <List>{renderList(secondaryMenuItems)}</List>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
