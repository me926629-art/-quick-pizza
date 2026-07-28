const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const WeeklyRevenue = require('../models/WeeklyRevenue');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const [users, products, categories, orders, carts, weeklyRevenue] = await Promise.all([
      User.find().select('-password'),
      Product.find(),
      Category.find(),
      Order.find(),
      Cart.find(),
      WeeklyRevenue.find()
    ]);

    const backup = {
      date: new Date().toISOString(),
      data: { users, products, categories, orders, carts, weeklyRevenue }
    };

    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function safe(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const c = { ...doc };
  delete c.__v;
  return c;
}

async function upsertMany(Model, docs) {
  if (!docs || docs.length === 0) return;
  const errors = [];
  for (const d of docs) {
    try {
      const clean = safe(d);
      await Model.findByIdAndUpdate(clean._id, clean, { upsert: true, runValidators: false });
    } catch (e) {
      errors.push(e.message);
    }
  }
  return errors;
}

router.post('/restore', adminAuth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    const allErrors = [];

    // Upsert everything — no deleteMany, safe even if partial failure
    const oErr = await upsertMany(Order, data.orders);
    if (oErr.length) allErrors.push('Orders: ' + oErr.join(', '));

    const wErr = await upsertMany(WeeklyRevenue, data.weeklyRevenue);
    if (wErr.length) allErrors.push('Revenue: ' + wErr.join(', '));

    const cErr = await upsertMany(Category, data.categories);
    if (cErr.length) allErrors.push('Categories: ' + cErr.join(', '));

    const pErr = await upsertMany(Product, data.products);
    if (pErr.length) allErrors.push('Products: ' + pErr.join(', '));

    const cartErr = await upsertMany(Cart, data.carts);
    if (cartErr.length) allErrors.push('Carts: ' + cartErr.join(', '));

    if (data.users) {
      for (const u of data.users) {
        try {
          const existing = await User.findById(u._id);
          if (existing) {
            if (u.name) existing.name = u.name;
            if (u.email) existing.email = u.email;
            if (u.phone) existing.phone = u.phone;
            if (u.address) existing.address = u.address;
            if (u.role) existing.role = u.role;
            await existing.save();
          }
        } catch (e) {
          allErrors.push('User: ' + e.message);
        }
      }
    }

    const msg = allErrors.length
      ? 'تم الاستعادة مع بعض الأخطاء: ' + allErrors.join(' | ')
      : 'تم استعادة الباك أب بنجاح ✅';
    res.json({ success: true, message: msg, errors: allErrors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
