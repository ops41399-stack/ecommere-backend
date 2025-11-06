const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [{ type: String }],
  sku: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
