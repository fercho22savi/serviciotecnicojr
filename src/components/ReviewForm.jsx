import React, { useState } from 'react';
import { Box, Typography, Rating, TextField, Button, CircularProgress, Paper } from '@mui/material';
import toast from 'react-hot-toast';

const ReviewForm = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Por favor, selecciona una calificación por estrellas.');
            return;
        }
        if (comment.trim().length < 10) {
            toast.error('Tu comentario debe tener al menos 10 caracteres.');
            return;
        }
        
        setLoading(true);
        try {
            await onSubmit({ rating, comment });
            // Reset form on successful submission
            setRating(0);
            setComment('');
        } catch (error) {
            // Error toast is handled in the parent component
            console.error("Failed to submit review: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper component="form" onSubmit={handleSubmit} sx={{ mt: 4, p: { xs: 2, sm: 4 }, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                ¿Qué te pareció el producto?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comparte tu opinión con otros compradores.
            </Typography>
            
            <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="legend" fontWeight="500">Tu calificación:</Typography>
                <Rating
                    name="user-rating"
                    value={rating}
                    onChange={(event, newValue) => {
                        setRating(newValue);
                    }}
                    size="large"
                />
            </Box>
            
            <TextField
                label="Escribe tu opinión aquí"
                placeholder="Ej: Me encantó el diseño y la calidad del material. ¡Lo recomiendo totalmente!"
                multiline
                rows={5}
                fullWidth
                variant="outlined"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                margin="normal"
                sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                    size="large"
                    sx={{ mt: 2, px: 4, py: 1.5, borderRadius: '8px' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Opinión'}
                </Button>
            </Box>
        </Paper>
    );
};

export default ReviewForm;
