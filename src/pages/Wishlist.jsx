import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Grid, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { FavoriteBorder } from '@mui/icons-material';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';

import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const { currentUser } = useAuth();
    const { wishlist, loading: wishlistLoading } = useWishlist();
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (!currentUser || wishlist.size === 0) {
                setProducts([]);
                setProductsLoading(false);
                return;
            }

            setProductsLoading(true);
            try {
                const productIds = Array.from(wishlist);
                const productsRef = collection(db, 'products');
                // Firestore 'in' query supports up to 10 items. For more, multiple queries would be needed.
                const q = query(productsRef, where(documentId(), 'in', productIds));
                const querySnapshot = await getDocs(q);
                const wishlistProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(wishlistProducts);
            } catch (error) {
                console.error("Error fetching wishlist products: ", error);
                toast.error("Failed to load wishlist items.");
            }
            setProductsLoading(false);
        };

        // We only fetch products if the initial wishlist loading is done.
        if (!wishlistLoading) {
            fetchWishlistProducts();
        }

    }, [wishlist, currentUser, wishlistLoading]);

    const isLoading = wishlistLoading || productsLoading;

    // User not logged in
    if (!currentUser) {
        return (
            <Box sx={{ textAlign: 'center', mt: 8, p: 4 }}>
                <FavoriteBorder sx={{ fontSize: 80, color: 'grey.400' }} />
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Inicia sesión para ver tu lista de deseos
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Guarda tus productos favoritos para no perderlos de vista.
                </Typography>
                <Button component={RouterLink} to="/login" variant="contained">
                    Iniciar Sesión
                </Button>
            </Box>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                Mi Lista de Deseos
            </Typography>
            
            {products.length > 0 ? (
                <Grid container spacing={3}>
                    {products.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                // Wishlist is empty
                <Box sx={{ textAlign: 'center', mt: 8, p: 4, border: '2px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                    <FavoriteBorder sx={{ fontSize: 80, color: 'grey.400' }} />
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                        Tu lista de deseos está vacía
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Explora el catálogo y pulsa el corazón para guardar tus productos favoritos.
                    </Typography>
                    <Button component={RouterLink} to="/products" variant="contained">
                        Buscar Productos
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default WishlistPage;
