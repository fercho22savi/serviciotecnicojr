import React from 'react';
import { Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Logo = () => {
  return (
    <Typography 
      variant="h4" 
      component={RouterLink} 
      to="/" 
      sx={{ 
        color: 'inherit', 
        textDecoration: 'none', 
        fontWeight: 'bold',
        letterSpacing: '1.5px' 
      }}
    >
      TECNO
      <span style={{ color: '#90CAF9' }}>JR</span>
    </Typography>
  );
};

export default Logo;
