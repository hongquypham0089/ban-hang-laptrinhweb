const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");
// TÔI ĐÃ XÓA DÒNG BCRYPT Ở ĐÂY ĐỂ TRÁNH LỖI

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

        // SỬA LẠI CHỖ NÀY: SO SÁNH TRỰC TIẾP CHỮ BÌNH THƯỜNG (Ví dụ: admin123 === admin123)
        if (MatKhau !== user.MatKhau) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }

        if (user.TinhTrang !== 'Active') {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa" });
        }

        const jwtSecret = process.env.JWT_SECRET || "secret_key";
        const token = jwt.sign(
            { MaTaiKhoan: user.MaTaiKhoan, VaiTro: user.TenVaiTro },
            jwtSecret,
            { expiresIn: "1d" }
        );

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

module.exports = router;
// [POST] Đăng ký tài khoản mới
router.post("/register", (req, res) => {
    const { TenNguoiDung, NgaySinh, SoDienThoai, Email, MatKhau } = req.body;

    // 1. Kiểm tra dữ liệu rỗng
    if (!TenNguoiDung || !SoDienThoai || !Email || !MatKhau) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Ghi chú: Vì form đăng ký của bạn không có trường "Tên Tài Khoản" riêng, 
    // nên ta sẽ dùng luôn Email làm Tên Tài Khoản (TenTaiKhoan) để đăng nhập.
    const TenTaiKhoan = Email; 
    const MaVaiTro = 2; // Giả sử 2 là mã Vai Trò của Khách hàng (Bạn hãy kiểm tra lại DB của mình nhé)

    // 2. Kiểm tra xem Email hoặc Tài khoản đã tồn tại chưa
    const checkSql = `SELECT * FROM TAIKHOAN WHERE TenTaiKhoan = ? OR Email = ?`;
    db.query(checkSql, [TenTaiKhoan, Email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
        }

        // 3. Thêm thông tin vào bảng NGUOIDUNG
        const insertUserSql = `INSERT INTO NGUOIDUNG (TenNguoiDung, NgaySinh, SoDienThoai) VALUES (?, ?, ?)`;
        db.query(insertUserSql, [TenNguoiDung, NgaySinh, SoDienThoai], (err, userResult) => {
            if (err) return res.status(500).json({ success: false, message: "Lỗi tạo người dùng: " + err.message });
            
            const MaNguoiDung = userResult.insertId; // Lấy ID của người dùng vừa tạo

            // 4. Thêm thông tin vào bảng TAIKHOAN
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