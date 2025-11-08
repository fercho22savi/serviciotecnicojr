import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, 
    AppBar, Toolbar, IconButton, useTheme, useMediaQuery, CssBaseline, ListItemIcon
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    ShoppingBag as ShoppingBagIcon,
    Category as CategoryIcon,
    People as PeopleIcon,
    LocalOffer as CouponIcon,
    RateReview as RateReviewIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminLayout = () => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const adminLinks = [
    { text: t('admin_menu.dashboard'), to: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: t('admin_menu.products'), to: '/admin/products', icon: <ShoppingBagIcon /> },
    { text: t('admin_menu.categories'), to: '/admin/categories', icon: <CategoryIcon /> },
    { text: t('admin_menu.orders'), to: '/admin/orders', icon: <ShoppingBagIcon /> },
    { text: t('admin_menu.users'), to: '/admin/users', icon: <PeopleIcon /> },
    { text: t('admin_menu.coupons'), to: '/admin/coupons', icon: <CouponIcon /> },
    { text: t('admin_menu.reviews'), to: '/admin/reviews', icon: <RateReviewIcon /> },
  ];

  const navLinkStyle = ({ isActive }) => ({
    backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
    color: isActive ? theme.palette.primary.main : 'inherit',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
    '& .MuiListItemIcon-root': {
        color: isActive ? theme.palette.primary.main : 'inherit',
    },
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
  });

  const drawerContent = (
    <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 'bold' }}>
            {t('admin_menu.title')}
        </Typography>
        <List component="nav">
            {adminLinks.map((link) => (
                <ListItem key={link.to} disablePadding>
                    <ListItemButton component={NavLink} to={link.to} sx={navLinkStyle}>
                        <ListItemIcon>{link.icon}</ListItemIcon>
                        <ListItemText primary={link.text} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          display: { md: 'none' }, // Hide on desktop
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {t('admin_menu.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, top: 'auto' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', md: 0 } // Push content down on mobile
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
