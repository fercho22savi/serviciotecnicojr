import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Tooltip, Badge, InputBase, alpha, styled
} from '@mui/material';
// Icons
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import InventoryIcon from '@mui/icons-material/Inventory'; // <-- Icono añadido

// --- Styled Components ---
const Search = styled('div')(({ theme }) => ({ position: 'relative', borderRadius: theme.shape.borderRadius, backgroundColor: alpha(theme.palette.text.primary, 0.05), '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.1) }, marginRight: theme.spacing(2), marginLeft: theme.spacing(3), width: 'auto' }));
const SearchIconWrapper = styled('div')(({ theme }) => ({ padding: theme.spacing(0, 2), height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }));
const StyledInputBase = styled(InputBase)(({ theme }) => ({ color: 'inherit', '& .MuiInputBase-input': { padding: theme.spacing(1, 1, 1, 0), paddingLeft: `calc(1em + ${theme.spacing(4)})`, transition: theme.transitions.create('width'), width: '100%', [theme.breakpoints.up('md')]: { width: '20ch' } } }));

const categories = ['Todas las categorías', 'Portátiles', 'Smartphones', 'Accesorios', 'Gaming', 'Oficina'];

function Navbar({ setSearchTerm }) {
  const { currentUser, logout } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const { cartItemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCategoryMenuOpen = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleCategoryMenuClose();
    if (category && category !== 'Todas las categorías') {
      navigate(`/products?category=${category}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = async () => {
    handleClose();
    try { await logout(); navigate('/login'); } catch (error) { console.error('Error al cerrar sesión', error); }
  };
  
  const handleProfileNavigation = () => {
      navigate('/account/profile');
      handleClose();
  }

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <StorefrontIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component={NavLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          MiTienda
        </Typography>
        
        <Box sx={{ ml: 2 }}>
            <Button
                id="category-button"
                onClick={handleCategoryMenuOpen}
                variant="outlined"
                sx={{ minWidth: 150 }}
            >
                {selectedCategory}
            </Button>
            <Menu
                id="category-menu"
                anchorEl={categoryAnchorEl}
                open={Boolean(categoryAnchorEl)}
                onClose={handleCategoryMenuClose}
            >
                {categories.map((category) => (
                <MenuItem key={category} onClick={() => handleCategorySelect(category)}>
                    {category}
                </MenuItem>
                ))}
            </Menu>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Search>
            <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
            <StyledInputBase placeholder="Buscar productos…" onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)} />
        </Search>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* --- Icono de Productos Añadido --- */}
            <Tooltip title="Productos">
                <IconButton component={NavLink} to="/products" color="inherit">
                    <InventoryIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Mi Lista de Deseos">
                <IconButton component={NavLink} to="/account/wishlist" color="inherit">
                    <Badge badgeContent={wishlistItemCount} color="error"><FavoriteBorderIcon /></Badge>
                </IconButton>
            </Tooltip>

            <Tooltip title="Ver Carrito">
                <IconButton component={NavLink} to="/cart" color="inherit">
                    <Badge badgeContent={cartItemCount} color="error"><ShoppingCartIcon /></Badge>
                </IconButton>
            </Tooltip>

          {currentUser ? (
            <>
                <Tooltip title="Mi Cuenta">
                    <IconButton onClick={handleMenu} sx={{ p: 0, ml: 2 }}>
                        <Avatar 
                            alt={currentUser.displayName || 'Usuario'} 
                            src={currentUser.photoURL}
                        />
                    </IconButton>
                </Tooltip>
                <Menu 
                    id="menu-appbar" 
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)} 
                    onClose={handleClose} 
                    sx={{ mt: '45px' }} 
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={handleProfileNavigation}>Mi Perfil</MenuItem>
                    <MenuItem onClick={() => {navigate('/account/orders'); handleClose();}}>Mis Pedidos</MenuItem>
                    <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={NavLink} to="/login" sx={{mr: 1}}>Iniciar Sesión</Button>
              <Button color="primary" variant="contained" component={NavLink} to="/register">Registrarse</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
