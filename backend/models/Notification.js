const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  url: { type: String, default: '/' },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['order', 'promo', 'general'], default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
