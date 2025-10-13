import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs, runTransaction, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Rating,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import ProductCard from '../components/ProductCard';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import ImageWithFallback from '../components/ImageWithFallback'; // Import the new component

function ProductDetail({ addToCart, wishlist, handleWishlist, isLoggedIn }) {
  const { productId } = useParams();
  const { currentUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Producto no encontrado");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Ocurrió un error al cargar el producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchReviewsAndRelated = async () => {
        if (!product) return;
        
        setReviewsLoading(true);
        try {
            const reviewsQuery = query(collection(db, `products/${productId}/reviews`), orderBy('createdAt', 'desc'));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
        setReviewsLoading(false);

        try {
            const relatedQuery = query(
                collection(db, "products"), 
                where('category', '==', product.category), 
                where('__name__', '!=', product.id),
                limit(4)
            );
            const relatedSnapshot = await getDocs(relatedQuery);
            setRelatedProducts(relatedSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        } catch (error) {
            console.error("Error fetching related products:", error);
        }
    }

    if (product) {
        fetchReviewsAndRelated();
    }
  }, [product, productId]);

  const handleReviewSubmit = async ({ rating, comment }) => {
      if (!currentUser) {
          toast.error("Debes iniciar sesión para dejar una opinión.");
          return;
      }

      const productRef = doc(db, "products", productId);
      const reviewRef = doc(collection(db, `products/${productId}/reviews`));

      try {
          await runTransaction(db, async (transaction) => {
              const productDoc = await transaction.get(productRef);
              if (!productDoc.exists()) {
                  throw "Product does not exist!";
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

              transaction.set(reviewRef, { 
                  userId: currentUser.uid,
                  userName: currentUser.displayName || 'Usuario Anónimo',
                  userAvatar: currentUser.photoURL,
                  rating,
                  comment,
                  createdAt: serverTimestamp()
              });
          });

          const newReview = { id: reviewRef.id, userId: currentUser.uid, userName: currentUser.displayName || 'Usuario Anónimo', userAvatar: currentUser.photoURL, rating, comment, createdAt: new Date() };
          setReviews([newReview, ...reviews]);
          setProduct(prev => ({
              ...prev,
              averageRating: (prev.averageRating * prev.numReviews + rating) / (prev.numReviews + 1),
              numReviews: prev.numReviews + 1
          }));

          toast.success("¡Gracias por tu opinión!");

      } catch (error) {
          console.error("Error submitting review: ", error);
          toast.error("No se pudo enviar tu opinión.");
      }
  };

  const isWishlisted = product && wishlist.has(product.id);
  const userHasReviewed = reviews.some(review => review.userId === currentUser?.uid);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ justifyContent: 'center' }}>{error}</Alert>
        <Button component={RouterLink} to="/products" variant="contained" sx={{ mt: 3 }}>Explorar Catálogo</Button>
      </Container>
    );
  }
  
  if (!product) return null;

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/">Inicio</Link>
        <Link underline="hover" color="inherit" component={RouterLink} to="/products">Productos</Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={{ xs: 2, md: 6 }}>
           <Grid item xs={12} md={6}>
             <Box sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ImageWithFallback 
                  src={product.images && product.images.length > 0 ? product.images[0] : ''} 
                  alt={product.name} 
                  style={{ width: '100%', height: 'auto', maxHeight: '550px', objectFit: 'cover', display: 'block' }} 
                />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>{product.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>Categoría: {product.category}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating name="read-only" value={product.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>({product.numReviews || 0} valoraciones)</Typography>
            </Box>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, flexGrow: 1 }}>{product.description}</Typography>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="500" sx={{ my: 2 }}>{`$${product.price.toLocaleString('es-CO')}`}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Button variant="contained" color="primary" size="large" sx={{ px: 6, py: 1.5, flexGrow: { xs: 1, md: 0 } }} onClick={() => addToCart(product)}>
                    Agregar al Carrito
                </Button>
                <IconButton onClick={() => handleWishlist(product)} aria-label="add to wishlist" sx={{ border: '1px solid', borderColor: 'grey.300', p: 1.5, borderRadius: '12px' }}>
                  {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 6 }} />

      {/* Reviews Section */}
      <Box>
          {reviewsLoading ? (
            <CircularProgress />
          ) : (
            <ReviewList reviews={reviews} />
          )}

          {isLoggedIn && !userHasReviewed && (
              <ReviewForm onSubmit={handleReviewSubmit} />
          )}
          {isLoggedIn && userHasReviewed && (
              <Alert severity="info" sx={{ mt: 4 }}>Ya has dejado una opinión para este producto.</Alert>
          )}
          {!isLoggedIn && (
              <Alert severity="warning" sx={{ mt: 4 }}>
                  <Link component={RouterLink} to={`/login?redirect=/product/${productId}`}>Inicia sesión</Link> para dejar tu opinión.
              </Alert>
          )}
      </Box>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>También te podría interesar</Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((relatedProduct) => (
              <Grid key={relatedProduct.id} item xs={12} sm={6} md={3}>
                <ProductCard
                  product={relatedProduct}
                  addToCart={addToCart}
                  handleWishlist={handleWishlist}
                  isInWishlist={wishlist.has(relatedProduct.id)}
                  isLoggedIn={isLoggedIn}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default ProductDetail;
