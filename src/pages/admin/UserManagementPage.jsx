import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, InputBase, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import UserFormModal from '../../components/admin/UserFormModal';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [roleFilter, setRoleFilter] = useState('Todos');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (formData, userId) => {
    try {
      if (userId) {
        // Actualizar usuario existente
        const userRef = doc(db, 'users', userId);
        const { email, ...updateData } = formData; // El email no se puede cambiar
        await updateDoc(userRef, updateData);
      } else {
        // Crear nuevo usuario (esto es simplificado, necesitaría Auth)
        await addDoc(collection(db, 'users',), formData);
      }
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error("Error saving user: ", error);
    }
    handleCloseModal();
  };

  const handleDelete = async (userId) => {
      if(window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
          try {
              await deleteDoc(doc(db, 'users', userId));
              fetchUsers();
          } catch (error) {
              console.error("Error deleting user: ", error)
          }
      }
  }

  const filteredUsers = users.filter(user => {
      const searchMatch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'Todos' || (user.status || 'Activo') === statusFilter;
      const roleMatch = roleFilter === 'Todos' || (user.role || 'Usuario') === roleFilter;
      return searchMatch && statusMatch && roleMatch;
  });

  return (
    <Paper sx={{ p: 2, margin: 'auto', flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1">
                Gestión de Usuarios
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
                Añadir Nuevo Usuario
            </Button>
        </Box>
        <Box display="flex" alignItems="center" mb={2}>
            <InputBase
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, mr: 2, border: '1px solid #ccc', borderRadius: 1, p: '2px 4px' }}
            />
             <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                <InputLabel>Estado</InputLabel>
                <Select value={statusFilter} label="Estado" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Rol</InputLabel>
                <Select value={roleFilter} label="Rol" onChange={(e) => setRoleFilter(e.target.value)}>
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Usuario Básico">Usuario Básico</MenuItem>
                </Select>
            </FormControl>
        </Box>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>NOMBRE</TableCell>
                        <TableCell>EMAIL</TableCell>
                        <TableCell>ROL</TableCell>
                        <TableCell>ESTADO</TableCell>
                        <TableCell>REGISTRO</TableCell>
                        <TableCell>ÚLTIMO ACCESO</TableCell>
                        <TableCell align="right">ACCIONES</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center"><CircularProgress /></TableCell>
                        </TableRow>
                    ) : (filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.displayName || 'N/A'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role || 'Usuario'}</TableCell>
                            <TableCell>{user.status || 'Activo'}</TableCell>
                            <TableCell>{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>{user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" color="primary" onClick={() => handleOpenModal(user)}><Edit /></IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}><Delete /></IconButton>
                            </TableCell>
                        </TableRow>
                    )))} 
                </TableBody>
            </Table>
        </TableContainer>
         <UserFormModal 
            open={modalOpen} 
            handleClose={handleCloseModal} 
            user={selectedUser} 
            handleSubmit={handleSubmit} 
        />
    </Paper>
  );
};

export default UserManagementPage;
