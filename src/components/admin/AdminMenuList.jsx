import React from 'react';
import { ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import CategoryIcon from '@mui/icons-material/Category';
import DiscountIcon from '@mui/icons-material/Discount';
import RateReviewIcon from '@mui/icons-material/RateReview'; // Import the new icon

export const mainListItems = (
  <div>
    <ListItem button component={RouterLink} to="/admin/dashboard">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button component={RouterLink} to="/admin/products">
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Productos" />
    </ListItem>
    <ListItem button component={RouterLink} to="/admin/categories">
      <ListItemIcon>
        <CategoryIcon />
      </ListItemIcon>
      <ListItemText primary="Categorías" />
    </ListItem>
    <ListItem button component={RouterLink} to="/admin/orders">
      <ListItemIcon>
        <ShoppingCartIcon />
      </ListItemIcon>
      <ListItemText primary="Pedidos" />
    </ListItem>
    <ListItem button component={RouterLink} to="/admin/coupons">
        <ListItemIcon>
            <DiscountIcon />
        </ListItemIcon>
        <ListItemText primary="Cupones" />
    </ListItem>
     <ListItem button component={RouterLink} to="/admin/reviews">
      <ListItemIcon>
        <RateReviewIcon />
      </ListItemIcon>
      <ListItemText primary="Gestión de Reseñas" />
    </ListItem>
    <ListItem button component={RouterLink} to="/admin/users">
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Usuarios" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Reportes</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Ventas del Mes" />
    </ListItem>
  </div>
);
