import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import {
    Box, Typography, Avatar, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminDashboard from '../components/AdminDashboard';

const StyledPaper = styled(Paper)(({ theme }) => ({ padding: theme.spacing(3), borderRadius: theme.shape.borderRadius * 2 }));

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [viewedUser, setViewedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [adminTabIndex, setAdminTabIndex] = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const fetchData = useCallback(async (type) => {
        if (type !== 'allProducts') return;
        setLoadingData(true);
        try {
            const querySnapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
            setAllProducts(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            setError(`Error cargando productos: ${err.message}`);
        }
        setLoadingData(false);
    }, []);

    useEffect(() => {
        getDoc(doc(db, 'users', userId)).then(userDoc => {
            if (userDoc.exists()) setViewedUser({ id: userDoc.id, ...userDoc.data() });
            else setError('Usuario no encontrado.');
            setLoading(false);
        }).catch(err => {
            setError(`Error al cargar el perfil: ${err.message}`);
            setLoading(false);
        });
    }, [userId]);

    useEffect(() => {
        if (tabIndex === 2 && currentUser?.role === 'admin') {
            if (adminTabIndex === 1) {
                fetchData('allProducts');
            }
        }
    }, [tabIndex, adminTabIndex, currentUser, fetchData]);

    const handleAddProduct = () => navigate('/product-form');
    const handleEditProduct = (id) => navigate(`/product-form/${id}`);
    const handleDeleteProduct = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await deleteDoc(doc(db, "products", id));
                setAllProducts(prev => prev.filter(p => p.id !== id));
            } catch (err) {
                setError(`Error al eliminar el producto: ${err.message}`);
            }
        }
    };
    
    if (loading) return <CircularProgress />

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <StyledPaper>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tab label="Historial de Pedidos" />
                    <Tab label="Mi Perfil" />
                    {viewedUser?.role === 'admin' && currentUser.uid === userId && <Tab label="Panel de Admin" />}
                </Tabs>

                {tabIndex === 2 && (
                    <Box>
                        <Tabs value={adminTabIndex} onChange={(e, val) => setAdminTabIndex(val)} variant="fullWidth">
                            <Tab label="Dashboard" />
                            <Tab label="Productos" />
                        </Tabs>

                        {adminTabIndex === 0 && (
                            <AdminDashboard />
                        )}

                        {adminTabIndex === 1 && (
                            <Box sx={{p: 2}}>{loadingData ? <CircularProgress /> : <>
                                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2}}>
                                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAddProduct}>Añadir Producto</Button>
                                </Box>
                                <TableContainer component={Paper}><Table>
                                    <TableHead><TableRow><TableCell>Producto</TableCell><TableCell>Categoría</TableCell><TableCell>Precio</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
                                    <TableBody>{allProducts.map(p => (
                                        <TableRow key={p.id} hover>
                                            <TableCell><Box sx={{display: 'flex', alignItems: 'center'}}><Avatar src={p.imageUrl} variant="rounded" sx={{mr: 2}}/>{p.name}</Box></TableCell>
                                            <TableCell>{p.category}</TableCell>
                                            <TableCell>${p.price ? p.price.toFixed(2) : '0.00'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton color="primary" onClick={() => handleEditProduct(p.id)}><EditIcon/></IconButton>
                                                <IconButton color="error" onClick={() => handleDeleteProduct(p.id)}><DeleteIcon/></IconButton>
                                            </TableCell>
                                        </TableRow>))}
                                    </TableBody>
                                </Table></TableContainer>
                            </>}</Box>
                        )}
                    </Box>
                )}
            </StyledPaper>
        </Box>
    );
}

export default UserProfile;
