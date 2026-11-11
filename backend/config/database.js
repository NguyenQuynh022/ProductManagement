const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ProductManagement', {
      autoIndex: false // Không tự động tạo index để tránh tác động đến database
    });

    console.log(`[MongoDB] Kết nối thành công: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Lỗi kết nối: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

