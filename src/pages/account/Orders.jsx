import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TablePagination,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import OrderDetailView from '../../components/orders/OrderDetailView';
import { toast } from 'react-hot-toast';
import { generateInvoice } from '../../utils/generateInvoice';
import { useTranslation } from 'react-i18next';
import StatusChip from '../../components/StatusChip'; // IMPORT THE NEW COMPONENT

const Orders = () => {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [usdToCopRate, setUsdToCopRate] = useState(null);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (data && data.rates && data.rates.COP) {
                    setUsdToCopRate(data.rates.COP);
                } else {
                    throw new Error('Invalid data structure from currency API');
                }
            } catch (err) {
                console.error("Failed to fetch exchange rate:", err);
                toast.error(t('orders.exchange_rate_error'));
            }
        };
        fetchExchangeRate();
    }, [t]);

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
            setError(t('orders.fetch_error'));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, t]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm(t('orders.cancel_confirm'))) return;
        
        const orderRef = doc(db, 'orders', orderId);
        try {
            await updateDoc(orderRef, { status: 'Cancelled' });
            toast.success(t('orders.cancel_success'));
        } catch (error) {
            console.error("Error canceling order: ", error);
            toast.error(t('orders.cancel_error'));
        }
    };
    
    const handleDownloadInvoice = () => {
        if (selectedOrder) {
            toast.loading(t('orders.generating_invoice'), { duration: 1500 });
            setTimeout(() => {
              generateInvoice(selectedOrder, t, i18n);
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

    const formatCurrency = (amount, currency) => {
        if (typeof amount !== 'number') return '$NaN';
        const locale = currency === 'COP' ? 'es-CO' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
    };

    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (loading && orders.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>{t('orders.title')}</Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            {!currentUser && !loading ? (
                <Alert severity="info">{t('orders.login_prompt')}</Alert>
            ) : orders.length === 0 && !loading ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}><Typography>{t('orders.no_orders')}</Typography></Paper>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('orders.order_number')}</TableCell>
                                    <TableCell>{t('orders.date')}</TableCell>
                                    <TableCell>{t('orders.status_label')}</TableCell>
                                    <TableCell>{t('orders.total')}</TableCell>
                                    <TableCell align="center">{t('orders.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedOrders.map((order) => {
                                    const totalInCop = order.pricing?.total ?? order.totalAmount;
                                    const totalInUsd = usdToCopRate && totalInCop ? totalInCop / usdToCopRate : null;
                                    const isCancellable = order.status === 'Processing';

                                    return (
                                        <TableRow key={order.id} hover>
                                            <TableCell>{order.orderNumber || order.id.substring(0, 6).toUpperCase()}</TableCell>
                                            <TableCell>{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd MMM, yyyy', { locale: i18n.language === 'es' ? es : enUS }) : 'N/A'}</TableCell>
                                            <TableCell><StatusChip status={order.status} /></TableCell>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {formatCurrency(totalInCop, 'COP')}
                                                </Typography>
                                                {usdToCopRate && totalInUsd !== null && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        (aprox. {formatCurrency(totalInUsd, 'USD')})
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button variant="outlined" size="small" onClick={() => handleOpenModal(order)} sx={{ mr: 1 }}>
                                                    {t('orders.view_details')}
                                                </Button>
                                                <Button 
                                                    variant="contained" 
                                                    color="error" 
                                                    size="small" 
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    disabled={!isCancellable}
                                                >
                                                    {t('orders.cancel_button')}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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
                        labelRowsPerPage={t('orders.rows_per_page')}
                    />
                </Paper>
            )}

            <Dialog open={!!selectedOrder} onClose={handleCloseModal} fullWidth maxWidth="md">
                <DialogTitle>
                    {t('order_detail.title_simple')}
                    <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedOrder && <OrderDetailView order={selectedOrder} />}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button onClick={handleCloseModal} color="secondary">{t('orders.close_button')}</Button>
                    <Button 
                        variant="contained" 
                        startIcon={<DownloadIcon />} 
                        onClick={handleDownloadInvoice}
                    >
                        {t('orders.download_pdf')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Orders;
