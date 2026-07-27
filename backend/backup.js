const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const backupDir = path.join(__dirname, 'backups');

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const folder = path.join(backupDir, timestamp);
  fs.mkdirSync(folder, { recursive: true });

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quick_pizza');
  console.log('Connected to MongoDB');

  const collections = ['users', 'products', 'categories', 'orders', 'carts'];

  for (const name of collections) {
    try {
      const data = await mongoose.connection.db.collection(name).find({}).toArray();
      fs.writeFileSync(path.join(folder, `${name}.json`), JSON.stringify(data, null, 2));
      console.log(`✅ ${name}: ${data.length} records`);
    } catch (e) {
      console.log(`⚠️ ${name}: skipped`);
    }
  }

  // Save metadata
  const meta = {
    date: new Date().toISOString(),
    collections: collections.length
  };
  fs.writeFileSync(path.join(folder, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log(`\nBackup saved: ${folder}`);
  await mongoose.disconnect();
  process.exit(0);
}

backup().catch(err => { console.error('Backup failed:', err); process.exit(1); });
