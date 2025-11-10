import React, { useState, useEffect } from 'react';
import { functions } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Button,
    TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UserFormModal from '../../components/admin/UserFormModal';

// Firebase Cloud Functions
const listUsers = httpsCallable(functions, 'listUsers');
const updateUserRole = httpsCallable(functions, 'updateUserRole');
const deleteUserFunc = httpsCallable(functions, 'deleteUser');
const createUserFunc = httpsCallable(functions, 'createUser');

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await listUsers();
            setUsers(result.data.users);
        } catch (err) {
            setError('Error al cargar los usuarios. Asegúrate de tener los permisos necesarios y que la función "listUsers" esté desplegada.');
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
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

    const handleSaveUser = async (data) => {
        try {
            if (data.uid) { // Update existing user
                await updateUserRole({ uid: data.uid, role: data.role });
            } else { // Create new user
                await createUserFunc(data);
            }
            await fetchUsers(); // Refresh the user list
            handleCloseModal(); // Close modal on success
        } catch (err) {
            console.error("Error saving user:", err);
            // Re-throw the error to be caught by the modal
            const message = err.message || `Error al ${data.uid ? 'actualizar' : 'crear'} el usuario.`;
            throw new Error(message);
        }
    };

    const handleDeleteUser = async (uid) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
            try {
                await deleteUserFunc({ uid });
                await fetchUsers(); // Refresh the list after deletion
            } catch (err) {
                setError('Error al eliminar el usuario.');
                console.error("Error deleting user:", err);
            }
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ m: 0 }}>
                    Administración de Usuarios
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Agregar Nuevo Usuario
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, mt: 2 }}>{error}</Alert>}

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold' } }}>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Correo Electrónico</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.map((user) => (
                                <TableRow key={user.uid} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>{user.displayName || 'N/A'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.customClaims?.role || 'Miembro'}</TableCell>
                                    <TableCell align="right">
                                        <Button 
                                            variant="outlined" 
                                            color="primary"
                                            size="small" 
                                            onClick={() => handleOpenModal(user)}
                                            sx={{ mr: 1 }}
                                        >
                                            Editar
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            color="error" 
                                            size="small" 
                                            onClick={() => handleDeleteUser(user.uid)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                />
            </Paper>
            
            <UserFormModal
                open={modalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
                onSave={handleSaveUser}
            />
        </Box>
    );
};

export default UserManagementPage;
