const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const envResult = dotenv.config({ path: require('path').join(__dirname, '.env') });
if (envResult.error) console.log('dotenv warning:', envResult.error.message);
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve static files and no-cache for HTML
app.use(express.static(path.join(__dirname, '../frontend'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.htm')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }
}));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quick_pizza')
  .then(async () => {
    console.log('MongoDB connected');
    // Drop stale unique index on orderNumber (daily reset makes it invalid)
    try {
      const db = mongoose.connection.db;
      const indexes = await db.collection('orders').indexes();
      for (const idx of indexes) {
        if (idx.name === 'orderNumber_1' || (idx.key && idx.key.orderNumber === 1)) {
          if (idx.unique) {
            await db.collection('orders').dropIndex(idx.name);
            console.log('Dropped unique index on orderNumber');
          }
        }
      }
    } catch (e) { console.log('Index cleanup note:', e.message); }
    const Category = require('./models/Category');
    const Product = require('./models/Product');
    const catCount = await Category.countDocuments();
    const prodCount = await Product.countDocuments();
    if (catCount === 0 || prodCount === 0) {
      console.log(`Empty ${catCount === 0 ? 'categories' : 'products'} detected, running seed...`);
      const seed = require('./seed');
      await seed(true);
    }
  })
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check for uptime monitoring
app.get('/api/health', async (req, res) => {
  let indexes = [];
  try {
    const db = mongoose.connection.db;
    indexes = await db.collection('orders').indexes();
  } catch (_) {}
  res.json({ status: 'ok', version: '56aea01', indexes, timestamp: new Date().toISOString() });
});

// Manual re-seed endpoint (admin only)
app.post('/api/seed', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('./models/User');
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    console.log('Manual re-seed triggered by admin...');
    const seed = require('./seed');
    await seed(true);
    res.json({ success: true, message: 'تم إعادة البذر بنجاح' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Quick Pizza server running on port ${PORT}`);
});
