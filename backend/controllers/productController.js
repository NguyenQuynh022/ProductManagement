const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const DB_JSON_PATH = path.resolve(__dirname, '../../database/products.json');

// Hàm xuất dữ liệu ra file products.json để phục vụ bàn giao bài thi
const exportProductsToJson = async () => {
  try {
    const products = await Product.find().lean();
    const formatted = products.map(p => ({
      _id: { $oid: p._id.toString() },
      name: p.name,
      price: Number(p.price),
      soluong: Number(p.soluong),
      image: p.image
    }));
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(formatted, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('[Export JSON Error]:', error.message);
    return false;
  }
};

// 1. GET /api/products - Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    let sortOptions = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else if (sort === 'soluong_asc') sortOptions.soluong = 1;
    else if (sort === 'soluong_desc') sortOptions.soluong = -1;
    else if (sort === 'name_asc') sortOptions.name = 1;
    else if (sort === 'name_desc') sortOptions.name = -1;

    const products = await Product.find(query).sort(sortOptions);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/products/:id - Lấy chi tiết 1 sản phẩm
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. POST /api/products - Thêm sản phẩm mới (chỉ chấp nhận 4 trường: name, price, soluong, image)
const createProduct = async (req, res) => {
  try {
    const { name, price, soluong, image } = req.body;

    if (!name || price === undefined || soluong === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: name, price, soluong, image'
      });
    }

    const numPrice = Number(price);
    const numSoluong = Number(soluong);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá sản phẩm phải là số không âm'
      });
    }

    if (isNaN(numSoluong) || numSoluong < 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng sản phẩm phải là số không âm'
      });
    }

    // Chỉ lọc đúng 4 trường được phép, loại bỏ mọi trường lạ
    const newProduct = new Product({
      name: String(name).trim(),
      price: numPrice,
      soluong: numSoluong,
      image: String(image).trim()
    });

    const saved = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công',
      data: saved
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 4. PUT /api/products/:id - Cập nhật sản phẩm (chỉ chấp nhận 4 trường: name, price, soluong, image)
const updateProduct = async (req, res) => {
  try {
    const { name, price, soluong, image } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (String(name).trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên sản phẩm không được để trống' });
      }
      updateData.name = String(name).trim();
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ success: false, message: 'Giá sản phẩm phải là số không âm' });
      }
      updateData.price = numPrice;
    }

    if (soluong !== undefined) {
      const numSoluong = Number(soluong);
      if (isNaN(numSoluong) || numSoluong < 0) {
        return res.status(400).json({ success: false, message: 'Số lượng sản phẩm phải là số không âm' });
      }
      updateData.soluong = numSoluong;
    }

    if (image !== undefined) {
      if (String(image).trim() === '') {
        return res.status(400).json({ success: false, message: 'Hình ảnh sản phẩm không được để trống' });
      }
      updateData.image = String(image).trim();
    }

    // Chỉ cập nhật các trường hợp lệ, không cho phép chèn trường lạ
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. DELETE /api/products/:id - Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để xóa'
      });
    }

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
      data: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. POST /api/products/export - Xuất dữ liệu ra file JSON nộp bài
const exportJson = async (req, res) => {
  try {
    const ok = await exportProductsToJson();
    if (ok) {
      res.json({
        success: true,
        message: 'Đã xuất dữ liệu ra file database/products.json thành công!',
        path: DB_JSON_PATH
      });
    } else {
      res.status(500).json({ success: false, message: 'Lỗi khi xuất file JSON' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  exportJson
};

