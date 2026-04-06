// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình multer để upload avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../public/uploads/avatars");
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.MaTaiKhoan || Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${userId}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)"));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Middleware xác thực token từ cookie
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

// ==================== API LẤY THÔNG TIN ====================

// [GET] Lấy thông tin người dùng
router.get("/profile", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    
    const sql = `
        SELECT TK.MaTaiKhoan, TK.TenTaiKhoan, TK.Email, TK.TinhTrang, TK.NgayTao, TK.avatar,
            ND.MaNguoiDung, ND.TenNguoiDung, ND.NgaySinh, ND.GioiTinh, ND.SoDienThoai, ND.DiaChi,
            VT.TenVaiTro
        FROM TAIKHOAN TK
        LEFT JOIN NGUOIDUNG ND ON TK.MaNguoiDung = ND.MaNguoiDung
        LEFT JOIN VAITRO VT ON TK.MaVaiTro = VT.MaVaiTro
        WHERE TK.MaTaiKhoan = ?
    `;
    
    db.query(sql, [maTaiKhoan], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        const user = results[0];
        res.json({
            success: true,
            data: {
                maTaiKhoan: user.MaTaiKhoan,
                tenTaiKhoan: user.TenTaiKhoan,
                email: user.Email,
                tinhTrang: user.TinhTrang,
                ngayTao: user.NgayTao,
                tenNguoiDung: user.TenNguoiDung,
                ngaySinh: user.NgaySinh,
                gioiTinh: user.GioiTinh,
                soDienThoai: user.SoDienThoai,
                diaChi: user.DiaChi,
                avatar: user.avatar,
                vaiTro: user.TenVaiTro
            }
        });
    });
});

// [GET] Lấy thống kê của người dùng
router.get("/stats", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    
    const sql = `
        SELECT 
            COUNT(CASE WHEN TrangThai != 'Đã hủy' THEN 1 END) as totalOrders,
            COUNT(CASE WHEN TrangThai = 'Chờ xác nhận' THEN 1 END) as pendingOrders,
            COUNT(CASE WHEN TrangThai = 'Đang giao' THEN 1 END) as shippingOrders,
            COUNT(CASE WHEN TrangThai = 'Đã giao' THEN 1 END) as deliveredOrders,
            COUNT(CASE WHEN TrangThai = 'Đã hủy' THEN 1 END) as cancelledOrders,
            COALESCE(SUM(TongTien), 0) as totalSpent
        FROM DONHANG
        WHERE MaTaiKhoan = ?
    `;
    
    db.query(sql, [maTaiKhoan], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        res.json({
            success: true,
            data: results[0]
        });
    });
});

// [GET] Lấy danh sách đơn hàng
router.get("/orders", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { page = 1, limit = 10, status } = req.query;
    
    let sql = `
        SELECT DH.MaDonHang, DH.NgayDat, DH.TongTien, DH.TrangThai,
               (SELECT COUNT(*) FROM CHITIET_DONHANG WHERE MaDonHang = DH.MaDonHang) as SoLuongSanPham
        FROM DONHANG DH
        WHERE DH.MaTaiKhoan = ?
    `;
    
    const params = [maTaiKhoan];
    
    if (status) {
        sql += " AND DH.TrangThai = ?";
        params.push(status);
    }
    
    sql += " ORDER BY DH.NgayDat DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    db.query(sql, params, (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        // Lấy tổng số đơn hàng
        let countSql = "SELECT COUNT(*) as total FROM DONHANG WHERE MaTaiKhoan = ?";
        const countParams = [maTaiKhoan];
        
        if (status) {
            countSql += " AND TrangThai = ?";
            countParams.push(status);
        }
        
        db.query(countSql, countParams, (err, countResult) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            
            res.json({
                success: true,
                data: orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(countResult[0].total / limit),
                    totalItems: countResult[0].total,
                    itemsPerPage: parseInt(limit)
                }
            });
        });
    });
});

// [GET] Lấy chi tiết một đơn hàng
router.get("/orders/:orderId", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { orderId } = req.params;
    
    const orderSql = `
        SELECT DH.*, TK.TenTaiKhoan, ND.TenNguoiDung, ND.SoDienThoai, ND.DiaChi
        FROM DONHANG DH
        JOIN TAIKHOAN TK ON DH.MaTaiKhoan = TK.MaTaiKhoan
        LEFT JOIN NGUOIDUNG ND ON TK.MaNguoiDung = ND.MaNguoiDung
        WHERE DH.MaDonHang = ? AND DH.MaTaiKhoan = ?
    `;
    
    db.query(orderSql, [orderId, maTaiKhoan], (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        const order = orders[0];
        
        // Lấy chi tiết sản phẩm trong đơn hàng
        const detailSql = `
            SELECT CT.MaSanPham, CT.SoLuong, CT.Gia,
                   SP.TenSanPham, SP.HinhAnh
            FROM CHITIET_DONHANG CT
            JOIN SANPHAM SP ON CT.MaSanPham = SP.MaSanPham
            WHERE CT.MaDonHang = ?
        `;
        
        db.query(detailSql, [orderId], (err, items) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            
            res.json({
                success: true,
                data: {
                    ...order,
                    items: items
                }
            });
        });
    });
});

