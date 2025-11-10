import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Paper, Box, Button, CircularProgress, Alert, 
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, Grid 
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
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
            setError(null); // Clear previous errors on successful load
        }, (err) => {
            console.error(err);
            if (err.code === 'permission-denied') {
                setError(t('category_management.errors.permission_denied_load', 'Permission Denied: You do not have permission to view categories.'));
            } else {
                setError(t('category_management.load_error', 'Failed to load categories.'));
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [t]);

    const validateForm = () => {
        const errors = {};
        if (!formValues.name.trim()) errors.name = t('category_management.form.errors.name_required', 'Category name is required');
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
        if (isSaving) return;
        setOpen(false);
        setCurrentCategory(null);
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        
        setIsSaving(true);
        const toastId = toast.loading(t('category_management.saving', 'Saving...'));
        const data = { name: formValues.name, description: formValues.description };

        try {
            if (isEditing) {
                await updateDoc(doc(db, 'categories', currentCategory.id), data);
                toast.success(t('category_management.update_success', 'Category updated successfully'), { id: toastId });
            } else {
                await addDoc(collection(db, 'categories'), data);
                toast.success(t('category_management.create_success', 'Category created successfully'), { id: toastId });
            }
            handleClose();
        } catch (err) {
            console.error(err);
            let errorMessage = t('category_management.save_error', 'Error saving category');
            if (err.code === 'permission-denied') {
                errorMessage = t('category_management.errors.permission_denied_save', 'Permission Denied: You must be an administrator to save a category.');
            }
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('category_management.delete_confirm', 'Are you sure you want to delete this category?'))) {
            const toastId = toast.loading(t('category_management.deleting', 'Deleting...'));
            try {
                await deleteDoc(doc(db, 'categories', id));
                toast.success(t('category_management.delete_success', 'Category deleted successfully'), { id: toastId });
            } catch (err) {
                console.error(err);
                let errorMessage = t('category_management.delete_error', 'Error deleting category');
                if (err.code === 'permission-denied') {
                    errorMessage = t('category_management.errors.permission_denied_delete', 'Permission Denied: You must be an administrator to delete a category.');
                }
                toast.error(errorMessage, { id: toastId });
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">{t('category_management.title', 'Category Management')}</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>{t('category_management.add_button', 'Add Category')}</Button>
            </Box>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error}</Alert>}
            
            {!loading && !error && (
                <Paper elevation={3} sx={{ overflowX: 'auto' }}>
                    {categories.length === 0 ? (
                        <Typography sx={{textAlign: 'center', p: 4}}>{t('category_management.empty_text', 'No categories found. Click "Add Category" to start.')}</Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('category_management.table.name', 'Name')}</TableCell>
                                    <TableCell>{t('category_management.table.description', 'Description')}</TableCell>
                                    <TableCell align="right">{t('category_management.table.actions', 'Actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map((cat) => (
                                    <TableRow key={cat.id} hover>
                                        <TableCell component="th" scope="row">{cat.name}</TableCell>
                                        <TableCell>{cat.description}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleOpen(cat)} aria-label={t('category_management.actions.edit', 'Edit')}><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDelete(cat.id)} aria-label={t('category_management.actions.delete', 'Delete')}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Paper>
            )}

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{isEditing ? t('category_management.form.edit_title', 'Edit Category') : t('category_management.form.add_title', 'Add New Category')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{pt: 1}}>
                        <Grid item xs={12}>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="name"
                                label={t('category_management.form.name_label', 'Category Name')}
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
                                label={t('category_management.form.description_label', 'Description')}
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
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={isSaving}>{t('category_management.form.cancel_button', 'Cancel')}</Button>
                    <LoadingButton 
                        onClick={handleSave} 
                        variant="contained"
                        loading={isSaving}
                        loadingPosition="start"
                        startIcon={<div/>}
                    >
                        {isSaving ? t('category_management.form.saving_button', 'Saving...') : (isEditing ? t('category_management.form.save_button', 'Save Changes') : t('category_management.form.add_button', 'Add Category'))}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CategoryManagement;
