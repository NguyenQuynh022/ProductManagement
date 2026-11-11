const mongoose = require('mongoose');

// Schema chỉ gồm đúng 4 trường theo quy định đề bài: name, price, soluong, image
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm không được để trống'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm không được để trống'],
      min: [0, 'Giá sản phẩm không được âm']
    },
    soluong: {
      type: Number,
      required: [true, 'Số lượng sản phẩm không được để trống'],
      min: [0, 'Số lượng không được âm']
    },
    image: {
      type: String,
      required: [true, 'Hình ảnh sản phẩm không được để trống'],
      trim: true
    }
  },
  {
    collection: 'products', // Chỉ định rõ collection 'products'
    versionKey: false,      // TUYỆT ĐỐI KHÔNG sinh trường __v
    timestamps: false       // TUYỆT ĐỐI KHÔNG tự thêm createdAt, updatedAt
  }
);

module.exports = mongoose.model('Product', productSchema);
