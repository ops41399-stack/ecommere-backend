const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const mongoose = require('mongoose');
const { io } = require('../utils/socket');

// Place order
exports.placeOrder = async (req, res, next) => {
  try {
    const { items, couponCode } = req.body; // items = [{ productId, quantity }]
    if (!items || !items.length) return res.status(400).json({ message: 'No items' });

    // fetch products and compute subtotal
    const productIds = items.map(i => mongoose.Types.ObjectId(i.productId));
    const products = await Product.find({ _id: { $in: productIds } });

    let subtotal = 0;
    const orderItems = items.map(it => {
      const p = products.find(pp => pp._id.equals(it.productId));
      if (!p) throw new Error('Product not found: ' + it.productId);
      if (p.stock < it.quantity) throw new Error(`Insufficient stock for ${p.name}`);
      subtotal += p.price * it.quantity;
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: it.quantity
      };
    });

    // apply coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon || !coupon.isActive) return res.status(400).json({ message: 'Invalid coupon' });
      if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: 'Coupon expired' });
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      coupon.usedCount += 1;
      await coupon.save();
    }

    const total = subtotal - discount;
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      total,
      couponCode
    });

    // reduce product stock
    const bulkOps = items.map(it => ({
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId(it.productId) },
        update: { $inc: { stock: -it.quantity } }
      }
    }));
    await Product.bulkWrite(bulkOps);

    // emit socket update for each product
    for (const it of items) {
      const p = await Product.findById(it.productId).select('stock name _id');
      io.emit('stock_update', { productId: p._id, stock: p.stock, name: p.name });
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    // if admin can see all, customer sees their own
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const orders = await Order.find(query).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: 'Not found' });
    // customers can only view their own
    if (req.user.role !== 'admin' && !order.userId._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) { next(err); }
};

// update order status (admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};
