require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser"); // THÊM DÒNG NÀY
const jwt = require("jsonwebtoken");           // THÊM DÒNG NÀY

const app = express();

// --- CẤU HÌNH EJS ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../FE"));

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Khởi tạo cookie-parser

// 1. Phục vụ file tĩnh (CSS, JS, Images cũ) từ thư mục FE
app.use(express.static(path.join(__dirname, "../FE")));

// 2. QUAN TRỌNG: Cấu hình phục vụ file ảnh đã tải lên
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ------------------------------------------------------------
// THÊM MIDDLEWARE KIỂM TRA ĐĂNG NHẬP TOÀN CỤC Ở ĐÂY
// ------------------------------------------------------------
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
            res.locals.user = decoded; // EJS giờ đây có thể dùng biến <%= user %> ở mọi nơi
        } catch (err) {
            res.locals.user = null; // Token hết hạn hoặc lỗi
        }
    } else {
        res.locals.user = null; // Chưa đăng nhập
    }
    next();
});

// --- ROUTES GIAO DIỆN (VIEW) ---

// Trang chủ
app.get("/", (req, res) => {
    res.render("TrangChu"); 
});

// Trang Admin
app.get("/admin", (req, res) => {
    res.render("admin"); 
});

// Trang dangnhap
app.get("/dangnhap", (req, res) => {
    res.render("dangnhap"); 
});

// Trang cá nhân (user Profile)
app.get("/user", (req, res) => {
    // 1. Kiểm tra nếu chưa đăng nhập thì đẩy về trang đăng nhập
    if (!res.locals.user) {
        return res.redirect("/dangnhap");
    }

    // 2. Lấy dữ liệu động từ token đã giải mã (thay vì dữ liệu cứng "Nguyễn Văn A")
    const userData = {
        user: {
            fullname: res.locals.user.TenNguoiDung, // Lấy từ DB thông qua JWT payload
            email: res.locals.user.TenTaiKhoan,     // Tên tài khoản hoặc Email
            phone: "Chưa cập nhật",                 // Có thể query thêm từ DB sau này
            birthday: "Chưa cập nhật", 
            rank: res.locals.user.VaiTro || "Member",
            points: 0,
            avatar: res.locals.user.avatar || null 
        },
        // Phần thống kê và đơn hàng tạm thời giữ nguyên dữ liệu tĩnh, 
        // sau này bạn có thể viết câu query SQL để lấy thật từ CSDL
        stats: {
            totalOrders: 5,
            wishlistCount: 2,
            pendingOrders: 3,
            shippingOrders: 2,
            deliveredOrders: 3
        },
        recentOrders: [
            { id: "OD12345", date: "15/02/2024", total: 32990000, statusClass: "delivered", statusText: "Đã giao" },
            { id: "OD12346", date: "10/02/2024", total: 3890000, statusClass: "shipping", statusText: "Đang giao" }
        ]
    };
    
    res.render("user", userData);
});

// Các trang khác
app.get("/cart", (req, res) => {
    res.render("Cart");
});

// --- ROUTES API (DATA) ---
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/api", productRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes);
// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).send("Không tìm thấy trang");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});