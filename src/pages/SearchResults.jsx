import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Container, Typography, Grid, CircularProgress, Box, Alert } from '@mui/material';
import ProductCard from '../components/ProductCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = ({ addToCart, handleWishlist, wishlist, isLoggedIn }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const queryParams = useQuery();
    const searchTerm = queryParams.get('q');

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchTerm) {
                setSearchResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const productsRef = collection(db, 'products');
                
                // Firestore does not support full-text search on its own.
                // This is a simple workaround to search for products where the name starts with the search term.
                // For a more robust solution, a third-party search service like Algolia is recommended.
                const q = query(productsRef, 
                    where('name', '>=', searchTerm),
                    where('name', '<=', searchTerm + '\uf8ff')
                );

                const querySnapshot = await getDocs(q);
                const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSearchResults(results);

            } catch (err) {
                console.error("Error fetching search results:", err);
                setError("Ocurrió un error al realizar la búsqueda.");
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchTerm]);

    return (
        <Container sx={{ py: 8 }} maxWidth="lg">
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Resultados de Búsqueda
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
            ) : (
                <Box>
                    <Typography variant="h6" component="p" sx={{ mb: 4 }}>
                        {searchResults.length} {searchResults.length === 1 ? 'resultado para' : 'resultados para'} <Box component="span" sx={{ fontWeight: 'bold' }}>"{searchTerm}"</Box>
                    </Typography>
                    
                    {searchResults.length > 0 ? (
                        <Grid container spacing={4}>
                            {searchResults.map(product => (
                                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                                    <ProductCard
                                        product={product}
                                        addToCart={addToCart}
                                        handleWishlist={handleWishlist}
                                        isInWishlist={wishlist.has(product.id)}
                                        isLoggedIn={isLoggedIn}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info" sx={{ mt: 4 }}>
                            No se encontraron productos que coincidan con tu búsqueda. Prueba con otros términos.
                        </Alert>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default SearchResults;
