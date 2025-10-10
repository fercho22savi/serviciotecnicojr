import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const UserFormModal = ({ open, handleClose, user, handleSubmit }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'Usuario Básico',
    status: 'Activo',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        password: '', // La contraseña no se precarga por seguridad
        role: user.role || 'Usuario Básico',
        status: user.status || 'Activo',
      });
    } else {
      // Reset form for new user
      setFormData({
        displayName: '',
        email: '',
        password: '',
        role: 'Usuario Básico',
        status: 'Activo',
      });
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData, user ? user.id : null);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <Box sx={style} component="form" onSubmit={onFormSubmit}>
        <Typography variant="h6" component="h2">
          {user ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="displayName"
          label="Nombre"
          name="displayName"
          autoComplete="name"
          autoFocus
          value={formData.displayName}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!!user} // No se puede editar el email de un usuario existente
        />
        <TextField
          margin="normal"
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          helperText={user ? "Dejar vacío para no cambiar" : ""}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            name="role"
            value={formData.role}
            label="Rol"
            onChange={handleChange}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Usuario Básico">Usuario Básico</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Estado</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            name="status"
            value={formData.status}
            label="Estado"
            onChange={handleChange}
          >
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserFormModal;
