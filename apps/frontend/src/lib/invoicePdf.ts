// jsPDF loaded dynamically to avoid bundle bloat

interface OrderItem {
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  delivery_fee: number;
  payment_method: string;
  delivery_address: string;
  status: string;
  items: OrderItem[];
  pharmacy_name?: string;
}

export const generateInvoicePDF = async (order: Order, patientName: string, patientEmail: string) => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();

  // Header
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('FACTURE', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text('PharmaConnect', 105, 30, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Invoice details
  doc.setFontSize(10);
  doc.text(`N° Facture: ${order.id.substring(0, 8).toUpperCase()}`, 20, 50);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, 20, 56);
  doc.text(`Statut: ${order.status.toUpperCase()}`, 20, 62);

  // Patient info
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENT', 20, 75);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(patientName, 20, 82);
  doc.text(patientEmail, 20, 88);
  doc.text(order.delivery_address, 20, 94);

  // Items table
  const tableData = order.items.map(item => [
    item.medicine_name,
    item.quantity.toString(),
    `${item.unit_price.toLocaleString('fr-FR')} FCFA`,
    `${item.total_price.toLocaleString('fr-FR')} FCFA`
  ]);

  (doc as any).autoTable({
    startY: 105,
    head: [['Médicament', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.text('Sous-total:', 130, finalY);
  doc.text(`${(order.total - order.delivery_fee).toLocaleString('fr-FR')} FCFA`, 190, finalY, { align: 'right' });

  doc.text('Frais de livraison:', 130, finalY + 7);
  doc.text(`${order.delivery_fee.toLocaleString('fr-FR')} FCFA`, 190, finalY + 7, { align: 'right' });

  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 130, finalY + 17);
  doc.text(`${order.total.toLocaleString('fr-FR')} FCFA`, 190, finalY + 17, { align: 'right' });

  // Payment method
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Mode de paiement: ${order.payment_method}`, 20, finalY + 17);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Merci pour votre confiance !', 105, 280, { align: 'center' });
  doc.text('PharmaConnect - Vos médicaments livrés en toute sécurité', 105, 285, { align: 'center' });

  // Save
  const fileName = `facture_${order.id.substring(0, 8)}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};
