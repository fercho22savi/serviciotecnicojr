
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const generateUserDataPdf = (userData, t) => {
  const doc = new jsPDF();
  const { profile, orderHistory, savedAddresses, userPreferences } = userData;

  // --- Document Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(t('pdfReport.title'), 14, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t('pdfReport.reportDate')}: ${format(new Date(), 'PPP', { locale: es })}`, 14, 30);

  let finalY = 40;

  // --- 1. Profile Data ---
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`🧑‍💼 ${t('pdfReport.profile.title')}`, 14, finalY);
  finalY += 10;

  const profileData = [
    [t('pdfReport.profile.fullName'), profile.profile?.displayName || t('pdfReport.notAvailable')],
    [t('pdfReport.profile.email'), profile.email],
    [t('pdfReport.profile.phone'), profile.profile?.phone || t('pdfReport.notAvailable')],
    [t('pdfReport.profile.memberSince'), profile.registrationDate ? format(new Date(profile.registrationDate), 'PPP', { locale: es }) : t('pdfReport.notAvailable')],
  ];

  doc.autoTable({
    startY: finalY,
    head: [[t('pdfReport.field'), t('pdfReport.value')]],
    body: profileData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  finalY = doc.lastAutoTable.finalY + 15;

  // --- 2. Shipping Addresses ---
  if (savedAddresses && savedAddresses.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`📬 ${t('pdfReport.addresses.title')}`, 14, finalY);
    finalY += 10;

    const addressBody = savedAddresses.map(addr => [
      addr.recipientName,
      `${addr.address}, ${addr.city}, ${addr.state} ${addr.postalCode}`,
      addr.recipientPhone,
      addr.shippingNotes || t('pdfReport.none'),
    ]);

    doc.autoTable({
      startY: finalY,
      head: [[
        t('pdfReport.addresses.recipient'), 
        t('pdfReport.addresses.address'), 
        t('pdfReport.addresses.phone'), 
        t('pdfReport.addresses.notes')
      ]],
      body: addressBody,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
    });

    finalY = doc.lastAutoTable.finalY + 15;
  }

  // --- 3. Purchase History ---
  if (orderHistory && orderHistory.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`🛒 ${t('pdfReport.history.title')}`, 14, finalY);
    finalY += 10;

    const orderBody = orderHistory.map(order => {
        const productsText = order.items.map(item => `${item.name} (x${item.quantity})`).join('\n');
        return [
            order.id,
            format(order.date.toDate(), 'Pp', { locale: es }),
            `$${order.total.toFixed(2)}`,
            t(`orders.status.${order.status.toLowerCase()}`),
            productsText
        ]
    });

    doc.autoTable({
      startY: finalY,
      head: [[
        t('pdfReport.history.orderId'), 
        t('pdfReport.history.date'), 
        t('pdfReport.history.total'), 
        t('pdfReport.history.status'), 
        t('pdfReport.history.products')
      ]],
      body: orderBody,
      theme: 'grid',
      headStyles: { fillColor: [230, 126, 34] },
      columnStyles: {
        4: { cellWidth: 'auto' }
      }
    });

    finalY = doc.lastAutoTable.finalY + 15;
  } else {
     doc.text(t('pdfReport.history.noOrders'), 14, finalY);
     finalY += 15;
  }


  // --- 4. User Preferences ---
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`💌 ${t('pdfReport.prefs.title')}`, 14, finalY);
  finalY += 10;
  
  const prefsData = [
      [t('pdfReport.prefs.language'), userPreferences.language.toUpperCase()],
      [t('pdfReport.prefs.theme'), userPreferences.theme === 'dark' ? t('themes.dark') : t('themes.light')],
      [t('pdfReport.prefs.offers'), userPreferences.notifications.offers ? t('pdfReport.subscribed') : t('pdfReport.unsubscribed')],
      [t('pdfReport.prefs.orderUpdates'), userPreferences.notifications.orders ? t('pdfReport.subscribed') : t('pdfReport.unsubscribed')],
  ];

  doc.autoTable({
    startY: finalY,
    head: [[t('pdfReport.preference'), t('pdfReport.selection')]],
    body: prefsData,
    theme: 'striped',
    headStyles: { fillColor: [142, 68, 173] },
  });

  finalY = doc.lastAutoTable.finalY + 15;

  // --- 5. Security Data ---
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`🔐 ${t('pdfReport.security.title')}`, 14, finalY);
  finalY += 10;

  const securityData = [
      [t('pdfReport.security.lastLogin'), profile.lastLogin ? format(new Date(profile.lastLogin), 'Pp', { locale: es }) : t('pdfReport.notAvailable')],
      [t('pdfReport.security.passwordChanges'), t('pdfReport.security.notTracked')],
      [t('pdfReport.security.activeSessions'), t('pdfReport.security.notTracked')],
  ];

  doc.autoTable({
    startY: finalY,
    head: [[t('pdfReport.field'), t('pdfReport.detail')]],
    body: securityData,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] },
  });
  
  finalY = doc.lastAutoTable.finalY + 15;

  // --- Footer ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${t('pdfReport.page')} ${i} / ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    doc.text(t('pdfReport.footer'), 14, doc.internal.pageSize.height - 10);
  }

  // --- Save Document ---
  const fileName = `${t('pdfReport.filename')}_${profile.profile?.displayName || profile.uid}.pdf`;
  doc.save(fileName.replace(/\s+/g, '_').toLowerCase());
};

export default generateUserDataPdf;
