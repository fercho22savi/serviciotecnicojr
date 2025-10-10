import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db as firestore } from '../../firebase/config';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
    Container, Typography, Box, Paper, CircularProgress, Fab, Tooltip, 
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip, Dialog, 
    DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';

// --- CouponFormDialog Component ---
const CouponFormDialog = ({ open, onClose, onSave, coupon }) => {
  const [formState, setFormState] = useState({ code: '', type: 'percentage', value: '', expiresAt: null });

  useEffect(() => {
    if (coupon) {
      setFormState({
        code: coupon.code || '',
        type: coupon.type || 'percentage',
        value: coupon.value || '',
        expiresAt: coupon.expiresAt ? coupon.expiresAt.toDate() : null
      });
    } else {
      setFormState({ code: '', type: 'percentage', value: '', expiresAt: null });
    }
  }, [coupon, open]);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormState({ ...formState, expiresAt: date });
  };

  const handleSave = () => {
    onSave(formState);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{coupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item xs={12}><TextField label="Código del Cupón" name="code" value={formState.code} onChange={handleChange} fullWidth required autoFocus/></Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                    <InputLabel>Tipo</InputLabel>
                    <Select name="type" value={formState.type} label="Tipo" onChange={handleChange}>
                        <MenuItem value="percentage">Porcentaje (%)</MenuItem>
                        <MenuItem value="fixed">Fijo ($)</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Valor" name="value" type="number" value={formState.value} onChange={handleChange} fullWidth required/></Grid>
            <Grid item xs={12}>
              <DatePicker selected={formState.expiresAt} onChange={handleDateChange} dateFormat="MMMM d, yyyy" placeholderText="Seleccionar fecha de expiración" className="MuiInputBase-input MuiOutlinedInput-input" customInput={<TextField label="Fecha de Expiración" fullWidth />}/>
            </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

// --- Main CouponManagement Component ---
function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'coupons'));
      const couponsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(couponsList);
    } catch (error) { 
        console.error(error);
        toast.error("Error al cargar los cupones."); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleOpenForm = (coupon = null) => {
    setSelectedCoupon(coupon);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCoupon(null);
  };

  const handleOpenDelete = (coupon) => {
    setSelectedCoupon(coupon);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedCoupon(null);
  };

  const handleSaveCoupon = async (formData) => {
    const dataToSave = {
        ...formData,
        value: parseFloat(formData.value),
        expiresAt: formData.expiresAt ? Timestamp.fromDate(formData.expiresAt) : null,
        updatedAt: serverTimestamp()
    };

    try {
      if (selectedCoupon) {
        await updateDoc(doc(firestore, 'coupons', selectedCoupon.id), dataToSave);
        toast.success("Cupón actualizado.");
      } else {
        await addDoc(collection(firestore, 'coupons'), { ...dataToSave, createdAt: serverTimestamp() });
        toast.success("Cupón creado.");
      }
      fetchCoupons();
    } catch (error) { 
        console.error(error);
        toast.error("Error al guardar el cupón."); 
    } finally { 
        handleCloseForm(); 
    }
  };

  const handleDeleteCoupon = async () => {
    try {
      await deleteDoc(doc(firestore, 'coupons', selectedCoupon.id));
      toast.success("Cupón eliminado.");
      fetchCoupons();
    } catch (error) { 
        console.error(error);
        toast.error("Error al eliminar el cupón."); 
    } finally { 
        handleCloseDelete(); 
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Gestión de Cupones</Typography>
      {loading ? <CircularProgress /> : (
        <Paper elevation={3}>
          <Table>
            <TableHead><TableRow><TableCell>Código</TableCell><TableCell>Tipo</TableCell><TableCell>Valor</TableCell><TableCell>Expira</TableCell><TableCell align="center">Acciones</TableCell></TableRow></TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id} hover>
                  <TableCell><Chip label={coupon.code} color="primary" /></TableCell>
                  <TableCell>{coupon.type}</TableCell>
                  <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}</TableCell>
                  <TableCell>{coupon.expiresAt ? coupon.expiresAt.toDate().toLocaleDateString() : 'Nunca'}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenForm(coupon)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleOpenDelete(coupon)} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Tooltip title="Añadir Cupón"><Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => handleOpenForm()}><AddIcon /></Fab></Tooltip>

      <CouponFormDialog open={openForm} onClose={handleCloseForm} onSave={handleSaveCoupon} coupon={selectedCoupon} />
      
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent><Typography>¿Seguro que quieres eliminar el cupón "{selectedCoupon?.code}"?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button onClick={handleDeleteCoupon} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CouponManagement;
