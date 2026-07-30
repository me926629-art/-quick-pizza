const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const DailyRevenue = require('../models/DailyRevenue');
const { auth, adminAuth } = require('../middleware/auth');

const exportsDir = path.join(__dirname, '../../frontend/exports');
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

function getEgyptTime() {
  const now = new Date();
  const egyptOffset = 2 * 60 * 60 * 1000;
  return new Date(now.getTime() + egyptOffset);
}

function getEgyptHours() { return getEgyptTime().getUTCHours(); }
function getEgyptMinutes() { return getEgyptTime().getUTCMinutes(); }
function getTimeTo6AM() {
  let h = getEgyptHours(), m = getEgyptMinutes();
  if (h >= 6) return 0;
  return (5 - h) * 60 + (60 - m);
}

function getOrderDayStart() {
  const now = new Date();
  const egyptOffset = 2 * 60 * 60 * 1000;
  const egyptTime = new Date(now.getTime() + egyptOffset);
  const egyptHours = egyptTime.getUTCHours();
  const egyptDayStart = new Date(egyptTime);
  if (egyptHours < 6) egyptDayStart.setUTCDate(egyptDayStart.getUTCDate() - 1);
  egyptDayStart.setUTCHours(6, 0, 0, 0);
  return new Date(egyptDayStart.getTime() - egyptOffset);
}

function getDateStr() {
  const now = new Date();
  const egyptOffset = 2 * 60 * 60 * 1000;
  const egyptTime = new Date(now.getTime() + egyptOffset);
  const h = egyptTime.getUTCHours();
  const d = new Date(egyptTime);
  if (h < 6) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function getOrCreateDailyRevenue() {
  const dateStr = getDateStr();
  let dr = await DailyRevenue.findOne({ isToday: true });
  if (!dr || dr.date !== dateStr) {
    if (dr) {
      dr.isToday = false;
      await dr.save();
    }
    dr = new DailyRevenue({ date: dateStr, totalRevenue: 0, totalOrders: 0, isToday: true });
    await dr.save();
  }
  return dr;
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

function getDateStrFromDate(date) {
  const egyptOffset = 2 * 60 * 60 * 1000;
  const egyptTime = new Date(date.getTime() + egyptOffset);
  const h = egyptTime.getUTCHours();
  const d = new Date(egyptTime);
  if (h < 6) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const TRACKER_PATH = path.join(exportsDir, '.tracker.json');
function getTracker() { try { return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8')); } catch { return {}; } }
function saveTracker(t) { fs.writeFileSync(TRACKER_PATH, JSON.stringify(t)); }

async function generateDailyExport() {
  const todayStr = getDateStr();
  const tracker = getTracker();
  if (tracker[todayStr]) return { cached: true, filename: tracker[todayStr], todayStr };

  const XLSX = require('xlsx');
  const orders = await Order.find({})
    .populate('user', 'name email phone')
    .populate('items.product', 'name nameAr image')
    .sort('-createdAt');
  const todayOrders = orders.filter(o => getDateStrFromDate(new Date(o.createdAt)) === todayStr);

  function fmtDate(d) { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }); }
  function fmtTime(d) { return new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }); }
  function statusAr(s) { return { pending: 'بانتظار', confirmed: 'مؤكد', preparing: 'تحضير', ready: 'جاهز', out_for_delivery: 'في الطريق', delivered: 'تم التوصيل', cancelled: 'ملغي' }[s] || s; }

  const allRows = orders.map(o => [
    '#' + (o.orderNumber || ''), fmtDate(o.createdAt), fmtTime(o.createdAt),
    o.user?.name || 'غير معروف', o.phone || o.user?.phone || '',
    o.items.map(i => `${i.nameAr || i.name}${i.size ? ' (' + ({Small:'صغير',Medium:'وسط',Large:'كبير',Slice:'شريحة',Regular:'عادي'}[i.size]||i.size) + ')' : ''} x${i.quantity}`).join('\n'),
    o.subtotal, o.deliveryFee, o.total, statusAr(o.status),
    [o.deliveryAddress?.city, o.deliveryAddress?.district, o.deliveryAddress?.street].filter(Boolean).join(' - '),
    o.rating ? `${o.rating}/5 ${o.review ? '- ' + o.review : ''}` : '', o.specialInstructions || ''
  ]);
  const todayRows = todayOrders.map(o => [
    '#' + (o.orderNumber || ''), fmtTime(o.createdAt), o.user?.name || '', o.total, statusAr(o.status)
  ]);

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([
    ['📊 كويك بيتزا - تقرير الطلبات'],
    ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
    ['إجمالي الطلبات:', orders.length, '', 'إيرادات:', orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0) + ' ج.م'],
    ['طلبات اليوم:', todayOrders.length, '', 'إيرادات اليوم:', todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0) + ' ج.م'],
    ['بانتظار:', orders.filter(o => o.status === 'pending').length, '', 'تم التوصيل:', orders.filter(o => o.status === 'delivered').length, '', 'ملغي:', orders.filter(o => o.status === 'cancelled').length],
    [],
    ['رقم', 'التاريخ', 'الوقت', 'العميل', 'الهاتف', 'الأصناف', 'الفرعي', 'التوصيل', 'الإجمالي', 'الحالة', 'العنوان', 'التقييم', 'ملاحظات'],
    ...allRows
  ]);
  XLSX.utils.book_append_sheet(wb, ws1, 'كل الطلبات');
  const ws2 = XLSX.utils.aoa_to_sheet([
    ['📅 تقرير اليوم - ' + new Date().toLocaleDateString('ar-EG')], [],
    ['رقم', 'الوقت', 'العميل', 'الإجمالي', 'الحالة'], ...todayRows
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, 'اليوم');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  const filename = `تقرير_يومي_${todayStr}.xlsx`;
  fs.writeFileSync(path.join(exportsDir, filename), wbout);
  tracker[todayStr] = filename;
  saveTracker(tracker);
  return { cached: false, filename, todayStr, todayCount: todayOrders.length };
}

