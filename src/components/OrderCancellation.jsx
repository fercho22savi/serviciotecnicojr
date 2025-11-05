
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useOrder } from '../context/OrderContext';

const OrderCancellation = () => {
  const { t } = useTranslation();
  const { latestOrder, timeLeft, clearOrder } = useOrder();

  if (!latestOrder) {
    return null;
  }

  const handleCancelOrder = () => {
    console.log(`Cancelling order ${latestOrder.id}`);
    // Here you would typically call an API to formally cancel the order
    clearOrder(); // Clear the order from the context and UI
  };

  const isTimeUp = timeLeft === 0;
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <Paper elevation={3} sx={{ 
        position: 'fixed', 
        bottom: 16, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        zIndex: 1300,
        backgroundColor: isTimeUp ? '#f5f5f5' : '#fff',
    }}>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        {isTimeUp ? (
          <Typography variant="body1" color="text.secondary">
            {t('order_cancellation.time_up', { orderId: latestOrder.id })}
          </Typography>
        ) : (
          <>
            <Typography variant="body1">
                {t('order_cancellation.message', { orderId: latestOrder.id })}
            </Typography>
            <Typography variant="h6" sx={{ minWidth: '80px' }}>
                {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </Typography>
          </>
        )}
      </Box>
      
      <Button 
        variant="contained" 
        color="error" 
        onClick={handleCancelOrder} 
        disabled={isTimeUp}
      >
        {t('order_cancellation.cancel_button')}
      </Button>
      {isTimeUp && (
          <IconButton onClick={clearOrder} size="small">
              <CloseIcon />
          </IconButton>
      )}
    </Paper>
  );
};

export default OrderCancellation;
