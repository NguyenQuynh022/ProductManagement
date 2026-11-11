# BÁO CÁO BÀI THI THỰC HÀNH: ỨNG DỤNG QUẢN LÝ SẢN PHẨM
## (PRODUCT MANAGEMENT APP – WEB ADMIN & MOBILE ANDROID)

---

## 1. GIỚI THIỆU ĐỀ TÀI
Dự án "Xây dựng ứng dụng quản lý sản phẩm" phục vụ phân hệ quản trị viên (Admin) trên nền tảng Web và thiết bị di động (Android). Ứng dụng cho phép quản trị viên theo dõi, thêm mới, chỉnh sửa, xóa và tìm kiếm sản phẩm với dữ liệu thực tế được lưu trữ tập trung tại cơ sở dữ liệu MongoDB.

---

## 2. MỤC TIÊU
- Xây dựng hệ thống hoàn chỉnh tách biệt Frontend và Backend thông qua RESTful API.
- **Web Admin**: Đăng nhập quản trị, xem danh sách, thêm, sửa, xóa, tìm kiếm sản phẩm, giao diện hiện đại responsive.
- **Mobile Android**: Hiển thị sản phẩm, xem chi tiết, thêm sản phẩm và chọn/tải ảnh trực tiếp từ thư viện hoặc camera thiết bị di động.
- **Cơ sở dữ liệu**: Kết nối MongoDB hiện có (`ProductManagement`), bảo đảm đúng 4 trường dữ liệu (`name`, `price`, `soluong`, `image`) và không có trường thừa.

---

## 3. CÔNG NGHỆ SỬ DỤNG
- **Backend:** 
  - Node.js v22.20.0
  - Express.js
  - Mongoose
  - Multer (xử lý upload ảnh multipart/form-data)
  - CORS (chia sẻ tài nguyên giữa Web và Mobile)
  - dotenv (quản lý biến môi trường)
  - bcryptjs (mã hóa mật khẩu)
  - jsonwebtoken (xác thực quyền truy cập JWT)
- **Frontend:** 
  - React Native
  - Expo SDK 52
  - Expo Router v4
  - React Native Web
  - TypeScript
  - Axios (gọi RESTful API)
  - Expo Image Picker (chọn và upload ảnh từ thư viện / camera)
- **Cơ sở dữ liệu:** 
  - MongoDB Server (Local Windows, Port 27017)
  - Database: `ProductManagement`
  - Collection: `products`

---

