import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { Box, Typography, TextField, Button, Grid, Alert } from '@mui/material';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Security() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwords.newPassword || !passwords.currentPassword) {
      setError(t('security.errors.fill_all_fields'));
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError(t('security.errors.passwords_do_not_match'));
      return;
    }
    if (passwords.newPassword.length < 6) {
        setError(t('security.errors.password_too_short'));
        return;
    }

    const toastId = toast.loading(t('security.toast.changing_password'));

    try {
      const credential = EmailAuthProvider.credential(user.email, passwords.currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, passwords.newPassword);

      toast.success(t('security.toast.success'), { id: toastId });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      console.error("Error changing password:", error);
      let errorMessage = t('security.errors.generic_error');
      if (error.code === 'auth/wrong-password') {
        errorMessage = t('security.errors.wrong_current_password');
      }
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        {t('security.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {t('security.subtitle')}
      </Typography>
      
      <Grid container spacing={3} maxWidth="sm">
        <Grid item xs={12}>
          <TextField
            name="currentPassword"
            label={t('security.form.current_password')}
            type="password"
            value={passwords.currentPassword}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="newPassword"
            label={t('security.form.new_password')}
            type="password"
            value={passwords.newPassword}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="confirmPassword"
            label={t('security.form.confirm_password')}
            type="password"
            value={passwords.confirmPassword}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        
        {error && (
            <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
            </Grid>
        )}

      </Grid>

      <Box sx={{ mt: 4, display: 'flex' }}>
        <Button type="submit" variant="contained" size="large">
          {t('security.button.change_password')}
        </Button>
      </Box>
    </Box>
  );
}

export default Security;
