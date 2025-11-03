import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Divider,
    Switch,
    Button,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Palette as PaletteIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Language as LanguageIcon,
    Email as EmailIcon,
    Download as DownloadIcon,
    DeleteForever as DeleteForeverIcon,
    VpnKey as VpnKeyIcon,
    ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import { useCustomTheme } from '../../context/ThemeContext'; // Corrected import

const SettingsPage = () => {
  const { mode, toggleTheme } = useCustomTheme(); // Corrected hook and function name

  // Placeholder handlers
  const handleAction = (action) => {
    alert(`La funcionalidad para "${action}" se implementará próximamente.`);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta de forma permanente? Esta acción no se puede deshacer.')) {
        handleAction('Eliminar Cuenta');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: '0 8px 16px 0 rgba(0,0,0,0.05)' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Configuración
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestiona la apariencia, notificaciones y seguridad de tu cuenta.
      </Typography>

      {/* --- Section: Appearance --- */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaletteIcon /> Apariencia
        </Typography>
        <List>
            <ListItem>
                <ListItemIcon><LanguageIcon /></ListItemIcon>
                <ListItemText primary="Idioma" secondary="Español (Latinoamérica)" />
                <Button variant="outlined" size="small" onClick={() => handleAction('Cambiar Idioma')}>Cambiar</Button>
            </ListItem>
            <ListItem>
                <ListItemIcon>🎨</ListItemIcon> {/* Using an emoji for Dark Mode for a friendly touch */}
                <ListItemText primary="Modo Oscuro" secondary="Ideal para navegar de noche" />
                <Switch edge="end" onChange={toggleTheme} checked={mode === 'dark'} />
            </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* --- Section: Notifications --- */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <NotificationsIcon /> Notificaciones
        </Typography>
         <List>
            <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText primary="Ofertas y Promociones" secondary="Recibir correos con nuestros mejores descuentos" />
                <Switch edge="end" defaultChecked />
            </ListItem>
             <ListItem>
                <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                <ListItemText primary="Actualizaciones de Pedidos" secondary="Recibir notificaciones sobre el estado de tus compras" />
                <Switch edge="end" defaultChecked />
            </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* --- Section: Security & Data --- */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SecurityIcon /> Seguridad y Datos
        </Typography>
         <List>
             <ListItem>
                <ListItemIcon><VpnKeyIcon /></ListItemIcon>
                <ListItemText primary="Contraseña" secondary="Se recomienda actualizarla periódicamente" />
                <Button variant="outlined" size="small" onClick={() => handleAction('Cambiar Contraseña')}>Cambiar</Button>
            </ListItem>
            <ListItem>
                <ListItemIcon><DownloadIcon /></ListItemIcon>
                <ListItemText primary="Exportar mis datos" secondary="Descarga un archivo con toda tu información" />
                <Button variant="outlined" size="small" onClick={() => handleAction('Exportar Datos')}>Exportar</Button>
            </ListItem>
        </List>
      </Box>
      
      <Divider sx={{ my: 3 }} />

       {/* --- Section: Danger Zone --- */}
      <Box sx={{ my: 3 }}>
         <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main' }}>
            <DeleteForeverIcon /> Zona de Peligro
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main', background: 'rgba(255, 231, 217, 0.3)' }}>
            <ListItem>
                    <ListItemText primary="Eliminar Cuenta" secondary="Esta acción es permanente y no se puede deshacer." />
                    <Button variant="contained" color="error" onClick={handleDeleteAccount}>
                        Eliminar mi cuenta
                    </Button>
            </ListItem>
        </Paper>
         <Alert severity="warning" sx={{ mt: 2 }}>
          Al eliminar tu cuenta, se borrará tu historial de pedidos, listas de deseos y toda la información asociada de forma irreversible.
        </Alert>
      </Box>
    </Paper>
  );
};

export default SettingsPage;
