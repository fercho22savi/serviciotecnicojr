import React from 'react';
import { Link as RouterLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

function Account({ user, handleLogout }) {
  const location = useLocation();

  // If the user is not logged in, there is nothing to show here.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect base /account to /account/profile
  if (location.pathname === '/account' || location.pathname === '/account/') {
      return <Navigate to="/account/profile" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ my: 5 }}>
        <Grid container spacing={4}>
            {/* Sidebar */}
            <Grid item xs={12} md={3}>
                <Paper elevation={1}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center'}}>
                        <Avatar src={user.photoURL} alt={user.displayName} sx={{ width: 48, height: 48, mr: 2 }} />
                        <Box sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            <Typography variant="subtitle1" noWrap>{user.displayName}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
                        </Box>
                    </Box>
                    <Divider />
                    <List component="nav">
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/account/profile" selected={location.pathname.startsWith('/account/profile')}>
                                <ListItemIcon><PersonOutlineOutlinedIcon /></ListItemIcon>
                                <ListItemText primary="Mi Perfil" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                             <ListItemButton component={RouterLink} to="/account/orders" selected={location.pathname.startsWith('/account/orders')}>
                                <ListItemIcon><ShoppingBagOutlinedIcon /></ListItemIcon>
                                <ListItemText primary="Mis Pedidos" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider />
                     <Box sx={{ p: 1, mt: 1 }}>
                        <Button fullWidth variant="text" startIcon={<LogoutOutlinedIcon />} onClick={handleLogout} sx={{justifyContent: 'flex-start'}}>
                            Cerrar Sesión
                        </Button>
                    </Box>
                </Paper>
            </Grid>
            
            {/* Content */}
            <Grid item xs={12} md={9}>
                {/* The nested route content will be rendered here */}
                <Outlet />
            </Grid>
        </Grid>
    </Container>
  );
}

export default Account;
