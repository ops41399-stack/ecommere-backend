const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true }, // e.g., 10 for 10%
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Coupon', couponSchema);
