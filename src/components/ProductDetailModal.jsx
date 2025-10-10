import React from 'react';
import { Modal, Box, IconButton, Fade, Backdrop } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ProductDetail from '../pages/ProductDetail';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '1200px',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

function ProductDetailModal({ open, handleClose, product, products, addToCart, wishlist, handleWishlist }) {
  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <ProductDetail 
            product={product}
            products={products}
            addToCart={addToCart}
            wishlist={wishlist}
            handleWishlist={handleWishlist}
          />
        </Box>
      </Fade>
    </Modal>
  );
}

export default ProductDetailModal;
