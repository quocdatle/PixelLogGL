const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  try {
    await mongoose.connect(mongoUri);
    console.log('[DB] Kết nối MongoDB thành công');
  } catch (err) {
    console.error('[DB] Kết nối MongoDB thất bại:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
