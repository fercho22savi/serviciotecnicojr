import React, { useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { deepOrange, deepPurple, green, blue } from '@mui/material/colors';
import ProductCard from '../components/ProductCard';

const mockReviewsData = [
  {
    id: 1, name: 'Carlos S.', rating: 5, comment: '¡Absolutamente increíble! La calidad superó mis expectativas. El envío fue rápido y el producto llegó en perfectas condiciones.',
    avatarColor: deepOrange[500]
  },
  {
    id: 2, name: 'Ana G.', rating: 4, comment: 'Muy buen producto, tal como se describe. Es resistente y se ve genial en mi sala. Le doy 4 estrellas porque la caja llegó un poco dañada.',
    avatarColor: deepPurple[500]
  },
  {
    id: 3, name: 'Luis F.', rating: 5, comment: 'Una pieza central fantástica para mi comedor. He recibido muchos cumplidos de mis amigos. ¡Totalmente recomendado!',
    avatarColor: green[500]
  },
  {
    id: 4, name: 'María P.', rating: 3, comment: 'El color es un poco diferente a como se veía en la foto, pero sigue siendo un buen artículo. El montaje fue sencillo.',
    avatarColor: blue[500]
  },
];

const getReviewsForProduct = () => {
  return [...mockReviewsData].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
}

function ProductDetail({ product: productProp, products, addToCart, wishlist, handleWishlist }) {
  const { productId } = useParams();
  const product = productProp || products.find(p => p.id === parseInt(productId));

  const isWishlisted = product && wishlist.has(product.id);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reviews = useMemo(() => getReviewsForProduct(), [productId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4">Producto no encontrado</Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
          Volver a la Tienda
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/">Inicio</Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={{ xs: 2, md: 6 }}>
          <Grid item xs={12} md={6}>
             <Box sx={{ 
              borderRadius: 2, 
              overflow: 'hidden', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '550px',
                  objectFit: 'cover',
                  display: 'block'
                }} 
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              Categoría: {product.category}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating name="read-only" value={product.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.reviewCount || reviews.length} valoraciones)
              </Typography>
            </Box>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, flexGrow: 1 }}>
              {product.description}
            </Typography>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="500" sx={{ my: 2 }}>
                  ${product.price.toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    sx={{ px: 6, py: 1.5, flexGrow: { xs: 1, md: 0 } }}
                    onClick={() => addToCart(product)}
                >
                    Agregar al Carrito
                </Button>
                <IconButton
                  onClick={() => handleWishlist(product.id)}
                  aria-label="add to wishlist"
                  sx={{ border: '1px solid', borderColor: 'grey.300', p: 1.5, borderRadius: '12px' }}
                >
                  {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          Opiniones de Clientes ({reviews.length})
        </Typography>
        <Paper elevation={2} sx={{p: {xs: 1, md: 2}}}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {reviews.map((review, index) => (
                <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                    <Avatar sx={{ bgcolor: review.avatarColor }}>{review.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                    primary={
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 0.5}}>
                             <Typography component="span" fontWeight="bold" sx={{mr: 1}}>{review.name}</Typography>
                            <Rating value={review.rating} readOnly size="small"/>
                        </Box>
                    }
                    secondary={
                        <Typography variant="body2" color="text.secondary">
                            {review.comment}
                        </Typography>
                    }
                    />
                </ListItem>
                {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
            ))}
            </List>
        </Paper>
      </Box>

      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            También te podría interesar
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((relatedProduct) => (
              <Grid item key={relatedProduct.id} xs={12} sm={3} md={3} lg={3} sx={{ display: 'flex' }}>
                <ProductCard
                  product={relatedProduct}
                  addToCart={addToCart}
                  handleWishlist={handleWishlist}
                  wishlist={wishlist}
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
