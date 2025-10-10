import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Box, Paper, TextField, Button, Typography, CircularProgress, Alert, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 800,
  margin: 'auto',
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const productCategories = ['Sillas', 'Sofás', 'Mesas', 'Iluminación', 'Almacenamiento', 'Camas', 'Decoración'];

function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);

  const [formState, setFormState] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      getDoc(doc(db, 'products', productId))
        .then(docSnap => {
          if (docSnap.exists()) {
            setFormState(docSnap.data());
          }
        })
        .finally(() => setLoading(false));
    }
  }, [productId, isEditing]);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const productData = {
        ...formState,
        price: parseFloat(formState.price),
        averageRating: formState.averageRating || 0, // Keep existing rating or default to 0
        createdAt: serverTimestamp(),
      };

      if (isEditing) {
        await setDoc(doc(db, 'products', productId), productData, { merge: true });
        setSuccess('¡Producto actualizado con éxito!');
      } else {
        await addDoc(collection(db, 'products'), productData);
        setSuccess('¡Producto añadido con éxito!');
        // Reset form after creation
        setFormState({ name: '', description: '', price: '', category: '', imageUrl: '' });
      }
      setTimeout(() => navigate('/profile/me'), 2000); // Redirect after a delay
    } catch (err) {
      setError('Hubo un error al guardar el producto. Por favor, inténtalo de nuevo.');
      console.error(err);
    }
    setLoading(false);
  };

  if (loading && isEditing) {
      return <CircularProgress />
  }

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField fullWidth required label="Nombre del Producto" name="name" value={formState.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth required multiline rows={4} label="Descripción" name="description" value={formState.description} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required type="number" label="Precio" name="price" value={formState.price} onChange={handleChange} inputProps={{ step: "0.01" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Categoría</InputLabel>
              <Select name="category" label="Categoría" value={formState.category} onChange={handleChange}>
                {productCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth required label="URL de la Imagen" name="imageUrl" value={formState.imageUrl} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
             {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth sx={{ py: 1.5, fontWeight: 'bold' }}>
              {loading ? <CircularProgress size={24} /> : (isEditing ? 'Guardar Cambios' : 'Añadir Producto')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </StyledPaper>
  );
}

export default ProductForm;
