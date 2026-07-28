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

router.post('/restore', adminAuth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    if (data.users) {
      for (const u of data.users) {
        await User.findByIdAndUpdate(u._id, u, { upsert: true });
      }
    }
    if (data.categories) {
      await Category.deleteMany({});
      for (const c of data.categories) {
        await new Category(c).save();
      }
    }
    if (data.products) {
      await Product.deleteMany({});
      for (const p of data.products) {
        await new Product(p).save();
      }
    }
    if (data.orders) {
      await Order.deleteMany({});
      for (const o of data.orders) {
        await new Order(o).save();
      }
    }
    if (data.carts) {
      await Cart.deleteMany({});
      for (const c of data.carts) {
        await new Cart(c).save();
      }
    }
    if (data.weeklyRevenue) {
      await WeeklyRevenue.deleteMany({});
      for (const w of data.weeklyRevenue) {
        await new WeeklyRevenue(w).save();
      }
    }

    res.json({ success: true, message: 'تم استعادة الباك أب بنجاح ✅' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
