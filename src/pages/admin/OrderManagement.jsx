import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { 
    Container, Typography, Box, Paper, CircularProgress, 
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const getStatusChipColor = (status) => {
    switch (status) {
        case 'Procesando': return 'warning';
        case 'Enviado': return 'info';
        case 'Completado': return 'success';
        case 'Cancelado': return 'error';
        default: return 'default';
    }
};

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(ordersQuery);
        const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders: ", error);
        toast.error("Error al cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Pedidos
      </Typography>
      
      <Paper elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID Pedido</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell component="th" scope="row" sx={{fontFamily: 'monospace'}}>
                  {order.id.substring(0, 6).toUpperCase()}
                </TableCell>
                <TableCell>
                  {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </TableCell>
                <TableCell>{order.userId}</TableCell> {/* Displaying user ID for now, can be enriched with user name later */}
                <TableCell align="right">
                  ${order.totalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell align="center">
                    <Chip label={order.status} color={getStatusChipColor(order.status)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton component={Link} to={`/admin/orders/${order.id}`} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.length === 0 && !loading && 
            <Typography sx={{textAlign: 'center', p: 4}}>No se han encontrado pedidos.</Typography>
        }
      </Paper>
    </Container>
  );
}

export default OrderManagement;
