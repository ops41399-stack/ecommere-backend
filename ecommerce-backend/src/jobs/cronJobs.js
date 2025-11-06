const cron = require('node-cron');
const Product = require('../models/Product');
const Order = require('../models/Order');
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

// run daily at 00:30
exports.startJobs = () => {
  cron.schedule('30 0 * * *', async () => {
    console.log('Running daily stock audit & invoice generation...');
    try {
      // stock audit
      const lowStock = await Product.find({ stock: { $lte: 5 } }).select('name stock');
      if (lowStock.length) {
        console.log('Low stock items:', lowStock);
      }

      // generate yesterday sales pdf (example)
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0,0,0,0);
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23,59,59,999);

      const orders = await Order.find({ createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }, status: { $ne: 'cancelled' } });
      if (orders.length) {
        const reportData = { period: 'daily', products: [], categories: [] };
        // (could aggregate here as in reportController)
        const buffer = await pdfService.generateSalesPDF(reportData);
        const filePath = path.join(__dirname, '..', '..', 'reports', `sales-${Date.now()}.pdf`);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, buffer);
        console.log('Saved daily report to', filePath);
      }
    } catch (err) {
      console.error('Cron job error', err);
    }
  });
};
