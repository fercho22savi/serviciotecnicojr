import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';

const UserFormModal = ({ open, onClose, user, onSave }) => {
    const [userData, setUserData] = useState({
        displayName: '',
        email: '',
        password: '',
        role: 'Miembro',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const isNewUser = !user;

    useEffect(() => {
        if (open) {
            setError('');
            setIsSaving(false);
            if (user) {
                setUserData({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    password: '',
                    role: user.customClaims?.role || 'Miembro',
                });
            } else {
                setUserData({
                    displayName: '',
                    email: '',
                    password: '',
                    role: 'Miembro',
                });
            }
        }
    }, [open, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setError('');
        if (isNewUser && (!userData.password || userData.password.length < 6)) {
            setError('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
            return;
        }

        setIsSaving(true);
        try {
            // Pass the correct data structure for both create and update
            const dataToSave = isNewUser ? userData : { uid: user.uid, role: userData.role };
            await onSave(dataToSave);
        } catch (err) {
            setError(err.message || 'Ocurrió un error al guardar. Por favor, inténtelo de nuevo.');
            setIsSaving(false); // Only stop loading if there is an error
        }
    };

    return (
        <Dialog open={open} onClose={() => !isSaving && onClose()} fullWidth maxWidth="sm">
            <DialogTitle>{isNewUser ? 'Agregar Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    autoFocus
                    margin="dense"
                    name="displayName"
                    label="Nombre"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={userData.displayName}
                    onChange={handleChange}
                    disabled={isSaving || !isNewUser}
                />
                <TextField
                    margin="dense"
                    name="email"
                    label="Correo Electrónico"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={userData.email}
                    onChange={handleChange}
                    disabled={isSaving || !isNewUser}
                />
                {isNewUser && (
                    <TextField
                        margin="dense"
                        name="password"
                        label="Contraseña"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={userData.password}
                        onChange={handleChange}
                        disabled={isSaving}
                    />
                )}
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="role-select-label">Rol</InputLabel>
                    <Select
                        labelId="role-select-label"
                        name="role"
                        value={userData.role}
                        label="Rol"
                        onChange={handleChange}
                        disabled={isSaving}
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Miembro">Miembro</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => !isSaving && onClose()} disabled={isSaving}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormModal;
