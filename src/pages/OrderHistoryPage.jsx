import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Alert,
    TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // Corrected: useAuth provides 'user', not 'currentUser'
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                // No need to set an error, the component will just show the empty state
                return;
            }
            try {
                setLoading(true);
                const ordersRef = collection(db, 'orders');
                // Query orders for the current user, ordered by creation date
                const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(userOrders);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Ocurrió un error al cargar tus pedidos. Por favor, intenta de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Corrected navigation path
    const handleViewOrder = (orderId) => {
        navigate(`/account/orders/${orderId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Mi Historial de Pedidos
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            {!user && !loading && (
                 <Alert severity="info" sx={{ mb: 3 }}>Por favor, inicia sesión para ver tu historial de pedidos.</Alert>
            )}

            {user && !loading && !error && orders.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6">Aún no has realizado ningún pedido.</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        ¡Explora nuestros productos y anímate a comprar!
                    </Typography>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/products')}>
                        Ir al Catálogo
                    </Button>
                </Paper>
            ) : user && (
                <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 640 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Número de Pedido</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedOrders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell component="th" scope="row">
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                #{order.id.substring(0, 6).toUpperCase()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd/MM/yyyy') : 'Fecha no disponible'}
                                        </TableCell>
                                        <TableCell align="right">
                                            {/* Corrected field name from total to totalAmount */}
                                            ${order.totalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleViewOrder(order.id)}
                                            >
                                                Ver Pedido
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
                        count={orders.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Pedidos por página:"
                    />
                </Paper>
            )}
        </Container>
    );
};

export default OrderHistoryPage;
