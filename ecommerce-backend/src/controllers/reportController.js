const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const pdfService = require('../services/pdfService');

// helper to get date range
const getRange = (period) => {
  const end = new Date();
  let start;
  if (period === 'daily') {
    start = new Date(); start.setHours(0,0,0,0);
  } else if (period === 'weekly') {
    start = new Date(); start.setDate(start.getDate() - 7);
  } else { // monthly
    start = new Date(); start.setMonth(start.getMonth() - 1);
  }
  return { start, end };
};

exports.salesReport = async (req, res, next) => {
  try {
    const period = req.query.period || 'daily';
    const { start, end } = getRange(period);

    // aggregate orders
    const agg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          quantity: 1,
          productRevenue: 1
        }
      },
      { $sort: { productRevenue: -1 } }
    ]);

    // revenue per category
    const categoryAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'p'
        }
      },
      { $unwind: '$p' },
      {
        $group: {
          _id: '$p.categoryId',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { categoryName: '$category.name', revenue: 1 } },
      { $sort: { revenue: -1 } }
    ]);

    const reportData = { period, products: agg, categories: categoryAgg };

    // generate pdf
    const pdfBuffer = await pdfService.generateSalesPDF(reportData);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="sales-${period}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};
