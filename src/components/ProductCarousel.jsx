import React from 'react';
import { Box, Typography } from '@mui/material';
import Slider from 'react-slick';
import ProductCard from './ProductCard';

// Import slick-carousel styles if not already globally available
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductCarousel = ({ title, products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        {title}
      </Typography>
      <Slider {...sliderSettings}>
        {products.map((product) => (
          <Box key={product.id} sx={{ p: 1.5 }}>
            <ProductCard product={product} />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default ProductCarousel;
