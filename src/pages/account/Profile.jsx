import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    documento_identidad: '',
    fecha_nacimiento: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              nombre: data.personal_info?.nombre || user.displayName || '',
              apellido: data.personal_info?.apellido || '',
              telefono: data.contact_info?.telefono || '',
              documento_identidad: data.personal_info?.documento_identidad || '',
              fecha_nacimiento: data.personal_info?.fecha_nacimiento || '',
            });
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          toast.error(t('profile.errors.load_profile'));
          setLoading(false);
        });
    }
  }, [user, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const toastId = toast.loading(t('profile.toast.updating'));

    try {
      await updateDoc(userDocRef, {
        'personal_info.nombre': profile.nombre,
        'personal_info.apellido': profile.apellido,
        'personal_info.documento_identidad': profile.documento_identidad,
        'personal_info.fecha_nacimiento': profile.fecha_nacimiento,
        'contact_info.telefono': profile.telefono,
      }, { merge: true });

      toast.success(t('profile.toast.success'), { id: toastId });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t('profile.errors.update_profile'), { id: toastId });
    }
  };

  if (loading) {
    return <Typography>{t('profile.loading')}</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        {t('profile.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {t('profile.subtitle')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="nombre"
            label={t('profile.form.first_name')}
            value={profile.nombre}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="apellido"
            label={t('profile.form.last_name')}
            value={profile.apellido}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="email"
            label="Email"
            value={user?.email || ''}
            fullWidth
            disabled
            helperText={t('profile.form.email_helper')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="telefono"
            label={t('profile.form.phone')}
            value={profile.telefono}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
                name="documento_identidad"
                label={t('profile.form.id_document')}
                value={profile.documento_identidad}
                onChange={handleChange}
                fullWidth
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
                name="fecha_nacimiento"
                label={t('profile.form.birth_date')}
                type="date"
                value={profile.fecha_nacimiento}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" size="large">
          {t('profile.button.save')}
        </Button>
      </Box>
    </Box>
  );
}

export default Profile;
