const mongoose = require('mongoose');

const weeklyRevenueSchema = new mongoose.Schema({
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  isCurrent: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyRevenue', weeklyRevenueSchema);
