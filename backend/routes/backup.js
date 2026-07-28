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

function cleanDoc(doc, skipOrderNum) {
  if (!doc || typeof doc !== 'object') return doc;
  const cleaned = { ...doc };
  delete cleaned.__v;
  if (skipOrderNum || (cleaned.orderNumber && typeof cleaned.orderNumber === 'string')) {
    delete cleaned.orderNumber;
  }
  return cleaned;
}

router.post('/restore', adminAuth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    // 1. Restore orders (this is what users care about most)
    if (data.orders) {
      await Order.deleteMany({});
      for (const o of data.orders) {
        const doc = cleanDoc(o, true);
        delete doc.paymentMethod;
        await new Order(doc).save();
      }
    }

    // 2. Restore weekly revenue
    if (data.weeklyRevenue && data.weeklyRevenue.length > 0) {
      await WeeklyRevenue.deleteMany({});
      for (const w of data.weeklyRevenue) {
        await new WeeklyRevenue(cleanDoc(w)).save();
      }
    }

    // 3. Restore categories & products (menu)
    if (data.categories) {
      await Category.deleteMany({});
      for (const c of data.categories) {
        await new Category(cleanDoc(c)).save();
      }
    }
    if (data.products) {
      await Product.deleteMany({});
      for (const p of data.products) {
        await new Product(cleanDoc(p)).save();
      }
    }

    // 4. Restore carts
    if (data.carts) {
      await Cart.deleteMany({});
      for (const c of data.carts) {
        await new Cart(cleanDoc(c)).save();
      }
    }

    // 5. Don't restore users (they already exist in DB, password field is excluded from backup)
    //    Just update non-sensitive fields if needed
    if (data.users) {
      for (const u of data.users) {
        const existing = await User.findById(u._id);
        if (existing) {
          existing.name = u.name || existing.name;
          existing.email = u.email || existing.email;
          existing.phone = u.phone || existing.phone;
          existing.address = u.address || existing.address;
          existing.role = u.role || existing.role;
          await existing.save();
        }
      }
    }

    res.json({ success: true, message: 'تم استعادة الباك أب بنجاح ✅' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
