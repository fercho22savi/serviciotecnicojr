import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
};

const OrderSuccessModal = ({ open, orderId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/account/orders');
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="order-success-modal-title"
            aria-describedby="order-success-modal-description"
        >
            <Box sx={style}>
                <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main' }} />
                <Typography id="order-success-modal-title" variant="h6" component="h2" sx={{ mt: 2 }}>
                    {t('checkout.order_success_title')}
                </Typography>
                <Typography id="order-success-modal-description" sx={{ mt: 2 }}>
                    {t('checkout.order_success_message')}
                </Typography>
                <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2">{t('checkout.confirmation_number', { orderId })}</Typography>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" onClick={handleClose}>{t('checkout.continue_shopping')}</Button>
                    <Button variant="outlined" onClick={handleViewOrders}>{t('checkout.view_orders')}</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default OrderSuccessModal;
