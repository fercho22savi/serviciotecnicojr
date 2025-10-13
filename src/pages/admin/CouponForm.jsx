import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Typography, Paper } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const CouponForm = ({ coupon, onSubmit }) => {
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState(0);
    const [expiresAt, setExpiresAt] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (coupon) {
            setCode(coupon.code || '');
            setDiscountType(coupon.discountType || 'percentage');
            setDiscountValue(coupon.discountValue || 0);
            setExpiresAt(coupon.expiresAt?.toDate() || null);
            setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
        }
    }, [coupon]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim() || discountValue <= 0) {
            toast.error('El código y un valor de descuento mayor a cero son obligatorios.');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({ 
                code: code.toUpperCase(), 
                discountType, 
                discountValue, 
                expiresAt, 
                isActive 
            });
            toast.success(`Cupón "${code.toUpperCase()}" ${coupon ? 'actualizado' : 'creado'} correctamente.`);
            // Reset form if it's for creating a new one
            if (!coupon) {
                setCode('');
                setDiscountType('percentage');
                setDiscountValue(0);
                setExpiresAt(null);
                setIsActive(true);
            }
        } catch (error) {
            console.error("Error submitting coupon:", error);
            toast.error("No se pudo guardar el cupón.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>{coupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Código del Cupón (ej. VERANO20)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoFocus
                        disabled={!!coupon} // Cannot edit code of existing coupon
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Tipo de Descuento</InputLabel>
                        <Select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                            label="Tipo de Descuento"
                        >
                            <MenuItem value="percentage">Porcentaje (%)</MenuItem>
                            <MenuItem value="fixed">Monto Fijo ($)</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label={discountType === 'percentage' ? 'Porcentaje de Descuento' : 'Monto Fijo de Descuento'}
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    />
                    <DatePicker
                        label="Fecha de Expiración (Opcional)"
                        value={expiresAt}
                        onChange={(newValue) => setExpiresAt(newValue)}
                        minDate={new Date()}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                margin: 'normal',
                            },
                        }}
                    />
                    <FormControlLabel
                        control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                        label="Cupón Activo"
                        sx={{ mt: 1 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : (coupon ? 'Actualizar Cupón' : 'Crear Cupón')}
                    </Button>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
};

export default CouponForm;
