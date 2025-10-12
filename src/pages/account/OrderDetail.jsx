import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Typography, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching order: ", error);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!order) {
    return <Typography>No se encontró el pedido.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalle del Pedido #{order.orderId}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Fecha: {new Date(order.createdAt.seconds * 1000).toLocaleString()}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total: ${order.totalAmount.toFixed(2)}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Artículos
      </Typography>
      <List>
        {order.items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText 
              primary={item.name}
              secondary={`Cantidad: ${item.quantity} - Precio: $${item.price.toFixed(2)}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default OrderDetail;