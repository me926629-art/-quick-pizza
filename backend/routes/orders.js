const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name nameAr image')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name nameAr image')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name nameAr image')
      .populate('user', 'name email phone');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, specialInstructions, phone } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      nameAr: item.product.nameAr,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      toppings: item.toppings,
      specialInstructions: item.specialInstructions
    }));
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 15;
    const tax = Math.round(subtotal * 0.14);
    const total = subtotal + deliveryFee + tax - cart.couponDiscount;
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);
    const order = new Order({
      user: req.user._id,
      items,
      subtotal,
      deliveryFee,
      tax,
      total: Math.max(total, 0),
      deliveryAddress,
      paymentMethod: paymentMethod || 'cash',
      specialInstructions,
      phone: phone || req.user.phone || '',
      estimatedDelivery
    });
    await order.save();
    cart.items = [];
    cart.couponCode = null;
    cart.couponDiscount = 0;
    await cart.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email phone');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (status === 'delivered') {
      order.actualDelivery = new Date();
      await order.save();
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only rate delivered orders' });
    }
    order.rating = rating;
    order.review = review;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (['preparing', 'ready', 'out_for_delivery'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order in current status' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
