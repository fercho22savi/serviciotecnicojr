
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
    IconButton,
    Switch,
    Button,
    Tabs,
    Tab,
    TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import UserFormModal from '../../components/admin/UserFormModal';

// Placeholder for callable functions
const listUsers = httpsCallable(functions, 'listUsers');
const updateUserRole = httpsCallable(functions, 'updateUserRole');
const toggleUserStatus = httpsCallable(functions, 'toggleUserStatus');

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await listUsers();
            // Note: Ensure your 'listUsers' cloud function returns 'displayName'.
            setUsers(result.data.users);
            setError(null);
        } catch (err) {
            setError('Error al cargar los usuarios. Asegúrate de tener los permisos necesarios y que la función "listUsers" esté desplegada.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setModalOpen(false);
    };

    const handleRoleUpdate = async (uid, newRole) => {
        try {
            await updateUserRole({ uid, role: newRole });
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            setError('Error al actualizar el rol del usuario.');
            console.error(err);
        }
    };

    const handleStatusToggle = async (uid, disabled) => {
        try {
            await toggleUserStatus({ uid, disabled: !disabled });
            fetchUsers();
        } catch (err) {
            setError('Error al cambiar el estado del usuario.');
            console.error(err);
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
            <Paper elevation={3} sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} aria-label="user management tabs">
                        <Tab label="Usuarios" />
                        <Tab label="Roles y Permisos" disabled />
                    </Tabs>
                </Box>
                
                {tabIndex === 0 && (
                    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ m: 0 }}>
                                Gestión de Usuarios
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                // onClick={() => handleOpenModal(null)} // Adapt to create new user
                            >
                                Nuevo Usuario
                            </Button>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold' } }}>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedUsers.map((user) => (
                                        <TableRow key={user.uid} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>{user.displayName || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={!user.disabled}
                                                    onChange={() => handleStatusToggle(user.uid, user.disabled)}
                                                    color="primary"
                                                    size="small"
                                                />
                                                {user.disabled ? 'Inactivo' : 'Activo'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Editar Rol">
                                                    <IconButton size="small" onClick={() => handleOpenModal(user)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
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
                    </Box>
                )}
            </Paper>
            {selectedUser && (
                <UserFormModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    user={selectedUser}
                    onSave={handleRoleUpdate}
                />
            )}
        </Box>
    );
};

export default UserManagementPage;

