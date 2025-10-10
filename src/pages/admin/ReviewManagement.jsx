import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db as firestore } from '../../firebase/config';
import { 
    Container, Typography, Box, Paper, CircularProgress, Chip, IconButton, 
    List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-hot-toast';

const getStatusChipColor = (status) => {
    switch (status) {
        case 'Pendiente': return 'warning';
        case 'Aprobada': return 'success';
        case 'Rechazada': return 'error';
        default: return 'default';
    }
};

function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pendiente'); // Default filter to Pending

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const reviewsQuery = query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsList);
    } catch (error) {
      console.error("Error fetching reviews: ", error);
      toast.error("Error al cargar las reseñas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    const originalReviews = [...reviews];
    // Optimistic UI update
    setReviews(prevReviews => prevReviews.map(r => r.id === reviewId ? { ...r, status: newStatus } : r));

    try {
      const reviewRef = doc(firestore, 'reviews', reviewId);
      await updateDoc(reviewRef, { status: newStatus });
      toast.success(`Reseña ${newStatus.toLowerCase()}.`);
    } catch (error) {
      console.error("Error updating review status: ", error);
      toast.error("Error al actualizar la reseña.");
      // Rollback on error
      setReviews(originalReviews);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredReviews = reviews.filter(review => review.status === filter);

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Moderación de Reseñas
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange} aria-label="filtro de estado">
          <ToggleButton value="Pendiente" aria-label="pendientes">Pendientes</ToggleButton>
          <ToggleButton value="Aprobada" aria-label="aprobadas">Aprobadas</ToggleButton>
          <ToggleButton value="Rechazada" aria-label="rechazadas">Rechazadas</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={2}>
          <List sx={{ p: 0 }}>
            {filteredReviews.length > 0 ? filteredReviews.map((review, index) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start" sx={{ p: 2 }}>
                  <ListItemAvatar>
                    <Avatar alt={review.userName} src={review.userPhotoURL} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<span><b>{review.userName}</b> comentó sobre el producto <b>{review.productId}</b></span>}
                    secondary={
                      <span>
                        <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.primary">
                          {"\u2605".repeat(review.rating)}{"\u2606".repeat(5 - review.rating)}
                        </Typography>
                        {review.comment}
                      </span>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                    <Chip label={review.status} color={getStatusChipColor(review.status)} sx={{ mb: { xs: 1, sm: 0 }, mr: { sm: 2 } }} />
                    {review.status === 'Pendiente' && (
                      <Box>
                        <IconButton color="success" onClick={() => handleUpdateStatus(review.id, 'Aprobada')}>
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleUpdateStatus(review.id, 'Rechazada')}>
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </ListItem>
                {index < filteredReviews.length - 1 && <Divider component="li" />}
              </React.Fragment>
            )) : (
                <Typography sx={{textAlign: 'center', p: 4}}>No hay reseñas en estado "{filter}".</Typography>
            )}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default ReviewManagement;
