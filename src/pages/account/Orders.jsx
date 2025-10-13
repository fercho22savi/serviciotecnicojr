import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TablePagination
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    
    // --- State for Pagination ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            setError("Debes iniciar sesión para ver tus pedidos.");
            return;
        }

        setLoading(true);
        const ordersQuery = query(
            collection(db, 'orders'), 
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
            const userOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            setOrders(userOrders);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching orders: ", err);
            setError("No se pudieron cargar tus pedidos. Inténtalo de nuevo más tarde.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // --- Handlers for Pagination ---
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }
    
    // Slice orders for current page
    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container>
            <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                Mis Pedidos
            </Typography>
            {orders.length === 0 ? (
                <Paper sx={{ textAlign: 'center', p: 4, mt: 4, border: '2px dashed', borderColor: 'grey.300' }}>
                    <ReceiptLongIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Aún no tienes pedidos.</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>Cuando realices una compra, aparecerá aquí.</Typography>
                    <Button component={RouterLink} to="/products" variant="contained">
                        Explorar Productos
                    </Button>
                </Paper>
            ) : (
                <Paper>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nº Pedido</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedOrders.map((order) => (
                                    <TableRow key={order.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            <Typography variant="body2" sx={{ fontWeight: '500' }}>{order.orderNumber || order.orderId}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {order.createdAt ? new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }).format(order.createdAt) : '--'}
                                        </TableCell>
                                        <TableCell align="center">{order.status}</TableCell>
                                        <TableCell align="right">${new Intl.NumberFormat('es-CO').format(order.totalAmount)}</TableCell>
                                        <TableCell align="center">
                                            <Button component={RouterLink} to={`/account/orders/${order.id}`} size="small">
                                                Ver Detalles
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* --- Pagination Component --- */}
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

export default Orders;
