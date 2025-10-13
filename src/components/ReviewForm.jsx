import React, { useState } from 'react';
import { Box, Typography, Rating, TextField, Button, CircularProgress } from '@mui/material';
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
        if (comment.trim() === '') {
            toast.error('Por favor, escribe un comentario.');
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
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Escribe tu opinión
            </Typography>
            <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
                <Typography component="legend" sx={{ mr: 2 }}>Tu Calificación:</Typography>
                <Rating
                    name="user-rating"
                    value={rating}
                    onChange={(event, newValue) => {
                        setRating(newValue);
                    }}
                />
            </Box>
            <TextField
                label="Tu comentario"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                margin="normal"
            />
            <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Enviar Opinión'}
            </Button>
        </Box>
    );
};

export default ReviewForm;