## 4. KIẾN TRÚC FRONTEND – BACKEND
Hệ thống tuân thủ kiến trúc phân tầng độc lập:
```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     React Native Web (Admin)    │       │   Mobile Android (Expo App)     │
│   http://localhost:8081 (Web)   │       │   Mạng LAN: 192.168.137.232     │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 │ RESTful API (JSON & Multipart)          │
                 ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    BACKEND REST API (Express.js)                          │
│                    Lắng nghe tại cổng 5000                                │
│       Auth (JWT)  │  Upload (Multer)  │  Products CRUD                    │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Mongoose Connection
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE (Windows Local)                       │
│    URI: mongodb://localhost:27017/ProductManagement                        │
│    Collection: products (Chỉ 4 trường: name, price, soluong, image)       │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 5. CẤU TRÚC THƯ MỤC
```
ProductManagement/
│
├── backend/
│   ├── config/
│   │   └── database.js         # Kết nối MongoDB ProductManagement
│   ├── models/
│   │   └── Product.js          # Mongoose Schema (4 trường, không __v)
│   ├── controllers/
│   │   ├── authController.js   # Đăng nhập Admin & cấp phát JWT
│   │   └── productController.js# CRUD sản phẩm, tìm kiếm, sắp xếp
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth
│   │   ├── productRoutes.js    # /api/products
│   │   └── uploadRoutes.js     # /api/upload
│   ├── middleware/
│   │   └── authMiddleware.js   # Xác thực quyền Admin Bearer JWT
│   ├── uploads/                # Lưu trữ file ảnh vật lý (.gitkeep)
│   ├── .env                    # Biến môi trường Backend (đã đưa vào .gitignore)
│   ├── .env.example            # Mẫu cấu hình bảo mật
│   ├── package.json            # Dependencies Backend
│   └── server.js               # Entry point khởi chạy máy chủ Express
│
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx         # Định tuyến gốc Expo Router
│   │   ├── index.tsx           # Kiểm tra phiên đăng nhập và chuyển hướng
│   │   ├── login.tsx           # Màn hình đăng nhập Web Admin
│   │   ├── admin/
│   │   │   ├── dashboard.tsx   # Bảng điều khiển thống kê tổng quan
│   │   │   └── products.tsx    # Quản lý sản phẩm (Bảng, Thêm, Sửa, Xóa)
│   │   └── mobile/
│   │       ├── index.tsx       # Màn hình chính Mobile Android (Danh sách SP)
│   │       ├── add.tsx         # Màn hình Thêm sản phẩm Mobile (Expo Image Picker)
│   │       └── detail/
│   │           └── [id].tsx    # Màn hình Chi tiết sản phẩm Mobile (Ảnh Hero)
│   ├── components/
│   │   ├── Navbar.tsx          # Thanh điều hướng Web Admin & liên kết Mobile
│   │   ├── StatCard.tsx        # Thẻ thống kê số liệu kho hàng
│   │   ├── ProductFormModal.tsx# Hộp thoại Thêm / Sửa sản phẩm kèm Upload ảnh
│   │   └── DeleteConfirmModal.tsx # Hộp thoại xác nhận xóa an toàn
│   ├── services/
│   │   ├── api.ts              # Cấu hình Axios Interceptors
│   │   ├── authService.ts      # Gọi API đăng nhập và lưu JWT token
│   │   ├── productService.ts   # Gọi API CRUD sản phẩm, upload, export JSON
│   │   └── storage.ts          # Lưu trữ token đa nền tảng
│   ├── types/
│   │   └── product.ts          # Định nghĩa kiểu dữ liệu TypeScript
│   ├── constants/
│   │   └── api.ts              # Cấu hình IP và URL Backend Web/Mobile
│   ├── assets/                 # Biểu tượng và hình ảnh giao diện
│   ├── app.json                # Cấu hình Expo
│   ├── tsconfig.json           # Cấu hình TypeScript
│   └── package.json            # Dependencies Frontend
│
├── database/
│   └── products.json           # File dữ liệu chuẩn bị nộp bài
│
├── report/
│   ├── BAO_CAO.md              # Báo cáo chi tiết đề tài
│   ├── screenshot_login.png    # Ảnh đăng nhập Web
│   ├── screenshot_dashboard.png# Ảnh Dashboard
│   ├── screenshot_products.png # Ảnh Quản lý sản phẩm
│   ├── screenshot_add_modal.png# Ảnh Modal Thêm Web
│   ├── screenshot_edit_modal.png# Ảnh Modal Sửa Web
│   ├── screenshot_delete_modal.png# Ảnh Modal Xác nhận Xóa Web
│   ├── screenshot_responsive.png# Ảnh Responsive Mobile Web
│   ├── screenshot_mobile_home.png# Ảnh Màn hình chính Mobile Android
│   ├── screenshot_mobile_detail.png# Ảnh Chi tiết sản phẩm Mobile Android
│   ├── screenshot_mobile_add.png# Ảnh Thêm sản phẩm Mobile Android
│   ├── screenshot_crud_create.png# Ảnh kiểm thử Tạo sản phẩm
│   ├── screenshot_crud_update.png# Ảnh kiểm thử Sửa sản phẩm
│   └── screenshot_crud_delete.png# Ảnh kiểm thử Xóa sản phẩm
│
├── README.md                   # Hướng dẫn tổng quan dự án
├── .gitignore                  # Loại trừ node_modules, .env, .expo
└── products.json               # File dữ liệu gốc được bảo vệ
```

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU
- **Database:** `ProductManagement`
- **Collection:** `products`
- **Cấu trúc Document:**
  - `_id`: ObjectId (mặc định của MongoDB)
  - `name`: String (Tên sản phẩm)
  - `price`: Number (Đơn giá)
  - `soluong`: Number (Số lượng tồn kho)
  - `image`: String (URL hoặc đường dẫn ảnh upload)
- **Quy tắc nghiêm ngặt:** Cấu hình `{ collection: 'products', versionKey: false, timestamps: false }` đảm bảo không phát sinh `__v`, không có `createdAt`/`updatedAt`, không thêm trường nghiệp vụ ngoài quy định.

---

## 7. CÁC CHỨC NĂNG ĐÃ XÂY DỰNG
### Phân hệ Backend:
1. **Quản lý sản phẩm (RESTful API):**
   - `GET /api/products`: Lấy danh sách sản phẩm (có tìm kiếm `?search=` và sắp xếp `?sort=`).
   - `GET /api/products/:id`: Lấy chi tiết một sản phẩm.
   - `POST /api/products`: Thêm sản phẩm mới (chỉ nhận đúng 4 trường, chặn trường lạ, bảo vệ bằng JWT).
   - `PUT /api/products/:id`: Cập nhật sản phẩm theo ID (chỉ cập nhật 4 trường, bảo vệ bằng JWT).
   - `DELETE /api/products/:id`: Xóa sản phẩm theo ID (bảo vệ bằng JWT).
   - `POST /api/products/export`: Xuất dữ liệu đồng bộ ra file `database/products.json`.
2. **Upload hình ảnh:**
   - `POST /api/upload`: Nhận file ảnh qua Multer, kiểm tra định dạng và kích thước (tối đa 5MB), bảo vệ bằng JWT Authentication, lưu vào `backend/uploads/` và trả về đường dẫn URL.
   - Phục vụ file tĩnh tại endpoint `/uploads/:filename`.
3. **Xác thực Admin:**
   - `POST /api/auth/login`: Xác thực tài khoản quản trị (`admin`/`admin123`), sinh mã JWT token thời hạn 24 giờ.
   - `GET /api/auth/me`: Kiểm tra thông tin phiên làm việc.

### Phân hệ Web Admin:
1. **Đăng nhập Admin (`/login`):** Giao diện đăng nhập hiện đại, lưu JWT an toàn, form không hardcode mật khẩu, tự động kiểm tra phiên và điều hướng.
2. **Dashboard (`/admin/dashboard`):** Thống kê tổng số sản phẩm, tổng tồn kho, giá trị kho hàng, sản phẩm giá cao nhất, bảng xem trước sản phẩm.
3. **Quản lý sản phẩm (`/admin/products`):** Danh sách dạng bảng chuyên nghiệp, tìm kiếm tên thời gian thực, 5 bộ lọc sắp xếp giá và số lượng, modal Thêm và Sửa tích hợp bộ chọn ảnh tải lên, hộp thoại xác nhận xóa an toàn.

### Phân hệ Mobile Android:
1. **Danh sách sản phẩm (`/mobile`):**
   - Giao diện thẻ (Card) chuẩn di động: Ảnh sản phẩm, tên, đơn giá VND nổi bật, huy hiệu số lượng tồn kho.
   - Thanh tìm kiếm lọc thời gian thực.
   - Kéo để làm mới (Pull-to-refresh).
   - Nút hành động nổi (FAB `➕`) dẫn đến màn hình thêm sản phẩm.
2. **Chi tiết sản phẩm (`/mobile/detail/[id]`):**
   - Ảnh sản phẩm kích thước lớn (Hero image).
   - Hiển thị đầy đủ thông tin: Tên sản phẩm, đơn giá, số lượng tồn kho, mã `_id` MongoDB, tổng giá trị mặt hàng trong kho.
3. **Thêm sản phẩm Mobile (`/mobile/add`):**
   - Form nhập: Tên, Đơn giá, Số lượng.
   - Tích hợp `expo-image-picker`:
     - Chọn ảnh từ Thư viện thiết bị Android.
     - Chụp ảnh trực tiếp từ Camera điện thoại.
   - Tự động upload ảnh lên Backend Multer và lưu vào MongoDB với đúng 4 trường được phép.

---

## 8. HƯỚNG DẪN CÀI ĐẶT THƯ VIỆN
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## 9. HƯỚNG DẪN CHẠY BACKEND
Tại thư mục `backend/`:
```bash
npm run dev
```
- Server chạy tại: `http://localhost:5000` (hoặc qua IP mạng LAN `http://192.168.137.232:5000`).

