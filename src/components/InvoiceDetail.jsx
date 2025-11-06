import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Box, Button, Typography, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, Divider } from '@mui/material';
import Logo from './Logo'; // Assuming you have a Logo component

const InvoiceDetail = ({ order }) => {
  const componentRef = useRef();

  // This hook handles the print action
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Factura-${order.orderNumber}`,
  });

  // --- Dynamic Currency Formatter ---
  const formatCurrency = (amount, currencyCode) => {
    if (typeof amount !== 'number') return 'N/A';
    
    const locale = currencyCode === 'COP' ? 'es-CO' : 'en-US';
    const options = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currencyCode === 'USD' ? 2 : 0,
        maximumFractionDigits: currencyCode === 'USD' ? 2 : 0,
    };

    return new Intl.NumberFormat(locale, options).format(amount);
  };

  const orderCurrency = order.pricing?.currency || 'COP';

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 2 }}>
      {/* --- Component to be printed -- */}
      <Box ref={componentRef} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Grid item>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              Servicio Técnico JR
            </Typography>
          </Grid>
          <Grid item textAlign="right">
            <Typography variant="h5" color="primary" sx={{ fontWeight: 500 }}>
              FACTURA DE VENTA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Carrera 10 #12-34, Bogotá, Colombia
            </Typography>
          </Grid>
        </Grid>

        <Grid container justifyContent="space-between" sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant="overline" color="text.secondary">Facturar a:</Typography>
            <Typography>{order.shippingAddress?.recipientName}</Typography>
            <Typography>{order.shippingAddress?.street}</Typography>
            <Typography>{`${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}`}</Typography>
            <Typography>{order.shippingAddress?.country}</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Grid container>
                <Grid item xs={6}><Typography variant="body1" sx={{fontWeight: 'bold'}}>N° de Factura:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1">{order.orderNumber}</Typography></Grid>
                
                <Grid item xs={6}><Typography variant="body1" sx={{fontWeight: 'bold'}}>Fecha de Emisión:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Grid>
                
                <Grid item xs={6}><Typography variant="body1" sx={{fontWeight: 'bold'}}>Estado del Pedido:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1">{order.status}</Typography></Grid>
            </Grid>
          </Grid>
        </Grid>

        <Table sx={{ mb: 4 }}>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Cant.</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Precio Unit.</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.price, orderCurrency)}</TableCell>
                <TableCell align="right">{formatCurrency(item.price * item.quantity, orderCurrency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Grid container>
            <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Método de Pago:</Typography>
                <Typography>Tarjeta {order.payment?.brand || 'N/A'} terminada en {order.payment?.last4 || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6} >
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography sx={{fontWeight: 'bold'}}>Subtotal:</Typography>
                    <Typography>{formatCurrency(order.pricing.subtotal, orderCurrency)}</Typography>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography sx={{fontWeight: 'bold'}}>Coste de Envío:</Typography>
                    <Typography>{order.pricing.shipping === 0 ? 'Gratis' : formatCurrency(order.pricing.shipping, orderCurrency)}</Typography>
                </Box>
                {order.pricing.discount > 0 && (
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                        <Typography sx={{fontWeight: 'bold'}}>Descuento:</Typography>
                        <Typography color="success.main">-{formatCurrency(order.pricing.discount, orderCurrency)}</Typography>
                    </Box>
                )}
                <Divider sx={{my:1}} />
                <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                    <Typography variant="h6" sx={{fontWeight: 'bold'}} color="primary">TOTAL A PAGAR:</Typography>
                    <Typography variant="h6" sx={{fontWeight: 'bold'}}>{formatCurrency(order.pricing.total, orderCurrency)}</Typography>
                </Box>
            </Grid>
        </Grid>

      </Box>

      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
        {/* The print button now generates a PDF-like experience */}
        <Button variant="contained" color="secondary" onClick={handlePrint}>Imprimir o Guardar como PDF</Button>
        {/* Other export buttons can be re-enabled later if needed */}
        {/* <Button variant="outlined" onClick={() => alert('Exporting to PDF...')}>Exportar a PDF (WIP)</Button> */}
      </Box>
    </Paper>
  );
};

export default InvoiceDetail;
