require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Cho phép cả Web Admin (localhost) và Mobile (LAN IP) truy cập
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình thư mục tĩnh phục vụ hình ảnh đã upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Định tuyến API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API ProductManagement đang hoạt động ổn định',
    timestamp: new Date().toISOString()
  });
});

// Xử lý route không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ'
  });
});

// Khởi chạy server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`[Backend Server] Đang lắng nghe trên cổng: ${PORT}`);
  console.log(`[Web URL]        http://localhost:${PORT}`);
  console.log(`[API Base URL]   http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});

