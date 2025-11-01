import React from 'react';
import { Box, Rating as MuiRating, Typography } from '@mui/material';

const Rating = ({ value, text, color = '#faaf00' }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <MuiRating value={value} readOnly precision={0.5} sx={{ color }} />
      <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
        {text && text}
      </Typography>
    </Box>
  );
};

export default Rating;
