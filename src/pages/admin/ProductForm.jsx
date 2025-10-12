import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Corrected import path
import { 
    Container, Typography, TextField, Button, Box, Paper, CircularProgress, Grid, 
    TextareaAutosize, MenuItem, Select, InputLabel, FormControl 
} from '@mui/material';
import { toast } from 'react-hot-toast';

const categories = ['Laptops', 'Smartphones', 'Accesorios', 'Gaming', 'Audio'];

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const productRef = doc(db, 'products', id);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            setProduct(productSnap.data());
          } else {
            toast.error('Producto no encontrado.');
            navigate('/admin/products');
          }
        } catch (error) {
          console.error(error);
          toast.error('Error al cargar el producto.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const productData = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10),
        updatedAt: serverTimestamp()
    };

    try {
      if (isEditing) {
        const productRef = doc(db, 'products', id);
        await updateDoc(productRef, productData);
        toast.success('Producto actualizado con éxito.');
      } else {
        await addDoc(collection(db, 'products'), {
            ...productData,
            createdAt: serverTimestamp()
        });
        toast.success('Producto creado con éxito.');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error("Error submitting product: ", error);
      toast.error('Error al guardar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
      </Typography>
      <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit} elevation={3}>
        <Grid container spacing={3}>
          <Grid xs={12}>
            <TextField name="name" label="Nombre del Producto" value={product.name} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid xs={12}>
            <TextareaAutosize 
                name="description"
                placeholder="Descripción del producto" 
                value={product.description}
                onChange={handleChange}
                minRows={5}
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', borderColor: '#ccc' }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField name="price" label="Precio" type="number" value={product.price} onChange={handleChange} fullWidth required inputProps={{ step: "0.01" }}/>
          </Grid>
          <Grid xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Categoría</InputLabel>
              <Select name="category" label="Categoría" value={product.category} onChange={handleChange}>
                {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField name="stock" label="Stock" type="number" value={product.stock} onChange={handleChange} fullWidth required />
          </Grid>
           <Grid xs={12}>
            <TextField name="image" label="URL de la Imagen" value={product.image} onChange={handleChange} fullWidth required />
          </Grid>
          {product.image && 
            <Grid xs={12} sx={{textAlign: 'center'}}>
                <Typography variant="caption">Vista Previa:</Typography>
                <Box sx={{mt: 1, border: '1px solid #ddd', padding: 1}}>
                    <img src={product.image} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </Box>
            </Grid>
           }
          <Grid xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => navigate('/admin/products')} sx={{ mr: 2 }}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ProductForm;
