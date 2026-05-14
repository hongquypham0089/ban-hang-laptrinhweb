const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Nhớ kiểm tra lại đường dẫn tới db cho đúng
const jwt = require("jsonwebtoken");
const { authenticateToken, authenticateTokenAPI } = require("../middleware/authMiddleware"); // Đảm bảo đúng tên file middleware của bạn
router.post("/login", (req, res) => {
    const { TenTaiKhoan, MatKhau } = req.body;

    if (!TenTaiKhoan || !MatKhau) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" });
    }

    // SQL gốc không có HinhAnh -> Không bị lỗi Unknown column
    const sql = `
        SELECT TK.*, VT.TenVaiTro, ND.TenNguoiDung 
        FROM TAIKHOAN TK
        LEFT JOIN VAITRO VT ON TK.MaVaiTro = VT.MaVaiTro
        LEFT JOIN NGUOIDUNG ND ON TK.MaNguoiDung = ND.MaNguoiDung
        WHERE TK.TenTaiKhoan = ?
    `;

    db.query(sql, [TenTaiKhoan], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // 1. Kiểm tra tài khoản tồn tại
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }

        const user = results[0];

        // 2. Kiểm tra mật khẩu (Nên dùng bcrypt.compare nếu có mã hóa)
        if (MatKhau !== user.MatKhau) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }

        // 3. Kiểm tra tình trạng tài khoản
        if (user.TinhTrang !== 'Active') {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa" });
        }

        // 4. Tạo JWT Token
        const jwtSecret = process.env.JWT_SECRET || "secret_key";
        const token = jwt.sign(
            { 
                id: user.MaTaiKhoan, 
                username: user.TenTaiKhoan, 
                MaTaiKhoan: user.MaTaiKhoan, // <-- Cực kỳ quan trọng để thêm Giỏ Hàng
                role: user.MaVaiTro, 
                roleName: user.TenVaiTro,
                name: user.TenNguoiDung,
                avatar: null // Đặt cố định là null để an toàn
            },
            jwtSecret,
            { expiresIn: "1d" }
        );

        // 5. Lưu token vào cookie
        res.cookie("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            maxAge: 24 * 60 * 60 * 1000 // 1 ngày
        });

        // 6. Trả về phản hồi cho Frontend
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token: token,
            role: user.MaVaiTro, 
            user: {
                MaTaiKhoan: user.MaTaiKhoan,
                TenTaiKhoan: user.TenTaiKhoan,
                TenNguoiDung: user.TenNguoiDung,
                Email: user.Email,
                VaiTro: user.TenVaiTro,
                MaVaiTro: user.MaVaiTro
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

// [POST] Đổi mật khẩu
router.post("/change-password", authenticateTokenAPI, (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Lấy userId từ token đã được giải mã ở middleware
    const userId = req.user.id;
    
    // 1. Validate dữ liệu đầu vào
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "Vui lòng nhập đầy đủ thông tin mật khẩu" 
        });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: "Mật khẩu mới phải có ít nhất 6 ký tự" 
        });
    }
    
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "Mật khẩu xác nhận không khớp" 
        });
    }
    
    if (currentPassword === newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "Mật khẩu mới không được trùng với mật khẩu cũ" 
        });
    }
    
    // 2. Kiểm tra mật khẩu hiện tại có đúng không
    const getCurrentPasswordSql = `SELECT MatKhau FROM TAIKHOAN WHERE MaTaiKhoan = ?`;
    
    db.query(getCurrentPasswordSql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: "Lỗi server: " + err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy tài khoản" 
            });
        }
        
        const user = results[0];
        
        // Kiểm tra mật khẩu hiện tại (so sánh trực tiếp)
        if (currentPassword !== user.MatKhau) {
            return res.status(401).json({ 
                success: false, 
                message: "Mật khẩu hiện tại không chính xác" 
            });
        }
        
        // 3. Cập nhật mật khẩu mới
        const updatePasswordSql = `UPDATE TAIKHOAN SET MatKhau = ? WHERE MaTaiKhoan = ?`;
        
        db.query(updatePasswordSql, [newPassword, userId], (err, updateResult) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Lỗi cập nhật mật khẩu: " + err.message 
                });
            }
            
            // 4. Xóa token cũ để người dùng đăng nhập lại
            res.clearCookie("token");
            
            res.json({ 
                success: true, 
                message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." 
            });
        });
    });
});

module.exports = router;