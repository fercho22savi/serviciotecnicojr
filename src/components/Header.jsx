import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Badge, IconButton, Box, Button, Avatar, Menu, MenuItem, 
    ListItemIcon, Divider, TextField, InputAdornment, Tooltip, Select, FormControl
} from '@mui/material';
import {
    ShoppingCart, FavoriteBorder, AccountCircle, Logout, AdminPanelSettings, Search, Store, Storefront
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header({ cartItemCount, searchTerm, handleSearchChange, wishlistCount, categories, selectedCategory, handleCategoryChange }) {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogoutClick = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', color: '#000' }}>
      <Toolbar sx={{ justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', py: 1 }}>
        {/* Logo */}
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}
        >
          <Store sx={{ mr: 1, color: '#1A2980' }} />
          MiTienda
        </Typography>

        {/* Search Bar & Category Filter */}
        <Box sx={{ flexGrow: 1, mx: { xs: 1, md: 4 }, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150, 
                '& .MuiOutlinedInput-root': {
                    borderRadius: '25px',
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                },
            }}>
                <Select
                    value={selectedCategory || ''}
                    onChange={handleCategoryChange}
                    displayEmpty
                    variant="outlined"
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
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '25px',
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                },
                input: { color: '#333' },
                }}
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <Search sx={{ color: 'grey' }} />
                    </InputAdornment>
                ),
                }}
            />
        </Box>

        {/* Icons and Auth */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Catálogo">
                <IconButton color="inherit" component={Link} to="/products" sx={{ mr: 0.5 }}>
                    <Storefront />
                </IconButton>
            </Tooltip>
            <Tooltip title="Lista de Deseos">
                <IconButton color="inherit" component={Link} to="/wishlist" sx={{ mr: 0.5 }}>
                    <Badge badgeContent={wishlistCount} color="error">
                        <FavoriteBorder />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Tooltip title="Carrito">
                <IconButton color="inherit" component={Link} to="/cart" sx={{ mr: 1.5 }}>
                    <Badge badgeContent={cartItemCount} color="error">
                        <ShoppingCart />
                    </Badge>
                </IconButton>
            </Tooltip>

          {currentUser ? (
            <>
              <IconButton onClick={handleMenu} size="small">
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#1A2980' }} src={currentUser.photoURL} >
                  {currentUser.displayName?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => handleNavigate('/account')}>
                  <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                  Mi Cuenta
                </MenuItem>
                {currentUser.role === 'admin' && (
                  <MenuItem onClick={() => handleNavigate('/admin')}>
                    <ListItemIcon><AdminPanelSettings fontSize="small" /></ListItemIcon>
                    Panel de Admin
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{display: {xs: 'none', md: 'flex'}, alignItems: 'center'}}>
              <Button variant="text" color="inherit" component={Link} to="/login" sx={{ mr: 1, fontWeight: 'bold' }}>
                INICIAR SESIÓN
              </Button>
              <Button variant="contained" disableElevation component={Link} to="/signup" sx={{ fontWeight: 'bold', bgcolor: '#1A2980', color: 'white', '&:hover': { bgcolor: '#152269'} }}>
                REGISTRARSE
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
