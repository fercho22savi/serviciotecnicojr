import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Container, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InvoiceDetail from '../components/InvoiceDetail'; // Usaremos este componente reutilizable

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const ordersRef = collection(db, 'orders');
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
    return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom>Mis Pedidos</Typography>
      {orders.length === 0 ? (
        <Typography>Aún no has realizado ningún pedido.</Typography>
      ) : (
        orders.map((order) => (
          <Accordion key={order.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography>Pedido ID: {order.orderId}</Typography>
                <Typography>Fecha: {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>Total: {(order.totalAmount * 1.21).toFixed(2)} €</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <InvoiceDetail order={order} />
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default MyOrders;
