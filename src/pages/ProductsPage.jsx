import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress, Pagination, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ProductsPage = () => {
    // --- LOCAL STATE FOR FILTERING ---
    const [priceRange, setPriceRange] = useState([0, 5000000]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [maxPrice, setMaxPrice] = useState(5000000); 

    // --- CONTEXT VALUES ---
    const { currentUser } = useAuth();
    const { addToCart } = useCart();
    const { wishlist, handleWishlist } = useWishlist();

    // --- COMPONENT STATE ---
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(9);
    const searchParams = useQuery();
    const selectedCategory = searchParams.get('category');
    const searchTerm = searchParams.get('q') || '';

    // 1. Fetch ALL products and determine max price
    useEffect(() => {
        const fetchProductsAndPrice = async () => {
            setLoading(true);
            try {
                const productsQuery = query(collection(db, "products"), orderBy("name"));
                const querySnapshot = await getDocs(productsQuery);
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllProducts(productsData);

                const prices = productsData.map(p => p.price || 0);
                const max = Math.max(...prices);
                if (max > 0) {
                    setMaxPrice(max);
                    setPriceRange([0, max]);
                }

            } catch (error) {
                console.error("Error fetching products: ", error);
                toast.error("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductsAndPrice();
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
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
            if (inStockOnly && product.stock <= 0) return false;
            return true;
        });
    }, [allProducts, searchTerm, selectedCategory, priceRange, inStockOnly]);


    // 3. Paginate the filtered results
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, productsPerPage]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    const handleProductsPerPageChange = (event) => {
        setProductsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1); // Reset to page 1 when changing products per page
    };

    return (
        <Container sx={{ py: 4 }} maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                  {selectedCategory ? selectedCategory : (searchTerm ? `Resultados para "${searchTerm}"` : 'Catálogo de Productos')}
              </Typography>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Productos por página</InputLabel>
                  <Select
                      value={productsPerPage}
                      onChange={handleProductsPerPageChange}
                      label="Productos por página"
                  >
                      <MenuItem value={9}>9</MenuItem>
                      <MenuItem value={18}>18</MenuItem>
                      <MenuItem value={30}>30</MenuItem>
                  </Select>
              </FormControl>
            </Box>
            
            <Grid container spacing={4}>
                {/* --- Filter Sidebar --- */}
                <Grid item xs={12} md={3}>
                    <FilterSidebar 
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        inStockOnly={inStockOnly}
                        onInStockChange={setInStockOnly}
                        maxPrice={maxPrice}
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
                            {filteredProducts.length > productsPerPage && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                                    <Pagination 
                                        count={Math.ceil(filteredProducts.length / productsPerPage)}
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
