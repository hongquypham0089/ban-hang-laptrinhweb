require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

// --- CẤU HÌNH EJS ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- MIDDLEWARE ---
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 1. Phục vụ file tĩnh (CSS, JS, Images cũ) từ thư mục FE
app.use(express.static(path.join(__dirname, "../FE")))

// 2. QUAN TRỌNG: Cấu hình phục vụ file ảnh đã tải lên
// Dòng này giúp link http://localhost:5000/uploads/ten-anh.jpg hoạt động
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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

// Trang cá nhân (User Profile)
app.get("/user", (req, res) => {
    const userData = {
        user: {
            fullname: "Nguyễn Văn A",
            email: "nguyenvana@email.com",
            phone: "0987654321",
            birthday: "1995-05-15",
            rank: "Gold",
            points: 350,
            avatar: null 
        },
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
    res.render("User", userData);
});

// Các trang khác
app.get("/cart", (req, res) => {
    res.render("Cart");
});

// --- ROUTES API (DATA) ---
const productRoutes = require("./routes/productRoutes")
const authRoutes = require("./routes/authRoutes");
app.use("/api", productRoutes) 
app.use("/api/auth", authRoutes); // Thêm dòng này (URL sẽ là /api/auth/login)
// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).send("Không tìm thấy trang");
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`)
    console.log(`🛠️  Trang Admin: http://localhost:${PORT}/admin`)
})