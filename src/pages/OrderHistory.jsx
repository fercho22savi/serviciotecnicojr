import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Container, Typography, Paper, CircularProgress, Box, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>;
  }

  if (orders.length === 0) {
    return <Typography sx={{mt: 2}}>Aún no has realizado ningún pedido.</Typography>;
  }

  return (
    <Box>
        <Typography variant="h5" gutterBottom>Mis Pedidos</Typography>
        <Paper elevation={1}>
            <List disablePadding>
                {orders.map((order, index) => (
                    <React.Fragment key={order.id}>
                        <ListItem sx={{p: 2}}>
                            <ListItemText 
                                primary={`Pedido #${order.id.substring(0, 8)}...`}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            Fecha: {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="body2" color="text.secondary">
                                            Estado: {order.status}
                                        </Typography>
                                    </>
                                }
                            />
                            <Box sx={{textAlign: 'right'}}>
                                <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>${order.total.toFixed(2)}</Typography>
                                <Button component={Link} to={`/account/orders/${order.id}`} size="small" sx={{mt: 1}} variant="outlined">
                                    Ver Detalles
                                </Button>
                            </Box>
                        </ListItem>
                        {index < orders.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    </Box>
  );
}

export default OrderHistory;
