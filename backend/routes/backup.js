const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const DailyRevenue = require('../models/DailyRevenue');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const [users, products, categories, orders, carts, dailyRevenue] = await Promise.all([
      User.find().select('-password'),
      Product.find(),
      Category.find(),
      Order.find(),
      Cart.find(),
      DailyRevenue.find()
    ]);

    const backup = {
      date: new Date().toISOString(),
      data: { users, products, categories, orders, carts, dailyRevenue }
    };

    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/restore', adminAuth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    const restored = [];

    for (const col of ['categories', 'products', 'orders', 'dailyRevenue', 'carts', 'users']) {
      if (!data[col] || !data[col].length) continue;
      const Model = { orders: Order, dailyRevenue: DailyRevenue, categories: Category, products: Product, carts: Cart, users: User }[col];
      let ok = 0, fail = 0;

      // For categories & products: replace entirely (delete old, insert backup)
      if (col === 'categories' || col === 'products') {
        await Model.deleteMany({});
      }

      for (const doc of data[col]) {
        try {
          const { _id, __v, ...rest } = doc;
          if (_id) {
            await Model.findByIdAndUpdate(_id, rest, { upsert: true, runValidators: false });
          } else {
            await new Model(rest).save();
          }
          ok++;
        } catch (e) {
          fail++;
          console.error('Restore error in ' + col + ':', e.message.slice(0, 80));
        }
      }
      restored.push(col + ': ' + ok + '/' + (ok + fail));
    }

    res.json({ success: true, message: '✅ ' + restored.join(' | ') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
