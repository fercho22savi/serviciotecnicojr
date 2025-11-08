
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link as RouterLink } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ProductCarousel from '../components/ProductCarousel';
import RecentlyViewedProducts from '../components/RecentlyViewedProducts'; // Import the new component
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  const [newProducts, setNewProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest products
        const newProductsQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const newProductsSnapshot = await getDocs(newProductsQuery);
        setNewProducts(newProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch popular products (by averageRating)
        const popularProductsQuery = query(
          collection(db, 'products'),
          orderBy('averageRating', 'desc'),
          limit(10)
        );
        const popularProductsSnapshot = await getDocs(popularProductsQuery);
        setPopularProducts(popularProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch categories
        const categoriesQuery = query(collection(db, 'categories'), limit(6));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError('No se pudieron cargar los datos de la página de inicio. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ py: 4, textAlign: 'center' }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <HeroSection />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        
        {/* Categories Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            {t('home_page.explore_categories_title')}
          </Typography>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category.id}>
                  <Paper 
                    component={RouterLink} 
                    to={`/products?category=${category.name}`}
                    elevation={0}
                    sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: 'background.paper',
                        textDecoration: 'none',
                        display: 'block',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: (theme) => theme.shadows[4]
                        }
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="600">{category.name}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* New Products Carousel */}
        <ProductCarousel title={t('home_page.new_arrivals_title')} products={newProducts} />

        {/* Popular Products Carousel */}
        <ProductCarousel title={t('home_page.most_popular_title')} products={popularProducts} />

        {/* Recently Viewed Products Section */}
        <RecentlyViewedProducts />

      </Container>
    </Box>
  );
}

export default HomePage;
