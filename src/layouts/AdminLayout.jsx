import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Dashboard, People, VpnKey, BarChart, Report, Support } from '@mui/icons-material';
import { NavLink, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const AdminLayout = () => {
  const navItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Gestión de Usuarios', icon: <People />, path: '/admin/users' },
    { text: 'Roles y Permisos', icon: <VpnKey />, path: '/admin/roles' },
    { text: 'Actividad del Sistema', icon: <BarChart />, path: '/admin/activity' },
    { text: 'Reportes', icon: <Report />, path: '/admin/reports' },
    { text: 'Soporte', icon: <Support />, path: '/admin/support' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#343a40', color: 'white' },
        }}
      >
        <Toolbar>
            <Typography variant="h6" noWrap component="div">
                ADMIN
            </Typography>
        </Toolbar>
        <List>
          {navItems.map((item, index) => (
            <ListItem button component={NavLink} to={item.path} key={item.text} sx={{ 
                '&.active': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                },
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
            }}>
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default AdminLayout;
