require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser"); 
const jwt = require("jsonwebtoken");           
const { adminMiddleware, authenticateToken } = require("./middleware/authMiddleware");
const db = require("./config/db");
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

// Trang giỏ hàng

app.get("/cart", (req, res) => {
    res.render("GioHang"); 
});

// Trang Admin
app.get("/admin", adminMiddleware, (req, res) => {
    res.render("admin"); 
});


// Trang Admin dashboard
app.get("/admin_sanpham", adminMiddleware, (req, res) => {
    res.render("admin_sanpham"); 
});
// Trang Admin danh mục
app.get("/admin_danhmuc", adminMiddleware, (req, res) => {
    res.render("admin_danhmuc"); 
});
// Trang Admin user
app.get("/admin_user", adminMiddleware, (req, res) => {
    res.render("admin_user"); 
});

// Trang Admin đờn hàng
app.get("/admin_donhang", adminMiddleware, (req, res) => {
    res.render("admin_donhang"); 
});

// Trang dangnhap
app.get("/dangnhap", (req, res) => {
    res.render("dangnhap"); 
});
// Thêm route checkout vào app.js
app.get("/checkout", authenticateToken, (req, res) => {
    res.render("checkout");
});
// Trang cá nhân (user)
app.get("/user", authenticateToken, async (req, res) => {
    try {
        // Lấy ID tài khoản từ Token (chính là số 7 hoặc 8 lúc nãy in ra)
        const userId = req.user.id; 

        if (!userId) {
             return res.redirect("/dangnhap"); 
        }

        const promiseDb = db.promise();

        // 1. LẤY THÔNG TIN NGƯỜI DÙNG (KẾT HỢP 2 BẢNG TAIKHOAN VÀ NGUOIDUNG)
        const [userRows] = await promiseDb.query(`
            SELECT 
                TK.MaTaiKhoan, TK.TenTaiKhoan, TK.avatar,
                ND.TenNguoiDung, ND.NgaySinh, ND.GioiTinh, ND.SoDienThoai, ND.DiaChi
            FROM TAIKHOAN TK
            JOIN NGUOIDUNG ND ON TK.MaNguoiDung = ND.MaNguoiDung
            WHERE TK.MaTaiKhoan = ?
        `, [userId]);

        // Nếu không tìm thấy user trong CSDL thì bắt đăng nhập lại
        if (userRows.length === 0) {
            return res.redirect("/dangnhap");
        }

        const dbUser = userRows[0];

        // Format lại dữ liệu cho giống với các biến EJS đang gọi
        const formattedUser = {
            ...dbUser,
            Email: dbUser.TenTaiKhoan // Dùng TenTaiKhoan (email) làm Email hiển thị
        };

        // 2. LẤY THỐNG KÊ ĐƠN HÀNG (Bỏ đếm Yêu thích tạm thời)
        const [statsRows] = await promiseDb.query(`
            SELECT 
                (SELECT COUNT(*) FROM DONHANG WHERE MaTaiKhoan = ?) as totalOrders,
                (SELECT COUNT(*) FROM DONHANG WHERE MaTaiKhoan = ? AND TrangThai = 'Chờ xác nhận') as pendingOrders,
                0 as wishlistCount
        `, [userId, userId]);

        const stats = statsRows[0];

        // 3. LẤY DANH SÁCH 5 ĐƠN HÀNG GẦN NHẤT
        const [orderRows] = await promiseDb.query(`
            SELECT MaDonHang as id, NgayDat as date, TongTien as total, TrangThai as statusText
            FROM DONHANG 
            WHERE MaTaiKhoan = ? 
            ORDER BY NgayDat DESC 
            LIMIT 5
        `, [userId]);

        const getStatusClass = (status) => {
            if (status === 'Đã giao') return 'delivered';
            if (status === 'Đang giao') return 'shipping';
            if (status === 'Đã hủy') return 'cancelled';
            return 'pending';
        };

        const recentOrders = orderRows.map(order => ({
            ...order,
            date: new Date(order.date).toLocaleDateString('vi-VN'),
            statusClass: getStatusClass(order.statusText)
        }));

        // 4. RENDER GIAO DIỆN
        res.render("user", {
            user: formattedUser, 
            stats: stats,
            recentOrders: recentOrders,
            title: 'Tài khoản của tôi'
        });

    } catch (error) {
        console.error("Lỗi khi tải trang user:", error);
        res.status(500).send("Lỗi Server. Vui lòng thử lại sau.");
    }
});

// --- ROUTES API (DATA) ---
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const detailRoutes = require("./routes/detailRoutes"); 
const addToCartRoutes = require("./routes/addtocartRoute");
const orderRoutes = require("./routes/orderRoutes"); // Thêm route cho đơn hàng
const admin_userRoutes = require("./routes/admin_userRoutes"); // Thêm route cho quản lý user (admin)
// Thêm route cho dashboard
const adminDashboardRoutes = require("./routes/admin_dashboardRoutes");

app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/users", admin_userRoutes); // Thêm route cho quản lý user (admin)
app.use("/api/orders", orderRoutes); // Thêm route cho đơn hàng
app.use("/api/cart", addToCartRoutes); // Thêm route cho giỏ hàng
app.use("/api", productRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes);
app.use("/chitiet", detailRoutes); 

// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).send("Không tìm thấy trang");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});