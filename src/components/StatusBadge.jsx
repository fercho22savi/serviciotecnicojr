import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const statusStyles = {
  'En proceso': { backgroundColor: '#ffc107', color: '#000' },    // yellow
  'Processing': { backgroundColor: '#ffc107', color: '#000' },    // yellow
  'Pagado': { backgroundColor: '#0288d1', color: '#fff' },        // blue
  'Paid': { backgroundColor: '#0288d1', color: '#fff' },        // blue
  'En preparación': { backgroundColor: '#ff9800', color: '#000' },// orange
  'Preparing': { backgroundColor: '#ff9800', color: '#000' },// orange
  'Enviado': { backgroundColor: '#4caf50', color: '#fff' },       // green
  'Shipped': { backgroundColor: '#4caf50', color: '#fff' },       // green
  'Entregado': { backgroundColor: '#9e9e9e', color: '#fff' },       // grey
  'Delivered': { backgroundColor: '#9e9e9e', color: '#fff' },       // grey
  'Cancelado': { backgroundColor: '#f44336', color: '#fff' },     // red
  'Cancelled': { backgroundColor: '#f44336', color: '#fff' },     // red
};

function StatusBadge({ status }) {
  const { t } = useTranslation();

  // Find the translation key for the status
  const statusKey = `status.${status.toLowerCase().replace(' ', '_')}`;

  const style = statusStyles[status] || {};

  return (
    <Chip 
      label={t(statusKey, status)} 
      size="small" 
      sx={{ 
        ...style,
        fontWeight: 'bold',
        borderRadius: '16px',
        padding: '0px 4px',
      }} 
    />
  );
}

export default StatusBadge;
