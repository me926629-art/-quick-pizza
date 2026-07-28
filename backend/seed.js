const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const seed = async (force) => {
  const needsConnect = mongoose.connection.readyState === 0;
  if (needsConnect) await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quick_pizza');
  if (needsConnect) console.log('Connected to MongoDB');

  if (force) {
    console.log('Force mode: clearing existing categories and products...');
    await Product.deleteMany({});
    await Category.deleteMany({});
  }

  const cats = await Category.insertMany([
    { name: 'Savory Pies', nameAr: 'فطائر حادق', icon: '🫓', order: 2 },
    { name: 'Sandwiches', nameAr: 'سندوتشات', icon: '🥪', order: 3 },
    { name: 'Panini', nameAr: 'بانيني', icon: '🥖', order: 4 },
    { name: 'Grill & BBQ', nameAr: 'مشويات', icon: '🥩', order: 5 },
    { name: 'Extras', nameAr: 'إضافات الوجبات', icon: '➕', order: 6 },
    { name: 'Soup', nameAr: 'شوربة', icon: '🍜', order: 7 },
    { name: 'Savory Crepes', nameAr: 'كريب حادق', icon: '🥞', order: 8 },
    { name: 'Calzone', nameAr: 'كالزوني', icon: '🥟', order: 9 },
    { name: 'Italian Pasta', nameAr: 'معجنات إيطالية', icon: '🍝', order: 10 },
    { name: 'Sweet Pies', nameAr: 'فطائر حلو', icon: '🥮', order: 11 },
    { name: 'Sweet Crepes', nameAr: 'كريب حلو', icon: '🫓', order: 12 },
    { name: 'Salads & Appetizers', nameAr: 'سلطات ومقبلات', icon: '🥗', order: 13 },
    { name: 'Beverages', nameAr: 'مشروبات', icon: '🥤', order: 14 }
  ]);
  const cm = {};
  cats.forEach(c => cm[c.name] = c._id);
  console.log('Categories created');

  const products = [
    // ===== 1. Pizza =====
    { nameAr: 'بيتزا دجاج تشيدر (سوسيس)', descriptionAr: 'سوسيس - جبنة تشيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 135 }, { name: 'Medium', nameAr: 'متوسطة', price: 180 }, { name: 'Large', nameAr: 'كبيرة', price: 200 }, { name: 'Slice', nameAr: 'شريحة', price: 50 }] },
    { nameAr: 'بيتزا مارجريتا', descriptionAr: 'جبنة موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 145 }, { name: 'Medium', nameAr: 'متوسطة', price: 185 }, { name: 'Large', nameAr: 'كبيرة', price: 210 }, { name: 'Slice', nameAr: 'شريحة', price: 50 }] },
    { nameAr: 'بيتزا مشكل جبن', descriptionAr: 'موتزاريلا - رومي - شيدر - جودة - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 145 }, { name: 'Medium', nameAr: 'متوسطة', price: 185 }, { name: 'Large', nameAr: 'كبيرة', price: 210 }, { name: 'Slice', nameAr: 'شريحة', price: 50 }] },
    { nameAr: 'بيتزا كيري', descriptionAr: 'كيري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 165 }, { name: 'Medium', nameAr: 'متوسطة', price: 195 }, { name: 'Large', nameAr: 'كبيرة', price: 240 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا فراخ', descriptionAr: 'صدور فراخ متبلة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 165 }, { name: 'Medium', nameAr: 'متوسطة', price: 210 }, { name: 'Large', nameAr: 'كبيرة', price: 250 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا فراخ على مشكل جبن', descriptionAr: 'صدور فراخ متبلة - شيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 165 }, { name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا شاورما فراخ', descriptionAr: 'شاورما فراخ - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 165 }, { name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا شاورما فراخ على مشكل جبن', descriptionAr: 'شاورما فراخ - موتزاريلا - جبن رومي - جبن شيدر - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 175 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 275 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا بانيه', descriptionAr: 'بانيه - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 165 }, { name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 275 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا شيش طاووق', descriptionAr: 'شيش طاووق - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 165 }, { name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 275 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا مشكل فراخ', descriptionAr: 'فراخ بانية - شاورما - شيش طاووق - بانيه نوجتس - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 180 }, { name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 275 }] },
    { nameAr: 'بيتزا سموكد تركي', descriptionAr: 'تركي مدخن - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 220 }, { name: 'Medium', nameAr: 'متوسطة', price: 245 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }, { name: 'Slice', nameAr: 'شريحة', price: 65 }] },
    { nameAr: 'بيتزا تشكن كرستي', descriptionAr: 'فراخ كرسبي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 175 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 280 }, { name: 'Slice', nameAr: 'شريحة', price: 65 }] },
    { nameAr: 'بيتزا تشكن رانتش', descriptionAr: 'فراخ - صوص رانتش - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 175 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 280 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا لحمة مفرومة بلدي', descriptionAr: 'لحمة مفرومة بلدي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 165 }, { name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 255 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا لحمة مفرومة بلدي على مشكل جبن', descriptionAr: 'لحم بلدي مفروم - مشكل جبن - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 175 }, { name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا مكس باربيكيو', descriptionAr: 'لحم بلدي مفروم - حواوشي - شيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 180 }, { name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 280 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا شاورما لحمة', descriptionAr: 'شاورما لحمة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 180 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 285 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا شاورما لحمة على مشكل جبن', descriptionAr: 'شاورما لحمة - جبن رومي - جبن شيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 185 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 285 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا مكس باربيكيو لحوم', descriptionAr: 'شاورما لحمة - سوسيس - رومي - شيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 180 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 285 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا سوبر سوبريم', descriptionAr: 'لحم مفروم - سجق - بسطرمة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 190 }, { name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا كويك', descriptionAr: 'سجق - بسطرمة - كيري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 190 }, { name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا سجق بلدي', descriptionAr: 'سجق بلدي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 170 }, { name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا سوسيس أو هوت دوج', descriptionAr: 'سوسيس - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 185 }, { name: 'Medium', nameAr: 'متوسطة', price: 240 }, { name: 'Large', nameAr: 'كبيرة', price: 300 }, { name: 'Slice', nameAr: 'شريحة', price: 70 }] },
    { nameAr: 'بيتزا بسطرمة', descriptionAr: 'بسطرمة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 180 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا بسطرمة كيري', descriptionAr: 'بسطرمة - كيري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 185 }, { name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا سلامي', descriptionAr: 'سلامي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 210 }, { name: 'Medium', nameAr: 'متوسطة', price: 275 }, { name: 'Large', nameAr: 'كبيرة', price: 320 }, { name: 'Slice', nameAr: 'شريحة', price: 70 }] },
    { nameAr: 'بيتزا برجر', descriptionAr: 'برجر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 220 }, { name: 'Medium', nameAr: 'متوسطة', price: 245 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }, { name: 'Slice', nameAr: 'شريحة', price: 60 }] },
    { nameAr: 'بيتزا سموكي برجر', descriptionAr: 'برجر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 160 }, { name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 275 }] },
    { nameAr: 'بيتزا سوبر برجر', descriptionAr: 'برجر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 175 }, { name: 'Medium', nameAr: 'متوسطة', price: 235 }, { name: 'Large', nameAr: 'كبيرة', price: 285 }, { name: 'Slice', nameAr: 'شريحة', price: 70 }] },
    { nameAr: 'بيتزا تونة', descriptionAr: 'تونة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 180 }, { name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 275 }] },
    { nameAr: 'بيتزا كالاماري', descriptionAr: 'جمبري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 200 }, { name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا جمبري', descriptionAr: 'جمبري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 230 }, { name: 'Medium', nameAr: 'متوسطة', price: 270 }, { name: 'Large', nameAr: 'كبيرة', price: 320 }, { name: 'Slice', nameAr: 'شريحة', price: 65 }] },
    { nameAr: 'بيتزا جمبري وسبيط', descriptionAr: 'جمبري - سبيط - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 240 }, { name: 'Medium', nameAr: 'متوسطة', price: 280 }, { name: 'Large', nameAr: 'كبيرة', price: 325 }, { name: 'Slice', nameAr: 'شريحة', price: 65 }] },
    { nameAr: 'بيتزا سي فود', descriptionAr: 'أسماك - جمبري - سبيط - تونة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 250 }, { name: 'Medium', nameAr: 'متوسطة', price: 285 }, { name: 'Large', nameAr: 'كبيرة', price: 330 }, { name: 'Slice', nameAr: 'شريحة', price: 65 }] },
    { nameAr: 'بيتزا فورسيزون', descriptionAr: 'ربع مشكل جبن - ربع سجق - ربع مشكل لحوم - ربع كويك الباب', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 250 }, { name: 'Medium', nameAr: 'متوسطة', price: 285 }, { name: 'Large', nameAr: 'كبيرة', price: 330 }, { name: 'Slice', nameAr: 'شريحة', price: 65 }] },
    { nameAr: 'بيتزا سي رانش', descriptionAr: 'جمبري - كالاماري - صوص رانش - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 250 }, { name: 'Medium', nameAr: 'متوسطة', price: 285 }, { name: 'Large', nameAr: 'كبيرة', price: 330 }, { name: 'Slice', nameAr: 'شريحة', price: 65 }] },
    { nameAr: 'بيتزا مشروم', descriptionAr: 'مشروم - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 155 }, { name: 'Medium', nameAr: 'متوسطة', price: 195 }, { name: 'Large', nameAr: 'كبيرة', price: 230 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا سبانخ', descriptionAr: 'سبانخ - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 155 }, { name: 'Medium', nameAr: 'متوسطة', price: 195 }, { name: 'Large', nameAr: 'كبيرة', price: 230 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا كونستانتينوس', descriptionAr: 'بيتزا سبانخ - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 150 }, { name: 'Medium', nameAr: 'متوسطة', price: 190 }, { name: 'Large', nameAr: 'كبيرة', price: 225 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },
    { nameAr: 'بيتزا عبد القديسين', descriptionAr: 'بيتزا سبانخ - مشروم - فلفل رومي - طماطم - زيتون', category: cm['Pizza'], sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 155 }, { name: 'Medium', nameAr: 'متوسطة', price: 195 }, { name: 'Large', nameAr: 'كبيرة', price: 230 }, { name: 'Slice', nameAr: 'شريحة', price: 55 }] },

    // ===== 2. Savory Pies =====
    { nameAr: 'فطيرة بالجبنة الرومي', descriptionAr: 'جبنة رومي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 185 }, { name: 'Large', nameAr: 'كبيرة', price: 215 }] },
    { nameAr: 'فطيرة كيري', descriptionAr: 'كيري - رومي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 195 }, { name: 'Large', nameAr: 'كبيرة', price: 230 }] },
    { nameAr: 'فطيرة مشكل جبن', descriptionAr: 'شيدر - جبنة رومي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 195 }, { name: 'Large', nameAr: 'كبيرة', price: 230 }] },
    { nameAr: 'فطيرة بالفراخ', descriptionAr: 'صدور دجاج - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 245 }] },
    { nameAr: 'فطيرة بالفراخ على مشكل جبن', descriptionAr: 'صدور دجاج - جبن شيدر - رومي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 250 }] },
    { nameAr: 'فطيرة شاورما فراخ', descriptionAr: 'شاورما فراخ - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 250 }] },
    { nameAr: 'فطيرة شاورما فراخ على مشكل جبن', descriptionAr: 'شاورما فراخ - جبن رومي - جبن شيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 260 }] },
    { nameAr: 'فطيرة فراخ باربيكيو', descriptionAr: 'سوسيس - طماطم - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 265 }] },
    { nameAr: 'فطيرة فراخ بانيه', descriptionAr: 'فراخ بانيه - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 255 }] },
    { nameAr: 'فطيرة مشكل فراخ', descriptionAr: 'شيش طاووق - شاورما فراخ - بانيه - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 275 }] },
    { nameAr: 'فطيرة سموكد تركي', descriptionAr: 'تركي مدخن - رومي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 245 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }] },
    { nameAr: 'فطيرة تشكن كرسبي', descriptionAr: 'كرسبي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }] },
    { nameAr: 'فطيرة تشكن رانتش', descriptionAr: 'فراخ - صوص رانتش - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }] },
    { nameAr: 'فطيرة تشكن باربيكيو', descriptionAr: 'فراخ - صوص باربيكيو - حلقات بصل - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }] },
    { nameAr: 'فطيرة لحمة مفرومة', descriptionAr: 'لحم مفروم - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 205 }, { name: 'Large', nameAr: 'كبيرة', price: 240 }] },
    { nameAr: 'فطيرة لحمة مفرومة على مشكل جبن', descriptionAr: 'لحم مفروم - رومي - حمص - شيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 210 }, { name: 'Large', nameAr: 'كبيرة', price: 245 }] },
    { nameAr: 'فطيرة شاورما لحمة', descriptionAr: 'شاورما لحمة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 250 }] },
    { nameAr: 'فطيرة شاورما لحمة على مشكل جبن', descriptionAr: 'شاورما لحمة - جبن رومي - جبن شيدر - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 260 }] },
    { nameAr: 'فطيرة مكس باربيكيو', descriptionAr: 'سوسيس - لحمة مفرومة - صوص باربيكيو - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 265 }] },
    { nameAr: 'فطيرة سوبر سوبريم', descriptionAr: 'لحم مفروم - سجق - بسطرمة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 225 }, { name: 'Large', nameAr: 'كبيرة', price: 265 }] },
    { nameAr: 'فطيرة كويك', descriptionAr: 'سجق بلدي - بسطرمة - كيري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 280 }] },
    { nameAr: 'فطيرة سجق بلدي', descriptionAr: 'سجق بلدي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 205 }, { name: 'Large', nameAr: 'كبيرة', price: 245 }] },
    { nameAr: 'فطيرة سجق كيري', descriptionAr: 'سجق بلدي - كيري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 235 }, { name: 'Large', nameAr: 'كبيرة', price: 285 }] },
    { nameAr: 'فطيرة سوسيس أو هوت دوج', descriptionAr: 'سوسيس أو هوت دوج - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 280 }] },
    { nameAr: 'فطيرة بسطرمة', descriptionAr: 'بسطرمة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 220 }, { name: 'Large', nameAr: 'كبيرة', price: 265 }] },
    { nameAr: 'فطيرة بسطرمة كيري', descriptionAr: 'بسطرمة - كيري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 245 }, { name: 'Large', nameAr: 'كبيرة', price: 300 }] },
    { nameAr: 'فطيرة سلامي', descriptionAr: 'سلامي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 245 }, { name: 'Large', nameAr: 'كبيرة', price: 290 }] },
    { nameAr: 'فطيرة كبده بلدي', descriptionAr: 'كبده بلدي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }] },
    { nameAr: 'فطيرة سموكي برجر', descriptionAr: 'برجر سموكي - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 230 }, { name: 'Large', nameAr: 'كبيرة', price: 280 }] },
    { nameAr: 'فطيرة تونة', descriptionAr: 'تونة - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 215 }, { name: 'Large', nameAr: 'كبيرة', price: 250 }] },
    { nameAr: 'فطيرة جمبري', descriptionAr: 'جمبري - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 270 }, { name: 'Large', nameAr: 'كبيرة', price: 315 }] },
    { nameAr: 'فطيرة سي فود', descriptionAr: 'جمبري - سبيط - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 275 }, { name: 'Large', nameAr: 'كبيرة', price: 315 }] },
    { nameAr: 'فطيرة سي رانش', descriptionAr: 'جمبري - كالاماري - موتزاريلا - فلفل رومي - طماطم - صوص رانتش', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 275 }, { name: 'Large', nameAr: 'كبيرة', price: 315 }] },
    { nameAr: 'فطيرة مشروم', descriptionAr: 'مشروم - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 190 }, { name: 'Large', nameAr: 'كبيرة', price: 225 }] },
    { nameAr: 'فطيرة خضراوات', descriptionAr: 'فلفل رومي - طماطم - زيتون - موتزاريلا', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 185 }, { name: 'Large', nameAr: 'كبيرة', price: 215 }] },
    { nameAr: 'فطيرة سبانخ', descriptionAr: 'سبانخ - موتزاريلا - فلفل رومي - طماطم - زيتون', category: cm['Savory Pies'], sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 190 }, { name: 'Large', nameAr: 'كبيرة', price: 225 }] },

    // ===== 3. Sandwiches =====
    { nameAr: 'ساندوتش برجر لحم أو فراخ سادة', descriptionAr: 'لحمة أو فراخ - بصل - طماطم - خس - خيار مخلل - خلطة كويك العجيبة', price: 135, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش برجر لحم أو فراخ بالجبنة', descriptionAr: 'لحمة أو فراخ - بصل - طماطم - خس - خيار مخلل - جبنة شيدر - خلطة كويك العجيبة', price: 140, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش برجر لحمة أو فراخ دبل بالجبنة', descriptionAr: 'دبل لحم أو دبل فراخ', price: 170, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش فاهيتا لحمة', descriptionAr: 'لحمة - فلفل أحمر واصفر - مشروم - فاهيتا - مايونيز - توابل كويك السحرية - جبنا - زيتون', price: 155, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش كفتة لبناني', descriptionAr: 'كفتة مشوية - معجون طحينة - تحويجة كويك السحرية - خيار مخلل - خس - كابوتشا', price: 130, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش سوسيس أو هوت دوج', descriptionAr: 'هوت دوج أو سوسيس - عشترود - زيتون - فلفل أخضر - طماطم', price: 130, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش شاورما لحمة (عيش باجت أو سوري)', descriptionAr: 'لحمة - طماطم - فلفل - بصل - طحينة - كاتشب - بهارات', price: 150, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش كبدة بقرية أو جريل (حارة أو غير حارة)', descriptionAr: 'كبده - بصل - فلفل - مخلل - طحينة', price: 135, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش كباب عيش بلدي', descriptionAr: 'سيس كباب - صوص مشوية - طماطم', price: 160, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش كفتة عيش بلدي', descriptionAr: 'سيس كفتة - صوص طحينة - طماطم', price: 100, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش طرب عيش بلدي', descriptionAr: 'طرب - صوص طحينة - طماطم', price: 100, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش حواوشي لحمة بلدي', descriptionAr: 'لحمة مفروم أو سجق - وابل - كويك السحرية + مخلل+بطاطس', price: 100, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش بوم فريت', price: 100, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش شاورما فراخ (عيش باجت أو سوري)', descriptionAr: 'فراخ - طماطم - فلفل - بهارات - ثومية - كاتشب - خلطة كويك العجيبة', price: 160, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش فراخ بانيه', descriptionAr: 'صدور فراخ - مايونيز - خلطة كويك السحرية - خيار مخلل - خس كابوتشا', price: 160, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش فاهيتا فراخ', descriptionAr: 'فراخ صوص باربيكيو - بصل - موتزاريلا - زيتون - مايونيز - توابل كويك الحارة أو العادية', price: 160, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش كوردن بلو', descriptionAr: 'صدور فراخ - جبنة شيدر - سلامي وشيدر ورومي مدخن - خيار - مايونيز - موتزاريلا - بهارات كويك', price: 170, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش أصابع الفراخ الحارة', descriptionAr: 'صدور فراخ - خلطة كويك العجيبة - بهارات كويك السحرية - خس كابوتشا', price: 135, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش شيش طاووق', descriptionAr: 'فراخ شيش - بصل - فلفل - مشروم - بهارات كويك السحرية - خس كابوتشا', price: 135, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش كويك فراخ', descriptionAr: 'صدور فراخ - بصل - فلفل - مشروم - موتزاريلا - مايونيز - صوص - صوص مستردة - خس كابوتشا', price: 165, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش تشيكن كرسبي', descriptionAr: 'فراخ كرسبي - خس كابوتشا - مايونيز - بهارات كويك السحرية - خيار مخلل', price: 170, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش تشيكن زون', descriptionAr: 'صدور فراخ سوسيس - طماطم - خس كابوتشا - مايونيز', price: 170, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش تونة', descriptionAr: 'تونة - بهارات كويك السحرية - خس كابوتشا - مستردة - ليمون', price: 130, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش سمك فيليه', descriptionAr: 'سمك فيليه - بهارات كويك السحرية - خس كابوتشا', price: 140, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش جمبري جريل أو بانيه', descriptionAr: 'جمبري مشوي أو مقلي - مستردة - بهارات كويك السحرية - صوص جرين ثوم - ليمون', price: 210, category: cm['Sandwiches'] },
    { nameAr: 'ساندوتش سي فود', descriptionAr: 'سمك - سبيط - جمبري - مستردة - بهارات كويك السحرية', price: 230, category: cm['Sandwiches'] },

    // ===== 4. Panini =====
    { nameAr: 'بانيني خضراوات ومشروم', descriptionAr: 'مشروم - صوص البانيني - فلفل - بصل - جرجير', price: 165, category: cm['Panini'] },
    { nameAr: 'بانيني تشيز', descriptionAr: 'موتزاريلا - شيدر - رومي - صوص البانيني - فلفل أسود', price: 150, category: cm['Panini'] },
    { nameAr: 'بانيني كوردن بلو', descriptionAr: 'فراخ - لحم دمي رومي مدخن - صوص البانيني - زعتر - بصل - جرجير', price: 180, category: cm['Panini'] },
    { nameAr: 'بانيني روزبيف', descriptionAr: 'لحمة - صوص البانيني - زعتر - بصل - جرجير', price: 180, category: cm['Panini'] },

    // ===== 5. Grill & BBQ =====
    { nameAr: 'شيش كباب', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 365, category: cm['Grill & BBQ'] },
    { nameAr: 'شيش كفتة', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 315, category: cm['Grill & BBQ'] },
    { nameAr: 'كباب وكفتة مكس', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 365, category: cm['Grill & BBQ'] },
    { nameAr: 'ريش مشوي على الفحم', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 365, category: cm['Grill & BBQ'] },
    { nameAr: 'مكس جريل', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 365, category: cm['Grill & BBQ'] },
    { nameAr: 'شيش طاووق', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 355, category: cm['Grill & BBQ'] },
    { nameAr: 'كبدة بلدي مشوي على الفحم', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 360, category: cm['Grill & BBQ'] },
    { nameAr: 'حمام محشي فريك أو أرز', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 320, category: cm['Grill & BBQ'] },
    { nameAr: 'فراخ مكسيكي', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 320, category: cm['Grill & BBQ'] },
    { nameAr: 'ربع فراخ على الفحم', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 180, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف فراخ على الفحم', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 300, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف فراخ على الفحم سادة', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 290, category: cm['Grill & BBQ'] },
    { nameAr: 'فرخة كاملة مشوية', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 395, category: cm['Grill & BBQ'] },
    { nameAr: 'فراخ كوردن بلو', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 360, category: cm['Grill & BBQ'] },
    { nameAr: 'موزة بتلو', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 365, category: cm['Grill & BBQ'] },
    { nameAr: 'ستيك', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 365, category: cm['Grill & BBQ'] },
    { nameAr: 'نيفا', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 360, category: cm['Grill & BBQ'] },
    { nameAr: 'طرب', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 360, category: cm['Grill & BBQ'] },
    { nameAr: 'اسكالوب بانية', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 320, category: cm['Grill & BBQ'] },
    { nameAr: 'داوود باشا', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 350, category: cm['Grill & BBQ'] },
    { nameAr: 'فراخ بانية', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 360, category: cm['Grill & BBQ'] },
    { nameAr: 'ورقة لحمة بلدي', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 370, category: cm['Grill & BBQ'] },
    { nameAr: 'تشكن كرسبي', descriptionAr: 'شاملة: شوربة، أرز، سلطة طحينة، وخضراء، عيش', price: 295, category: cm['Grill & BBQ'] },
    { nameAr: 'طاجن خضار باللحمة أو الفراخ أو السمك', price: 280, category: cm['Grill & BBQ'] },
    { nameAr: 'طاجن مسقعة باللحمة', price: 185, category: cm['Grill & BBQ'] },
    { nameAr: 'طاجن مسقعة صيامي', price: 265, category: cm['Grill & BBQ'] },
    { nameAr: 'طاجن سي فود', price: 485, category: cm['Grill & BBQ'] },
    { nameAr: 'جمبري', price: 425, category: cm['Grill & BBQ'] },
    { nameAr: 'سي فود', price: 575, category: cm['Grill & BBQ'] },
    { nameAr: 'سمك فيليه', price: 375, category: cm['Grill & BBQ'] },
    { nameAr: 'وجبة الدايت', price: 285, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو كفتة', price: 590, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو كباب', price: 680, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو ريش', price: 670, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو نيفا', price: 650, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو طرب', price: 585, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو كبده', price: 670, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو موزه', price: 680, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف استيك', price: 680, category: cm['Grill & BBQ'] },
    { nameAr: 'نصف كيلو مكس جريل', price: 695, category: cm['Grill & BBQ'] },

    // ===== 6. Extras =====
    { nameAr: 'ربع فراخ سادة', price: 110, category: cm['Extras'] },
    { nameAr: 'قطعتين شيش طاووق', price: 135, category: cm['Extras'] },
    { nameAr: 'قطعتين كباب', price: 145, category: cm['Extras'] },
    { nameAr: 'قطعتين كفتة', price: 145, category: cm['Extras'] },
    { nameAr: 'قطعة استيك', price: 145, category: cm['Extras'] },
    { nameAr: 'قطعة كبدة بلدي', price: 145, category: cm['Extras'] },
    { nameAr: 'قطعة ريش أو نيفا', price: 145, category: cm['Extras'] },
    { nameAr: 'صابع كفتة أو طرب', price: 60, category: cm['Extras'] },
    { nameAr: 'قطعة كوردون بلو', price: 140, category: cm['Extras'] },
    { nameAr: 'قطعة بانية', price: 140, category: cm['Extras'] },
    { nameAr: 'فرخة حمام', price: 220, category: cm['Extras'] },
    { nameAr: 'قطعة جمبري جامبو', price: 90, category: cm['Extras'] },
    { nameAr: 'طاجن خضار', price: 50, category: cm['Extras'] },
    { nameAr: 'طبق أرز', price: 35, category: cm['Extras'] },

    // ===== 7. Soup =====
    { nameAr: 'شوربة لسان عصفور', price: 55, category: cm['Soup'] },
    { nameAr: 'شوربة خضار', price: 75, category: cm['Soup'] },
    { nameAr: 'شوربة عدس', price: 85, category: cm['Soup'] },
    { nameAr: 'شوربة كريمة', price: 95, category: cm['Soup'] },
    { nameAr: 'ستافت كراست موتزاريلا', price: 95, category: cm['Soup'] },
    { nameAr: 'كيري أو هوت دوج', price: 75, category: cm['Soup'] },
    { nameAr: 'موتزاريلا أو مشروم', price: 75, category: cm['Soup'] },
    { nameAr: 'لحوم أو فراخ', price: 80, category: cm['Soup'] },
    { nameAr: 'أسماك - جمبري - كالاماري', price: 105, category: cm['Soup'] },
    { nameAr: 'باربيكيو صوص أو رانتش صوص', price: 15, category: cm['Soup'] },

    // ===== 8. Savory Crepes =====
    { nameAr: 'كريب موتزاريلا', descriptionAr: 'موتزاريلا - فلفل - طماطم - زيتون - مايونيز - كاتشب', price: 130, category: cm['Savory Crepes'] },
    { nameAr: 'كريب رومي', descriptionAr: 'شيدر - رومي - فلفل - طماطم - زيتون - كاتشب', price: 140, category: cm['Savory Crepes'] },
    { nameAr: 'كريب مشكل جبن', descriptionAr: 'موتزاريلا - رومي - فلفل - طماطم - زيتون - كاتشب', price: 145, category: cm['Savory Crepes'] },
    { nameAr: 'كريب فراخ', descriptionAr: 'فراخ - موتزاريلا - فلفل - طماطم - زيتون - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب فراخ على مشكل جبن', descriptionAr: 'شاورما فراخ - موتزاريلا - جبن رومي - شيدر - فلفل - زيتون - مايونيز - كاتشب', price: 165, category: cm['Savory Crepes'] },
    { nameAr: 'كريب شاورما فراخ', descriptionAr: 'شاورما فراخ - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 165, category: cm['Savory Crepes'] },
    { nameAr: 'كريب شاورما فراخ على مشكل جبن', descriptionAr: 'شاورما فراخ - موتزاريلا - سوسيس - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 170, category: cm['Savory Crepes'] },
    { nameAr: 'كريب تشكن باربيكيو', descriptionAr: 'فراخ - صوص باربيكيو - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 170, category: cm['Savory Crepes'] },
    { nameAr: 'كريب فراخ بانية', descriptionAr: 'فراخ بانية - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب مشكل فراخ', descriptionAr: 'شيش - فراخ - شاورما - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 175, category: cm['Savory Crepes'] },
    { nameAr: 'كريب شيش طاووق', descriptionAr: 'فراخ شيش - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 175, category: cm['Savory Crepes'] },
    { nameAr: 'كريب تشكن كرسبي', descriptionAr: 'فراخ كرسبي - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 170, category: cm['Savory Crepes'] },
    { nameAr: 'كريب سموكد تركي', descriptionAr: 'سموكد تركي - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 170, category: cm['Savory Crepes'] },
    { nameAr: 'كريب لحمة مفرومة بلدي', descriptionAr: 'لحم مفروم - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب لحمة مفرومة بلدي على مشكل جبن', descriptionAr: 'لحم مفروم - موتزاريلا - جبن رومي - شيدر - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 165, category: cm['Savory Crepes'] },
    { nameAr: 'كريب شاورما لحمة', descriptionAr: 'شاورما لحمة - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 165, category: cm['Savory Crepes'] },
    { nameAr: 'كريب شاورما لحمة على مشكل جبن', descriptionAr: 'شاورما لحمة - موتزاريلا - جبن رومي - شيدر - فلفل - زيتون - مايونيز - كاتشب', price: 170, category: cm['Savory Crepes'] },
    { nameAr: 'كريب مكس باربيكيو', descriptionAr: 'لحم مفروم - صوص باربيكيو - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 175, category: cm['Savory Crepes'] },
    { nameAr: 'كريب سوبر سوبريم', descriptionAr: 'لحم مفروم - سجق - بسطرمة - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 175, category: cm['Savory Crepes'] },
    { nameAr: 'كريب كويك', descriptionAr: 'لحم مفروم - هوت دوج - سجق - بسطرمة - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 180, category: cm['Savory Crepes'] },
    { nameAr: 'كريب سجق', descriptionAr: 'سجق - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 150, category: cm['Savory Crepes'] },
    { nameAr: 'كريب سوسيس أو هوت دوج', descriptionAr: 'سوسيس أو هوت دوج - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 150, category: cm['Savory Crepes'] },
    { nameAr: 'كريب بسطرمة', descriptionAr: 'بسطرمة - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب برجر', descriptionAr: 'برجر - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب كفتة', descriptionAr: 'كفتة - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب سلامي', descriptionAr: 'سلامي - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 175, category: cm['Savory Crepes'] },
    { nameAr: 'كريب كبدة بلدي', descriptionAr: 'كبده بلدي - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب تونة', descriptionAr: 'تونة - موتزاريلا - فلفل رومي - طماطم - زيتون - مستردة - مايونيز - كاتشب', price: 155, category: cm['Savory Crepes'] },
    { nameAr: 'كريب جمبري', descriptionAr: 'جمبري - موتزاريلا - فلفل رومي - طماطم - زيتون - مستردة - مايونيز - كاتشب', price: 225, category: cm['Savory Crepes'] },
    { nameAr: 'كريب سي فود', descriptionAr: 'جمبري - سبيط - موتزاريلا - فلفل رومي - طماطم - زيتون - مستردة - مايونيز - كاتشب', price: 215, category: cm['Savory Crepes'] },
    { nameAr: 'كريب بطاطس', descriptionAr: 'بطاطس - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 130, category: cm['Savory Crepes'] },
    { nameAr: 'كريب مشروم', descriptionAr: 'مشروم - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 145, category: cm['Savory Crepes'] },

    // ===== 9. Calzone =====
    { nameAr: 'كالزوني فراخ', descriptionAr: 'فراخ - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 190, category: cm['Calzone'] },
    { nameAr: 'كالزوني شاورما فراخ', descriptionAr: 'شاورما فراخ - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 195, category: cm['Calzone'] },
    { nameAr: 'كالزوني مشكل فراخ', descriptionAr: 'فراخ بانية - شاورما فراخ - شيش - زيتون - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 205, category: cm['Calzone'] },
    { nameAr: 'كالزوني سموكد تركي', descriptionAr: 'سموكد تركي - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 215, category: cm['Calzone'] },
    { nameAr: 'كالزوني تشكن باربيكيو', descriptionAr: 'فراخ - موتزاريلا - صوص باربيكيو - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 215, category: cm['Calzone'] },
    { nameAr: 'كالزوني تشكن رانتش', descriptionAr: 'فراخ - صوص رانتش - موتزاريلا - فلفل رومي - طماطم - زيتون', price: 215, category: cm['Calzone'] },
    { nameAr: 'كالزوني شيش طاووق', descriptionAr: 'فراخ شيش - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 205, category: cm['Calzone'] },
    { nameAr: 'كالزوني لحمة مفرومة', descriptionAr: 'لحم مفروم - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 190, category: cm['Calzone'] },
    { nameAr: 'كالزوني شاورما لحمة', descriptionAr: 'شاورما لحمة - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 195, category: cm['Calzone'] },
    { nameAr: 'كالزوني كويك', descriptionAr: 'لحم مفروم - فراخ - سوسيس - هالبينو - هوت دوج - صوص كويك اللذيذ - موتزاريلا', price: 200, category: cm['Calzone'] },
    { nameAr: 'كالزوني سجق أو سوسيس', descriptionAr: 'سجق بلدي مفروم أو سوسيس - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 190, category: cm['Calzone'] },
    { nameAr: 'كالزوني سلامي', descriptionAr: 'سلامي مدخن - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 205, category: cm['Calzone'] },
    { nameAr: 'كالزوني بسطرمة', descriptionAr: 'بسطرمة - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 205, category: cm['Calzone'] },
    { nameAr: 'كالزوني مكس باربيكيو', descriptionAr: 'لحم مفروم - فراخ - صوص باربيكيو - موتزاريلا - فلفل رومي - طماطم - زيتون - مايونيز - كاتشب', price: 210, category: cm['Calzone'] },
    { nameAr: 'كالزوني تونة', descriptionAr: 'تونة - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 195, category: cm['Calzone'] },
    { nameAr: 'كالزوني جمبري', descriptionAr: 'جمبري - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 250, category: cm['Calzone'] },
    { nameAr: 'كالزوني سي فود', descriptionAr: 'جمبري - سبيط - زيتون - طماطم - فلفل - صوص كويك اللذيذ - موتزاريلا', price: 245, category: cm['Calzone'] },
    { nameAr: 'كالزوني مشكل جبن', descriptionAr: 'جبنة شيدر - جبنة رومي - موتزاريلا - فلفل رومي - طماطم - زيتون - صوص كويك اللذيذ', price: 190, category: cm['Calzone'] },
    { nameAr: 'كالزوني مشروم', descriptionAr: 'مشروم - موتزاريلا - فلفل رومي - طماطم - زيتون - صوص كويك اللذيذ', price: 190, category: cm['Calzone'] },
    { nameAr: 'كالزوني بطاطس', descriptionAr: 'بطاطس - موتزاريلا - فلفل رومي - طماطم - زيتون - صوص كويك اللذيذ', price: 175, category: cm['Calzone'] },

    // ===== 10. Italian Pasta =====
    { nameAr: 'نجرسكو فراخ', descriptionAr: 'فراخ - فلفل - طماطم - زيتون - مشروم - بصل - أرز - صوص أبيض - مكرونة سوسيت', price: 145, category: cm['Italian Pasta'] },
    { nameAr: 'نجرسكو لحمة مفرومة', descriptionAr: 'لحمة مفرومة - فلفل - طماطم - زيتون - صوص أبيض - مكرونة', price: 175, category: cm['Italian Pasta'] },
    { nameAr: 'نجرسكو سجق', descriptionAr: 'سجق بلدي - مفروم - فلفل - طماطم - صوص أبيض - مكرونة', price: 175, category: cm['Italian Pasta'] },
    { nameAr: 'نجرسكو كويك', descriptionAr: 'لحم - فراخ - سجق - بسطرمة - هوت دوج - موتزاريلا - مكرونة سوسيت', price: 165, category: cm['Italian Pasta'] },
    { nameAr: 'نجرسكو شاورما فراخ', descriptionAr: 'شاورما فراخ - فلفل - طماطم - باني - موتزاريلا - مكرونة سوسيت', price: 180, category: cm['Italian Pasta'] },
    { nameAr: 'نجرسكو جمبري', descriptionAr: 'جمبري - فلفل - طماطم - زيتون - موتزاريلا - صوص أبيض - مكرونة سوسيت', price: 230, category: cm['Italian Pasta'] },
    { nameAr: 'نجرسكو سي فود', descriptionAr: 'سبيط - جمبري - فلفل - طماطم - زيتون - موتزاريلا - صوص أبيض - مكرونة سوسيت', price: 235, category: cm['Italian Pasta'] },
    { nameAr: 'لازانيا', descriptionAr: 'لحم مفروم - صوص بولونيز - صوص أبيض - بهارات - عجينة اللازانيا', price: 140, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي نابوليتان', descriptionAr: 'فلفل أحمر - أصفر - ثوم - صوص أحمر - بهارات', price: 140, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي مشروم', descriptionAr: 'مشروم - فلفل - طماطم - زيتون - صوص أحمر - بهارات', price: 145, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي لحمة مفرومة', descriptionAr: 'لحم مفروم - صوص أحمر - بهارات', price: 150, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي سجق', descriptionAr: 'سجق بلدي - مفروم - صوص أحمر - بهارات', price: 145, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي جمبري', descriptionAr: 'جمبري - صوص أحمر - بهارات', price: 220, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي كاليماري', descriptionAr: 'كاليماري - صوص أحمر - بهارات', price: 210, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي فراخ', descriptionAr: 'فراخ - صوص أحمر - بهارات', price: 230, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي تونة', descriptionAr: 'تونة - فلفل - زيتون - طماطم - صوص أحمر', price: 155, category: cm['Italian Pasta'] },
    { nameAr: 'اسباجتي كبدة', descriptionAr: 'كبده - فلفل - طماطم - زيتون - صوص أحمر - بصل', price: 160, category: cm['Italian Pasta'] },
    { nameAr: 'بستا سي فود', descriptionAr: 'مكرونة سوسيت - جمبري - كاليماري - كريمة لباني', price: 155, category: cm['Italian Pasta'] },
    { nameAr: 'تشكن الفريدو', descriptionAr: 'مكرونة سوسيت - فراخ - مشروم - كريمة لباني', price: 220, category: cm['Italian Pasta'] },
    { nameAr: 'جمبري الفريدو', descriptionAr: 'مكرونة سوسيت - جمبري - مشروم - كريمة لباني', price: 245, category: cm['Italian Pasta'] },
    { nameAr: 'مكرونة كاربونارا', descriptionAr: 'اسباجتي - مغمسات - دجاج - صوص أبيض - موتزاريلا - شيدر - كريمة لباني', price: 155, category: cm['Italian Pasta'] },

    // ===== 11. Sweet Pies =====
    { nameAr: 'فطيرة سادة سكر', descriptionAr: 'سكر - لبن - سمن بلدي', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 110 }, { name: 'Large', nameAr: 'كبيرة', price: 130 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة سكر بالقرفة', descriptionAr: 'سكر - لبن - سمن بلدي - قرفة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 120 }, { name: 'Large', nameAr: 'كبيرة', price: 130 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة كاستر', descriptionAr: 'لبن - سكر - سمن بلدي - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 125 }, { name: 'Large', nameAr: 'كبيرة', price: 135 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة مشكل مكسرات', descriptionAr: 'مكسرات - سكر - سمن بلدي - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 140 }, { name: 'Large', nameAr: 'كبيرة', price: 165 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة كريمة وبسبوسة', descriptionAr: 'كريمة - بسبوسة - سكر - سمن بلدي - عسل', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 145 }, { name: 'Large', nameAr: 'كبيرة', price: 175 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة بسبوسة مع كنافة', descriptionAr: 'كنافة - بسبوسة - سكر - سمن بلدي - كريمة - عسل', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 150 }, { name: 'Large', nameAr: 'كبيرة', price: 175 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة زبيب وجوز هند', descriptionAr: 'زبيب - جوز هند - سكر - سمن بلدي - كريمة - لبن', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 135 }, { name: 'Large', nameAr: 'كبيرة', price: 155 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة القشطة وعسل النحل', descriptionAr: 'قشطة - عسل - سمن بلدي - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 145 }, { name: 'Large', nameAr: 'كبيرة', price: 165 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة بالشوكولاتة والسكر', descriptionAr: 'شوكولاتة - سكر - سمن بلدي - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 145 }, { name: 'Large', nameAr: 'كبيرة', price: 165 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة فروتي', descriptionAr: 'كوكتيل فواكه - عسل - سمن بلدي - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 165 }, { name: 'Large', nameAr: 'كبيرة', price: 195 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة تفاح', descriptionAr: 'تفاح - عسل - سمن بلدي - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 155 }, { name: 'Large', nameAr: 'كبيرة', price: 175 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة موز', descriptionAr: 'موز - عسل - كريمة - عسل', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 155 }, { name: 'Large', nameAr: 'كبيرة', price: 175 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة كوين الحلوة', descriptionAr: 'مكسرات - قشطة - عسل - سمن بلدي - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 175 }, { name: 'Large', nameAr: 'كبيرة', price: 205 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة بغاشة', descriptionAr: 'جوز هند - سكر - عسل - سمن بلدي', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 125 }, { name: 'Large', nameAr: 'كبيرة', price: 145 }], category: cm['Sweet Pies'] },
    { nameAr: 'إمبيرو نوتيلا بالموز', descriptionAr: 'موز - نوتيلا - كريمة - سمن بلدي', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 175 }, { name: 'Large', nameAr: 'كبيرة', price: 205 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة نوتيلا', descriptionAr: 'نوتيلا - كريمة - سمن بلدي', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 175 }, { name: 'Large', nameAr: 'كبيرة', price: 205 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة اللوتس', descriptionAr: 'كريمة اللوتس - بسكويت اللوتس - مجروش بسكويت اللوتس - كريمة', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 205 }, { name: 'Large', nameAr: 'كبيرة', price: 245 }], category: cm['Sweet Pies'] },
    { nameAr: 'فطيرة مشلتت بالسمن الفلاحي', sizes: [{ name: 'Medium', nameAr: 'متوسطة', price: 145 }, { name: 'Large', nameAr: 'كبيرة', price: 175 }], category: cm['Sweet Pies'] },
    { nameAr: 'أم علي بالمكسرات', price: 145, category: cm['Sweet Pies'] },

    // ===== 12. Sweet Crepes =====
    { nameAr: 'كريب نوتيلا إيطالي', price: 145, category: cm['Sweet Crepes'] },
    { nameAr: 'كريب نوتيلا بالموز', price: 150, category: cm['Sweet Crepes'] },
    { nameAr: 'عسل نحل / مربى / قشطة', price: 70, category: cm['Sweet Crepes'] },
    { nameAr: 'شيكولاتة / مكسرات / فواكه / موز', price: 70, category: cm['Sweet Crepes'] },

    // ===== 13. Salads =====
    { nameAr: 'سلطة خضراء', price: 45, category: cm['Salads & Appetizers'] },
    { nameAr: 'سلطة بطاطس', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'باذنجان', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'بابا غنوج', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'سلطة طحينة', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'زبادي', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'ثومية', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'سلطة حمص', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'تبولة', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'كول سلو', price: 55, category: cm['Salads & Appetizers'] },
    { nameAr: 'سلطة تونة', price: 80, category: cm['Salads & Appetizers'] },
    { nameAr: 'سلطة يوناني', price: 80, category: cm['Salads & Appetizers'] },
    { nameAr: 'حلقات بصل', price: 100, category: cm['Salads & Appetizers'] },
    { nameAr: 'بطاطس بالجبنة', price: 100, category: cm['Salads & Appetizers'] },
    { nameAr: 'بطاطس محمرة', price: 70, category: cm['Salads & Appetizers'] },
    { nameAr: 'أصابع جبنة', price: 135, category: cm['Salads & Appetizers'] },
    { nameAr: 'مخلل', price: 25, category: cm['Salads & Appetizers'] },

    // ===== 14. Beverages =====
    { nameAr: 'اسبريسو', price: 55, category: cm['Beverages'] },
    { nameAr: 'قهوة أمريكية', price: 55, category: cm['Beverages'] },
    { nameAr: 'كابوتشينو', price: 55, category: cm['Beverages'] },
    { nameAr: 'كافيه لاتيه', price: 55, category: cm['Beverages'] },
    { nameAr: 'شيكولاتة ساخنة', price: 55, category: cm['Beverages'] },
    { nameAr: 'نسكافيه', price: 55, category: cm['Beverages'] },
    { nameAr: 'قهوة تركي', price: 45, category: cm['Beverages'] },
    { nameAr: 'قهوة فرنسي', price: 45, category: cm['Beverages'] },
    { nameAr: 'شاي (نكهات مختلفة)', price: 30, category: cm['Beverages'] },
    { nameAr: 'كولا كانز', price: 30, category: cm['Beverages'] },
    { nameAr: 'بيريل', price: 35, category: cm['Beverages'] },
    { nameAr: 'فيروز', price: 35, category: cm['Beverages'] },
    { nameAr: 'شويبس', price: 35, category: cm['Beverages'] },
    { nameAr: 'كولا لتر', price: 60, category: cm['Beverages'] },
    { nameAr: 'سيبو سباتس', price: 30, category: cm['Beverages'] },
    { nameAr: 'مياه معدنية كبير', price: 25, category: cm['Beverages'] },
    { nameAr: 'مياه معدنية صغير', price: 15, category: cm['Beverages'] }
  ];

  for (const p of products) {
    if (!p.sizes) {
      p.price = p.price;
      p.sizes = [{ name: 'Regular', nameAr: 'عادي', price: p.price }];
    }
    p.isAvailable = true;
    p.isPopular = p.isFeatured = false;
  }

  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  const admin = await User.findOne({ email: 'admin@quickpizza.com' });
  if (!admin) {
    await User.create({ name: 'Admin', email: 'admin@quickpizza.com', password: 'admin123', role: 'admin' });
    console.log('Admin created: admin@quickpizza.com / admin123');
  }

  if (needsConnect) await mongoose.connection.close();
};

if (require.main === module) seed().then(() => process.exit());
module.exports = seed;
