const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  nameAr: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  size: String,
  toppings: [String],
  specialInstructions: String
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    city: String,
    district: String,
    street: String,
    location: String,
    deliveryArea: { type: String, default: '' }
  },
  phone: { type: String, default: '' },
  estimatedDelivery: Date,
  actualDelivery: Date,
  rating: { type: Number, min: 1, max: 5 },
  review: String,
  specialInstructions: String,
  orderNumber: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
