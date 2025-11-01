import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress, Pagination, Stack } from '@mui/material';
import { SentimentVeryDissatisfied } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

// --- CONTEXT HOOKS ---
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const PRODUCTS_PER_PAGE = 9;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ProductsPage = () => {
    // --- STATE FROM PARENT (MainLayout) ---
    const { 
        searchTerm, 
        priceRange, 
        setPriceRange, 
        inStockOnly, 
        setInStockOnly,
        maxPrice
    } = useOutletContext();

    // --- CONTEXT VALUES ---
    const { currentUser } = useAuth();
    const { addToCart } = useCart();
    const { wishlist, handleWishlist } = useWishlist();

    // --- COMPONENT STATE ---
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const searchParams = useQuery();
    const selectedCategory = searchParams.get('category');

    // 1. Fetch ALL products from Firestore on component mount
    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            try {
                const productsQuery = query(collection(db, "products"), orderBy("name"));
                const querySnapshot = await getDocs(productsQuery);
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllProducts(productsData);
            } catch (error) {
                console.error("Error fetching all products: ", error);
                toast.error("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    // 2. Memoize filtered products for performance
    const filteredProducts = useMemo(() => {
        setCurrentPage(1); // Reset to page 1 whenever filters change
        return allProducts.filter(product => {
            if (selectedCategory && product.category !== selectedCategory) return false;
            if (searchTerm) {
                const searchableText = `${product.name} ${product.description}`.toLowerCase();
                if (!searchableText.includes(searchTerm.toLowerCase())) return false;
            }
            // This check is now safe because priceRange is initialized in MainLayout
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
            if (inStockOnly && product.stock <= 0) return false;
            return true;
        });
    }, [allProducts, searchTerm, selectedCategory, priceRange, inStockOnly]);


    // 3. Paginate the filtered results
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    return (
        <Container sx={{ py: 4 }} maxWidth="xl">
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                {selectedCategory ? selectedCategory : 'Catálogo de Productos'}
            </Typography>
            
            <Grid container spacing={4}>
                {/* --- Filter Sidebar --- */}
                <Grid item xs={12} md={3}>
                    <FilterSidebar 
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        inStockOnly={inStockOnly}
                        onInStockChange={setInStockOnly}
                        maxPrice={maxPrice} // Pass the maxPrice from MainLayout
                    />
                </Grid>

                {/* --- Products Grid --- */}
                <Grid item xs={12} md={9}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
                    ) : filteredProducts.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary', p: 3 }}>
                            <SentimentVeryDissatisfied sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6">No se encontraron productos</Typography>
                            <Typography>Intenta ajustar los filtros o la búsqueda.</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={4}>
                            <Grid container spacing={3}>
                                {paginatedProducts.map((product) => (
                                    <Grid key={product.id} item xs={12} sm={6} md={4} lg={4}>
                                        <ProductCard 
                                            product={product} 
                                            addToCart={addToCart}
                                            handleWishlist={handleWishlist} 
                                            isInWishlist={wishlist.has(product.id)}
                                            isLoggedIn={!!currentUser}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            {filteredProducts.length > PRODUCTS_PER_PAGE && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                                    <Pagination 
                                        count={Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                    />
                                </Box>
                            )}
                        </Stack>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductsPage;
