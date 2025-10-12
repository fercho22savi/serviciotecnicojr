import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel, Select, MenuItem, Button, Paper } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

function Preferences() {
  const { mode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [prefs, setPrefs] = useState({
    email_offers: false,
    sms_updates: false,
    push_notifications: false,
  });

  // This state now correctly reflects the active language and updates automatically
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language.split('-')[0]);
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().preferences) {
          setPrefs(docSnap.data().preferences);
        }
      });
    }
  }, [user]);

  // Listen for language changes from i18next and update the local state
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng.split('-')[0]);
    };
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handlePrefChange = (event) => {
    const { name, checked } = event.target;
    setPrefs(prev => ({ ...prev, [name]: checked }));
  };

  // --- THE FINAL, SIMPLIFIED SOLUTION ---
  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    // Simply call i18n.changeLanguage. The new architecture handles the rest:
    // - React re-renders components with the new language.
    // - The language detector saves the new setting to localStorage.
    // No more page reloads or manual localStorage interaction is needed.
    i18n.changeLanguage(newLang);
  };

  const handleThemeChange = (event) => {
    const newMode = event.target.value;
    toggleTheme(newMode);
  };

  const handleSave = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const toastId = toast.loading(t('preferences.saving_toast'));

    try {
      await updateDoc(userDocRef, { preferences: prefs }, { merge: true });
      toast.success(t('preferences.save_success'), { id: toastId });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error(t('preferences.save_error'), { id: toastId });
    }
  };

  const languageOptions = [
    { value: 'es', label: t('preferences.spanish') },
    { value: 'en', label: t('preferences.english') }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        {t('preferences.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {t('preferences.subtitle')}
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>{t('preferences.notifications')}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <FormControlLabel
            control={<Switch checked={prefs.email_offers} onChange={handlePrefChange} name="email_offers" />}
            label={t('preferences.email_offers')}
          />
          <FormControlLabel
            control={<Switch checked={prefs.sms_updates} onChange={handlePrefChange} name="sms_updates" />}
            label={t('preferences.sms_updates')}
          />
          <FormControlLabel
            control={<Switch checked={prefs.push_notifications} onChange={handlePrefChange} name="push_notifications" />}
            label={t('preferences.push_notifications')}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>{t('preferences.appearance_language')}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Select value={currentMode} onChange={handleThemeChange} fullWidth>
            <MenuItem value="light">{t('preferences.light_theme')}</MenuItem>
            <MenuItem value="dark">{t('preferences.dark_theme')}</MenuItem>
          </Select>
          <Select value={currentLanguage} onChange={handleLanguageChange} fullWidth>
            {languageOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" onClick={handleSave}>
          {t('preferences.save_button')}
        </Button>
      </Box>
    </Box>
  );
}

export default Preferences;
