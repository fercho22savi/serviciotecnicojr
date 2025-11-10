import React, { useState, useEffect, useCallback } from 'react';
import { functions } from '../../firebase/config'; // Make sure this path is correct
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';

import {
    Container, Typography, Box, Paper, CircularProgress, Fab, Tooltip, Switch,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip, Dialog,
    DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import CouponForm from './CouponForm';

// Callable Cloud Functions
const listCoupons = httpsCallable(functions, 'listCoupons');
const createCoupon = httpsCallable(functions, 'createCoupon');
const updateCoupon = httpsCallable(functions, 'updateCoupon');

function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const result = await listCoupons();
            const couponsList = result.data.coupons.map(c => ({
                ...c,
                // Convert ISO strings back to Date objects for the form/UI
                expiresAt: c.expiresAt ? new Date(c.expiresAt) : null,
            }));
            setCoupons(couponsList);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error(error.message || "Error al cargar los cupones.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleOpenForm = (coupon = null) => {
        setSelectedCoupon(coupon);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedCoupon(null);
    };

    const handleToggleActive = async (coupon) => {
        const newActiveState = !coupon.isActive;
        // Optimistically update UI
        setCoupons(prev => prev.map(c => c.id === coupon.id ? {...c, isActive: newActiveState} : c));
        
        try {
            await updateCoupon({ id: coupon.id, isActive: newActiveState });
            toast.success(`Cupón "${coupon.code}" ${newActiveState ? 'activado' : 'desactivado'}.`);
        } catch (error) {
            console.error("Error toggling coupon status:", error);
            toast.error("No se pudo cambiar el estado del cupón.");
            // Revert optimistic update on failure
            setCoupons(prev => prev.map(c => c.id === coupon.id ? {...c, isActive: coupon.isActive} : c));
        }
    };

    const handleCouponSubmit = async (formData) => {
        const dataToSave = {
            ...formData,
            // Convert Date object to ISO string for Firebase Function
            expiresAt: formData.expiresAt ? formData.expiresAt.toISOString() : null,
        };

        try {
            if (selectedCoupon) {
                await updateCoupon({ id: selectedCoupon.id, ...dataToSave });
            } else {
                await createCoupon(dataToSave);
            }
            await fetchCoupons();
            handleCloseForm();
        } catch (error) {
            console.error("Error saving coupon:", error);
            throw error; // Let CouponForm handle displaying the error
        }
    };

    const formatValue = (type, value) => {
        return type === 'percentage' ? `${value}%` : `$${Number(value).toLocaleString('es-CO')}`;
    }

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">Gestión de Cupones</Typography>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center'}}><CircularProgress /></Box>
            ) : (
                <Paper elevation={3} sx={{ overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Código</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Valor</TableCell>
                                <TableCell>Expira</TableCell>
                                <TableCell align="center">Activo</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.id} hover>
                                    <TableCell><Chip label={coupon.code} color="primary" variant="outlined" size="small" /></TableCell>
                                    <TableCell>{coupon.discountType === 'percentage' ? 'Porcentaje' : 'Fijo'}</TableCell>
                                    <TableCell>{formatValue(coupon.discountType, coupon.discountValue)}</TableCell>
                                    <TableCell>{coupon.expiresAt ? coupon.expiresAt.toLocaleDateString() : 'Nunca'}</TableCell>
                                    <TableCell align="center">
                                        <Switch
                                            checked={coupon.isActive}
                                            onChange={() => handleToggleActive(coupon)}
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar Cupón">
                                            <IconButton onClick={() => handleOpenForm(coupon)} size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            <Tooltip title="Añadir Nuevo Cupón">
                <Fab color="primary" sx={{ position: 'fixed', bottom: { xs: 72, md: 32 }, right: { xs: 16, md: 32 } }} onClick={() => handleOpenForm()}>
                    <AddIcon />
                </Fab>
            </Tooltip>

            <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                 <DialogTitle>{selectedCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}</DialogTitle>
                 <DialogContent>
                     <CouponForm 
                        coupon={selectedCoupon} 
                        onSubmit={handleCouponSubmit} 
                        onClose={handleCloseForm} 
                    />
                 </DialogContent>
            </Dialog>
        </Container>
    );
}

export default CouponManagement;
