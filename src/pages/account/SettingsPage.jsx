import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    ListItemIcon,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
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
    ShoppingBag as ShoppingBagIcon,
    Brightness4 as Brightness4Icon
} from '@mui/icons-material';
import { useCustomTheme } from '../../context/ThemeContext'; // Corrected Path

const SettingsPage = () => {
    const { mode, toggleTheme } = useCustomTheme();
    const { t, i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(i18n.language.split('-')[0]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '' });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [notificationPrefs, setNotificationPrefs] = useState({
        offers: true,
        orders: true,
    });

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            setSelectedLang(lng.split('-')[0]);
        };
        i18n.on('languageChanged', handleLanguageChanged);
        // You would typically fetch user notification preferences here
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    const handleLanguageChange = (event) => {
        const lang = event.target.value;
        i18n.changeLanguage(lang);
    };

    const handleAction = (title, message) => {
        setDialogContent({ title, message });
        setDialogOpen(true);
    };
    
    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDeleteAccount = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirmClose = (confirmed) => {
        setDeleteConfirmOpen(false);
        if (confirmed) {
            // --- TODO: Implement actual account deletion logic here ---
            // 1. Re-authenticate the user for security.
            // 2. Delete user data from Firestore/Storage.
            // 3. Delete the user from Firebase Auth.
            console.log("Account deletion initiated.");
            handleAction(t('settings.danger_zone.delete_account_action'), t('settings.danger_zone.deletion_initiated'));
        }
    };

    const handleNotificationChange = (event) => {
        const { name, checked } = event.target;
        setNotificationPrefs(prev => ({
            ...prev,
            [name]: checked
        }));
        // --- TODO: Save notification preferences to the backend here ---
        console.log(`Notification preference '${name}' set to '${checked}'`);
    };

    const languageMap = {
        en: "English",
        es: "Español"
    };

    return (
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: '0 8px 16px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('settings.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t('settings.subtitle')}
            </Typography>

            {/* --- Section: Appearance --- */}
            <Box sx={{ my: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PaletteIcon /> {t('settings.appearance.title')}
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><LanguageIcon /></ListItemIcon>
                        <ListItemText primary={t('settings.appearance.language_label')} secondary={languageMap[selectedLang]} />
                        <Select
                            value={selectedLang}
                            onChange={handleLanguageChange}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="es">Español</MenuItem>
                            <MenuItem value="en">English</MenuItem>
                        </Select>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Brightness4Icon /></ListItemIcon>
                        <ListItemText primary={t('settings.appearance.dark_mode_label')} secondary={t('settings.appearance.dark_mode_secondary')} />
                        <Switch edge="end" onChange={toggleTheme} checked={mode === 'dark'} />
                    </ListItem>
                </List>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* --- Section: Notifications --- */}
            <Box sx={{ my: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <NotificationsIcon /> {t('settings.notifications.title')}
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><EmailIcon /></ListItemIcon>
                        <ListItemText primary={t('settings.notifications.offers_label')} secondary={t('settings.notifications.offers_secondary')} />
                        <Switch edge="end" name="offers" checked={notificationPrefs.offers} onChange={handleNotificationChange} />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                        <ListItemText primary={t('settings.notifications.orders_label')} secondary={t('settings.notifications.orders_secondary')} />
                        <Switch edge="end" name="orders" checked={notificationPrefs.orders} onChange={handleNotificationChange} />
                    </ListItem>
                </List>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* --- Section: Security & Data --- */}
            <Box sx={{ my: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SecurityIcon /> {t('settings.security.title')}
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><VpnKeyIcon /></ListItemIcon>
                        <ListItemText primary={t('settings.security.password_label')} secondary={t('settings.security.password_secondary')} />
                        <Button variant="outlined" size="small" onClick={() => handleAction(t('settings.security.change_password_action'), t('settings.security.password_action_message'))}>{t('settings.change_button')}</Button>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><DownloadIcon /></ListItemIcon>
                        <ListItemText primary={t('settings.security.export_data_label')} secondary={t('settings.security.export_data_secondary')} />
                        <Button variant="outlined" size="small" onClick={() => handleAction(t('settings.security.export_data_action'), t('settings.security.export_data_action_message'))}>{t('settings.export_button')}</Button>
                    </ListItem>
                </List>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* --- Section: Danger Zone --- */}
            <Box sx={{ my: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main' }}>
                    <DeleteForeverIcon /> {t('settings.danger_zone.title')}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main', background: 'rgba(255, 231, 217, 0.3)' }}>
                    <ListItem>
                        <ListItemText primary={t('settings.danger_zone.delete_account_label')} secondary={t('settings.danger_zone.delete_account_secondary')} />
                        <Button variant="contained" color="error" onClick={handleDeleteAccount}>
                            {t('settings.danger_zone.delete_account_button')}
                        </Button>
                    </ListItem>
                </Paper>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    {t('settings.danger_zone.delete_warning')}
                </Alert>
            </Box>

            {/* --- Dialog for placeholder actions --- */}
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>{dialogContent.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogContent.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>

            {/* --- Dialog for account deletion confirmation --- */}
            <Dialog open={deleteConfirmOpen} onClose={() => handleDeleteConfirmClose(false)}>
                <DialogTitle>{t('settings.danger_zone.delete_confirm_title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('settings.danger_zone.delete_confirm_text')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDeleteConfirmClose(false)}>{t('cancel')}</Button>
                    <Button onClick={() => handleDeleteConfirmClose(true)} color="error">{t('delete')}</Button>
                </DialogActions>
            </Dialog>

        </Paper>
    );
};

export default SettingsPage;
