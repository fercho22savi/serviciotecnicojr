import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const StatusChip = ({ status }) => {
  const { t } = useTranslation();

  const getStatusProperties = () => {
    const lowerCaseStatus = status ? status.toLowerCase() : '';
    let color = 'default';
    let translationKey = '';

    switch (lowerCaseStatus) {
      case 'processing':
        color = 'info';
        translationKey = 'processing';
        break;
      case 'completed':
        color = 'success';
        translationKey = 'completed';
        break;
      case 'cancelled':
        color = 'error';
        translationKey = 'cancelled';
        break;
      case 'shipped':
        color = 'primary';
        translationKey = 'shipped';
        break;
      default:
        return { label: status, color };
    }
    
    const label = t(`orders.status.${translationKey}`);
    return { label, color };
  };

  const { label, color } = getStatusProperties();

  return <Chip label={label} color={color} size="small" />;
};

export default StatusChip;
