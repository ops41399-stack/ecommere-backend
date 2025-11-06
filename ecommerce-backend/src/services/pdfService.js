const PDFDocument = require('pdfkit');
const getStream = require('get-stream');

exports.generateSalesPDF = async (reportData) => {
  const doc = new PDFDocument({ margin: 30 });
  doc.fontSize(20).text(`Sales Report — ${reportData.period}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('Top Products', { underline: true });
  doc.moveDown(0.5);

  reportData.products.forEach(p => {
    doc.fontSize(12).text(`${p.productName || 'Unknown'} - Qty: ${p.quantity} - Revenue: ₹${p.productRevenue}`, { continued: false });
  });
  doc.addPage();
  doc.fontSize(14).text('Revenue by Category', { underline: true });
  doc.moveDown(0.5);
  reportData.categories.forEach(c => {
    doc.fontSize(12).text(`${c.categoryName || 'Unknown'} - Revenue: ₹${c.revenue}`);
  });

  doc.end();
  const buffer = await getStream.buffer(doc);
  return buffer;
};
