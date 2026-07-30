const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const { genEn, hasArabic } = require('../seed');

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, popular } = req.query;
    let filter = { isAvailable: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (popular === 'true') filter.isPopular = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameAr: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    let products = await Product.find(filter).populate('category', 'name nameAr icon').sort('name');
    products = products.map(p => {
      p = p.toObject();
      if (p.name && hasArabic(p.name) && p.nameAr) {
        p.name = p.name === p.nameAr ? genEn(p.nameAr) : genEn(p.name);
      }
      if (p.description && hasArabic(p.description) && p.descriptionAr && p.description === p.descriptionAr) {
        p.description = genEn(p.descriptionAr);
      }
      return p;
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name nameAr icon');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/', adminAuth, async (req, res) => {
  try {
    await Product.deleteMany({});
    res.json({ message: 'All products deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/migrate', adminAuth, async (req, res) => {
  try {
    const products = await Product.find({});
    let count = 0;
    for (const p of products) {
      let changed = false;
      if (p.name && hasArabic(p.name) && p.nameAr) {
        p.name = genEn(p.nameAr);
        changed = true;
      }
      if (p.description && hasArabic(p.description) && p.descriptionAr) {
        p.description = genEn(p.descriptionAr);
        changed = true;
      }
      if (changed) {
        await p.save();
        count++;
      }
    }
    res.json({ success: true, migrated: count, total: products.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/set-category-images', adminAuth, async (req, res) => {
  const Category = require('../models/Category');
  const path = require('path');
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const categories = await Category.find({ image: { $exists: true, $ne: '' } });
  const results = [];

  for (const cat of categories) {
    const url = cat.image;
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || cat._id;
    const filename = `cat-${slug}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filepath, buffer);

      const imageUrl = '/uploads/' + filename;
      const updateResult = await Product.updateMany(
        { category: cat._id },
        { $set: { image: imageUrl } }
      );

      results.push({ category: cat.name, imageUrl, productsUpdated: updateResult.modifiedCount });
    } catch (e) {
      results.push({ category: cat.name, error: e.message });
    }
  }

  res.json({ success: true, results });
});

module.exports = router;
