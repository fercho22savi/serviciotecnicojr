import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
    TablePagination // <-- 1. Importar el componente de paginación
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // 2. Añadir estados para la paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser) {
                setLoading(false);
                setError("Por favor, inicia sesión para ver tu historial de pedidos.");
                return;
            }
            try {
                setLoading(true);
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, where("userId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                let userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                userOrders.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                    return dateB - dateA;
                });
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
    }, [currentUser]);

    // 3. Crear manejadores para los eventos de paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Volver a la primera página cuando cambia la cantidad de filas
    };

    const handleViewOrder = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // 4. Calcular el "trozo" de pedidos a mostrar
    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Mi Historial de Pedidos
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {!loading && !error && orders.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6">Aún no has realizado ningún pedido.</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        ¡Explora nuestros productos y anímate a comprar!
                    </Typography>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/products')}>
                        Ir al Catálogo
                    </Button>
                </Paper>
            ) : (
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
                                                #{order.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd/MM/yyyy') : 'Fecha no disponible'}
                                        </TableCell>
                                        <TableCell align="right">
                                            ${order.total.toLocaleString('es-CO')}
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
                    {/* 5. Añadir el componente de paginación a la interfaz */}
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
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
