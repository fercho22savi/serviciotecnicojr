import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar, Toolbar, Typography, Badge, IconButton, Box, Button, Avatar, Menu, MenuItem, 
  ListItemIcon, Divider, TextField, InputAdornment, Tooltip, Container, Drawer, List, ListItem, ListItemText
} from '@mui/material';
import {
  ShoppingCart, FavoriteBorder, AccountCircle, Logout, Search, Store, Storefront, Dashboard, 
  LightMode, DarkMode, ReceiptLong as OrdersIcon, Menu as MenuIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Header = () => {
  const { t } = useTranslation();
  const { currentUser, isAdmin, logout } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const { cartItemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleAccountClick = () => {
    handleNavigate(isAdmin ? '/admin/dashboard' : '/account/profile');
  };

  const handleLogoutClick = async () => {
    await logout();
    handleClose();
    navigate('/');
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };
  
  const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileMenu = (
      <Drawer anchor="right" open={mobileMenuOpen} onClose={toggleMobileMenu}>
          <Box sx={{ width: 250 }} role="presentation" onClick={toggleMobileMenu} onKeyDown={toggleMobileMenu}>
              <List>
                <ListItem component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', justifyContent: 'center', py: 2}}>
                    <TextField fullWidth variant="outlined" size="small" placeholder={t('header.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
                </ListItem>
                <ListItem button component={Link} to="/products"><ListItemText primary={t('header.products')} /></ListItem>
                <ListItem button component={Link} to="/account/wishlist"><ListItemText primary={t('header.wishlist')} /></ListItem>
                <ListItem button component={Link} to="/cart"><ListItemText primary={t('header.cart')} /></ListItem>
                {!currentUser && <>
                    <Divider />
                    <ListItem button component={Link} to="/login"><ListItemText primary={t('header.login')} /></ListItem>
                    <ListItem button component={Link} to="/signup"><ListItemText primary={t('header.signup')} /></ListItem>
                </>}    
              </List>
          </Box>
      </Drawer>
  )

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', gap: 2 }}>
          
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', fontWeight: 'bold', color: 'text.primary', display: 'flex', alignItems: 'center' }}
          >
            <Store sx={{ mr: 1, color: 'primary.main' }} />
            {t('header.storeName')}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center'}}>
            <Box component="form" onSubmit={handleSearchSubmit} sx={{width: '100%', maxWidth: 500 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={t('header.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                }}
              />
            </Box>
          </Box>
          

          <Box sx={{ display: {xs: 'none', md: 'flex'}, alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? t('header.darkModeTooltip') : t('header.lightModeTooltip')}>
                <IconButton color="inherit" onClick={toggleTheme}>
                    {mode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
            </Tooltip>
            <Tooltip title={t('header.products')}><IconButton color="inherit" component={Link} to="/products"><Storefront /></IconButton></Tooltip>
            <Tooltip title={t('header.wishlist')}><IconButton color="inherit" component={Link} to="/account/wishlist"><Badge badgeContent={wishlistItemCount} color="error"><FavoriteBorder /></Badge></IconButton></Tooltip>
            <Tooltip title={t('header.cart')}><IconButton color="inherit" component={Link} to="/cart"><Badge badgeContent={cartItemCount} color="error"><ShoppingCart /></Badge></IconButton></Tooltip>

            {currentUser ? (
              <>
                <IconButton onClick={handleMenu} size="small" sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 34, height: 34 }} src={currentUser.photoURL}>{currentUser.displayName?.charAt(0).toUpperCase()}</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  PaperProps={{ sx: { mt: 1.5, minWidth: 180 } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleAccountClick}>
                    <ListItemIcon>{isAdmin ? <Dashboard fontSize="small" /> : <AccountCircle fontSize="small" />}</ListItemIcon>
                    {isAdmin ? 'Dashboard' : t('header.account')}
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/account/orders')}><ListItemIcon><OrdersIcon fontSize="small" /></ListItemIcon>{t('header.orders')}</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogoutClick}><ListItemIcon><Logout fontSize="small" /></ListItemIcon>{t('header.logout')}</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <Button variant="outlined" component={Link} to="/login">{t('header.login')}</Button>
                <Button variant="contained" disableElevation component={Link} to="/signup">{t('header.signup')}</Button>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton color="inherit" onClick={toggleTheme}><Tooltip title={mode === 'light' ? t('header.darkModeTooltip') : t('header.lightModeTooltip')}>{mode === 'light' ? <DarkMode /> : <LightMode />}</Tooltip></IconButton>
            <IconButton color="inherit" onClick={toggleMobileMenu}><MenuIcon /></IconButton>
          </Box>
        </Toolbar>
        {mobileMenu}
      </Container>
    </AppBar>
  );
}

export default Header;