router.get('/export', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .populate('items.product', 'name nameAr image')
      .sort('-createdAt');
    const todayStr = getDateStr();
    const todayOrders = orders.filter(o => getDateStrFromDate(new Date(o.createdAt)) === todayStr);
    const stats = {
      total: orders.length,
      today: todayOrders.length,
      revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
      todayRevenue: todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
      pending: orders.filter(o => o.status === 'pending').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    res.json({ orders, todayOrders, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/day-end-status', adminAuth, async (req, res) => {
  try {
    const egyptTime = getEgyptTime();
    const h = egyptTime.getUTCHours();
    const m = egyptTime.getUTCMinutes();
    const inReminderWindow = h < 6 || h >= 23;
    const tracker = getTracker();
    const todayStr = getDateStr();
    const exportsList = fs.readdirSync(exportsDir).filter(f => f.endsWith('.xlsx')).sort().reverse();
    res.json({
      egyptHour: h, egyptMinute: m,
      inReminderWindow,
      dayEndsInMin: getTimeTo6AM(),
      todayStr,
      autoExportDone: !!tracker[todayStr],
      autoExportFile: tracker[todayStr] || null,
      exports: exportsList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auto-export', adminAuth, async (req, res) => {
  try {
    const result = await generateDailyExport();
    res.json(result);
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
  'الضبعيه': 30,
  'طيبه': 70,
  'العشي': 50,
  'المدامود': 35,
  'المنشاه': 25,
  'الحبيل': 25,
  'البغدادي': 35,
  'المراسي': 25,
  'الطود': 25,
  'الرضوانيه': 25,
  'العديسات': 70,
  'الحيط': 50,
  'ارمنت الوابورات': 70,
  'الصعايده': 30,
  'الأقالته': 70
};

router.post('/', auth, async (req, res) => {
  try {
    const { deliveryAddress, specialInstructions, phone } = req.body;
    console.log('POST /api/orders by user', req.user?._id);
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const validItems = cart.items.filter(item => item.product);
    if (validItems.length === 0) {
      cart.items = [];
      await cart.save();
      return res.status(400).json({ error: 'All items in cart are no longer available. Cart cleared.' });
    }
    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    const items = validItems.map(item => ({
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
    const dr = await getOrCreateDailyRevenue();
    dr.totalRevenue += Math.max(total, 0);
    dr.totalOrders += 1;
    await dr.save();
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('ORDER ERROR:', error.message, error.code, error.stack?.slice(0, 200));
    res.status(500).json({ error: error.message + (error.code ? ' (code: ' + error.code + ')' : '') });
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
      preparing: '👨‍🍳 طلبك قيد التحضير',
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
    const dr = await getOrCreateDailyRevenue();
    res.json(dr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/revenue/history', adminAuth, async (req, res) => {
  try {
    const history = await DailyRevenue.find({ isToday: false }).sort('-date').limit(30);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: test order creation
router.post('/test', auth, async (req, res) => {
  try {
    const dr = await getOrCreateDailyRevenue();
    const order = new Order({
      user: req.user._id,
      items: [{ product: req.user._id, name: 'Test', nameAr: 'اختبار', quantity: 1, price: 10 }],
      subtotal: 10, deliveryFee: 0, total: 10,
      orderNumber: 9999,
      deliveryAddress: { city: 'Test', deliveryArea: '' },
      phone: req.user.phone || '01000000000'
    });
    await order.save();
    dr.totalRevenue += 10;
    dr.totalOrders += 1;
    await dr.save();
    res.json({ ok: true, orderId: order._id });
  } catch (e) {
    res.status(500).json({ error: 'Test order failed: ' + e.message, code: e.code });
  }
});

module.exports = router;
