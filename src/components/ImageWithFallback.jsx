import React, { useState } from 'react';

const Placeholder = ({ width, height }) => (
  <svg 
    width={width || '100%'} 
    height={height || '100%'} 
    viewBox="0 0 400 300" 
    xmlns="http://www.w3.org/2000/svg" 
    preserveAspectRatio="xMidYMid slice"
    style={{ 
        backgroundColor: '#E0E0E0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#9E9E9E' 
    }}
  >
    <text 
      x="50%" 
      y="50%" 
      dy=".3em" 
      textAnchor="middle" 
      fontSize="20" 
      fill="#9E9E9E"
      fontFamily="sans-serif"
    >
      Imagen no disponible
    </text>
  </svg>
);

const ImageWithFallback = ({ src, alt, ...props }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  // If src is invalid or error has occurred, show placeholder
  if (!src || error) {
    return <Placeholder {...props} />;
  }

  return <img src={src} alt={alt} onError={handleError} {...props} />;
};

export default ImageWithFallback;
