const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res, next) => {
  try {
    const c = await Coupon.create(req.body);
    res.status(201).json(c);
  } catch (err) { next(err); }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.isActive) return res.status(400).json({ message: 'Invalid coupon' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: 'Expired' });
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Usage limit reached' });
    res.json({ valid: true, discountPercent: coupon.discountPercent });
  } catch (err) { next(err); }
};
