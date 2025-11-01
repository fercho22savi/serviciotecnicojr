import React from 'react';
import { Box, Typography, Paper, Avatar, Rating, Grid } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <Box sx={{ mt: 4, p: 4, textAlign: 'center', backgroundColor: 'grey.50', borderRadius: 2 }}>
                 <Typography variant="h6" gutterBottom>
                    Aún no hay opiniones
                </Typography>
                <Typography color="text.secondary">
                    ¡Sé el primero en compartir tu experiencia con este producto!
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Opiniones de Clientes
            </Typography>
            <Grid container spacing={3}>
                {reviews.map((review) => (
                    <Grid item xs={12} key={review.id}>
                        <Paper elevation={1} sx={{ p: 3, borderRadius: '12px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs="auto">
                                    <Avatar alt={review.userName} src={review.userAvatar || '/'} sx={{ width: 48, height: 48 }} />
                                </Grid>
                                <Grid item xs>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{review.userName}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {review.createdAt?.toDate ? 
                                                formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true, locale: es }) : 
                                                'Justo ahora'}
                                        </Typography>
                                    </Box>
                                    <Rating value={review.rating} readOnly size="small" sx={{ my: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {review.comment}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ReviewList;
