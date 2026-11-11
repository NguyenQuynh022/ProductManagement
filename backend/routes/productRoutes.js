const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  exportJson
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/authMiddleware');

// 1. GET /api/products - Lấy danh sách sản phẩm (hỗ trợ search, sort) - Công khai
router.get('/', getProducts);

// 2. GET /api/products/:id - Lấy chi tiết 1 sản phẩm - Công khai
router.get('/:id', getProductById);

// 3. POST /api/products - Thêm sản phẩm mới - Yêu cầu xác thực Admin
router.post('/', protectAdmin, createProduct);

// 4. PUT /api/products/:id - Cập nhật sản phẩm - Yêu cầu xác thực Admin
router.put('/:id', protectAdmin, updateProduct);

// 5. DELETE /api/products/:id - Xóa sản phẩm - Yêu cầu xác thực Admin
router.delete('/:id', protectAdmin, deleteProduct);

// 6. POST /api/products/export - Xuất dữ liệu ra file products.json
router.post('/export', protectAdmin, exportJson);

module.exports = router;
