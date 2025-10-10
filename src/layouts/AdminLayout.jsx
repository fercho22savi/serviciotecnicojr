import React from 'react';
import { Navigate, Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LoyaltyIcon from '@mui/icons-material/Loyalty';

const drawerWidth = 240;

const adminNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Productos', icon: <InventoryIcon />, path: '/admin/products' },
  { text: 'Pedidos', icon: <ShoppingCartIcon />, path: '/admin/orders' },
  { text: 'Reseñas', icon: <RateReviewIcon />, path: '/admin/reviews' },
  { text: 'Cupones', icon: <LoyaltyIcon />, path: '/admin/coupons' },
];

function AdminLayout({ userProfile }) {

  // Security Gate: Check for admin role
  if (!userProfile || !userProfile.isAdmin) {
    // Redirect non-admins to the home page
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
            <Typography variant='h6' noWrap>Admin Panel</Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {adminNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={RouterLink} to={item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Toolbar /> {/* This is a spacer to push content below the app bar if one existed */}
        <Outlet /> {/* Renders the nested admin route component */}
      </Box>
    </Box>
  );
}

export default AdminLayout;
