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

// Categories are passed as a prop from App.jsx now
const Header = ({ setSearchTerm, setSelectedCategory, cartItemCount, wishlistItemCount }) => {
  const { t } = useTranslation();
  const { currentUser, isAdmin, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('Todas');

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
  
  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setLocalSearch(newSearchTerm);
    setSearchTerm(newSearchTerm); // Update parent state on every keystroke
  };
  
  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setLocalCategory(newCategory);
    setSelectedCategory(newCategory); // Update parent state
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
            MiTienda
          </Typography>

          {/* Search and category filters */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, maxWidth: 600 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select value={localCategory} onChange={handleCategoryChange} displayEmpty variant="outlined" sx={{ borderRadius: '25px' }}>
                <MenuItem value="Todas"><em>Todas las categorías</em></MenuItem>
                <MenuItem value="Portátiles">Portátiles</MenuItem>
                <MenuItem value="Smartphones">Smartphones</MenuItem>
                <MenuItem value="Accesorios">Accesorios</MenuItem>
                <MenuItem value="Gaming">Gaming</MenuItem>
                <MenuItem value="Oficina">Oficina</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={t('header.searchPlaceholder')}
              value={localSearch}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && navigate(`/products`)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
              }}
            />
          </Box>

          {/* Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? t('header.darkModeTooltip') : t('header.lightModeTooltip')}>
                <IconButton color="inherit" onClick={toggleTheme}>
                    {mode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
            </Tooltip>
            <Tooltip title={t('header.products')}><IconButton color="inherit" component={Link} to="/products"><Storefront /></IconButton></Tooltip>
            <Tooltip title={t('header.wishlist')}><IconButton color="inherit" component={Link} to="/wishlist"><Badge badgeContent={wishlistItemCount} color="error"><FavoriteBorder /></Badge></IconButton></Tooltip>
            <Tooltip title={t('header.cart')}><IconButton color="inherit" component={Link} to="/cart"><Badge badgeContent={cartItemCount} color="error"><ShoppingCart /></Badge></IconButton></Tooltip>

            {/* User Profile / Login Buttons */}
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
