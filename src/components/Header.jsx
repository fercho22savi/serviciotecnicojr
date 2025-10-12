import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar, Toolbar, Typography, Badge, IconButton, Box, Button, Avatar, Menu, MenuItem, 
  ListItemIcon, Divider, TextField, InputAdornment, Tooltip, Select, FormControl, Container
} from '@mui/material';
import {
  ShoppingCart, FavoriteBorder, AccountCircle, Logout, Search, Store, Storefront, Dashboard, 
  LightMode, DarkMode, ReceiptLong as OrdersIcon 
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; 
import { auth } from '../firebase/config';

function Header({ cartItemCount, searchTerm, handleSearchChange, wishlistCount, categories = [], selectedCategory, handleCategoryChange }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { mode, toggleColorMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogoutClick = async () => {
    try {
      await auth.signOut();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error(t('header.logout_error'), error);
    }
  };

  const isAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'admin');

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', gap: 2 }}>
          
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              fontWeight: 'bold',
              color: 'text.primary',
            }}
          >
            <Store sx={{ mr: 1, color: 'primary.main' }} />
            MiTienda
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedCategory || ''}
                onChange={handleCategoryChange}
                displayEmpty
                variant="outlined"
                sx={{ borderRadius: '25px' }}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category === 'Todas' ? '' : category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={t('header.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? t('header.darkModeTooltip') : t('header.lightModeTooltip')}>
                <IconButton color="inherit" onClick={toggleColorMode}>
                    {mode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
            </Tooltip>
            <Tooltip title={t('header.products')}>
              <IconButton color="inherit" component={Link} to="/products">
                <Storefront />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('header.wishlist')}>
              <IconButton color="inherit" component={Link} to="/wishlist">
                <Badge badgeContent={wishlistCount} color="error">
                  <FavoriteBorder />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('header.cart')}>
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Tooltip>

            {currentUser ? (
              <>
                <IconButton onClick={handleMenu} size="small" sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }} src={currentUser.photoURL}>
                    {currentUser.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  PaperProps={{ sx: { mt: 1.5 } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => handleNavigate('/account/profile')}>
                    <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                    {t('header.account')}
                  </MenuItem>
                   <MenuItem onClick={() => handleNavigate('/my-orders')}>
                    <ListItemIcon><OrdersIcon fontSize="small" /></ListItemIcon>
                    {t('header.my_orders')}
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem onClick={() => handleNavigate('/admin')}>
                      <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                      {t('header.dashboard')}
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogoutClick}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    {t('header.logout')}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 1 }}>
                <Button variant="outlined" component={Link} to="/login">
                  {t('header.login')}
                </Button>
                <Button variant="contained" disableElevation component={Link} to="/signup">
                  {t('header.signup')}
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;