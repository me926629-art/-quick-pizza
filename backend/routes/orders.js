const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const WeeklyRevenue = require('../models/WeeklyRevenue');
const { auth, adminAuth } = require('../middleware/auth');

function getOrderDayStart() {
  const now = new Date();
  const egyptOffset = 2 * 60 * 60 * 1000;
  const egyptTime = new Date(now.getTime() + egyptOffset);
  const egyptHours = egyptTime.getUTCHours();
  const egyptDayStart = new Date(egyptTime);
  if (egyptHours < 7) egyptDayStart.setUTCDate(egyptDayStart.getUTCDate() - 1);
  egyptDayStart.setUTCHours(7, 0, 0, 0);
  return new Date(egyptDayStart.getTime() - egyptOffset);
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function getOrCreateWeeklyRevenue() {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  let wr = await WeeklyRevenue.findOne({ isCurrent: true });
  if (!wr || wr.weekStart < weekStart) {
    if (wr) {
      wr.isCurrent = false;
      await wr.save();
    }
    wr = new WeeklyRevenue({ weekStart, weekEnd, totalRevenue: 0, totalOrders: 0, isCurrent: true });
    await wr.save();
  }
  return wr;
}

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

const deliveryAreas = {
  'داخل الأقصر': 0,
  'القرنه': 70,
  'الزنيه قبلي': 25,
  'ارمنت الحيط': 50,
  'الضبعيه': 30
};

router.post('/', auth, async (req, res) => {
  try {
    const { deliveryAddress, specialInstructions, phone } = req.body;
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
    const deliveryFee = deliveryAddress?.deliveryArea ? (deliveryAreas[deliveryAddress.deliveryArea] || 0) : 0;
    const total = subtotal + deliveryFee;
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);
    const orderDayStart = getOrderDayStart();
    const dailyCount = await Order.countDocuments({ createdAt: { $gte: orderDayStart } });
    const order = new Order({
      user: req.user._id,
      items,
      subtotal,
      deliveryFee,
      total: Math.max(total, 0),
      deliveryAddress,
      orderNumber: dailyCount + 1,
      specialInstructions,
      phone: phone || req.user.phone || '',
      estimatedDelivery
    });
    await order.save();
    const wr = await getOrCreateWeeklyRevenue();
    wr.totalRevenue += Math.max(total, 0);
    wr.totalOrders += 1;
    await wr.save();
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

    const statusLabels = {
      confirmed: '✅ تم تأكيد طلبك',
      preparing: '👨‍🍳 طلبكقيد التحضير',
      ready: '📦 طلبك جاهز!',
      out_for_delivery: '🚗 طلبك في الطريق ليك!',
      delivered: '🎉 تم توصيل طلبك! بالهنا والشفا',
      cancelled: '❌ للأسف تم إلغاء طلبك'
    };

    if (order.user && statusLabels[status]) {
      try {
        const { sendPushToUser } = require('../routes/notifications');
        await sendPushToUser(
          order.user._id,
          `كويك بيتزا 🍕`,
          `${statusLabels[status]} - #${order.orderNumber}`,
          `/#tracking/${order._id}`
        );
      } catch (e) {
        console.log('Push notification failed:', e.message);
      }
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

router.get('/revenue/current', adminAuth, async (req, res) => {
  try {
    const wr = await getOrCreateWeeklyRevenue();
    res.json(wr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/revenue/history', adminAuth, async (req, res) => {
  try {
    const history = await WeeklyRevenue.find({ isCurrent: false }).sort('-weekStart').limit(52);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
