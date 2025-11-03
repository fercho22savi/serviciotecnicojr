import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, Grid, Divider, Table, 
    TableBody, TableCell, TableContainer, TableHead, TableRow, ListItemText, Button
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ImageWithFallback from '../../components/ImageWithFallback';
import OrderStatusTracker from '../../components/OrderStatusTracker';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const invoiceRef = useRef();
    const [reviewStatus, setReviewStatus] = useState({});

    useEffect(() => {
        if (!currentUser) {
            setError("Debes iniciar sesión para ver los detalles de un pedido.");
            setLoading(false);
            return;
        }

        const getOrder = async () => {
            setLoading(true);
            try {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await getDoc(orderRef);

                if (orderSnap.exists() && orderSnap.data().userId === currentUser.uid) {
                    const orderData = {
                        ...orderSnap.data(),
                        id: orderSnap.id,
                        createdAt: orderSnap.data().createdAt?.toDate(),
                        orderNumber: orderSnap.data().orderNumber || orderId.substring(0, 8).toUpperCase()
                    };
                    setOrder(orderData);
                } else {
                    setError("Factura no encontrada o no tienes permiso para verla.");
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError("No se pudo cargar el detalle de la factura.");
            } finally {
                setLoading(false);
            }
        };

        getOrder();
    }, [orderId, currentUser]);

    useEffect(() => {
        if (order && currentUser) {
            const checkReviewStatus = async () => {
                const initialStatus = order.items.reduce((acc, item) => ({ ...acc, [item.id]: 'checking' }), {});
                setReviewStatus(initialStatus);

                const statusPromises = order.items.map(async (item) => {
                    const reviewsQuery = query(
                        collection(db, `products/${item.id}/reviews`),
                        where('userId', '==', currentUser.uid),
                        limit(1)
                    );
                    const reviewSnapshot = await getDocs(reviewsQuery);
                    return { productId: item.id, hasReviewed: !reviewSnapshot.empty };
                });

                const results = await Promise.all(statusPromises);
                const finalStatus = results.reduce((acc, result) => ({ ...acc, [result.productId]: result.hasReviewed ? 'reviewed' : 'not_reviewed' }), {});
                setReviewStatus(finalStatus);
            };
            checkReviewStatus();
        }
    }, [order, currentUser]);

    const handleExportToPdf = () => {
        const input = invoiceRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save(`factura-${order.orderNumber}.pdf`);
        });
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2, mx: 2 }}>{error}</Alert>;
    }

    if (!order) return null;

    const { customerDetails, items, subtotal, discountAmount, totalAmount, createdAt, orderNumber, status } = order;

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Button 
                startIcon={<ArrowBackIosNewIcon />} 
                onClick={() => navigate(-1)} 
                sx={{ mb: 2, fontWeight: 'bold' }}
            >
                Volver al historial
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Detalle del Pedido</Typography>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportToPdf}>Exportar a PDF</Button>
            </Box>
            
            <OrderStatusTracker status={status} />

            <Paper ref={invoiceRef} sx={{ p: { xs: 2, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
                <Grid container justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                    <Grid item>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <StoreIcon color="primary" sx={{ fontSize: 50 }}/>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>MiTienda</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">Calle Falsa 123, Ciudad Principal</Typography>
                        <Typography variant="body2" color="text.secondary">contact@mitienda.com</Typography>
                    </Grid>
                    <Grid item sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: '500' }}>FACTURA</Typography>
                        <Typography color="text.secondary">Nº: {orderNumber}</Typography>
                        <Typography color="text.secondary">Fecha: {createdAt ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(createdAt) : '--'}</Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="overline" color="text.secondary">FACTURADO A</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{customerDetails.firstName} {customerDetails.lastName}</Typography>
                        <Typography variant="body2">{customerDetails.address}</Typography>
                        <Typography variant="body2">{`${customerDetails.city}, ${customerDetails.postalCode}`}</Typography>
                        <Typography variant="body2">{customerDetails.email}</Typography>
                    </Grid>
                </Grid>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>PRODUCTO</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>CANT.</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>PRECIO UNIT.</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>ACCIONES</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ImageWithFallback src={item.image || item.images?.[0]} alt={item.name} style={{ width: 40, height: 40, marginRight: '16px', borderRadius: '4px', objectFit: 'cover' }}/>
                                            <ListItemText primary={item.name} primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'text.primary' }}/>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">{item.quantity}</TableCell>
                                    <TableCell align="right">{`$${new Intl.NumberFormat('es-CO').format(item.price)}`}</TableCell>
                                    <TableCell align="right">{`$${new Intl.NumberFormat('es-CO').format(item.price * item.quantity)}`}</TableCell>
                                    <TableCell align="center">
                                        {reviewStatus[item.id] === 'not_reviewed' && (
                                            <Button component={RouterLink} to={`/product/${item.id}#reviews`} variant="outlined" size="small" startIcon={<RateReviewOutlinedIcon />}>Escribir reseña</Button>
                                        )}
                                        {reviewStatus[item.id] === 'reviewed' && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', justifyContent: 'center' }}>
                                                <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                <Typography variant="caption">Ya has opinado</Typography>
                                            </Box>
                                        )}
                                        {reviewStatus[item.id] === 'checking' && <CircularProgress size={20} />}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Divider />

                <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
                     <Grid item xs={12} sm={6} md={4}>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">Subtotal:</Typography>
                            <Typography sx={{ fontWeight: 500 }}>{`$${new Intl.NumberFormat('es-CO').format(subtotal)}`}</Typography>
                        </Box>
                        {discountAmount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Descuento:</Typography>
                                <Typography sx={{ fontWeight: 500, color: 'success.main' }}>{`-$${new Intl.NumberFormat('es-CO').format(discountAmount)}`}</Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">Envío:</Typography>
                            <Typography sx={{ fontWeight: 500 }}>Gratis</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{`$${new Intl.NumberFormat('es-CO').format(totalAmount)}`}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 5, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">¡Gracias por tu compra!</Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default OrderDetail;
