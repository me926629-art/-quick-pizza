const mongoose = require('mongoose');

const dailyRevenueSchema = new mongoose.Schema({
  date: { type: String, required: true },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  isToday: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DailyRevenue', dailyRevenueSchema);
