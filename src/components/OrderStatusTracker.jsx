import React from 'react';
import { Stepper, Step, StepLabel, Box, Typography } from '@mui/material';

const steps = ['Procesando', 'Enviado', 'Completado'];

const OrderStatusTracker = ({ status }) => {
    const getActiveStep = () => {
        const statusIndex = steps.findIndex(step => step.toLowerCase() === status.toLowerCase());
        // If status is 'Cancelado', we don't show it in the stepper, so return -1 or some other indicator.
        // Or we could show the stepper up to the point it was cancelled.
        if (status.toLowerCase() === 'cancelado') {
            return -1; // Or handle as you see fit
        }
        return statusIndex >= 0 ? statusIndex : 0; // Default to first step if status is unknown
    };

    const activeStep = getActiveStep();

    if (status.toLowerCase() === 'cancelado') {
        return (
            <Box sx={{ my: 4, p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="h6" color="error.main">Pedido Cancelado</Typography>
                <Typography variant="body2" color="text.secondary">Este pedido ha sido cancelado.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', my: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default OrderStatusTracker;
