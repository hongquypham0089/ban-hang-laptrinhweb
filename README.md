# 🛒 Website Bán máy tính

Dự án Website bán máy tính được xây dựng bằng **Node.js, Express.js, MySQL và EJS** theo mô hình Fullstack Web Application.  
Hệ thống hỗ trợ đầy đủ các chức năng dành cho khách hàng và quản trị viên (Admin).

---

# ✨ Chức năng chính

## 👤 Người dùng (Customer)

- Đăng ký / Đăng nhập
- Xác thực bằng JWT + Cookie
- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Tìm kiếm sản phẩm
- Thêm / xóa sản phẩm khỏi giỏ hàng
- Đặt hàng
- Xem lịch sử đơn hàng
- Hủy đơn hàng
- Cập nhật thông tin cá nhân
- Đổi mật khẩu
- Upload ảnh đại diện (Avatar)

---

## 🛠️ Quản trị viên (Admin)

- Dashboard thống kê tổng quan
- Quản lý sản phẩm
  - Thêm sản phẩm
  - Sửa sản phẩm
  - Xóa sản phẩm
  - Upload hình ảnh
- Quản lý đơn hàng
  - Xác nhận đơn
  - Cập nhật trạng thái giao hàng
- Quản lý người dùng
- Quản lý danh mục sản phẩm
- Thống kê doanh thu và sản phẩm bán chạy

---

# 💻 Công nghệ sử dụng

## Backend
- Node.js
- Express.js

## Frontend
- EJS Template Engine
- HTML5
- CSS3
- JavaScript

## Database
- MySQL
- mysql2 Connection Pool

## Authentication & Security
- JWT (JSON Web Token)
- bcrypt
- cookie-parser

## Upload File
- Multer

---

# 🚀 Hướng dẫn cài đặt

## 1. Clone project

```bash
git clone https://github.com/hongquypham0089/ban-hang-laptrinhweb.git
cd ban-hang-laptrinhweb
```

---

## 2. Cài đặt dependencies

```bash
npm install
```

---

## 3. Cấu hình môi trường

Tạo file `.env` trong thư mục gốc dự án:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=laptrinhweb

JWT_SECRET=your_secret_key
PORT=5000
```

---

## 4. Import Database

- Tạo database MySQL tên:
```sql
laptrinhweb
```

- Import file:
```text
DB/Dump20260511.sql
```

---

## 5. Chạy project

```bash
node app.js
```

Hoặc dùng nodemon:

```bash
npx nodemon app.js
```

---

# 🌐 Địa chỉ chạy mặc định

```text
http://localhost:5000
```

---

# 📂 Cấu trúc thư mục

```text
ban-hang-laptrinhweb
│
├── BE/
│   ├── config/          # Kết nối database
│   ├── middleware/      # Middleware xác thực
│   ├── routes/          # API Routes
│   ├── public/
│   │   └── uploads/     # Hình ảnh upload
│   └── app.js           # Entry point backend
│
├── FE/
│   ├── CSS/
│   ├── JS/
│   └── *.ejs            # Giao diện EJS
│
├── DB/
│   └── Dump20260511.sql
│
├── package.json
└── README.md
```

---

# 🔐 Tài khoản Admin mẫu

```text
Email: hongquy@gmail.com
Password: 123123
```

> Có thể thay đổi trực tiếp trong database.

---

# 📸 Một số chức năng nổi bật

- Authentication bằng JWT
- Upload Avatar và hình ảnh sản phẩm
- Dashboard Admin
- Quản lý đơn hàng
- Responsive UI
- Shopping Cart
- Order Management
