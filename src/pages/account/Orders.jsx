import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TablePagination,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download'; // Icono para el nuevo botón
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import OrderDetailView from '../../components/orders/OrderDetailView';
import { toast } from 'react-hot-toast';
import { generateInvoice } from '../../utils/generateInvoice'; // <-- Importamos el generador de PDF

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const ordersQuery = query(
            collection(db, 'orders'), 
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
            const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(userOrders);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching orders: ", err);
            setError("No se pudieron cargar tus pedidos.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar este pedido?")) return;
        
        const orderRef = doc(db, 'orders', orderId);
        try {
            await updateDoc(orderRef, { status: 'Cancelado' });
            toast.success("Pedido cancelado con éxito.");
        } catch (error) {
            console.error("Error canceling order: ", error);
            toast.error("No se pudo cancelar el pedido.");
        }
    };
    
    const handleDownloadInvoice = () => {
        if (selectedOrder) {
            toast.loading('Generando tu factura...', { duration: 1500 });
            setTimeout(() => {
              generateInvoice(selectedOrder);
            }, 1500);
        }
    };

    const handleOpenModal = (order) => setSelectedOrder(order);
    const handleCloseModal = () => setSelectedOrder(null);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatCurrency = (order) => {
        const total = order.pricing?.total ?? order.totalAmount;
        if (typeof total !== 'number') return '$NaN';
        return `$${total.toLocaleString('es-CO')}`;
    };

    const getStatusChip = (status) => {
        let color = 'default';
        if (status === 'Procesando') color = 'info';
        if (status === 'Completado') color = 'success';
        if (status === 'Cancelado') color = 'error';
        return <Chip label={status} color={color} size="small" />;
    };

    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>Mis Pedidos</Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            {!currentUser && !loading ? (
                <Alert severity="info">Por favor, <Button color="inherit" onClick={() => navigate('/login')}>inicia sesión</Button> para ver tu historial.</Alert>
            ) : orders.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}><Typography>Aún no has realizado ningún pedido.</Typography></Paper>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>N° Pedido</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedOrders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>{order.orderNumber || order.id.substring(0, 6).toUpperCase()}</TableCell>
                                        <TableCell>{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd MMM, yyyy', { locale: es }) : 'N/A'}</TableCell>
                                        <TableCell>{getStatusChip(order.status)}</TableCell>
                                        <TableCell>{formatCurrency(order)}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="outlined" size="small" onClick={() => handleOpenModal(order)} sx={{ mr: 1 }}>
                                                Ver Detalles
                                            </Button>
                                            {order.status === 'Procesando' && (
                                                <Button variant="contained" color="error" size="small" onClick={() => handleCancelOrder(order.id)}>
                                                    Cancelar
                                                </Button>
                                            )}
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

            <Dialog open={!!selectedOrder} onClose={handleCloseModal} fullWidth maxWidth="md">
                <DialogTitle>
                    Detalles del Pedido
                    <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedOrder && <OrderDetailView order={selectedOrder} />}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button onClick={handleCloseModal} color="secondary">Cerrar</Button>
                    <Button 
                        variant="contained" 
                        startIcon={<DownloadIcon />} 
                        onClick={handleDownloadInvoice}
                    >
                        Descargar PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Orders;
