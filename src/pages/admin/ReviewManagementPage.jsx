import React, { useState, useEffect } from 'react';
import { collectionGroup, query, where, getDocs, doc, writeBatch, runTransaction } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Box,
  Alert,
  Rating
} from '@mui/material';
import toast from 'react-hot-toast';

const ReviewManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  const fetchPendingReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const reviewsQuery = query(collectionGroup(db, 'reviews'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(reviewsQuery);
      const pendingReviews = querySnapshot.docs.map(doc => {
          const pathParts = doc.ref.path.split('/');
          const productId = pathParts[pathParts.length - 3];
          return { id: doc.id, productId, ...doc.data() };
      });
      setReviews(pendingReviews);
    } catch (err) {
      console.error("Error fetching pending reviews:", err);
      setError("No se pudieron cargar las reseñas pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleApprove = async (reviewId, productId, rating) => {
    setUpdating(prev => ({ ...prev, [reviewId]: true }));
    
    const reviewRef = doc(db, `products/${productId}/reviews`, reviewId);
    const productRef = doc(db, `products`, productId);

    try {
        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw new Error("¡El producto no existe!");
            }

            const currentData = productDoc.data();
            const currentRating = currentData.averageRating || 0;
            const currentNumReviews = currentData.numReviews || 0;

            const newNumReviews = currentNumReviews + 1;
            const newAverageRating = (currentRating * currentNumReviews + rating) / newNumReviews;
            
            transaction.update(productRef, { 
                averageRating: newAverageRating,
                numReviews: newNumReviews 
            });
            
            transaction.update(reviewRef, { status: 'approved' });
        });

        setReviews(prev => prev.filter(r => r.id !== reviewId));
        toast.success('Reseña aprobada y publicada.');
    } catch (error) {
        console.error("Error approving review:", error);
        toast.error(`Error al aprobar la reseña: ${error.message}`);
    } finally {
        setUpdating(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleReject = async (reviewId, productId) => {
    setUpdating(prev => ({ ...prev, [reviewId]: true }));
    try {
      const reviewRef = doc(db, `products/${productId}/reviews`, reviewId);
      await deleteDoc(reviewRef);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Reseña rechazada y eliminada.');
    } catch (error) {
      console.error("Error rejecting review:", error);
      toast.error('Error al rechazar la reseña.');
    } finally {
      setUpdating(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Gestión de Reseñas</Typography>
      {reviews.length === 0 ? (
        <Alert severity="info">No hay reseñas pendientes de aprobación.</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto ID</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Comentario</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.productId}</TableCell>
                    <TableCell>{review.userName}</TableCell>
                    <TableCell><Rating value={review.rating} readOnly /></TableCell>
                    <TableCell>{review.comment}</TableCell>
                    <TableCell align="right">
                      {updating[review.id] ? <CircularProgress size={24} /> : (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button variant="contained" color="success" size="small" onClick={() => handleApprove(review.id, review.productId, review.rating)}>Aprobar</Button>
                          <Button variant="contained" color="error" size="small" onClick={() => handleReject(review.id, review.productId)}>Rechazar</Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default ReviewManagementPage;
