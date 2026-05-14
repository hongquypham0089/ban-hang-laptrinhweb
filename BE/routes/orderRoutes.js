const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// Middleware xác thực người dùng
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để thanh toán" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Phiên đăng nhập hết hạn" });
    }
};

// Middleware xác thực admin
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Vui lòng đăng nhập" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        if (decoded.role !== 1) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập" });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token không hợp lệ" });
    }
};

// ==================== API USER (Cho khách hàng) ====================

// --- API THANH TOÁN (CHECKOUT) ---
router.post("/checkout", verifyToken, async (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { diaChi, soDienThoai, ghiChu, phuongThucThanhToan, maGiamGia, tongTien, phiVanChuyen, giamGia } = req.body;

    if (!diaChi || !soDienThoai) {
        return res.status(400).json({ 
            success: false, 
            message: "Vui lòng nhập đầy đủ địa chỉ và số điện thoại giao hàng" 
        });
    }

    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        const [cartItems] = await connection.query(`
            SELECT 
                ct.MaSanPham, 
                ct.SoLuong, 
                sp.Gia, 
                sp.SoLuong as Kho, 
                sp.TenSanPham,
                sp.HinhAnh
            FROM CHITIET_GIOHANG ct
            JOIN GIOHANG gh ON ct.MaGioHang = gh.MaGioHang
            JOIN SANPHAM sp ON ct.MaSanPham = sp.MaSanPham
            WHERE gh.MaTaiKhoan = ?
        `, [maTaiKhoan]);

        if (cartItems.length === 0) {
            throw new Error("Giỏ hàng của bạn đang trống");
        }

        let tongTienHang = 0;
        for (const item of cartItems) {
            if (item.SoLuong > item.Kho) {
                throw new Error(`Sản phẩm "${item.TenSanPham}" không đủ hàng trong kho (Còn: ${item.Kho})`);
            }
            tongTienHang += item.Gia * item.SoLuong;
        }

        const finalTotal = tongTien || tongTienHang;
        const shippingFee = phiVanChuyen || 30000;
        const discountAmount = giamGia || 0;
        
        const [orderResult] = await connection.query(`
            INSERT INTO DONHANG (
                MaTaiKhoan, NgayDat, TongTien, TrangThai, 
                DiaChiGiaoHang, SoDienThoai, GhiChu, 
                PhuongThucThanhToan, MaGiamGia, PhiVanChuyen, GiamGia
            ) VALUES (?, NOW(), ?, 'Chờ xác nhận', ?, ?, ?, ?, ?, ?, ?)
        `, [maTaiKhoan, finalTotal, diaChi, soDienThoai, ghiChu || null, 
            phuongThucThanhToan || 'COD', maGiamGia || null, shippingFee, discountAmount]);

        const maDonHang = orderResult.insertId;

        for (const item of cartItems) {
            await connection.query(`
                INSERT INTO CHITIET_DONHANG (MaDonHang, MaSanPham, SoLuong, Gia)
                VALUES (?, ?, ?, ?)
            `, [maDonHang, item.MaSanPham, item.SoLuong, item.Gia]);

            await connection.query(`
                UPDATE SANPHAM SET SoLuong = SoLuong - ? WHERE MaSanPham = ?
            `, [item.SoLuong, item.MaSanPham]);
        }

        const [userCart] = await connection.query(
            "SELECT MaGioHang FROM GIOHANG WHERE MaTaiKhoan = ?", [maTaiKhoan]
        );
        
        if (userCart.length > 0) {
            await connection.query(
                "DELETE FROM CHITIET_GIOHANG WHERE MaGioHang = ?", [userCart[0].MaGioHang]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: "Đặt hàng thành công! Đơn hàng đã được tạo.",
            orderId: maDonHang
        });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi thanh toán:", error.message);
        res.status(500).json({ success: false, message: error.message || "Lỗi hệ thống khi thanh toán" });
    } finally {
        connection.release();
    }
});

