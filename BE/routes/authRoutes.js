const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Nhớ kiểm tra lại đường dẫn tới db cho đúng
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
    const { TenTaiKhoan, MatKhau } = req.body;

    if (!TenTaiKhoan || !MatKhau) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" });
    }

    const sql = `
        SELECT TK.*, VT.TenVaiTro, ND.TenNguoiDung 
        FROM TAIKHOAN TK
        LEFT JOIN VAITRO VT ON TK.MaVaiTro = VT.MaVaiTro
        LEFT JOIN NGUOIDUNG ND ON TK.MaNguoiDung = ND.MaNguoiDung
        WHERE TK.TenTaiKhoan = ?
    `;

    db.query(sql, [TenTaiKhoan], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }

        const user = results[0];

        if (MatKhau !== user.MatKhau) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }

        if (user.TinhTrang !== 'Active') {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa" });
        }

        const jwtSecret = process.env.JWT_SECRET || "secret_key";

        const token = jwt.sign(
            { 
                MaTaiKhoan: user.MaTaiKhoan, 
                VaiTro: user.TenVaiTro,
                TenTaiKhoan: user.TenTaiKhoan,
                TenNguoiDung: user.TenNguoiDung,
                avatar: user.avatar || null 
            },
            jwtSecret,
            { expiresIn: "1d" }
        );

        // --- ĐÂY LÀ PHẦN QUAN TRỌNG VỪA ĐƯỢC THÊM VÀO ---
        // Lưu token vào cookie của trình duyệt để các trang khác có thể đọc được
        res.cookie("token", token, {
            httpOnly: true, // Bảo mật: Ngăn chặn JavaScript ở client đọc được cookie này
            secure: process.env.NODE_ENV === "production", // Chỉ dùng HTTPS trên môi trường production
            maxAge: 24 * 60 * 60 * 1000 // Thời gian sống của cookie là 1 ngày (trùng với thời hạn token)
        });
        // ------------------------------------------------

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token: token,
            user: {
                MaTaiKhoan: user.MaTaiKhoan,
                TenTaiKhoan: user.TenTaiKhoan,
                TenNguoiDung: user.TenNguoiDung,
                Email: user.Email,
                VaiTro: user.TenVaiTro
            }
        });
    });
});

// [POST] Đăng ký tài khoản mới
router.post("/register", (req, res) => {
    const { TenNguoiDung, NgaySinh, SoDienThoai, Email, MatKhau } = req.body;

    if (!TenNguoiDung || !SoDienThoai || !Email || !MatKhau) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const TenTaiKhoan = Email; 
    const MaVaiTro = 2; 

    const checkSql = `SELECT * FROM TAIKHOAN WHERE TenTaiKhoan = ? OR Email = ?`;
    db.query(checkSql, [TenTaiKhoan, Email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
        }

        const insertUserSql = `INSERT INTO NGUOIDUNG (TenNguoiDung, NgaySinh, SoDienThoai) VALUES (?, ?, ?)`;
        db.query(insertUserSql, [TenNguoiDung, NgaySinh, SoDienThoai], (err, userResult) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi tạo người dùng: " + err.message });
            
            const MaNguoiDung = userResult.insertId; 

            const insertAccountSql = `
                INSERT INTO TAIKHOAN (TenTaiKhoan, MatKhau, Email, MaNguoiDung, MaVaiTro, TinhTrang) 
                VALUES (?, ?, ?, ?, ?, 'Active')
            `;
            
            db.query(insertAccountSql, [TenTaiKhoan, MatKhau, Email, MaNguoiDung, MaVaiTro], (err, accountResult) => {
                 if (err) return res.status(500).json({ success: false, message: "Lỗi tạo tài khoản: " + err.message });
                 
                 res.json({ success: true, message: "Đăng ký thành công!" });
            });
        });
    });
});

// [POST] Đăng xuất
router.post("/logout", (req, res) => {
    // Xóa cookie có tên là 'token'
    res.clearCookie("token");
    res.json({ success: true, message: "Đăng xuất thành công" });
});

module.exports = router;