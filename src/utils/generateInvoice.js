import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const toSlug = (text) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export const generateInvoice = (order, t, i18n) => {
    const doc = new jsPDF();

    const safePricing = {
        subtotal: order.pricing?.subtotal ?? order.subTotal ?? 0,
        shipping: order.pricing?.shipping ?? order.shippingCost ?? 0,
        discount: order.pricing?.discount ?? order.discount ?? 0,
        total: order.pricing?.total ?? order.totalAmount ?? 0,
    };
    const discountAmount = typeof safePricing.discount === 'number' ? safePricing.discount : 0;

    const companyLogo = 'https://firebasestorage.googleapis.com/v0/b/serviciotecnicojr-187663-9a086.appspot.com/o/images%2FAPP%2FLOGO.png?alt=media&token=c80337c7-c725-4638-9e55-52467d1c1a9a'; 
    const companyName = 'Servicio Técnico JR';
    const companyAddress = 'Carrera 10 #12-34, Bogotá, Colombia';
    const invoiceTitle = t('invoice.title');
    const currencySymbol = '$';
    
    const primaryColor = '#4A90E2';
    const textColor = '#4A4A4A';
    const headerFooterColor = '#F5F5F5';

    const activeLocale = i18n.language === 'es' ? es : enUS;
    const localeString = i18n.language === 'es' ? 'es-CO' : 'en-US';

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'N/A';
        return new Intl.NumberFormat(localeString, { style: 'currency', currency: 'USD' }).format(value);
    };

    doc.setFillColor(headerFooterColor);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    try {
        doc.addImage(companyLogo, 'PNG', 15, 12, 25, 16);
    } catch(e) {
        console.error("Error loading PDF logo", e);
        doc.setFontSize(20).setFont('helvetica', 'bold').text(companyName, 15, 25);
    }

    doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor(primaryColor);
    doc.text(invoiceTitle, doc.internal.pageSize.getWidth() - 15, 25, { align: 'right' });
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(textColor);
    doc.text(companyAddress, doc.internal.pageSize.getWidth() - 15, 32, { align: 'right' });

    const infoStartY = 50;
    doc.setFontSize(12).setFont('helvetica', 'bold').text(t('invoice.bill_to'), 15, infoStartY);

    const clientInfo = order.shippingAddress;
    doc.setFont('helvetica', 'normal');
    let yPos = infoStartY + 7;
    doc.text(clientInfo?.recipientName || 'N/A', 15, yPos);
    yPos += 7;
    doc.text(clientInfo?.street || 'N/A', 15, yPos);
    yPos += 7;
    const cityLine = [clientInfo?.city, clientInfo?.state, clientInfo?.postalCode].filter(Boolean).join(', ');
    doc.text(cityLine, 15, yPos);
    yPos += 7;
    doc.text(clientInfo?.country || 'N/A', 15, yPos);
    yPos += 7;
    const phoneLine = `${t('invoice.phone_label')}: ${clientInfo?.recipientPhone || 'N/A'}`;
    doc.text(phoneLine, 15, yPos);

    const invoiceDetails = [
        [t('invoice.invoice_number'), order.orderNumber || order.id.substring(0, 8).toUpperCase()],
        [t('invoice.issue_date'), order.createdAt?.toDate ? format(order.createdAt.toDate(), "dd MMMM, yyyy", { locale: activeLocale }) : 'N/A'],
        [t('invoice.order_status'), t(`orders.status.${order.status.toLowerCase()}`)],
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

    const tableHeaders = [[t('invoice.table.description'), t('invoice.table.quantity'), t('invoice.table.unit_price'), t('invoice.table.total')]];
    const tableBody = order.items.map(item => [
        item.name,
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
        head: tableHeaders,
        body: tableBody,
        startY: yPos + 20, // Adjusted startY to be dynamic
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'center' },
        columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        didDrawPage: (data) => {
            doc.setFillColor(headerFooterColor).rect(0, doc.internal.pageSize.getHeight() - 20, doc.internal.pageSize.getWidth(), 20, 'F');
            doc.setFontSize(10).setTextColor(textColor).text(t('invoice.footer_thanks'), 15, doc.internal.pageSize.getHeight() - 10);
            doc.text(`${t('invoice.footer_page')} ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
    });

    const finalY = (doc).lastAutoTable.finalY;
    
    const totalsBody = [
        [t('order_detail.subtotal') + ':', formatCurrency(safePricing.subtotal)],
        [t('order_detail.shipping_cost') + ':', safePricing.shipping === 0 ? t('order_detail.free_shipping') : formatCurrency(safePricing.shipping)],
    ];
    if (discountAmount > 0) {
        totalsBody.push([t('order_detail.discount') + ':', `-${formatCurrency(discountAmount)}`]);
    }
    totalsBody.push([t('invoice.total_due'), formatCurrency(safePricing.total)]);

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

    const paymentY = finalY + 15;
    doc.setFontSize(11).setFont('helvetica', 'bold').text(t('order_detail.payment_method') + ':', 15, paymentY);
    const cardText = t('invoice.payment_method_card', {
        brand: order.payment?.brand || 'N/A',
        last4: order.payment?.last4 || 'XXXX'
    });
    doc.setFont('helvetica', 'normal').text(cardText, 15, paymentY + 7);

    const safeOrderNumber = toSlug(order.orderNumber || order.id);
    doc.save(`${t('invoice.filename')}-${safeOrderNumber}.pdf`);
};
