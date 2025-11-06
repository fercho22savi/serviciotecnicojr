import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Paper, Box, Button, CircularProgress, Alert, 
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, Grid 
} from '@mui/material';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const CategoryManagement = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formValues, setFormValues] = useState({ name: '', description: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(cats);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(t('category_management.load_error'));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [t]);

    const validateForm = () => {
        const errors = {};
        if (!formValues.name.trim()) errors.name = t('category_management.errors.name_required');
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpen = (category = null) => {
        if (category) {
            setIsEditing(true);
            setCurrentCategory(category);
            setFormValues({ name: category.name, description: category.description || '' });
        } else {
            setIsEditing(false);
            setCurrentCategory(null);
            setFormValues({ name: '', description: '' });
        }
        setFormErrors({});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCategory(null);
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        
        setIsSaving(true);
        const data = { name: formValues.name, description: formValues.description };

        try {
            if (isEditing) {
                await updateDoc(doc(db, 'categories', currentCategory.id), data);
                toast.success(t('category_management.update_success'));
            } else {
                await addDoc(collection(db, 'categories'), data);
                toast.success(t('category_management.create_success'));
            }
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error(isEditing ? t('category_management.update_error') : t('category_management.create_error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('category_management.delete_confirm'))) {
            try {
                await deleteDoc(doc(db, 'categories', id));
                toast.success(t('category_management.delete_success'));
            } catch (err) {
                console.error(err);
                toast.error(t('category_management.delete_error'));
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">{t('category_management.title')}</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>{t('category_management.add_button')}</Button>
            </Box>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error}</Alert>}
            
            {!loading && !error && (
                <Paper elevation={3} sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('category_management.table.name')}</TableCell>
                                <TableCell>{t('category_management.table.description')}</TableCell>
                                <TableCell align="right">{t('category_management.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id} hover>
                                    <TableCell>{cat.name}</TableCell>
                                    <TableCell>{cat.description}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpen(cat)}><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleDelete(cat.id)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {categories.length === 0 && !loading && 
                        <Typography sx={{textAlign: 'center', p: 4}}>{t('category_management.no_categories')}</Typography>
                    }
                </Paper>
            )}

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{isEditing ? t('category_management.edit_title') : t('category_management.add_title')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{pt: 1}}>
                        <Grid item xs={12}>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="name"
                                label={t('category_management.form.name')}
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={formValues.name}
                                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                name="description"
                                label={t('category_management.form.description')}
                                type="text"
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('category_management.cancel_button')}</Button>
                    <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                        {isSaving ? <CircularProgress size={24} /> : t('category_management.save_button')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CategoryManagement;
