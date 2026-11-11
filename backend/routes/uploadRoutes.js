const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protectAdmin } = require('../middleware/authMiddleware');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ file của Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: product-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Bộ lọc định dạng file hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimeType = allowedExtensions.test(file.mimetype);
  const extName = allowedExtensions.test(ext);

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các file hình ảnh có định dạng JPG, JPEG, PNG, WEBP, GIF!'), false);
  }
};

// Giới hạn kích thước file: 5MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// POST /api/upload - Upload 1 file hình ảnh (Bảo vệ bằng JWT Authentication)
router.post('/', protectAdmin, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Dung lượng file quá lớn. Tối đa cho phép là 5MB.'
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn 1 file hình ảnh để tải lên'
      });
    }

    // Xây dựng URL đầy đủ để client có thể truy cập ảnh
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Tải hình ảnh lên thành công',
      filename: req.file.filename,
      image: imageUrl,
      url: imageUrl
    });
  });
});

module.exports = router;
