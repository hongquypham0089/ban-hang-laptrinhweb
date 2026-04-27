const express = require("express");
const router = express.Router();
const db = require("../config/db"); // File kết nối DB của bạn
const jwt = require("jsonwebtoken");

// Middleware kiểm tra đăng nhập (nếu bạn chưa có)
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Vui lòng đăng nhập" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        req.user = decoded; // Lưu thông tin user (có MaTaiKhoan) vào req
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

// API: POST /api/cart/add
router.post("/add", verifyToken, async (req, res) => {
    // req.user được lấy từ token (bạn cần đảm bảo lúc tạo token ở authRoutes có payload là MaTaiKhoan)
    const maTaiKhoan = req.user.MaTaiKhoan; 
    const { maSanPham, soLuong = 1 } = req.body;

    if (!maSanPham) {
        return res.status(400).json({ success: false, message: "Thiếu mã sản phẩm" });
    }

    try {
        const promiseDb = db.promise(); // Sử dụng promise để dùng async/await

        // 1. Kiểm tra sản phẩm có tồn tại và còn hàng không
        const [products] = await promiseDb.query(
            "SELECT SoLuong FROM SANPHAM WHERE MaSanPham = ?", [maSanPham]
        );
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }
        if (products[0].SoLuong < soLuong) {
            return res.status(400).json({ success: false, message: "Số lượng trong kho không đủ" });
        }

        // 2. Kiểm tra user đã có Giỏ Hàng nào chưa
        let [carts] = await promiseDb.query(
            "SELECT MaGioHang FROM GIOHANG WHERE MaTaiKhoan = ? LIMIT 1", [maTaiKhoan]
        );

        let maGioHang;
        
        // Nếu chưa có, tạo Giỏ Hàng mới
        if (carts.length === 0) {
            const [newCart] = await promiseDb.query(
                "INSERT INTO GIOHANG (MaTaiKhoan) VALUES (?)", [maTaiKhoan]
            );
            maGioHang = newCart.insertId;
        } else {
            maGioHang = carts[0].MaGioHang;
        }

        // 3. Kiểm tra sản phẩm đã có trong chi tiết giỏ hàng chưa
        const [cartItems] = await promiseDb.query(
            "SELECT MaChiTiet, SoLuong FROM CHITIET_GIOHANG WHERE MaGioHang = ? AND MaSanPham = ?", 
            [maGioHang, maSanPham]
        );

        if (cartItems.length > 0) {
            // ĐÃ CÓ -> Cập nhật cộng dồn số lượng
            const newQuantity = cartItems[0].SoLuong + parseInt(soLuong);
            await promiseDb.query(
                "UPDATE CHITIET_GIOHANG SET SoLuong = ? WHERE MaChiTiet = ?",
                [newQuantity, cartItems[0].MaChiTiet]
            );
        } else {
            // CHƯA CÓ -> Thêm mới vào chi tiết giỏ hàng
            await promiseDb.query(
                "INSERT INTO CHITIET_GIOHANG (MaGioHang, MaSanPham, SoLuong) VALUES (?, ?, ?)",
                [maGioHang, maSanPham, soLuong]
            );
        }

        res.json({ success: true, message: "Đã thêm sản phẩm vào giỏ hàng thành công!" });

    } catch (error) {
        console.error("Lỗi thêm vào giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
    }
});

// --- 1. API: Lấy danh sách sản phẩm trong giỏ hàng ---
// GET /api/cart
router.get("/", verifyToken, async (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;

    try {
        const promiseDb = db.promise();
        
        // Truy vấn lấy danh sách sản phẩm kèm thông tin từ bảng SANPHAM
        const [items] = await promiseDb.query(`
            SELECT 
                ct.MaChiTiet, 
                ct.MaSanPham, 
                ct.SoLuong, 
                sp.TenSanPham, 
                sp.Gia, 
                sp.HinhAnh
            FROM GIOHANG gh
            JOIN CHITIET_GIOHANG ct ON gh.MaGioHang = ct.MaGioHang
            JOIN SANPHAM sp ON ct.MaSanPham = sp.MaSanPham
            WHERE gh.MaTaiKhoan = ?
        `, [maTaiKhoan]);

        res.json({ success: true, data: items });
    } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
});

// --- 2. API: Xóa sản phẩm khỏi giỏ hàng ---
// DELETE /api/cart/remove/:maChiTiet
router.delete("/remove/:id", verifyToken, async (req, res) => {
    const maChiTiet = req.params.id;
    const maTaiKhoan = req.user.MaTaiKhoan;

    try {
        const promiseDb = db.promise();

        // Bảo mật: Kiểm tra xem MaChiTiet này có đúng là của User này không
        const [check] = await promiseDb.query(`
            SELECT ct.MaChiTiet 
            FROM CHITIET_GIOHANG ct
            JOIN GIOHANG gh ON ct.MaGioHang = gh.MaGioHang
            WHERE ct.MaChiTiet = ? AND gh.MaTaiKhoan = ?
        `, [maChiTiet, maTaiKhoan]);

        if (check.length === 0) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền xóa sản phẩm này" });
        }

        // Thực hiện xóa
        await promiseDb.query("DELETE FROM CHITIET_GIOHANG WHERE MaChiTiet = ?", [maChiTiet]);

        res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
    } catch (error) {
        console.error("Lỗi xóa giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
});
module.exports = router;