---

## 10. HƯỚNG DẪN CHẠY WEB ADMIN
Tại thư mục `frontend/`:
```bash
npx expo start --web
```
- Mở trình duyệt tại: `http://localhost:8081`
- Tài khoản đăng nhập Admin: `admin` / `admin123`

---

## 11. HƯỚNG DẪN CHẠY MOBILE ANDROID

### Cách 1: Chạy trên điện thoại Android thật (Khuyên dùng)
1. Đảm bảo máy tính và điện thoại Android kết nối **chung một mạng Wi-Fi**.
2. Địa chỉ IPv4 của máy tính trên mạng Wi-Fi: **`192.168.137.232`** (đã cấu hình sẵn trong `frontend/constants/api.ts`).
3. Khởi chạy Expo:
   ```bash
   cd frontend
   npx expo start
   ```
4. Mở ứng dụng **Expo Go** trên điện thoại Android, quét mã QR hiển thị trên màn hình terminal máy tính để khởi chạy ứng dụng.

### Cách 2: Chạy trên Android Emulator (Máy ảo Android)
Máy tính đã có sẵn AVD: `Medium_Phone_API_35`.
1. Khởi chạy máy ảo Android từ Android Studio hoặc qua dòng lệnh:
   ```bash
   C:\Users\admin\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone_API_35
   ```
