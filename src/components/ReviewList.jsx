import React from 'react';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Rating, Divider } from '@mui/material';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <Typography sx={{ mt: 3, fontStyle: 'italic' }}>
                Todavía no hay reseñas para este producto. ¡Sé el primero en dejar una!
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Opiniones de Clientes
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {reviews.map((review, index) => (
                    <React.Fragment key={review.id || index}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar alt={review.userName} src={review.userAvatar || '/'} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography sx={{ fontWeight: 'bold', mr: 1 }}>{review.userName}</Typography>
                                        <Rating value={review.rating} readOnly size="small" />
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        {review.comment}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default ReviewList;
