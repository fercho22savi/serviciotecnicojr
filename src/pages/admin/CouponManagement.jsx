import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

import {
    Container, Typography, Box, Paper, CircularProgress, Fab, Tooltip, Switch,
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip, Dialog,
    DialogContent, DialogTitle, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import CouponForm from './CouponForm';

function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const couponsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCoupons(couponsList);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Error al cargar los cupones.");
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
        const couponRef = doc(db, 'coupons', coupon.id);
        try {
            await updateDoc(couponRef, { isActive: !coupon.isActive });
            toast.success(`Cupón "${coupon.code}" ${!coupon.isActive ? 'activado' : 'desactivado'}.`);
            // Optimistically update UI
            setCoupons(prev => prev.map(c => c.id === coupon.id ? {...c, isActive: !c.isActive} : c));
        } catch (error) {
            console.error("Error toggling coupon status:", error);
            toast.error("No se pudo cambiar el estado del cupón.");
        }
    };

    const handleCouponSubmit = async (formData) => {
        const dataToSave = {
            ...formData,
            discountValue: Number(formData.discountValue),
            expiresAt: formData.expiresAt ? Timestamp.fromDate(formData.expiresAt) : null,
        };

        try {
            if (selectedCoupon) {
                // Update existing coupon
                const couponRef = doc(db, 'coupons', selectedCoupon.id);
                await updateDoc(couponRef, dataToSave);
            } else {
                // Create new coupon
                await addDoc(collection(db, 'coupons'), { ...dataToSave, createdAt: serverTimestamp() });
            }
            await fetchCoupons(); // Refresh the list
            handleCloseForm();
        } catch (error) {
            throw error; // Let CouponForm handle the error toast
        }
    };

    const formatValue = (type, value) => {
        return type === 'percentage' ? `${value}%` : `$${value.toLocaleString('es-CO')}`;
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
                                    <TableCell><Chip label={coupon.code} color="primary" size="small" /></TableCell>
                                    <TableCell>{coupon.discountType === 'percentage' ? 'Porcentaje' : 'Fijo'}</TableCell>
                                    <TableCell>{formatValue(coupon.discountType, coupon.discountValue)}</TableCell>
                                    <TableCell>{coupon.expiresAt ? coupon.expiresAt.toDate().toLocaleDateString() : 'Nunca'}</TableCell>
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
                    <CouponForm coupon={selectedCoupon} onSubmit={handleCouponSubmit} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default CouponManagement;
