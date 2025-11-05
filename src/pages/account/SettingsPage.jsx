import React from 'react';
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
    MenuItem
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
import { useCustomTheme } from '../../context/ThemeContext';

const SettingsPage = () => {
    const { mode, toggleTheme } = useCustomTheme();
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (event) => {
        const lang = event.target.value;
        i18n.changeLanguage(lang);
    };

    const handleAction = (action) => {
        alert(`${t('settings.action_alert_prefix')} "${action}" ${t('settings.action_alert_suffix')}`);
    };

    const handleDeleteAccount = () => {
        if (window.confirm(t('settings.delete_account_confirm'))) {
            handleAction(t('settings.delete_account_action'));
        }
    };

    const languageMap = {
        en: "English",
        es: "Español (Latinoamérica)"
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
                        <ListItemText primary={t('settings.appearance.language_label')} secondary={languageMap[i18n.language]} />
                        <Select
                            value={i18n.language}
                            onChange={handleLanguageChange}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="es">Español</MenuItem>
                            <MenuItem value="en">English</MenuItem>
                        </Select>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>🎨</ListItemIcon>
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
                        <Switch edge="end" defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                        <ListItemText primary={t('settings.notifications.orders_label')} secondary={t('settings.notifications.orders_secondary')} />
                        <Switch edge="end" defaultChecked />
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
                        <Button variant="outlined" size="small" onClick={() => handleAction(t('settings.security.change_password_action'))}>{t('settings.change_button')}</Button>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><DownloadIcon /></ListItemIcon>
                        <ListItemText primary={t('settings.security.export_data_label')} secondary={t('settings.security.export_data_secondary')} />
                        <Button variant="outlined" size="small" onClick={() => handleAction(t('settings.security.export_data_action'))}>{t('settings.export_button')}</Button>
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
        </Paper>
    );
};

export default SettingsPage;