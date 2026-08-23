const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Setting = require('../models/settingModel');

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportify';
    await mongoose.connect(mongoUri);
    await Setting.updateOne(
      {},
      { $set: { logoUrl: '/uploads/sportify-logo.png', faviconUrl: '/logo.png' } },
      { upsert: true }
    );
    console.log('✅ Logo & Favicon updated successfully in Database!');
    process.exit(0);
  } catch (err) {
    console.error('Update logo error:', err);
    process.exit(1);
  }
}

main();
