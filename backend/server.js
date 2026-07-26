const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const envResult = dotenv.config({ path: require('path').join(__dirname, '.env') });
if (envResult.error) console.log('dotenv warning:', envResult.error.message);
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quick_pizza')
  .then(async () => {
    console.log('MongoDB connected');
    const Category = require('./models/Category');
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('Empty database detected, running seed...');
      require('./seed');
    }
  })
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Quick Pizza server running on port ${PORT}`);
});
