import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import {
  Container, 
  Typography, 
  CircularProgress, 
  Accordion,
  AccordionSummary, 
  AccordionDetails, 
  Box,
  Button,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InvoiceDetail from '../components/InvoiceDetail';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-hot-toast';

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
        toast.error("Error al cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer.")) {
        return;
    }

    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status: 'Cancelado' });
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status: 'Cancelado' } : order
            )
        );
        toast.success("Pedido cancelado con éxito.");
    } catch (error) {
        console.error("Error canceling order: ", error);
        toast.error("No se pudo cancelar el pedido. Inténtalo de nuevo.");
    }
  };

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
          <Accordion key={order.id} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <Grid item xs={12} sm={4} md={3}>
                  <Typography variant="body2" color="text.secondary">Pedido ID:</Typography>
                  <Typography variant="body1" fontWeight="medium">{order.orderId}</Typography>
                </Grid>
                <Grid item xs={6} sm={3} md={3}>
                   <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                   <Typography variant="body1">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6} sm={2} md={3}>
                    <Typography variant="body2" color="text.secondary">Estado:</Typography>
                    <StatusBadge status={order.status || 'En proceso'} />
                </Grid>
                <Grid item xs={12} sm={3} md={3} sx={{ textAlign: { sm: 'right' } }}>
                   <Typography variant="body2" color="text.secondary">Total:</Typography>
                   <Typography variant="h6" fontWeight="bold">{(order.totalAmount * 1.21).toFixed(2)} €</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              {order.status === 'En proceso' && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleCancelOrder(order.id)}
                      >
                          Cancelar Pedido
                      </Button>
                  </Box>
              )}
              <InvoiceDetail order={order} />
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default MyOrders;
