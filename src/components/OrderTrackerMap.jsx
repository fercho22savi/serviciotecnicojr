import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '200px'
};

const OrderTrackerMap = ({ apiKey, userLocation }) => {
  const defaultCenter = { lat: -34.397, lng: 150.644 }; // Default location

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={15}
      >
        {userLocation && <Marker position={userLocation} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default OrderTrackerMap;