2. Tại terminal đang chạy Expo (`npx expo start`), nhấn phím **`a`** trên bàn phím để mở ứng dụng trực tiếp trên Android Emulator.

---

## 12. HÌNH ẢNH MINH HỌA CÁC CHỨC NĂNG

### 12.1. Phân hệ Web Admin
- **Đăng nhập Web:** ![Đăng nhập Web Admin](./screenshot_login.png)
- **Dashboard Tổng quan:** ![Dashboard Tổng quan](./screenshot_dashboard.png)
- **Quản lý Sản phẩm:** ![Bảng danh sách sản phẩm](./screenshot_products.png)
- **Hộp thoại Thêm Sản phẩm:** ![Modal Thêm Sản phẩm](./screenshot_add_modal.png)
- **Hộp thoại Sửa Sản phẩm:** ![Modal Sửa Sản phẩm](./screenshot_edit_modal.png)
- **Hộp thoại Xác nhận Xóa:** ![Modal Xác nhận Xóa](./screenshot_delete_modal.png)
- **Responsive Mobile Web:** ![Giao diện Responsive](./screenshot_responsive.png)

### 12.2. Phân hệ Mobile Android
- **Danh sách sản phẩm Mobile:** ![Màn hình chính Mobile](./screenshot_mobile_home.png)
- **Chi tiết sản phẩm Mobile:** ![Chi tiết sản phẩm Mobile](./screenshot_mobile_detail.png)
- **Thêm sản phẩm Mobile (Expo Image Picker):** ![Thêm sản phẩm Mobile](./screenshot_mobile_add.png)

---

## 13. KẾT LUẬN
Dự án đã hoàn thành trọn vẹn cả phân hệ Web Admin và Mobile Android kết nối chung cơ sở dữ liệu MongoDB, đáp ứng tuyệt đối toàn bộ yêu cầu của đề bài thi.
