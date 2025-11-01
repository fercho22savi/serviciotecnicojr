import React from 'react';
import { Box, Typography, Rating, LinearProgress, Grid } from '@mui/material';

const RatingSummary = ({ reviews, averageRating, totalReviews }) => {
    if (totalReviews === 0) {
        return null; // Don't show summary if there are no reviews
    }

    const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 for 1-star, up to index 4 for 5-star
    reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++;
        }
    });
    
    // We calculate percentages from the reversed array to match the display order (5 to 1)
    const ratingPercentages = ratingCounts.map(count => (totalReviews > 0 ? (count / totalReviews) * 100 : 0));

    return (
        <Paper elevation={1} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '12px' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Análisis de Opiniones</Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" component="div" fontWeight="bold">{averageRating.toFixed(1)}</Typography>
                    <Rating value={averageRating} precision={0.1} readOnly size="large" />
                    <Typography color="text.secondary">Basado en {totalReviews} {totalReviews === 1 ? 'opinión' : 'opiniones'}</Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box sx={{ width: '100%' }}>
                        {[5, 4, 3, 2, 1].map((star, index) => (
                            <Box key={star} sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: '60px' }}>{star} estrellas</Typography>
                                <Box sx={{ width: '100%', mx: 2 }}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={ratingPercentages[4 - index]} 
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '30px', textAlign: 'right' }}>
                                    {`${Math.round(ratingPercentages[4 - index])}%`}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

// A quick fix for the Paper component not being defined.
import { Paper } from '@mui/material';

export default RatingSummary;