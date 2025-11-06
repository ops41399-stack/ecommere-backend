const Product = require('../models/Product');
const mongoose = require('mongoose');
const { io } = require('../utils/socket'); // socket instance

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (err) { next(err); }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { next(err); }
};

// Delete
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// Get single product + category (using $lookup)
exports.getProductWithCategory = async (req, res, next) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const agg = await Product.aggregate([
      { $match: { _id: id } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
    ]);
    res.json(agg[0] || null);
  } catch (err) { next(err); }
};

// List products with pagination and $lookup to fetch category
exports.listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;
    const pipeline = [
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
    ];
    const items = await Product.aggregate(pipeline);
    res.json({ page, limit, items });
  } catch (err) { next(err); }
};
