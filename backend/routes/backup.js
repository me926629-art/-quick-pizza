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

function clean(doc) {
  const c = { ...doc };
  delete c._id;
  delete c.__v;
  return c;
}

router.post('/restore', adminAuth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    const restored = [];

    for (const col of ['orders', 'weeklyRevenue', 'categories', 'products', 'carts', 'users']) {
      if (!data[col] || !data[col].length) continue;
      const Model = { orders: Order, weeklyRevenue: WeeklyRevenue, categories: Category, products: Product, carts: Cart, users: User }[col];
      let count = 0;
      for (const doc of data[col]) {
        try {
          await new Model(clean(doc)).save();
          count++;
        } catch (e) {
          console.error('Restore error in ' + col + ':', e.message);
        }
      }
      restored.push(col + ': ' + count + '/' + data[col].length);
    }

    res.json({ success: true, message: '✅ ' + restored.join(' | ') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
