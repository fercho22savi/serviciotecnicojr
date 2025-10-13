import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { 
    Container, Typography, Box, Paper, CircularProgress, 
    Table, TableBody, TableCell, TableHead, TableRow, IconButton, 
    FormControl, Select, MenuItem
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import StatusBadge from '../../components/StatusBadge';

const STATUS_OPTIONS = ['En proceso', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(ordersQuery);
        const ordersList = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            // Asegurarse de que el estado por defecto sea 'En proceso' si no está definido
            status: doc.data().status || 'En proceso' 
        }));
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

  const handleStatusChange = async (orderId, newStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status: newStatus });
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
        toast.success('Estado del pedido actualizado.');
    } catch (error) {
        console.error("Error updating order status: ", error);
        toast.error('No se pudo actualizar el estado del pedido.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Pedidos
      </Typography>
      
      <Paper elevation={3} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 750 }}>
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
                  {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </TableCell>
                <TableCell sx={{fontFamily: 'monospace', fontSize: '0.75rem'}}>{order.userId}</TableCell>
                <TableCell align="right">
                  {(order.totalAmount * 1.21).toFixed(2)} €
                </TableCell>
                <TableCell align="center">
                    <FormControl fullWidth size="small">
                        <Select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            renderValue={(selected) => <StatusBadge status={selected} />}
                            sx={{ minWidth: 140 }}
                        >
                            {STATUS_OPTIONS.map((statusOption) => (
                                <MenuItem key={statusOption} value={statusOption}>
                                    <StatusBadge status={statusOption} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell align="center">
                  <IconButton component={Link} to={`/admin/orders/${order.id}`} color="primary" title="Ver Detalle">
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