// [GET] Lấy đơn hàng gần đây (cho dashboard)
router.get("/recent-orders", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const limit = parseInt(req.query.limit) || 5;
    
    const sql = `
        SELECT MaDonHang as id, 
               DATE_FORMAT(NgayDat, '%d/%m/%Y') as date,
               TongTien as total,
               TrangThai as statusText,
               CASE 
                   WHEN TrangThai = 'Đã giao' THEN 'delivered'
                   WHEN TrangThai = 'Đang giao' THEN 'shipping'
                   WHEN TrangThai = 'Chờ xác nhận' THEN 'pending'
                   ELSE 'cancelled'
               END as statusClass
        FROM DONHANG
        WHERE MaTaiKhoan = ?
        ORDER BY NgayDat DESC
        LIMIT ?
    `;
    
    db.query(sql, [maTaiKhoan, limit], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        res.json({
            success: true,
            data: results
        });
    });
});

// ==================== API CẬP NHẬT ====================

// [PUT] Cập nhật thông tin cá nhân
router.put("/profile", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { tenNguoiDung, ngaySinh, gioiTinh, soDienThoai, diaChi } = req.body;
    
    // Lấy MaNguoiDung từ tài khoản
    const getUserIdSql = "SELECT MaNguoiDung FROM TAIKHOAN WHERE MaTaiKhoan = ?";
    
    db.query(getUserIdSql, [maTaiKhoan], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        const maNguoiDung = results[0].MaNguoiDung;
        
        if (!maNguoiDung) {
            // Nếu chưa có NGUOIDUNG, tạo mới
            const insertSql = `
                INSERT INTO NGUOIDUNG (TenNguoiDung, NgaySinh, GioiTinh, SoDienThoai, DiaChi)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.query(insertSql, [tenNguoiDung, ngaySinh, gioiTinh, soDienThoai, diaChi], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                
                const newMaNguoiDung = result.insertId;
                
                const updateAccountSql = "UPDATE TAIKHOAN SET MaNguoiDung = ? WHERE MaTaiKhoan = ?";
                db.query(updateAccountSql, [newMaNguoiDung, maTaiKhoan], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    
                    res.json({ success: true, message: "Cập nhật thông tin thành công" });
                });
            });
        } else {
            // Cập nhật thông tin
            const updateSql = `
                UPDATE NGUOIDUNG 
                SET TenNguoiDung = ?, NgaySinh = ?, GioiTinh = ?, SoDienThoai = ?, DiaChi = ?
                WHERE MaNguoiDung = ?
            `;
            
            db.query(updateSql, [tenNguoiDung, ngaySinh, gioiTinh, soDienThoai, diaChi, maNguoiDung], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                
                res.json({ success: true, message: "Cập nhật thông tin thành công" });
            });
        }
    });
});

// [POST] Đổi mật khẩu
router.post("/change-password", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }
    
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Mật khẩu mới không khớp" });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }
    
    // Kiểm tra mật khẩu hiện tại
    const checkSql = "SELECT MatKhau FROM TAIKHOAN WHERE MaTaiKhoan = ?";
    
    db.query(checkSql, [maTaiKhoan], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
        }
        
        if (currentPassword !== results[0].MatKhau) {
            return res.status(401).json({ success: false, message: "Mật khẩu hiện tại không đúng" });
        }
        
        // Cập nhật mật khẩu mới
        const updateSql = "UPDATE TAIKHOAN SET MatKhau = ? WHERE MaTaiKhoan = ?";
        
        db.query(updateSql, [newPassword, maTaiKhoan], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            
            res.json({ success: true, message: "Đổi mật khẩu thành công" });
        });
    });
});

// [POST] Upload avatar
router.post("/upload-avatar", authenticateToken, upload.single("avatar"), (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh" });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const updateSql = "UPDATE TAIKHOAN SET avatar = ? WHERE MaTaiKhoan = ?";
    
    db.query(updateSql, [avatarUrl, maTaiKhoan], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        res.json({
            success: true,
            message: "Cập nhật avatar thành công",
            data: { avatarUrl: avatarUrl }
        });
    });
});

// ==================== API ĐỊA CHỈ ====================

// [GET] Lấy danh sách địa chỉ
router.get("/addresses", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    
    const sql = `
        SELECT MaNguoiDung FROM TAIKHOAN WHERE MaTaiKhoan = ?
    `;
    
    db.query(sql, [maTaiKhoan], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (results.length === 0 || !results[0].MaNguoiDung) {
            return res.json({ success: true, data: [] });
        }
        
        // Lấy địa chỉ từ NGUOIDUNG
        const addressSql = `
            SELECT MaNguoiDung, DiaChi as address, SoDienThoai as phone, TenNguoiDung as fullname
            FROM NGUOIDUNG
            WHERE MaNguoiDung = ?
        `;
        
        db.query(addressSql, [results[0].MaNguoiDung], (err, addresses) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            
            // Format lại thành mảng địa chỉ (hiện tại chỉ có 1 địa chỉ chính)
            const addressList = addresses.map((addr, index) => ({
                id: addr.MaNguoiDung,
                fullname: addr.fullname,
                phone: addr.phone,
                address: addr.address,
                isDefault: index === 0
            }));
            
            res.json({ success: true, data: addressList });
        });
    });
});

// [POST] Thêm địa chỉ mới
router.post("/addresses", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { fullname, phone, address } = req.body;
    
    if (!fullname || !phone || !address) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }
    
    // Lấy MaNguoiDung
    const getUserIdSql = "SELECT MaNguoiDung FROM TAIKHOAN WHERE MaTaiKhoan = ?";
    
    db.query(getUserIdSql, [maTaiKhoan], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        let maNguoiDung = results[0]?.MaNguoiDung;
        
        if (!maNguoiDung) {
            // Tạo mới NGUOIDUNG
            const insertUserSql = `
                INSERT INTO NGUOIDUNG (TenNguoiDung, SoDienThoai, DiaChi)
                VALUES (?, ?, ?)
            `;
            
            db.query(insertUserSql, [fullname, phone, address], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                
                maNguoiDung = result.insertId;
                
                const updateAccountSql = "UPDATE TAIKHOAN SET MaNguoiDung = ? WHERE MaTaiKhoan = ?";
                db.query(updateAccountSql, [maNguoiDung, maTaiKhoan], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    
                    res.json({ success: true, message: "Thêm địa chỉ thành công" });
                });
            });
        } else {
            // Cập nhật địa chỉ hiện tại (có thể mở rộng để lưu nhiều địa chỉ)
            const updateAddressSql = `
                UPDATE NGUOIDUNG 
                SET TenNguoiDung = ?, SoDienThoai = ?, DiaChi = ?
                WHERE MaNguoiDung = ?
            `;
            
            db.query(updateAddressSql, [fullname, phone, address, maNguoiDung], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                
                res.json({ success: true, message: "Cập nhật địa chỉ thành công" });
            });
        }
    });
});

// [PUT] Cập nhật địa chỉ
router.put("/addresses/:addressId", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { addressId } = req.params;
    const { fullname, phone, address } = req.body;
    
    const updateSql = `
        UPDATE NGUOIDUNG 
        SET TenNguoiDung = ?, SoDienThoai = ?, DiaChi = ?
        WHERE MaNguoiDung = ?
    `;
    
    db.query(updateSql, [fullname, phone, address, addressId], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        res.json({ success: true, message: "Cập nhật địa chỉ thành công" });
    });
});

// [DELETE] Xóa địa chỉ
router.delete("/addresses/:addressId", authenticateToken, (req, res) => {
    const { addressId } = req.params;
    
    const deleteSql = "DELETE FROM NGUOIDUNG WHERE MaNguoiDung = ?";
    
    db.query(deleteSql, [addressId], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        res.json({ success: true, message: "Xóa địa chỉ thành công" });
    });
});

// ==================== API YÊU THÍCH ====================

// [GET] Lấy danh sách sản phẩm yêu thích
router.get("/wishlist", authenticateToken, (req, res) => {
    // Giả sử có bảng YEU_THICH - bạn có thể tạo bảng này sau
    res.json({
        success: true,
        data: [],
        message: "Tính năng đang phát triển"
    });
});

// [POST] Thêm vào yêu thích
router.post("/wishlist", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Tính năng đang phát triển"
    });
});

// [DELETE] Xóa khỏi yêu thích
router.delete("/wishlist/:productId", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Tính năng đang phát triển"
    });
});

// ==================== API HỦY ĐƠN HÀNG ====================

// [POST] Hủy đơn hàng
router.post("/orders/:orderId/cancel", authenticateToken, (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { orderId } = req.params;
    const { reason } = req.body;
    
    // Kiểm tra đơn hàng có tồn tại và thuộc về user không
    const checkSql = "SELECT TrangThai FROM DONHANG WHERE MaDonHang = ? AND MaTaiKhoan = ?";
    
    db.query(checkSql, [orderId, maTaiKhoan], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        const currentStatus = results[0].TrangThai;
        
        if (currentStatus === "Đã giao") {
            return res.status(400).json({ success: false, message: "Không thể hủy đơn hàng đã giao" });
        }
        
        if (currentStatus === "Đã hủy") {
            return res.status(400).json({ success: false, message: "Đơn hàng đã được hủy trước đó" });
        }
        
        // Cập nhật trạng thái đơn hàng
        const updateSql = "UPDATE DONHANG SET TrangThai = 'Đã hủy' WHERE MaDonHang = ?";
        
        db.query(updateSql, [orderId], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            
            // Có thể lưu lý do hủy vào bảng riêng ở đây
            
            res.json({ success: true, message: "Hủy đơn hàng thành công" });
        });
    });
});

module.exports = router;