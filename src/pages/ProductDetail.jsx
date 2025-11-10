
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, handleWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  const fetchReviews = async () => {
    if (!productId) return;
    setReviewsLoading(true);
    try {
      // This query requires a composite index. The link to create it is in the browser's console log.
      const reviewsQuery = query(
        collection(db, `products/${productId}/reviews`),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const approvedReviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(approvedReviews);
    } catch (err) { 
      console.error("Error fetching reviews:", err); 
      // The error message in the console contains the link to create the index.
      toast.error("No se pudieron cargar las opiniones. Es posible que falte una configuración en la base de datos.");
    } finally {
      setReviewsLoading(false);
    }
  };

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
          addProduct(productId);
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
    fetchReviews(); // Fetch reviews initially
    window.scrollTo(0, 0);
  }, [productId, addProduct]);

  useEffect(() => {
    if (!product) return;

    const fetchRelatedProducts = async () => {
      try {
        if (product.category) {
            const relatedQuery = query(collection(db, "products"), where('category', '==', product.category), where('__name__', '!=', product.id), limit(4));
            const relatedSnapshot = await getDocs(relatedQuery);
            setRelatedProducts(relatedSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        }
      } catch (err) { console.error("Error fetching related products:", err); }
    }

    fetchRelatedProducts();

  }, [product, currentUser]);

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!currentUser) return toast.error("Debes iniciar sesión para dejar una opinión.");

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
        toast.success("¡Gracias por tu opinión! Será revisada por un administrador antes de ser publicada.");
        // No need to re-fetch reviews, the user won't see the pending one anyway.
    } catch (err) { 
        console.error("Error submitting review: ", err);
        toast.error("No se pudo enviar tu opinión.");
    }
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => {
        const newQuantity = prev + amount;
        if (newQuantity < 1) return 1;
        if (newQuantity > (product.stock || 0)) return product.stock || 1;
        return newQuantity;
    });
  };

  const handleAddToCart = () => {
      addToCart(product, quantity);
  }

  // Check if the user has already submitted a review that is either pending or approved.
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  useEffect(() => {
    const checkUserReview = async () => {
        if (!currentUser) return;

        const reviewsRef = collection(db, `products/${productId}/reviews`);
        const q = query(reviewsRef, where('userId', '==', currentUser.uid));
        
        const querySnapshot = await getDocs(q);
        
        // Check if any review from this user exists, regardless of status.
        if (!querySnapshot.empty) {
            setUserHasReviewed(true);
        }
    };

    checkUserReview();
  }, [currentUser, productId]);

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

  let imagesForGallery = [];
  const placeholderImage = 'https://via.placeholder.com/600x600.png?text=Imagen+no+disponible';
  const placeholderThumbnail = 'https://via.placeholder.com/150x150.png?text=No+Img';

  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    imagesForGallery = product.images.map(img => ({ original: img, thumbnail: img }));
  } else if (product.image && typeof product.image === 'string') {
    imagesForGallery = [{ original: product.image, thumbnail: product.image }];
  } else {
    imagesForGallery = [{ original: placeholderImage, thumbnail: placeholderThumbnail }];
  }

  const isWishlisted = wishlist.has(product.id);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
            startIcon={<ArrowBackIosNewIcon />} 
            onClick={() => navigate(-1)} 
            sx={{ mb: 3, fontWeight: 'bold' }}
        >
            Volver
        </Button>

      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/">Inicio</Link>
        <Link underline="hover" color="inherit" component={RouterLink} to="/products">Productos</Link>
        <Typography color="text.primary" sx={{maxWidth: '200px', overflow: 'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{product.name}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
           <Grid item xs={12} md={6}>
             <ImageGallery 
                items={imagesForGallery} 
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
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, textDecoration: 'underline' }}>({reviews.length} valoraciones)</Typography>
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
                    <IconButton size="small" onClick={() => handleQuantityChange(1)} disabled={quantity >= (product.stock || 1)}><AddIcon /></IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ml: 2}}>{product.stock || 0} disponibles</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large" 
                        onClick={handleAddToCart}
                        disabled={!product.stock || product.stock === 0}
                        sx={{ flexGrow: 1, py: 1.5, fontWeight:'bold' }}
                    >
                        {!product.stock || product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
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
                    <Tab label={`Opiniones (${reviews.length})`} id="tab-1" />
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
                            totalReviews={reviews.length} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ReviewList reviews={reviews} />
                    </Grid>
                    <Grid item xs={12}>
                        {
                          !currentUser ? <Alert severity="info"><Link component={RouterLink} to={`/login?redirect=/product/${productId}`}>Inicia sesión</Link> para dejar tu opinión.</Alert> :
                          userHasReviewed ? <Alert severity="success">Ya has dejado una opinión para este producto.</Alert> :
                          <ReviewForm onSubmit={handleReviewSubmit} />
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
