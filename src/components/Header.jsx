import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar, Toolbar, Typography, Badge, IconButton, Box, Button, Avatar, Menu, MenuItem, 
  ListItemIcon, Divider, TextField, InputAdornment, Tooltip, Container
} from '@mui/material';
import {
  ShoppingCart, FavoriteBorder, AccountCircle, Logout, Search, Store, Storefront, Dashboard, 
  LightMode, DarkMode, ReceiptLong as OrdersIcon
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

          <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, maxWidth: 500 }}>
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? t('header.darkModeTooltip') : t('header.lightModeTooltip')}>
                <IconButton color="inherit" onClick={toggleTheme}>
                    {mode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
            </Tooltip>
            <Tooltip title={t('header.products')}><IconButton color="inherit" component={Link} to="/products"><Storefront /></IconButton></Tooltip>
            <Tooltip title={t('header.wishlist')}><IconButton color="inherit" component={Link} to="/wishlist"><Badge badgeContent={wishlistItemCount} color="error"><FavoriteBorder /></Badge></IconButton></Tooltip>
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
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 1 }}>
                <Button variant="outlined" component={Link} to="/login">{t('header.login')}</Button>
                <Button variant="contained" disableElevation component={Link} to="/signup">{t('header.signup')}</Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
