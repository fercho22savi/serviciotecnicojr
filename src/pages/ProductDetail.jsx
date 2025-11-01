import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import toast from 'react-hot-toast';
import {
  Container, Grid, Box, Typography, Button, Rating, Breadcrumbs, Link, Paper, Divider,
  IconButton, CircularProgress, Alert, TextField, Tabs, Tab
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";

import ProductCard from '../components/ProductCard';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import RatingSummary from '../components/RatingSummary';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: {xs: 2, md: 3} }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ProductDetail() {
  const { productId } = useParams();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, handleWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed(); // <-- CORREGIDO

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseCheckLoading, setPurchaseCheckLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          addProduct(productId); // <-- CORREGIDO
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
    window.scrollTo(0, 0);
  }, [productId, addProduct]);

  useEffect(() => {
    if (!product) return;

    const fetchReviewsAndRelated = async () => {
      setReviewsLoading(true);
      try {
        const reviewsQuery = query(collection(db, `products/${productId}/reviews`), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) { console.error("Error fetching reviews:", err); }
      setReviewsLoading(false);

      try {
        const relatedQuery = query(collection(db, "products"), where('category', '==', product.category), where('__name__', '!=', product.id), limit(4));
        const relatedSnapshot = await getDocs(relatedQuery);
        setRelatedProducts(relatedSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      } catch (err) { console.error("Error fetching related products:", err); }
    }

    const checkPurchaseStatus = async () => {
      if (!currentUser) {
          setPurchaseCheckLoading(false);
          return;
      }
      setPurchaseCheckLoading(true);
      try {
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(ordersQuery);
        const purchased = querySnapshot.docs.some(doc => doc.data().items.some(item => item.id === productId));
        setHasPurchased(purchased);
      } catch (err) { console.error("Error checking purchase status:", err); }
      finally { setPurchaseCheckLoading(false); }
    };

    fetchReviewsAndRelated();
    checkPurchaseStatus();

  }, [product, productId, currentUser]);

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!currentUser) return toast.error("Debes iniciar sesión para dejar una opinión.");
    if (!hasPurchased) return toast.error("Debes haber comprado este producto para dejar una reseña.");

    const reviewRef = doc(collection(db, `products/${productId}/reviews`));
    try {
        await setDoc(reviewRef, { 
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Anónimo',
            userAvatar: currentUser.photoURL,
            rating,
            comment,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
        toast.success("¡Gracias! Tu opinión está pendiente de aprobación.");
    } catch (err) {
        console.error("Error submitting review: ", err);
        toast.error("No se pudo enviar tu opinión.");
    }
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => {
        const newQuantity = prev + amount;
        if (newQuantity < 1) return 1;
        if (newQuantity > product.stock) return product.stock;
        return newQuantity;
    });
  };

  const handleAddToCart = () => {
      addToCart(product, quantity);
  }

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

  const images = product.images?.length > 0 
    ? product.images.map(img => ({ original: img, thumbnail: img }))
    : [{ original: 'https://via.placeholder.com/600x600.png?text=No+Image', thumbnail: 'https://via.placeholder.com/150x150.png?text=No+Image' }];

  const isWishlisted = wishlist.has(product.id);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/">Inicio</Link>
        <Link underline="hover" color="inherit" component={RouterLink} to="/products">Productos</Link>
        <Typography color="text.primary" sx={{maxWidth: '200px', overflow: 'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{product.name}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
           <Grid item xs={12} md={6}>
             <ImageGallery 
                items={images} 
                showNav={false}
                showPlayButton={false}
                showFullscreenButton={true}
                thumbnailPosition="bottom"
             />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>{product.name}</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor:'pointer' }} onClick={() => setTabValue(1)}>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, textDecoration: 'underline' }}>({product.numReviews || 0} valoraciones)</Typography>
            </Box>
            
            <Box sx={{ my: 2 }}>
                {product.originalPrice && product.originalPrice > product.price && (
                    <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through', mr: 1, display: 'inline' }}>
                        ${Number(product.originalPrice).toLocaleString('es-CO')}
                    </Typography>
                )}
                <Typography variant="h4" color="text.primary" sx={{ fontWeight: 'bold', display: 'inline' }}>
                    ${Number(product.price).toLocaleString('es-CO')}
                </Typography>
            </Box>

            <Typography variant="body1" paragraph sx={{ my: 2 }}>{product.shortDescription || ''}</Typography>

            <Divider sx={{ my: 2 }} />

            {/* Add to Cart Section */}
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight:'bold' }}>Cantidad:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton size="small" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><RemoveIcon /></IconButton>
                    <Typography sx={{ mx: 2, width: '40px', textAlign:'center', fontWeight:'bold'}}>{quantity}</Typography>
                    <IconButton size="small" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}><AddIcon /></IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ml: 2}}>{product.stock} disponibles</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large" 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        sx={{ flexGrow: 1, py: 1.5, fontWeight:'bold' }}
                    >
                        {product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                    </Button>
                    <IconButton onClick={() => handleWishlist(product)} aria-label="add to wishlist" sx={{ border: '1px solid', borderColor: 'grey.300', p: 1.5, borderRadius: 2 }}>
                        {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                </Box>
            </Box>

          </Grid>
        </Grid>
      </Paper>

      {/* Info Tabs */}
      <Box sx={{ width: '100%', mt: 6 }}>
        <Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="info tabs" centered>
                    <Tab label="Descripción" id="tab-0" />
                    <Tab label={`Opiniones (${product.numReviews || 0})`} id="tab-1" />
                </Tabs>
            </Box>
            <CustomTabPanel value={tabValue} index={0}>
                <Typography paragraph>{product.description || "No hay descripción detallada disponible."}</Typography>
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={1}>
                {reviewsLoading ? <CircularProgress /> :
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <RatingSummary 
                            reviews={reviews} 
                            averageRating={product.averageRating || 0} 
                            totalReviews={product.numReviews || 0} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ReviewList reviews={reviews} />
                    </Grid>
                    <Grid item xs={12}>
                        {purchaseCheckLoading ? <CircularProgress /> :
                          !currentUser ? <Alert severity="info"><Link component={RouterLink} to={`/login?redirect=/product/${productId}`}>Inicia sesión</Link> para dejar tu opinión.</Alert> :
                          userHasReviewed ? <Alert severity="success">Ya has dejado una opinión para este producto.</Alert> :
                          hasPurchased ? <ReviewForm onSubmit={handleReviewSubmit} /> :
                          <Alert severity="info">Debes haber comprado este producto para poder dejar una opinión.</Alert>
                        }
                    </Grid>
                </Grid>
                }
            </CustomTabPanel>
        </Paper>
      </Box>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>También te podría interesar</Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((p) => <Grid key={p.id} item xs={12} sm={6} md={3}><ProductCard product={p} /></Grid>)}
          </Grid>
        </Box>
      )}
    </Container>
    </Box>
  );
}

export default ProductDetail;
