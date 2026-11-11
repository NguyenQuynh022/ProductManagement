const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Tài khoản Admin được cấu hình trong .env (tuyệt đối không lưu vào collection products)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'product_mgmt_jwt_secret_key_2026_exam';

// Đăng nhập Admin
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    // Kiểm tra thông tin đăng nhập với cấu hình .env
    const isUsernameMatch = cleanUsername === ADMIN_USERNAME;
    // Hỗ trợ kiểm tra mật khẩu dạng chuỗi hoặc dạng băm bcrypt
    const isPasswordMatch =
      cleanPassword === ADMIN_PASSWORD ||
      (ADMIN_PASSWORD.startsWith('$2') && bcrypt.compareSync(cleanPassword, ADMIN_PASSWORD));

    if (!isUsernameMatch || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Kiểm tra phiên đăng nhập
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  login,
  getMe
};

