import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Container, Box, CircularProgress, Alert, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OrderDetailView from '../../components/orders/OrderDetailView';
import { useTranslation } from 'react-i18next';

const OrderDetailPage = () => {
    const { t } = useTranslation();
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError('No order ID provided.');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const orderRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(orderRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Order not found.');
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError('Failed to fetch order details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, t]);

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/account/orders')}
                sx={{ mb: 2 }}
            >
                {t('orders.title', 'Back to Orders')}
            </Button>
            
            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : order ? (
                    <OrderDetailView order={order} />
                ) : (
                    <Alert severity="warning">{t('orders.not_found', 'Order details are not available.')}</Alert>
                )}
            </Paper>
        </Container>
    );
};

export default OrderDetailPage;
