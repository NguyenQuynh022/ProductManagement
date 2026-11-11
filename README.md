# ỨNG DỤNG QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT)
### Phân hệ Web Admin & Mobile Android

---

## 1. GIỚI THIỆU
Dự án quản lý sản phẩm phục vụ bài thi thực hành, được xây dựng theo kiến trúc phân tầng độc lập:
- **Backend:** Node.js v22 + Express.js + Mongoose + Multer + JWT + MongoDB.
- **Frontend Web Admin & Mobile:** React Native + Expo Router + TypeScript + Axios + Expo Image Picker.
- **Database:** MongoDB (`mongodb://localhost:27017/ProductManagement`), collection `products`.

---

## 2. CẤU TRÚC THƯ MỤC
```
ProductManagement/
│
├── backend/          # Server API RESTful (Port 5000)
├── frontend/         # Ứng dụng React Native Web & Mobile (Port 8081)
├── database/         # File dữ liệu nộp bài products.json
├── report/           # Báo cáo chi tiết đề tài BAO_CAO.md và ảnh chụp màn hình
├── products.json     # File dữ liệu gốc bảo toàn
└── README.md         # Hướng dẫn dự án
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Bước 1: Khởi chạy Backend
```bash
cd backend
npm install
npm run dev
```
- Máy chủ API chạy tại: `http://localhost:5000` (hoặc `http://192.168.137.232:5000`).
- API Base URL: `http://localhost:5000/api`.

### Bước 2: Khởi chạy Web Admin
Mở cửa sổ terminal mới:
```bash
cd frontend
npm install
npx expo start --web
```
- Truy cập trình duyệt tại: `http://localhost:8081`.
- Tài khoản quản trị Admin: Được cấu hình qua biến môi trường trong `backend/.env` (tham khảo mẫu tại `backend/.env.example`). *Khuyến nghị đổi mật khẩu quản trị trước khi công khai dự án.*

### Bước 3: Khởi chạy Mobile Android
- **Cách 1: Điện thoại thật:** Kết nối điện thoại cùng mạng Wi-Fi với máy tính, mở app **Expo Go** và quét mã QR từ terminal `npx expo start`.
- **Cách 2: Máy ảo Android (Emulator):** Khởi chạy máy ảo `Medium_Phone_API_35` và nhấn phím `a` trên terminal Expo.

---

## 4. QUY TẮC CƠ SỞ DỮ LIỆU ĐÃ TUÂN THỦ
- Chỉ sử dụng 4 trường dữ liệu trong `products`: `name`, `price`, `soluong`, `image` (+ `_id` mặc định).
- Không tự sinh `__v`, không có `createdAt`/`updatedAt`.
- Bảo toàn nguyên vẹn 5 sản phẩm gốc trong cơ sở dữ liệu.
