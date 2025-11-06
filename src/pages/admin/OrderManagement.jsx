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
import { useTranslation } from 'react-i18next';
import { es, enUS } from 'date-fns/locale';
import StatusChip from '../../components/StatusChip'; // IMPORT THE NEW COMPONENT

// Standardized status values (used in the database)
const STATUS_OPTIONS = ['Processing', 'Shipped', 'Completed', 'Cancelled'];

function OrderManagement() {
  const { t, i18n } = useTranslation();
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
            status: doc.data().status || 'Processing' // Default to standardized status
        }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders: ", error);
        toast.error(t('order_management.load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [t]);

  const handleStatusChange = async (orderId, newStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status: newStatus });
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
        toast.success(t('order_management.update_success'));
    } catch (error) {
        console.error("Error updating order status: ", error);
        toast.error(t('order_management.update_error'));
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('order_management.title')}
      </Typography>
      
      <Paper elevation={3} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('orders.order_number')}</TableCell>
              <TableCell>{t('orders.date')}</TableCell>
              <TableCell>{t('order_management.customer_id')}</TableCell>
              <TableCell align="right">{t('orders.total')}</TableCell>
              <TableCell align="center">{t('orders.status_label')}</TableCell>
              <TableCell align="center">{t('orders.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell component="th" scope="row" sx={{fontFamily: 'monospace'}}>
                  {order.orderNumber || order.id.substring(0, 6).toUpperCase()}
                </TableCell>
                <TableCell>
                  {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm', { locale: i18n.language === 'es' ? es : enUS }) : 'N/A'}
                </TableCell>
                <TableCell sx={{fontFamily: 'monospace', fontSize: '0.75rem'}}>{order.userId}</TableCell>
                <TableCell align="right">
                   {new Intl.NumberFormat(i18n.language === 'es' ? 'es-CO' : 'en-US', { style: 'currency', currency: order.currency || 'COP' }).format(order.totalAmount)}
                </TableCell>
                <TableCell align="center">
                    <FormControl fullWidth size="small">
                        <Select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            renderValue={(selected) => <StatusChip status={selected} />}
                            sx={{ minWidth: 140 }}
                        >
                            {STATUS_OPTIONS.map((statusOption) => (
                                <MenuItem key={statusOption} value={statusOption}>
                                    <StatusChip status={statusOption} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell align="center">
                  <IconButton component={Link} to={`/admin/orders/${order.id}`} color="primary" title={t('orders.view_details')}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.length === 0 && !loading && 
            <Typography sx={{textAlign: 'center', p: 4}}>{t('order_management.no_orders')}</Typography>
        }
      </Paper>
    </Container>
  );
}

export default OrderManagement;