// --- API LẤY DANH SÁCH ĐƠN HÀNG CỦA NGƯỜI DÙNG ---
router.get("/my-orders", verifyToken, async (req, res) => {
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT 
                dh.MaDonHang,
                dh.NgayDat,
                dh.TongTien,
                dh.TrangThai,
                dh.DiaChiGiaoHang,
                dh.SoDienThoai,
                dh.NgayGiao,
                dh.PhuongThucThanhToan,
                COUNT(ct.MaSanPham) as SoLuongSanPham
            FROM DONHANG dh
            LEFT JOIN CHITIET_DONHANG ct ON dh.MaDonHang = ct.MaDonHang
            WHERE dh.MaTaiKhoan = ?
        `;
        
        const params = [maTaiKhoan];
        
        if (status && status !== 'all') {
            query += ` AND dh.TrangThai = ?`;
            params.push(status);
        }
        
        query += ` GROUP BY dh.MaDonHang ORDER BY dh.NgayDat DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);
        
        const [orders] = await db.promise().query(query, params);
        
        let countQuery = `SELECT COUNT(*) as total FROM DONHANG WHERE MaTaiKhoan = ?`;
        const countParams = [maTaiKhoan];
        
        if (status && status !== 'all') {
            countQuery += ` AND TrangThai = ?`;
            countParams.push(status);
        }
        
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const total = totalResult[0].total;
        
        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// --- API LẤY CHI TIẾT ĐƠN HÀNG ---
router.get("/order/:id", verifyToken, async (req, res) => {
    const maDonHang = req.params.id;
    const maTaiKhoan = req.user.MaTaiKhoan;

    try {
        const [orderInfo] = await db.promise().query(`
            SELECT * FROM DONHANG 
            WHERE MaDonHang = ? AND MaTaiKhoan = ?
        `, [maDonHang, maTaiKhoan]);
        
        if (orderInfo.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        const [orderItems] = await db.promise().query(`
            SELECT ct.MaSanPham, ct.SoLuong, ct.Gia, sp.TenSanPham, sp.HinhAnh
            FROM CHITIET_DONHANG ct
            JOIN SANPHAM sp ON ct.MaSanPham = sp.MaSanPham
            WHERE ct.MaDonHang = ?
        `, [maDonHang]);
        
        res.json({
            success: true,
            data: { order: orderInfo[0], items: orderItems }
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// --- API HỦY ĐƠN HÀNG ---
router.post("/cancel/:id", verifyToken, async (req, res) => {
    const maDonHang = req.params.id;
    const maTaiKhoan = req.user.MaTaiKhoan;
    const { lyDo } = req.body;

    try {
        const [order] = await db.promise().query(`
            SELECT TrangThai FROM DONHANG 
            WHERE MaDonHang = ? AND MaTaiKhoan = ?
        `, [maDonHang, maTaiKhoan]);
        
        if (order.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        if (order[0].TrangThai !== 'Chờ xác nhận') {
            return res.status(400).json({ 
                success: false, 
                message: "Chỉ có thể hủy đơn hàng đang ở trạng thái 'Chờ xác nhận'" 
            });
        }
        
        await db.promise().query(`
            UPDATE DONHANG 
            SET TrangThai = 'Đã hủy', GhiChu = CONCAT(IFNULL(GhiChu, ''), ' | Hủy đơn: ', ?)
            WHERE MaDonHang = ?
        `, [lyDo || 'Khách hàng yêu cầu hủy', maDonHang]);
        
        res.json({ success: true, message: "Đã hủy đơn hàng thành công" });
    } catch (error) {
        console.error("Lỗi hủy đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// ==================== API ADMIN ====================

// --- API ADMIN: LẤY DANH SÁCH TẤT CẢ ĐƠN HÀNG ---
router.get("/admin", verifyAdmin, async (req, res) => {
    const { page = 1, limit = 10, status, search, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT 
                dh.MaDonHang,
                dh.NgayDat,
                dh.TongTien,
                dh.TrangThai,
                dh.DiaChiGiaoHang,
                dh.SoDienThoai,
                dh.PhuongThucThanhToan,
                dh.NgayGiao,
                COUNT(ct.MaSanPham) as SoLuongSanPham,
                nd.TenNguoiDung as TenKhachHang
            FROM DONHANG dh
            LEFT JOIN CHITIET_DONHANG ct ON dh.MaDonHang = ct.MaDonHang
            LEFT JOIN TAIKHOAN tk ON dh.MaTaiKhoan = tk.MaTaiKhoan
            LEFT JOIN NGUOIDUNG nd ON tk.MaNguoiDung = nd.MaNguoiDung
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status && status !== 'all') {
            query += ` AND dh.TrangThai = ?`;
            params.push(status);
        }
        
        if (search) {
            query += ` AND (dh.MaDonHang LIKE ? OR nd.TenNguoiDung LIKE ? OR dh.SoDienThoai LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (fromDate) {
            query += ` AND DATE(dh.NgayDat) >= ?`;
            params.push(fromDate);
        }
        
        if (toDate) {
            query += ` AND DATE(dh.NgayDat) <= ?`;
            params.push(toDate);
        }
        
        query += ` GROUP BY dh.MaDonHang ORDER BY dh.NgayDat DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);
        
        const [orders] = await db.promise().query(query, params);
        
        // Đếm tổng số
        let countQuery = `SELECT COUNT(DISTINCT dh.MaDonHang) as total FROM DONHANG dh WHERE 1=1`;
        const countParams = [];
        
        if (status && status !== 'all') {
            countQuery += ` AND dh.TrangThai = ?`;
            countParams.push(status);
        }
        if (fromDate) {
            countQuery += ` AND DATE(dh.NgayDat) >= ?`;
            countParams.push(fromDate);
        }
        if (toDate) {
            countQuery += ` AND DATE(dh.NgayDat) <= ?`;
            countParams.push(toDate);
        }
        
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const total = totalResult[0].total;
        
        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// --- API ADMIN: THỐNG KÊ ĐƠN HÀNG ---
router.get("/admin/stats", verifyAdmin, async (req, res) => {
    try {
        const [stats] = await db.promise().query(`
            SELECT 
                COUNT(*) as all_orders,
                SUM(CASE WHEN TrangThai = 'Chờ xác nhận' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN TrangThai = 'Đang xử lý' THEN 1 ELSE 0 END) as processing,
                SUM(CASE WHEN TrangThai = 'Đang giao' THEN 1 ELSE 0 END) as shipping,
                SUM(CASE WHEN TrangThai = 'Hoàn thành' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN TrangThai = 'Đã hủy' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN TrangThai = 'Hoàn tiền' THEN 1 ELSE 0 END) as refunded
            FROM DONHANG
        `);
        
        res.json({ success: true, data: stats[0] });
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// =====================================================================
// ĐƯA API EXPORT LÊN TRÊN API /:id
// =====================================================================

// --- API ADMIN: XUẤT EXCEL ĐƠN HÀNG ---
router.get("/admin/export", verifyAdmin, async (req, res) => {
    const { status, fromDate, toDate, search } = req.query;

    try {
        let query = `
            SELECT 
                dh.MaDonHang as 'Mã đơn hàng',
                nd.TenNguoiDung as 'Khách hàng',
                dh.SoDienThoai as 'Số điện thoại',
                dh.DiaChiGiaoHang as 'Địa chỉ giao hàng',
                DATE_FORMAT(dh.NgayDat, '%d/%m/%Y %H:%i') as 'Ngày đặt hàng',
                CASE 
                    WHEN dh.NgayGiao IS NOT NULL THEN DATE_FORMAT(dh.NgayGiao, '%d/%m/%Y')
                    ELSE 'Chưa giao'
                END as 'Ngày giao hàng',
                dh.TongTien as 'Tổng tiền hàng',
                dh.PhiVanChuyen as 'Phí vận chuyển',
                dh.GiamGia as 'Giảm giá',
                (dh.TongTien + COALESCE(dh.PhiVanChuyen, 0) - COALESCE(dh.GiamGia, 0)) as 'Thành tiền',
                dh.PhuongThucThanhToan as 'Phương thức thanh toán',
                dh.TrangThai as 'Trạng thái đơn hàng',
                COALESCE(dh.GhiChu, '') as 'Ghi chú'
            FROM DONHANG dh
            LEFT JOIN TAIKHOAN tk ON dh.MaTaiKhoan = tk.MaTaiKhoan
            LEFT JOIN NGUOIDUNG nd ON tk.MaNguoiDung = nd.MaNguoiDung
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status && status !== 'all') {
            query += ` AND dh.TrangThai = ?`;
            params.push(status);
        }
        
        if (search) {
            query += ` AND (dh.MaDonHang LIKE ? OR nd.TenNguoiDung LIKE ? OR dh.SoDienThoai LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        
        if (fromDate) {
            query += ` AND DATE(dh.NgayDat) >= ?`;
            params.push(fromDate);
        }
        
        if (toDate) {
            query += ` AND DATE(dh.NgayDat) <= ?`;
            params.push(toDate);
        }
        
        query += ` ORDER BY dh.NgayDat DESC`;
        
        const [orders] = await db.promise().query(query, params);
        
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: "Không có dữ liệu để xuất" });
        }
        
        // Tạo nội dung CSV
        const headers = Object.keys(orders[0]);
        let csvRows = [];
        
        // Thêm header
        csvRows.push(headers.join(','));
        
        // Thêm dữ liệu
        for (const order of orders) {
            const row = headers.map(header => {
                let value = order[header] !== null && order[header] !== undefined ? order[header] : '';
                // Định dạng số tiền
                if (header === 'Tổng tiền hàng' || header === 'Phí vận chuyển' || 
                    header === 'Giảm giá' || header === 'Thành tiền') {
                    value = formatNumberToCurrency(value);
                }
                // Escape dấu phẩy và xuống dòng
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',');
            csvRows.push(row);
        }
        
        const csvContent = csvRows.join('\n');
        
        // Thêm BOM cho UTF-8 để hỗ trợ tiếng Việt
        const bom = '\uFEFF';
        const buffer = Buffer.from(bom + csvContent, 'utf8');
        
        // Set headers cho file download
        const fileName = `don_hang_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.send(buffer);
        
    } catch (error) {
        console.error("Lỗi xuất Excel:", error);
        res.status(500).json({ success: false, message: "Lỗi xuất file: " + error.message });
    }
});

// Helper function để định dạng số tiền
function formatNumberToCurrency(value) {
    if (!value && value !== 0) return '0';
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('vi-VN') + '₫';
}

// =====================================================================
// API CÓ THAM SỐ ĐỘNG (/:id) LUÔN PHẢI NẰM CUỐI CÙNG
// =====================================================================

// --- API ADMIN: LẤY CHI TIẾT ĐƠN HÀNG ---
router.get("/admin/:id", verifyAdmin, async (req, res) => {
    const maDonHang = req.params.id;

    try {
        const [orderInfo] = await db.promise().query(`
            SELECT 
                dh.*,
                tk.TenTaiKhoan as Email,
                nd.TenNguoiDung as TenKhachHang
            FROM DONHANG dh
            LEFT JOIN TAIKHOAN tk ON dh.MaTaiKhoan = tk.MaTaiKhoan
            LEFT JOIN NGUOIDUNG nd ON tk.MaNguoiDung = nd.MaNguoiDung
            WHERE dh.MaDonHang = ?
        `, [maDonHang]);
        
        if (orderInfo.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        const [orderItems] = await db.promise().query(`
            SELECT 
                ct.MaSanPham,
                ct.SoLuong,
                ct.Gia,
                sp.TenSanPham,
                sp.HinhAnh
            FROM CHITIET_DONHANG ct
            JOIN SANPHAM sp ON ct.MaSanPham = sp.MaSanPham
            WHERE ct.MaDonHang = ?
        `, [maDonHang]);
        
        res.json({
            success: true,
            data: {
                order: orderInfo[0],
                items: orderItems
            }
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// --- API ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (XÁC NHẬN ĐƠN HÀNG) ---
router.put("/admin/:id/status", verifyAdmin, async (req, res) => {
    const maDonHang = req.params.id;
    const { status } = req.body;

    try {
        // Nếu status là "Đang giao" (shipping), cập nhật NgayGiao
        if (status === 'Đang giao' || status === 'shipping') {
            await db.promise().query(`
                UPDATE DONHANG 
                SET TrangThai = ?, NgayGiao = NOW() 
                WHERE MaDonHang = ?
            `, [status, maDonHang]);
        } else {
            await db.promise().query(`
                UPDATE DONHANG SET TrangThai = ? WHERE MaDonHang = ?
            `, [status, maDonHang]);
        }
        
        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

module.exports = router;