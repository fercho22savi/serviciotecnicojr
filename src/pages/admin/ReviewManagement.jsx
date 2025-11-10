import React, { useState, useEffect } from 'react';
import { collectionGroup, query, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Asegúrate de que esta ruta sea correcta
import { 
    Paper, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Chip, Select, MenuItem, FormControl, 
    InputLabel, Box, TablePagination, CircularProgress, Alert
} from '@mui/material';
import toast from 'react-hot-toast';

const StatusChip = ({ status }) => {
    let color;
    let label;
    switch (status) {
        case 'approved':
            color = 'success';
            label = 'Aprobado';
            break;
        case 'rejected':
            color = 'error';
            label = 'Rechazado';
            break;
        default:
            color = 'warning';
            label = 'Pendiente';
            break;
    }
    return <Chip label={label} color={color} size="small" />;
};

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const reviewsQuery = query(collectionGroup(db, 'reviews'));
            const querySnapshot = await getDocs(reviewsQuery);
            const reviewsData = querySnapshot.docs.map(doc => {
                const pathParts = doc.ref.path.split('/');
                // Path: products/{productId}/reviews/{reviewId}
                const productId = pathParts.length > 1 ? pathParts[1] : 'Desconocido';
                return {
                    id: doc.id,
                    ...doc.data(),
                    fullPath: doc.ref.path,
                    productId: productId, // Add the extracted product ID
                };
            });
            setReviews(reviewsData);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("No se pudieron cargar las reseñas.");
            toast.error("No se pudieron cargar las reseñas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleStatusChange = async (fullPath, newStatus) => {
        try {
            const reviewRef = doc(db, fullPath);
            await updateDoc(reviewRef, { status: newStatus });

            // Actualizar el estado localmente
            setReviews(prevReviews => 
                prevReviews.map(review => 
                    review.fullPath === fullPath ? { ...review, status: newStatus } : review
                )
            );
            toast.success('Estado de la reseña actualizado.');
        } catch (error) {
            console.error("Error updating review status:", error);
            toast.error('No se pudo actualizar el estado de la reseña.');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const paginatedReviews = reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Gestión de Reseñas</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Producto</TableCell>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Calificación</TableCell>
                            <TableCell>Comentario</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedReviews.map((review) => (
                            <TableRow key={review.id}>
                                <TableCell sx={{wordBreak: 'break-all'}}>{review.productId}</TableCell>
                                <TableCell>{review.userName}</TableCell>
                                <TableCell>{review.rating}</TableCell>
                                <TableCell>{review.comment}</TableCell>
                                <TableCell>{review.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <StatusChip status={review.status} />
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small" sx={{minWidth: 120}}>
                                        <Select
                                            value={review.status || 'pending'}
                                            onChange={(e) => handleStatusChange(review.fullPath, e.target.value)}
                                        >
                                            <MenuItem value="pending">Pendiente</MenuItem>
                                            <MenuItem value="approved">Aprobar</MenuItem>
                                            <MenuItem value="rejected">Rechazar</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={reviews.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default ReviewManagement;
