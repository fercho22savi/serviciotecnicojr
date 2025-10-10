import React from 'react';
import Slider from 'react-slick';
import { Box, Typography } from '@mui/material';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Carousel({ products }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Slider {...settings}>
        {products.slice(0, 3).map((product) => (
          <Box key={product.id} sx={{ position: 'relative' }}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
              }}
              alt={product.name}
              src={product.image}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: '20px',
              }}
            >
              <Typography variant="h4">{product.name}</Typography>
              <Typography>{product.description}</Typography>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}

export default Carousel;
