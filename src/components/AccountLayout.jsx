import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography,
    AppBar, Toolbar, IconButton, useTheme, useMediaQuery, CssBaseline, ListItemIcon, Divider, ListSubheader
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
    PeopleAlt as PeopleAltIcon,
    Build as BuildIcon,
} from '@mui/icons-material';

const drawerWidth = 250;

const AccountLayout = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  // Link Groups
  const mainLink = { text: t('account_menu.go_to_store'), to: '/', icon: <StorefrontIcon /> };
  
  const userLinks = [
    { text: t('account_menu.dashboard'), to: '/account/dashboard', icon: <DashboardIcon /> },
    { text: t('account_menu.order_history'), to: '/account/orders', icon: <ShoppingBagIcon /> },
    { text: t('account_menu.wishlist'), to: '/account/wishlist', icon: <FavoriteIcon /> },
    { text: t('account_menu.profile'), to: '/account/profile', icon: <AccountCircleIcon /> },
    { text: t('account_menu.recently_viewed'), to: '/account/recently-viewed', icon: <VisibilityIcon /> },
    { text: t('account_menu.payment_methods'), to: '/account/payment-methods', icon: <CreditCardIcon /> },
    { text: t('account_menu.settings'), to: '/account/settings', icon: <SettingsIcon /> },
  ];

  const adminLinks = [
    { text: t('admin_menu.user_management'), to: '/admin/users', icon: <PeopleAltIcon /> },
    { text: t('admin_menu.manage_products'), to: '/admin/products', icon: <BuildIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', px: 2, pt: 1, pb: 2 }}>
            {t('header.storeName')}
        </Typography>
        <List component="nav">
            {/* Main Link */}
            <ListItem disablePadding>
                <ListItemButton component={NavLink} to={mainLink.to} sx={navLinkStyle} onClick={!isDesktop ? handleDrawerToggle : undefined} end>
                    <ListItemIcon sx={{ minWidth: 40 }}>{mainLink.icon}</ListItemIcon>
                    <ListItemText primary={mainLink.text} />
                </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* User Links */}
            <ListSubheader sx={{ bgcolor: 'transparent', ...theme.typography.h6, fontWeight: 'bold' }}>{t('account_menu.title')}</ListSubheader>
            {userLinks.map(link => (
                <ListItem key={link.to} disablePadding>
                    <ListItemButton component={NavLink} to={link.to} sx={navLinkStyle} onClick={!isDesktop ? handleDrawerToggle : undefined}>
                        <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
                        <ListItemText primary={link.text} />
                    </ListItemButton>
                </ListItem>
            ))}

            {/* Admin Links */}
            {isAdmin && (
                <>
                    <Divider sx={{ my: 1 }} />
                    <ListSubheader sx={{ bgcolor: 'transparent', ...theme.typography.h6, fontWeight: 'bold' }}>{t('admin_menu.title')}</ListSubheader>
                    {adminLinks.map(link => (
                        <ListItem key={link.to} disablePadding>
                            <ListItemButton component={NavLink} to={link.to} sx={navLinkStyle} onClick={!isDesktop ? handleDrawerToggle : undefined}>
                                <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
                                <ListItemText primary={link.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </>
            )}
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
