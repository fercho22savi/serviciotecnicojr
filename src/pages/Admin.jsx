import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, 
    AppBar, Toolbar, IconButton, useTheme, useMediaQuery, CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RateReviewIcon from '@mui/icons-material/RateReview';

const drawerWidth = 240;

const Admin = () => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const adminLinks = [
    { text: t('admin_menu.dashboard'), to: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: t('admin_menu.products'), to: '/admin/products', icon: <ShoppingCartIcon /> },
    { text: t('admin_menu.categories'), to: '/admin/categories', icon: <CategoryIcon /> },
    { text: t('admin_menu.orders'), to: '/admin/orders', icon: <ShoppingCartIcon /> },
    { text: t('admin_menu.users'), to: '/admin/users', icon: <PeopleIcon /> },
    { text: t('admin_menu.coupons'), to: '/admin/coupons', icon: <LocalOfferIcon /> },
    { text: t('admin_menu.reviews'), to: '/admin/reviews', icon: <RateReviewIcon /> },
  ];

  const drawer = (
    <div>
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1 }}>
            <List>
                {adminLinks.map((link) => (
                    <ListItem key={link.to} disablePadding>
                        <ListItemButton component={NavLink} to={link.to} sx={{ 
                            '&.active': {
                                backgroundColor: theme.palette.action.selected,
                                color: theme.palette.primary.main
                            },
                            borderRadius: 1,
                            mb: 0.5
                        }}>
                            <Box sx={{ mr: 2 }}>{link.icon}</Box>
                            <ListItemText primary={link.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
            position="fixed"
            sx={{ 
                width: { sm: `calc(100% - ${drawerWidth}px)` }, 
                ml: { sm: `${drawerWidth}px` },
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                    {t('admin_panel.title')}
                </Typography>
            </Toolbar>
        </AppBar>
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ 
                    display: { xs: 'block', sm: 'none' }, 
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                }}
            >
                {drawer}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{ 
                    display: { xs: 'none', sm: 'block' }, 
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' }
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
        <Box
            component="main"
            sx={{ 
                flexGrow: 1, 
                p: 3, 
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                bgcolor: '#f5f5f5',
                minHeight: '100vh'
            }}
        >
            <Toolbar />
            <Outlet />
        </Box>
    </Box>
  );
};

export default Admin;
