import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import RateReviewIcon from '@mui/icons-material/RateReview';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { text: 'Usuarios', path: '/admin/users', icon: <PeopleIcon /> },
  { text: 'Productos', path: '/admin/products', icon: <ShoppingBagIcon /> },
  { text: 'Pedidos', path: '/admin/orders', icon: <ReceiptLongIcon /> },
  { text: 'Cupones', path: '/admin/coupons', icon: <ConfirmationNumberIcon /> },
  { text: 'Reseñas', path: '/admin/reviews', icon: <RateReviewIcon /> },
];

const AdminSidebar = () => {
  const location = useLocation();

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
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              component={RouterLink}
              to={item.path}
              key={item.text}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
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
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
