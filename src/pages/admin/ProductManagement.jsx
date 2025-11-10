import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Box, Typography, Button, Grid, CircularProgress, Alert, Modal, 
    TextField, Paper, Tooltip, IconButton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import toast from 'react-hot-toast';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

const ProductManagement = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setError(null);
        } catch (err) {
            setError(t('product_management.load_error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleOpenForm = (product = null) => {
        setIsEditing(!!product);
        setCurrentProduct(product ? { ...product } : { name: '', description: '', price: '', category: '', imageUrl: '' });
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setCurrentProduct(null);
        setIsEditing(false);
    };

    const handleSave = async (productData, imageFile) => {
        const loadingToast = toast.loading(t('product_management.saving'));
        try {
            let imageUrl = productData.imageUrl;
    
            if (imageFile) {
                const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }
    
            // Make sure price is a number
            const priceAsNumber = Number(productData.price);
            if (isNaN(priceAsNumber)) {
                throw new Error("Price must be a valid number.");
            }

            const productPayload = { ...productData, imageUrl, price: priceAsNumber };
    
            if (isEditing) {
                const productRef = doc(db, 'products', productPayload.id);
                await updateDoc(productRef, productPayload);
            } else {
                await addDoc(collection(db, 'products'), productPayload);
            }
            
            toast.success(t('product_management.save_success'), { id: loadingToast });
            fetchProducts();
            handleCloseForm();
        } catch (err) {
            console.error(err);
            toast.error(t('product_management.save_error'), { id: loadingToast });
        }
    };
    
    const openDeleteDialog = (id) => {
        setProductToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const closeDeleteDialog = () => {
        setProductToDelete(null);
        setDeleteConfirmOpen(false);
    }

    const handleDelete = async () => {
        if (!productToDelete) return;
        const loadingToast = toast.loading(t('product_management.deleting'));
        try {
            await deleteDoc(doc(db, 'products', productToDelete));
            toast.success(t('product_management.delete_success'), { id: loadingToast });
            fetchProducts();
        } catch (err) {
            setError(t('product_management.delete_error'));
            toast.error(t('product_management.delete_error'), { id: loadingToast });
            console.error(err);
        } finally {
            closeDeleteDialog();
        }
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Paper sx={{ p: {xs: 2, md: 3}, m: 'auto'}} elevation={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">{t('product_management.title')}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
                    {t('product_management.add_button')}
                </Button>
            </Box>

            <ProductTable products={products} onEdit={handleOpenForm} onDelete={openDeleteDialog} t={t} />

            <ProductForm 
                open={formOpen} 
                onClose={handleCloseForm} 
                onSave={handleSave} 
                product={currentProduct}
                isEditing={isEditing}
                t={t}
            />

            <Dialog open={deleteConfirmOpen} onClose={closeDeleteDialog}>
                <DialogTitle>{t('product_management.delete_confirm_title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('product_management.delete_confirm_text')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>{t('cancel')}</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>{t('delete')}</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

const ProductTable = ({ products, onEdit, onDelete, t }) => {
    if (products.length === 0) {
        return (
            <Box textAlign="center" my={5}>
                <Typography variant="h6">{t('product_management.empty_text')}</Typography>
            </Box>
        )
    }
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontWeight: 'bold'}}>{t('product_management.table_header.image')}</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}}>{t('product_management.table_header.name')}</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}}>{t('product_management.table_header.category')}</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}} align="right">{t('product_management.table_header.price')}</TableCell>
                        <TableCell sx={{fontWeight: 'bold'}} align="center">{t('product_management.table_header.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id} hover>
                            <TableCell>
                                <Avatar 
                                    variant="rounded" 
                                    src={product.imageUrl || 'https://via.placeholder.com/150'} 
                                    alt={product.name}
                                />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell align="right">${Number(product.price).toLocaleString('es-CO')}</TableCell>
                            <TableCell align="center">
                                <Tooltip title={t('product_management.actions.edit_tooltip')}>
                                    <IconButton onClick={() => onEdit(product)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('product_management.actions.delete_tooltip')}>
                                    <IconButton onClick={() => onDelete(product.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const ProductForm = ({ open, onClose, onSave, product, isEditing, t }) => {
    const [formData, setFormData] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (open) {
            if (product) {
                setFormData(product);
                setPreview(product.imageUrl);
            } else {
                setFormData({ name: '', description: '', price: '', category: '', imageUrl: '' });
                setPreview(null);
            }
            setImageFile(null);
        }
    }, [product, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, imageFile);
    };

    if (!formData) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h6" component="h2" fontWeight="bold">
                        {isEditing ? t('product_management.form.edit_title') : t('product_management.form.add_title')}
                    </Typography>
                    <IconButton onClick={onClose}><CloseIcon/></IconButton>
                </Box>
                
                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid item xs={12}>
                        <Box sx={{height: 200, border: '2px dashed grey', borderRadius: 2, display:'flex', justifyContent:'center', alignItems:'center', background: `#f5f5f5`, overflow:'hidden', position: 'relative'}}>
                            {preview ? 
                                <img src={preview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : 
                                <Typography>{t('product_management.form.image_placeholder')}</Typography>
                            }
                        </Box>
                         <Button variant="contained" component="label" fullWidth sx={{ my: 1 }}>
                            {t('product_management.form.upload_button')}
                            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField required fullWidth label={t('product_management.form.name_label')} name="name" value={formData.name} onChange={handleChange} />
                    </Grid>
                     <Grid item xs={12}>
                        <TextField required multiline rows={3} fullWidth label={t('product_management.form.description_label')} name="description" value={formData.description} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField required fullWidth label={t('product_management.form.price_label')} name="price" type="number" value={formData.price} onChange={handleChange} inputProps={{ step: "0.01" }} />
                    </Grid>
                    <Grid item xs={6}>
                         <TextField required fullWidth label={t('product_management.form.category_label')} name="category" value={formData.category} onChange={handleChange} />
                    </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onClose}>{t('product_management.form.cancel_button')}</Button>
                    <Button type="submit" variant="contained">{isEditing ? t('product_management.form.save_button') : t('product_management.form.add_new_button')}</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ProductManagement;
