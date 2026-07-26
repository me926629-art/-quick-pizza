const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String, default: '' },
  descriptionAr: { type: String, default: '' },
  price: { type: Number, required: true },
  priceLarge: { type: Number },
  image: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  sizes: [{
    name: String,
    nameAr: String,
    price: Number
  }],
  toppings: [{
    name: String,
    nameAr: String,
    price: Number
  }],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  spicyLevel: { type: Number, default: 0, min: 0, max: 3 },
  calories: { type: Number },
  prepTime: { type: Number, default: 15 },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
