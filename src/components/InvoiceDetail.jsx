import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Box, Button, Typography, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, Divider } from '@mui/material';
import Logo from './Logo';

const InvoiceDetail = ({ order }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Factura-${order.orderId}`,
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const finalY = (doc).lastAutoTable.finalY || 10;
    doc.text(`Factura #${order.orderId}`, 14, finalY + 15);
    doc.text(`Cliente: ${order.customerDetails.firstName} ${order.customerDetails.lastName}`, 14, finalY + 25);
    doc.text(`Total: ${(order.totalAmount * 1.21).toFixed(2)} €`, 14, finalY + 35);
    doc.autoTable({ html: '#invoice-table' });
    doc.save(`factura-${order.orderId}.pdf`);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      order.items.map(item => ({
        Producto: item.name,
        Cantidad: item.quantity,
        PrecioUnitario: `${item.price} €`,
        Subtotal: `${(item.price * item.quantity).toFixed(2)} €`,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factura');
    XLSX.writeFile(wb, `factura-${order.orderId}.xlsx`);
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 2 }}>
      <Box ref={componentRef} sx={{ p: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Logo />
            <Typography variant="h5" gutterBottom sx={{mt:2}}>Factura</Typography>
          </Grid>
          <Grid item textAlign="right">
            <Typography variant="h6">Pedido #{order.orderId}</Typography>
            <Typography>Fecha: {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography variant="h6">Cliente:</Typography>
            <Typography>{`${order.customerDetails.firstName} ${order.customerDetails.lastName}`}</Typography>
            <Typography>{order.customerDetails.address}</Typography>
            <Typography>{`${order.customerDetails.city}, ${order.customerDetails.postalCode}`}</Typography>
            <Typography>{order.customerDetails.country}</Typography>
            <Typography>Email: {order.customerDetails.email}</Typography>
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Productos</Typography>
        <Table id="invoice-table">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Precio Unitario</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.price.toFixed(2)} €</TableCell>
                <TableCell align="right">{(item.price * item.quantity).toFixed(2)} €</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell rowSpan={3} />
              <TableCell colSpan={2}>Subtotal</TableCell>
              <TableCell align="right">{order.totalAmount.toFixed(2)} €</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>IVA (21%)</TableCell>
              <TableCell align="right">{(order.totalAmount * 0.21).toFixed(2)} €</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}><Typography variant="h6">Total</Typography></TableCell>
              <TableCell align="right"><Typography variant="h6">{(order.totalAmount * 1.21).toFixed(2)} €</Typography></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
        <Button variant="contained" onClick={handleExportPDF}>Exportar a PDF</Button>
        <Button variant="contained" onClick={handleExportExcel}>Exportar a Excel</Button>
        <Button variant="contained" color="secondary" onClick={handlePrint}>Imprimir</Button>
      </Box>
    </Paper>
  );
};

export default InvoiceDetail;
