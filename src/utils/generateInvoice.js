import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para generar un slug de texto seguro para nombres de archivo
const toSlug = (text) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')       // Reemplaza espacios con -
    .replace(/[^\w\-]+/g, '')   // Elimina todos los caracteres que no son palabras
    .replace(/\-\-+/g, '-')     // Reemplaza múltiples - con uno solo
    .replace(/^-+/, '')          // Recorta - del inicio
    .replace(/-+$/, '');         // Recorta - del final

export const generateInvoice = (order) => {
    const doc = new jsPDF();

    // --- UNIFICACIÓN Y VALIDACIÓN DE DATOS ---
    // Unifica la estructura de precios para manejar datos antiguos y nuevos.
    const safePricing = {
        subtotal: order.pricing?.subtotal ?? order.subTotal ?? 0,
        shipping: order.pricing?.shipping ?? order.shippingCost ?? 0,
        discount: order.pricing?.discount ?? order.discount ?? 0,
        total: order.pricing?.total ?? order.totalAmount ?? 0,
    };
    const discountAmount = typeof safePricing.discount === 'number' ? safePricing.discount : 0;

    // --- DATOS GLOBALES ---
    const companyLogo = 'https://firebasestorage.googleapis.com/v0/b/serviciotecnicojr-187663-9a086.appspot.com/o/images%2FAPP%2FLOGO.png?alt=media&token=c80337c7-c725-4638-9e55-52467d1c1a9a'; 
    const companyName = 'Servicio Técnico JR';
    const companyAddress = 'Carrera 10 #12-34, Bogotá, Colombia';
    const invoiceTitle = 'FACTURA DE VENTA';
    const currencySymbol = '$';
    
    // --- Colores y Fuentes ---
    const primaryColor = '#4A90E2';
    const textColor = '#4A4A4A';
    const headerFooterColor = '#F5F5F5';

    // --- Función para formatear moneda ---
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'N/A';
        return `${currencySymbol}${value.toLocaleString('es-CO')}`;
    };

    // =======================================================================
    //  ENCABEZADO
    // =======================================================================
    doc.setFillColor(headerFooterColor);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    try {
        doc.addImage(companyLogo, 'PNG', 15, 12, 25, 16);
    } catch(e) {
        console.error("Error al cargar el logo en PDF", e);
        doc.setFontSize(20).setFont('helvetica', 'bold').text(companyName, 15, 25);
    }

    doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor(primaryColor);
    doc.text(invoiceTitle, doc.internal.pageSize.getWidth() - 15, 25, { align: 'right' });
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(textColor);
    doc.text(companyAddress, doc.internal.pageSize.getWidth() - 15, 32, { align: 'right' });

    // =======================================================================
    //  INFORMACIÓN DEL PEDIDO Y CLIENTE
    // =======================================================================
    const infoStartY = 50;
    doc.setFontSize(12).setFont('helvetica', 'bold').text('Facturar a:', 15, infoStartY);

    const clientInfo = order.shippingAddress;
    doc.setFont('helvetica', 'normal');
    doc.text(clientInfo?.recipientName || 'N/A', 15, infoStartY + 7);
    doc.text(clientInfo?.street || 'N/A', 15, infoStartY + 14);
    doc.text(`${clientInfo?.city || ''}, ${clientInfo?.postalCode || ''}`, 15, infoStartY + 21);
    doc.text(clientInfo?.country || 'N/A', 15, infoStartY + 28);

    const invoiceDetails = [
        ['N° de Factura:', order.orderNumber || order.id.substring(0, 8).toUpperCase()],
        ['Fecha de Emisión:', order.createdAt?.toDate ? format(order.createdAt.toDate(), "dd 'de' MMMM, yyyy", { locale: es }) : 'N/A'],
        ['Estado del Pedido:', order.status],
    ];

    autoTable(doc, {
        body: invoiceDetails,
        startY: infoStartY - 2,
        theme: 'plain',
        tableWidth: 80,
        margin: { left: doc.internal.pageSize.getWidth() - 95 },
        styles: { font: 'helvetica', fontSize: 11, cellPadding: {top: 1.5, right: 0, bottom: 1.5, left: 0}, halign: 'right' },
        columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
    });

    // =======================================================================
    //  TABLA DE PRODUCTOS
    // =======================================================================
    const tableHeaders = [['Descripción', 'Cantidad', 'Precio Unit.', 'Total']];
    const tableBody = order.items.map(item => [
        item.name,
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
        head: tableHeaders,
        body: tableBody,
        startY: infoStartY + 45,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'center' },
        columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        didDrawPage: () => {
            doc.setFillColor(headerFooterColor).rect(0, doc.internal.pageSize.getHeight() - 20, doc.internal.pageSize.getWidth(), 20, 'F');
            doc.setFontSize(10).setTextColor(textColor).text('¡Gracias por su compra!', 15, doc.internal.pageSize.getHeight() - 10);
            doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
    });

    // =======================================================================
    //  TOTALES
    // =======================================================================
    const finalY = (doc).lastAutoTable.finalY;
    
    const totalsBody = [
        ['Subtotal:', formatCurrency(safePricing.subtotal)],
        ['Envío:', safePricing.shipping === 0 ? 'Gratis' : formatCurrency(safePricing.shipping)],
    ];
    if (discountAmount > 0) {
        totalsBody.push(['Descuento:', `-${formatCurrency(discountAmount)}`]);
    }
    totalsBody.push(['TOTAL A PAGAR:', formatCurrency(safePricing.total)]);

    autoTable(doc, {
        body: totalsBody,
        startY: finalY + 10,
        theme: 'plain',
        tableWidth: 80,
        margin: { left: doc.internal.pageSize.getWidth() - 95 },
        styles: { font: 'helvetica', fontSize: 12 },
        columnStyles: { 0: { fontStyle: 'bold', halign: 'right' }, 1: { fontStyle: 'bold', halign: 'right' } },
        didParseCell: (data) => {
            if (data.row.index === totalsBody.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 14;
                data.cell.styles.textColor = primaryColor;
            }
        },
    });

    // =======================================================================
    //  DETALLES DE PAGO Y GUARDADO
    // =======================================================================
    const paymentY = finalY + 15;
    doc.setFontSize(11).setFont('helvetica', 'bold').text('Método de Pago:', 15, paymentY);
    doc.setFont('helvetica', 'normal').text(`Tarjeta ${order.payment?.brand || 'N/A'} terminada en ${order.payment?.last4 || 'XXXX'}`, 15, paymentY + 7);

    const safeOrderNumber = toSlug(order.orderNumber || order.id);
    doc.save(`factura-${safeOrderNumber}.pdf`);
};
