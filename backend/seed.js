const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quick_pizza');
  console.log('Connected to MongoDB');

  await Category.deleteMany({});
  await Product.deleteMany({});

  const categories = await Category.insertMany([
    { name: 'Pizza', nameAr: 'بيتزا', icon: '🍕', order: 1 },
    { name: 'Manakish', nameAr: 'فطاير', icon: '🫓', order: 2 },
    { name: 'Sides', nameAr: 'مقبلات', icon: '🍟', order: 3 },
    { name: 'Drinks', nameAr: 'مشروبات', icon: '🥤', order: 4 },
    { name: 'Desserts', nameAr: 'حلويات', icon: '🍰', order: 5 },
    { name: 'Combo', nameAr: 'كومبو', icon: '🍽️', order: 6 }
  ]);

  console.log('Categories seeded');

  const catMap = {};
  categories.forEach(c => catMap[c.name] = c._id);

  await Product.insertMany([
    // === PIZZAS ===
    {
      name: 'Margherita', nameAr: 'مرجريتا',
      description: 'Classic tomato sauce, mozzarella, fresh basil',
      descriptionAr: 'صلصة طماطم كلاسيكية، موزاريلا، ريحان طازج',
      price: 120, image: '/images/pizza-margherita.jpg',
      category: catMap['Pizza'], isFeatured: true, isPopular: true,
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 95 }, { name: 'Medium', nameAr: 'متوسطة', price: 120 }, { name: 'Large', nameAr: 'كبيرة', price: 160 }],
      toppings: [{ name: 'Extra Cheese', nameAr: 'جبنة زيادة', price: 20 }, { name: 'Mushrooms', nameAr: 'فطر', price: 15 }, { name: 'Olives', nameAr: 'زيتون', price: 10 }],
      calories: 850, prepTime: 15, tags: ['classic', 'vegetarian']
    },
    {
      name: 'Pepperoni', nameAr: 'بيبروني',
      description: 'Loaded with spicy pepperoni and melted mozzarella',
      descriptionAr: ' مليانه بيبروني حار وموزاريلا ذائبة',
      price: 150, image: '/images/pizza-pepperoni.jpg',
      category: catMap['Pizza'], isFeatured: true, isPopular: true,
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 120 }, { name: 'Medium', nameAr: 'متوسطة', price: 150 }, { name: 'Large', nameAr: 'كبيرة', price: 200 }],
      toppings: [{ name: 'Extra Pepperoni', nameAr: 'بيبروني زيادة', price: 25 }, { name: 'Jalapenos', nameAr: 'jalapenos', price: 15 }, { name: 'Hot Sauce', nameAr: 'صوص حار', price: 10 }],
      spicyLevel: 2, calories: 1100, prepTime: 15, tags: ['spicy', 'popular']
    },
    {
      name: 'BBQ Chicken', nameAr: 'بي بي كوي تشكن',
      description: 'Grilled chicken, BBQ sauce, red onions, cilantro',
      descriptionAr: 'دجاج مشوي، صوص بي بي كوي، بصل أحمر، كزبرة',
      price: 170, image: '/images/pizza-bbq.jpg',
      category: catMap['Pizza'], isFeatured: true,
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 135 }, { name: 'Medium', nameAr: 'متوسطة', price: 170 }, { name: 'Large', nameAr: 'كبيرة', price: 220 }],
      toppings: [{ name: 'Extra Chicken', nameAr: 'دجاج زيادة', price: 30 }, { name: 'Pineapple', nameAr: 'أناناس', price: 15 }, { name: 'Corn', nameAr: 'ذرة', price: 10 }],
      calories: 980, prepTime: 18, tags: ['chicken', 'bbq']
    },
    {
      name: 'Meat Lover', nameAr: 'لوفز ميت',
      description: 'Pepperoni, sausage, bacon, ham, ground beef',
      descriptionAr: 'بيبروني، نقانق، بيكون، لحم مفروم',
      price: 190, image: '/images/pizza-meat.jpg',
      category: catMap['Pizza'], isPopular: true,
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 155 }, { name: 'Medium', nameAr: 'متوسطة', price: 190 }, { name: 'Large', nameAr: 'كبيرة', price: 250 }],
      toppings: [{ name: 'Extra Meat', nameAr: 'لحمة زيادة', price: 35 }, { name: 'Egg', nameAr: 'بيضة', price: 10 }, { name: 'Onions', nameAr: 'بصل', price: 10 }],
      calories: 1350, prepTime: 20, tags: ['meat', 'heavy']
    },
    {
      name: 'Seafood', nameAr: 'سي فود',
      description: 'Shrimp, calamari, white sauce, garlic',
      descriptionAr: 'جمبري، كalamari، صوص أبيض، ثوم',
      price: 210, image: '/images/pizza-seafood.jpg',
      category: catMap['Pizza'],
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 170 }, { name: 'Medium', nameAr: 'متوسطة', price: 210 }, { name: 'Large', nameAr: 'كبيرة', price: 270 }],
      toppings: [{ name: 'Extra Shrimp', nameAr: 'جمبري زيادة', price: 40 }, { name: 'Chili Flakes', nameAr: 'شطة مجروشة', price: 10 }],
      calories: 920, prepTime: 20, tags: ['seafood', 'premium']
    },
    {
      name: 'Veggie Supreme', nameAr: 'فيجي سوبريم',
      description: 'Bell peppers, mushrooms, onions, olives, tomatoes',
      descriptionAr: 'فلفل حلو، فطر، بصل، زيتون، طماطم',
      price: 130, image: '/images/pizza-veggie.jpg',
      category: catMap['Pizza'], isFeatured: false,
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 100 }, { name: 'Medium', nameAr: 'متوسطة', price: 130 }, { name: 'Large', nameAr: 'كبيرة', price: 170 }],
      toppings: [{ name: 'Avocado', nameAr: 'أفوكادو', price: 20 }, { name: 'Sun-dried Tomatoes', nameAr: 'طماطم مجففة', price: 15 }],
      calories: 720, prepTime: 15, tags: ['vegetarian', 'healthy']
    },

    // === MANAKISH / فطاير ===
    {
      name: 'Cheese Manakish', nameAr: 'فطيرة جبنة',
      description: 'Fresh akkawi cheese with zaatar blend',
      descriptionAr: 'جبنة عكاوي طازجة مع خليط زعتر',
      price: 45, image: '/images/manakish-cheese.jpg',
      category: catMap['Manakish'], isPopular: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 45 }, { name: 'Large', nameAr: 'كبيرة', price: 70 }],
      toppings: [{ name: 'Extra Cheese', nameAr: 'جبنة زيادة', price: 15 }, { name: 'Thyme', nameAr: 'زعتر', price: 5 }],
      calories: 450, prepTime: 10, tags: ['traditional', 'cheese']
    },
    {
      name: 'Zaatar Manakish', nameAr: 'فطيرة زعتر',
      description: 'Traditional zaatar with olive oil',
      descriptionAr: 'زعتر تقليدي مع زيت زيتون',
      price: 35, image: '/images/manakish-zaatar.jpg',
      category: catMap['Manakish'], isFeatured: true, isPopular: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 35 }, { name: 'Large', nameAr: 'كبيرة', price: 55 }],
      toppings: [{ name: 'Extra Zaatar', nameAr: 'زعتر زيادة', price: 10 }, { name: 'Cheese', nameAr: 'جبنة', price: 15 }],
      calories: 380, prepTime: 8, tags: ['traditional', 'zaatar']
    },
    {
      name: 'Meat Manakish', nameAr: 'فطيرة لحمة',
      description: 'Spiced ground beef with pine nuts',
      descriptionAr: 'لحم مفروم بهارات مع صنوبر',
      price: 55, image: '/images/manakish-meat.jpg',
      category: catMap['Manakish'],
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 55 }, { name: 'Large', nameAr: 'كبيرة', price: 80 }],
      toppings: [{ name: 'Extra Meat', nameAr: 'لحمة زيادة', price: 20 }, { name: 'Pine Nuts', nameAr: 'صنوبر', price: 15 }],
      calories: 520, prepTime: 12, tags: ['traditional', 'meat']
    },
    {
      name: 'Kishk Manakish', nameAr: 'فطيرة كشك',
      description: 'Kishk with tomatoes and onions',
      descriptionAr: 'كشك مع طماطم وبصل',
      price: 40, image: '/images/manakish-kishk.jpg',
      category: catMap['Manakish'],
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 40 }, { name: 'Large', nameAr: 'كبيرة', price: 65 }],
      toppings: [{ name: 'Chili', nameAr: 'شطة', price: 5 }],
      calories: 400, prepTime: 10, tags: ['traditional']
    },
    {
      name: 'Nutella Manakish', nameAr: 'فطيرة نوتيلا',
      description: 'Nutella with bananas and hazelnuts',
      descriptionAr: 'نوتيلا مع موز وبندق',
      price: 50, image: '/images/manakish-nutella.jpg',
      category: catMap['Manakish'], isFeatured: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 50 }, { name: 'Large', nameAr: 'كبيرة', price: 75 }],
      toppings: [{ name: 'Extra Nutella', nameAr: 'نوتيلا زيادة', price: 15 }, { name: 'Strawberries', nameAr: 'فراولة', price: 15 }],
      calories: 600, prepTime: 8, tags: ['sweet', 'dessert']
    },

    // === SIDES / مقبلات ===
    {
      name: 'French Fries', nameAr: 'بطاطس مقلية',
      description: 'Crispy golden fries with seasoning',
      descriptionAr: 'بطاطس ذهبية مقرمشة مع بهارات',
      price: 35, image: '/images/fries.jpg',
      category: catMap['Sides'], isPopular: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 35 }, { name: 'Large', nameAr: 'كبيرة', price: 55 }],
      toppings: [{ name: 'Cheese Sauce', nameAr: 'صوص جبنة', price: 10 }, { name: 'Garlic Mayo', nameAr: 'مايونيز بالثوم', price: 10 }],
      calories: 380, prepTime: 8, tags: ['classic', 'side']
    },
    {
      name: 'Garlic Bread', nameAr: 'خبز بالثوم',
      description: 'Toasted bread with garlic butter and herbs',
      descriptionAr: 'خبز مشوي بالزبدة والثوم والأعشاب',
      price: 25, image: '/images/garlic-bread.jpg',
      category: catMap['Sides'],
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 25 }, { name: 'Large', nameAr: 'كبيرة', price: 40 }],
      toppings: [{ name: 'Cheese', nameAr: 'جبنة', price: 10 }],
      calories: 320, prepTime: 6, tags: ['bread', 'side']
    },
    {
      name: 'Chicken Wings', nameAr: 'أجنحة دجاج',
      description: 'Crispy wings with your choice of sauce',
      descriptionAr: 'أجنحة مقرمشة باختيار الصوص',
      price: 65, image: '/images/wings.jpg',
      category: catMap['Sides'], isFeatured: true,
      sizes: [{ name: '6 pcs', nameAr: '6 قطع', price: 65 }, { name: '12 pcs', nameAr: '12 قطعة', price: 110 }],
      toppings: [{ name: 'BBQ Sauce', nameAr: 'صوص بي بي كوي', price: 10 }, { name: 'Hot Sauce', nameAr: 'صوص حار', price: 10 }, { name: 'Honey Mustard', nameAr: 'خردل بالعسل', price: 10 }],
      spicyLevel: 1, calories: 680, prepTime: 12, tags: ['chicken', 'popular']
    },
    {
      name: 'Mozzarella Sticks', nameAr: 'عصا موزاريلا',
      description: 'Golden fried mozzarella with marinara sauce',
      descriptionAr: 'موزاريلا مقلي مع صوص مارينارا',
      price: 50, image: '/images/mozz-sticks.jpg',
      category: catMap['Sides'],
      sizes: [{ name: '6 pcs', nameAr: '6 قطع', price: 50 }, { name: '10 pcs', nameAr: '10 قطع', price: 80 }],
      calories: 520, prepTime: 8, tags: ['cheese', 'snack']
    },
    {
      name: 'Onion Rings', nameAr: 'حلقات بصل',
      description: 'Beer-battered onion rings',
      descriptionAr: 'حلقات بصل مقلي بعجينة البيرة',
      price: 40, image: '/images/onion-rings.jpg',
      category: catMap['Sides'],
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 40 }, { name: 'Large', nameAr: 'كبيرة', price: 60 }],
      calories: 410, prepTime: 8, tags: ['snack', 'side']
    },

    // === DRINKS / مشروبات ===
    {
      name: 'Cola', nameAr: 'كولا',
      description: 'Refreshing cola drink',
      descriptionAr: 'مشروب كولا منعش',
      price: 15, image: '/images/cola.jpg',
      category: catMap['Drinks'],
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 10 }, { name: 'Medium', nameAr: 'متوسطة', price: 15 }, { name: 'Large', nameAr: 'كبيرة', price: 20 }],
      calories: 140, prepTime: 1, tags: ['soda']
    },
    {
      name: 'Fresh Juice', nameAr: 'عصير طازج',
      description: 'Freshly squeezed seasonal juice',
      descriptionAr: 'عصير طازج موسمي',
      price: 25, image: '/images/juice.jpg',
      category: catMap['Drinks'], isFeatured: true,
      sizes: [{ name: 'Small', nameAr: 'صغيرة', price: 20 }, { name: 'Large', nameAr: 'كبيرة', price: 35 }],
      tags: ['juice', 'healthy']
    },
    {
      name: 'Milkshake', nameAr: 'ميلك شيك',
      description: 'Thick creamy milkshake',
      descriptionAr: 'ميلك شيك كريمي كثيف',
      price: 35, image: '/images/milkshake.jpg',
      category: catMap['Drinks'],
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 35 }],
      toppings: [{ name: 'Whipped Cream', nameAr: 'كريمة', price: 5 }, { name: 'Chocolate Chips', nameAr: 'رقائق شوكولاتة', price: 5 }],
      calories: 450, prepTime: 3, tags: ['sweet', 'drink']
    },
    {
      name: 'Water', nameAr: 'مياه',
      description: 'Mineral water',
      descriptionAr: 'مياه معدنية',
      price: 5, image: '/images/water.jpg',
      category: catMap['Drinks'],
      sizes: [{ name: '500ml', nameAr: '500 مل', price: 5 }, { name: '1.5L', nameAr: '1.5 لتر', price: 10 }],
      calories: 0, prepTime: 1, tags: ['water']
    },

    // === DESSERTS / حلويات ===
    {
      name: 'Chocolate Lava Cake', nameAr: 'كيك شوكولاتة',
      description: 'Warm chocolate cake with molten center',
      descriptionAr: 'كيك شوكولاتة ساخن مع قلب ذائب',
      price: 45, image: '/images/lava-cake.jpg',
      category: catMap['Desserts'], isFeatured: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 45 }],
      toppings: [{ name: 'Ice Cream', nameAr: 'آيس كريم', price: 15 }, { name: 'Whipped Cream', nameAr: 'كريمة', price: 5 }],
      calories: 580, prepTime: 5, tags: ['chocolate', 'hot']
    },
    {
      name: 'Tiramisu', nameAr: 'تيراميسو',
      description: 'Classic Italian dessert with mascarpone',
      descriptionAr: 'حلوى إيطالية كلاسيكية بالماسكاربوني',
      price: 50, image: '/images/tiramisu.jpg',
      category: catMap['Desserts'],
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 50 }],
      calories: 490, prepTime: 2, tags: ['classic', 'coffee']
    },
    {
      name: 'Ice Cream', nameAr: 'آيس كريم',
      description: 'Premium ice cream in various flavors',
      descriptionAr: 'آيس كريم فاخر بنكهات متنوعة',
      price: 25, image: '/images/icecream.jpg',
      category: catMap['Desserts'],
      sizes: [{ name: '1 Scoop', nameAr: 'كرة', price: 25 }, { name: '2 Scoops', nameAr: '2 كرة', price: 40 }],
      calories: 280, prepTime: 2, tags: ['cold', 'sweet']
    },

    // === COMBOS / كومبو ===
    {
      name: 'Family Combo', nameAr: 'كومبو عائلي',
      description: '2 Large Pizzas + Fries + Wings + 4 Drinks',
      descriptionAr: '2 بيتزا كبيرة + بطاطس + أجنحة + 4 مشروبات',
      price: 450, image: '/images/combo-family.jpg',
      category: catMap['Combo'], isFeatured: true, isPopular: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 450 }],
      calories: 4200, prepTime: 30, tags: ['combo', 'family', 'value']
    },
    {
      name: 'Couple Combo', nameAr: 'كومبو زوجين',
      description: '1 Medium Pizza + 2 Garlic Bread + 2 Drinks',
      descriptionAr: '1 بيتزا متوسطة + 2 خبز ثوم + 2 مشروبات',
      price: 250, image: '/images/combo-couple.jpg',
      category: catMap['Combo'], isFeatured: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 250 }],
      calories: 2100, prepTime: 20, tags: ['combo', 'couple']
    },
    {
      name: 'Solo Meal', nameAr: 'وجبة فردية',
      description: '1 Small Pizza + Fries + Drink',
      descriptionAr: '1 بيتزا صغيرة + بطاطس + مشروب',
      price: 150, image: '/images/combo-solo.jpg',
      category: catMap['Combo'], isPopular: true,
      sizes: [{ name: 'Regular', nameAr: 'عادي', price: 150 }],
      calories: 1200, prepTime: 15, tags: ['combo', 'solo', 'value']
    }
  ]);

  console.log('Products seeded');

  const admin = await User.findOne({ email: 'admin@quickpizza.com' });
  if (!admin) {
    await User.create({
      name: 'Admin',
      email: 'admin@quickpizza.com',
      password: 'admin123',
      phone: '01000000000',
      role: 'admin'
    });
    console.log('Admin user created: admin@quickpizza.com / admin123');
  }

  console.log('Seed complete!');
  if (require.main === module) process.exit(0);
};

if (require.main === module) {
  seed().catch(err => { console.error(err); process.exit(1); });
} else {
  module.exports = seed;
}
