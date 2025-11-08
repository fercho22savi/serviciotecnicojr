
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Grid, CircularProgress, Alert, Modal, 
    TextField, Card, CardMedia, CardContent, CardActions 
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase'; // Make sure this path is correct

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
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch products. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpen = (product = null) => {
        setIsEditing(!!product);
        setCurrentProduct(product ? { ...product } : { name: '', description: '', price: '', category: '', imageUrl: '' });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentProduct(null);
        setIsEditing(false);
    };

    const handleSave = async (productData, imageFile) => {
        let imageUrl = productData.imageUrl;

        if (imageFile) {
            const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const productPayload = { ...productData, imageUrl };

        if (isEditing) {
            const productRef = doc(db, 'products', productPayload.id);
            await updateDoc(productRef, productPayload);
        } else {
            await addDoc(collection(db, 'products'), productPayload);
        }

        fetchProducts(); // Refresh the list
        handleClose();
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(db, 'products', id));
                fetchProducts(); // Refresh list
            } catch (err) {
                setError('Failed to delete product.');
                console.error(err);
            }
        }
    };


    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">Product Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Product
                </Button>
            </Box>

            <Grid container spacing={3}>
                {products.map((product) => (
                    <Grid item key={product.id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="140"
                                image={product.imageUrl || 'https://via.placeholder.com/150'}
                                alt={product.name}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5">{product.name}</Typography>
                                <Typography variant="body2" color="text.secondary">${product.price}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(product)}>Edit</Button>
                                <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => handleDelete(product.id)}>Delete</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <ProductForm 
                open={open} 
                onClose={handleClose} 
                onSave={handleSave} 
                product={currentProduct}
                isEditing={isEditing}
            />
        </Box>
    );
};

// ProductForm component to be used in a Modal
const ProductForm = ({ open, onClose, onSave, product, isEditing }) => {
    const [formData, setFormData] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData(product);
            setPreview(product.imageUrl);
        } else {
            setFormData({ name: '', description: '', price: '', category: '', imageUrl: '' });
            setPreview(null);
        }
        setImageFile(null); // Reset file on open
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, imageFile);
    };

    if (!formData) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">{isEditing ? 'Edit Product' : 'Add Product'}</Typography>
                
                <Button variant="contained" component="label" sx={{ my: 2 }}>
                    Upload Image
                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                </Button>
                {preview && <Box component="img" src={preview} alt="Preview" sx={{ width: '100%', height: 'auto', mb: 2 }} />} 

                <TextField margin="normal" required fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} />
                <TextField margin="normal" required fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} />
                <TextField margin="normal" required fullWidth label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
                <TextField margin="normal" required fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
                    <Button type="submit" variant="contained">{isEditing ? 'Save Changes' : 'Add Product'}</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ProductManagement;
