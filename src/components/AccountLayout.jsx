import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, 
    AppBar, Toolbar, IconButton, useTheme, useMediaQuery, CssBaseline, ListItemIcon, Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    ShoppingBag as ShoppingBagIcon,
    Favorite as FavoriteIcon,
    AccountCircle as AccountCircleIcon,
    Visibility as VisibilityIcon,
    Settings as SettingsIcon,
    CreditCard as CreditCardIcon,
    Storefront as StorefrontIcon,
    AdminPanelSettings as AdminPanelSettingsIcon // <-- Import new icon
} from '@mui/icons-material';

const drawerWidth = 250;

const AccountLayout = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth(); // <-- Get admin status
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Build the links array dynamically
  const accountLinks = [
    { text: t('account_menu.go_to_store'), to: '/', icon: <StorefrontIcon /> },
    // Divider is handled separately
    { text: t('account_menu.dashboard'), to: '/account/dashboard', icon: <DashboardIcon /> },
    { text: t('account_menu.order_history'), to: '/account/orders', icon: <ShoppingBagIcon /> },
    { text: t('account_menu.wishlist'), to: '/account/wishlist', icon: <FavoriteIcon /> },
    { text: t('account_menu.profile'), to: '/account/profile', icon: <AccountCircleIcon /> },
    { text: t('account_menu.recently_viewed'), to: '/account/recently-viewed', icon: <VisibilityIcon /> },
    { text: t('account_menu.payment_methods'), to: '/account/payment-methods', icon: <CreditCardIcon /> },
  ];

  if (isAdmin) {
    accountLinks.push({ 
      text: t('account_menu.manage_products'), 
      to: '/admin/products', 
      icon: <AdminPanelSettingsIcon /> 
    });
  }

  accountLinks.push({ text: t('account_menu.settings'), to: '/account/settings', icon: <SettingsIcon /> });

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
    marginBottom: theme.spacing(0.5),
    transition: 'background-color 0.3s, color 0.3s',
  });

  const drawerContent = (
    <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('account_menu.title')}
        </Typography>
        <List component="nav">
            {accountLinks.map((link, index) => (
            <React.Fragment key={link.to}>
                <ListItem disablePadding>
                    <ListItemButton 
                        component={NavLink} 
                        to={link.to} 
                        sx={navLinkStyle}
                        onClick={!isDesktop ? handleDrawerToggle : undefined}
                        end={link.to === '/'}
                    >
                    <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.text} />
                    </ListItemButton>
                </ListItem>
                {/* Add a divider after the first item */}
                {index === 0 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
            ))}
        </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          display: { md: 'none' },
          bgcolor: 'background.paper'
        }}
        elevation={1}
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
          <Typography variant="h6" noWrap component="div" color="text.primary">
            {t('account_menu.title')}
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
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper', borderRight: 'none', top: 'auto' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', md: 0 }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AccountLayout;
