
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
    MenuItem 
} from '@mui/material';

const UserFormModal = ({ open, onClose, user, onSave }) => {
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (user) {
            setSelectedRole(user.customClaims?.role || 'user');
        }
    }, [user]);

    const handleSave = () => {
        onSave(user.uid, selectedRole);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Editar Rol de Usuario</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="role-select-label">Rol</InputLabel>
                    <Select
                        labelId="role-select-label"
                        value={selectedRole}
                        label="Rol"
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="editor">Editor</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormModal;
