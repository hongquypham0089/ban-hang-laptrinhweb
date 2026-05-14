const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Đường dẫn tới file kết nối database
const jwt = require('jsonwebtoken'); // Cần có để middleware check token

// ==================== MIDDLEWARE KIỂM TRA ADMIN ====================
// Middleware này sử dụng jwt để lấy thông tin từ cookie, bảo mật tuyệt đối các route Admin
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        // Kiểm tra xem role có phải là 1 (Admin) không
        if (decoded.role !== 1 && decoded.MaVaiTro !== 1) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
    }
};

// ==================== API THỐNG KÊ ====================

/**
 * @route GET /api/admin/users/stats
 * @desc Lấy số liệu thống kê người dùng
 * @access Admin
 */
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        // Tối ưu: Chỉ dùng 1 câu truy vấn duy nhất thay vì 4 câu rời rạc
        const [stats] = await db.promise().query(`
            SELECT 
                SUM(CASE WHEN MaVaiTro = 2 THEN 1 ELSE 0 END) as totalUsers,
                SUM(CASE WHEN MaVaiTro = 2 AND TinhTrang = 'Active' THEN 1 ELSE 0 END) as activeUsers,
                SUM(CASE WHEN MaVaiTro = 2 AND TinhTrang = 'Pending' THEN 1 ELSE 0 END) as pendingUsers,
                SUM(CASE WHEN MaVaiTro = 1 THEN 1 ELSE 0 END) as totalAdmins
            FROM taikhoan
        `);

        res.json({
            success: true,
            data: {
                totalUsers: Number(stats[0].totalUsers) || 0,
                activeUsers: Number(stats[0].activeUsers) || 0,
                pendingUsers: Number(stats[0].pendingUsers) || 0,
                totalAdmins: Number(stats[0].totalAdmins) || 0
            }
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== API QUẢN LÝ ADMIN ====================

/**
 * @route GET /api/admin/admins
 * @desc Lấy danh sách quản trị viên (có phân trang)
 * @access Admin
 */
router.get('/admins', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `
            SELECT 
                tk.MaTaiKhoan as id,
                tk.TenTaiKhoan as username,
                tk.Email as email,
                tk.TinhTrang as status,
                tk.NgayTao as createdAt,
                nd.TenNguoiDung as name,
                nd.SoDienThoai as phone,
                vt.TenVaiTro as role
            FROM taikhoan tk
            LEFT JOIN nguoidung nd ON tk.MaNguoiDung = nd.MaNguoiDung
            LEFT JOIN vaitro vt ON tk.MaVaiTro = vt.MaVaiTro
            WHERE tk.MaVaiTro = 1
        `;

        // FIX LỖI: Thêm JOIN vào countQuery để không bị lỗi khi search bằng tên
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM taikhoan tk
            LEFT JOIN nguoidung nd ON tk.MaNguoiDung = nd.MaNguoiDung
            WHERE tk.MaVaiTro = 1
        `;
        let queryParams = [];
        let countParams = [];

        if (search) {
            const searchCond = ` AND (tk.TenTaiKhoan LIKE ? OR tk.Email LIKE ? OR nd.TenNguoiDung LIKE ?)`;
            query += searchCond;
            countQuery += searchCond;
            
            const searchParam = `%${search}%`;
            queryParams.push(searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam);
        }

        query += ` ORDER BY tk.NgayTao DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [admins] = await db.promise().query(query, queryParams);
        const [totalResult] = await db.promise().query(countQuery, countParams);
        
        // Format dữ liệu
        const formattedAdmins = admins.map(admin => ({
            id: admin.id,
            name: admin.name || admin.username,
            email: admin.email,
            role: admin.role === 'Admin' ? 'super' : 'admin',
            permissions: admin.role === 'Admin' ? ['all'] : ['products', 'orders', 'users'],
            status: admin.status === 'Active' ? 'active' : 'inactive',
            lastLogin: admin.createdAt ? formatDate(admin.createdAt) : 'Chưa đăng nhập'
        }));

        res.json({
            success: true,
            data: {
                admins: formattedAdmins,
                pagination: {
                    currentPage: page,
                    totalItems: totalResult[0].total,
                    totalPages: Math.ceil(totalResult[0].total / limit),
                    limit: limit
                }
            }
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách admin:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * @route POST /api/admin/admins
 * @desc Thêm quản trị viên mới
 * @access Admin
 */
router.post('/admins', verifyAdmin, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        const { name, email, password, role, permissions, status } = req.body;

        // Kiểm tra email đã tồn tại
        const [existing] = await connection.query(
            'SELECT MaTaiKhoan FROM taikhoan WHERE Email = ?',
            [email]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
        }

        // Tạo bản ghi nguoidung
        const [userResult] = await connection.query(
            'INSERT INTO nguoidung (TenNguoiDung) VALUES (?)',
            [name]
        );
        const maNguoiDung = userResult.insertId;

        // Tạo bản ghi taikhoan
        const statusValue = status === 'active' ? 'Active' : 'Inactive';
        
        const [accountResult] = await connection.query(
            `INSERT INTO taikhoan 
            (TenTaiKhoan, MatKhau, Email, MaNguoiDung, MaVaiTro, TinhTrang) 
            VALUES (?, ?, ?, ?, 1, ?)`,
            [email, password, email, maNguoiDung, statusValue]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Thêm quản trị viên thành công',
            data: { id: accountResult.insertId }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi thêm admin:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        connection.release();
    }
});

/**
 * @route PUT /api/admin/admins/:id
 * @desc Cập nhật thông tin quản trị viên
 * @access Admin
 */
router.put('/admins/:id', verifyAdmin, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        const adminId = req.params.id;
        const { name, email, role, status, permissions } = req.body;

        // Lấy thông tin admin hiện tại
        const [admin] = await connection.query(
            `SELECT tk.MaTaiKhoan, tk.MaNguoiDung, tk.Email 
             FROM taikhoan tk 
             WHERE tk.MaTaiKhoan = ? AND tk.MaVaiTro = 1`,
            [adminId]
        );

        if (admin.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy admin' });
        }

        // Cập nhật email nếu thay đổi
        if (email && email !== admin[0].Email) {
            const [existing] = await connection.query(
                'SELECT MaTaiKhoan FROM taikhoan WHERE Email = ? AND MaTaiKhoan != ?',
                [email, adminId]
            );
            if (existing.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
            }
            
            await connection.query(
                'UPDATE taikhoan SET Email = ?, TenTaiKhoan = ? WHERE MaTaiKhoan = ?',
                [email, email, adminId]
            );
        }

        // Cập nhật tên trong nguoidung
        if (name && admin[0].MaNguoiDung) {
            await connection.query(
                'UPDATE nguoidung SET TenNguoiDung = ? WHERE MaNguoiDung = ?',
                [name, admin[0].MaNguoiDung]
            );
        }

        // Cập nhật trạng thái
        if (status) {
            const statusValue = status === 'active' ? 'Active' : 'Inactive';
            await connection.query(
                'UPDATE taikhoan SET TinhTrang = ? WHERE MaTaiKhoan = ?',
                [statusValue, adminId]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Cập nhật thông tin admin thành công'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi cập nhật admin:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        connection.release();
    }
});

/**
 * @route DELETE /api/admin/admins/:id
 * @desc Xóa quản trị viên
 * @access Admin
 */
router.delete('/admins/:id', verifyAdmin, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        const adminId = req.params.id;

        // Không cho xóa chính mình
        if (req.user && (req.user.MaTaiKhoan == adminId || req.user.id == adminId)) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản đang đăng nhập' });
        }

        // Lấy MaNguoiDung
        const [admin] = await connection.query(
            'SELECT MaNguoiDung FROM taikhoan WHERE MaTaiKhoan = ? AND MaVaiTro = 1',
            [adminId]
        );

        if (admin.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy admin' });
        }

        // Xóa tài khoản
        await connection.query('DELETE FROM taikhoan WHERE MaTaiKhoan = ?', [adminId]);

        // Xóa người dùng liên quan
        if (admin[0].MaNguoiDung) {
            await connection.query('DELETE FROM nguoidung WHERE MaNguoiDung = ?', [admin[0].MaNguoiDung]);
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Xóa quản trị viên thành công'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi xóa admin:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        connection.release();
    }
});

/**
 * @route PATCH /api/admin/admins/:id/toggle-status
 * @desc Khóa/Mở khóa quản trị viên
 * @access Admin
 */
router.patch('/admins/:id/toggle-status', verifyAdmin, async (req, res) => {
    try {
        const adminId = req.params.id;

        const [admin] = await db.promise().query(
            'SELECT TinhTrang FROM taikhoan WHERE MaTaiKhoan = ? AND MaVaiTro = 1',
            [adminId]
        );

        if (admin.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy admin' });
        }

        const newStatus = admin[0].TinhTrang === 'Active' ? 'Inactive' : 'Active';
        
        await db.promise().query(
            'UPDATE taikhoan SET TinhTrang = ? WHERE MaTaiKhoan = ?',
            [newStatus, adminId]
        );

        res.json({
            success: true,
            message: newStatus === 'Active' ? 'Đã kích hoạt admin' : 'Đã vô hiệu hóa admin',
            data: { status: newStatus === 'Active' ? 'active' : 'inactive' }
        });
    } catch (error) {
        console.error('Lỗi chuyển trạng thái admin:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== API QUẢN LÝ NGƯỜI DÙNG ====================

/**
 * @route GET /api/admin/users
 * @desc Lấy danh sách người dùng (có phân trang)
 * @access Admin
 */
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || '';

        let query = `
            SELECT 
                tk.MaTaiKhoan as id,
                tk.TenTaiKhoan as username,
                tk.Email as email,
                tk.TinhTrang as status,
                tk.NgayTao as createdAt,
                nd.TenNguoiDung as name,
                nd.SoDienThoai as phone,
                nd.DiaChi as address,
                nd.NgaySinh as birthday,
                vt.TenVaiTro as role,
                COALESCE((
                    SELECT COUNT(*) FROM donhang dh 
                    WHERE dh.MaTaiKhoan = tk.MaTaiKhoan
                ), 0) as totalOrders,
                COALESCE((
                    SELECT SUM(TongTien) FROM donhang dh 
                    WHERE dh.MaTaiKhoan = tk.MaTaiKhoan AND dh.TrangThai = 'Hoàn thành'
                ), 0) as totalSpent
            FROM taikhoan tk
            LEFT JOIN nguoidung nd ON tk.MaNguoiDung = nd.MaNguoiDung
            LEFT JOIN vaitro vt ON tk.MaVaiTro = vt.MaVaiTro
            WHERE tk.MaVaiTro = 2
        `;

        // FIX LỖI: Bổ sung JOIN cho countQuery giống hệt query
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM taikhoan tk
            LEFT JOIN nguoidung nd ON tk.MaNguoiDung = nd.MaNguoiDung
            WHERE tk.MaVaiTro = 2
        `;
        let queryParams = [];
        let countParams = [];

        if (search) {
            const searchCond = ` AND (tk.TenTaiKhoan LIKE ? OR tk.Email LIKE ? OR nd.TenNguoiDung LIKE ? OR nd.SoDienThoai LIKE ?)`;
            query += searchCond;
            countQuery += searchCond;

            const searchParam = `%${search}%`;
            queryParams.push(searchParam, searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam, searchParam);
        }

        if (status) {
            const statusValue = status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive';
            query += ` AND tk.TinhTrang = ?`;
            countQuery += ` AND tk.TinhTrang = ?`;
            queryParams.push(statusValue);
            countParams.push(statusValue);
        }

        query += ` ORDER BY tk.NgayTao DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [users] = await db.promise().query(query, queryParams);
        const [totalResult] = await db.promise().query(countQuery, countParams);

        // Xác định rank dựa trên tổng chi tiêu
        const getRank = (totalSpent) => {
            if (totalSpent >= 50000000) return 'platinum';
            if (totalSpent >= 20000000) return 'gold';
            if (totalSpent >= 10000000) return 'silver';
            return 'bronze';
        };

        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name || user.username,
            email: user.email,
            phone: user.phone || 'Chưa cập nhật',
            joinDate: formatDate(user.createdAt),
            orders: parseInt(user.totalOrders) || 0,
            spent: parseFloat(user.totalSpent) || 0,
            status: user.status === 'Active' ? 'active' : user.status === 'Pending' ? 'pending' : 'inactive',
            rank: getRank(parseFloat(user.totalSpent) || 0),
            address: user.address,
            birthday: user.birthday
        }));

        res.json({
            success: true,
            data: {
                users: formattedUsers,
                pagination: {
                    currentPage: page,
                    totalItems: totalResult[0].total,
                    totalPages: Math.ceil(totalResult[0].total / limit),
                    limit: limit
                }
            }
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách người dùng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * @route POST /api/admin/users
 * @desc Thêm người dùng mới
 * @access Admin
 */
router.post('/users', verifyAdmin, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        const { name, email, phone, birthday, password, address, rank, status } = req.body;

        // Kiểm tra email đã tồn tại
        const [existing] = await connection.query(
            'SELECT MaTaiKhoan FROM taikhoan WHERE Email = ?',
            [email]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
        }

        // Tạo bản ghi nguoidung
        const [userResult] = await connection.query(
            `INSERT INTO nguoidung 
            (TenNguoiDung, NgaySinh, SoDienThoai, DiaChi) 
            VALUES (?, ?, ?, ?)`,
            [name, birthday || null, phone, address || null]
        );
        const maNguoiDung = userResult.insertId;

        // Tạo bản ghi taikhoan
        const statusValue = status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive';
        
        const [accountResult] = await connection.query(
            `INSERT INTO taikhoan 
            (TenTaiKhoan, MatKhau, Email, MaNguoiDung, MaVaiTro, TinhTrang) 
            VALUES (?, ?, ?, ?, 2, ?)`,
            [email, password, email, maNguoiDung, statusValue]
        );

        // Tạo giỏ hàng cho người dùng mới
        await connection.query(
            'INSERT INTO giohang (MaTaiKhoan) VALUES (?)',
            [accountResult.insertId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Thêm người dùng thành công',
            data: { id: accountResult.insertId }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi thêm người dùng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        connection.release();
    }
});

/**
 * @route PUT /api/admin/users/:id
 * @desc Cập nhật thông tin người dùng
 * @access Admin
 */
router.put('/users/:id', verifyAdmin, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.params.id;
        const { name, email, phone, birthday, address, status, rank } = req.body;

        // Lấy thông tin user hiện tại
        const [user] = await connection.query(
            `SELECT tk.MaTaiKhoan, tk.MaNguoiDung, tk.Email 
             FROM taikhoan tk 
             WHERE tk.MaTaiKhoan = ? AND tk.MaVaiTro = 2`,
            [userId]
        );

        if (user.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Cập nhật email nếu thay đổi
        if (email && email !== user[0].Email) {
            const [existing] = await connection.query(
                'SELECT MaTaiKhoan FROM taikhoan WHERE Email = ? AND MaTaiKhoan != ?',
                [email, userId]
            );
            if (existing.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
            }
            
            await connection.query(
                'UPDATE taikhoan SET Email = ?, TenTaiKhoan = ? WHERE MaTaiKhoan = ?',
                [email, email, userId]
            );
        }

        // Cập nhật thông tin trong nguoidung
        if (user[0].MaNguoiDung) {
            let updateQuery = 'UPDATE nguoidung SET ';
            const updateValues = [];
            
            if (name) {
                updateQuery += 'TenNguoiDung = ?, ';
                updateValues.push(name);
            }
            if (phone !== undefined) {
                updateQuery += 'SoDienThoai = ?, ';
                updateValues.push(phone || null);
            }
            if (birthday !== undefined) {
                updateQuery += 'NgaySinh = ?, ';
                updateValues.push(birthday || null);
            }
            if (address !== undefined) {
                updateQuery += 'DiaChi = ?, ';
                updateValues.push(address || null);
            }
            
            updateQuery = updateQuery.slice(0, -2);
            updateQuery += ' WHERE MaNguoiDung = ?';
            updateValues.push(user[0].MaNguoiDung);
            
            await connection.query(updateQuery, updateValues);
        }

        // Cập nhật trạng thái tài khoản
        if (status) {
            const statusValue = status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive';
            await connection.query(
                'UPDATE taikhoan SET TinhTrang = ? WHERE MaTaiKhoan = ?',
                [statusValue, userId]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Cập nhật thông tin người dùng thành công'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi cập nhật người dùng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        connection.release();
    }
});

/**
 * @route DELETE /api/admin/users/:id
 * @desc Xóa người dùng
 * @access Admin
 */
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.params.id;

        // Lấy MaNguoiDung và giỏ hàng
        const [user] = await connection.query(
            'SELECT MaNguoiDung FROM taikhoan WHERE MaTaiKhoan = ? AND MaVaiTro = 2',
            [userId]
        );

        if (user.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Xóa chi tiết giỏ hàng
        await connection.query(
            `DELETE ct FROM chitiet_giohang ct 
             INNER JOIN giohang gh ON ct.MaGioHang = gh.MaGioHang 
             WHERE gh.MaTaiKhoan = ?`,
            [userId]
        );

        // Xóa giỏ hàng
        await connection.query('DELETE FROM giohang WHERE MaTaiKhoan = ?', [userId]);

        // Xóa chi tiết đơn hàng
        await connection.query(
            `DELETE ct FROM chitiet_donhang ct 
             INNER JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang 
             WHERE dh.MaTaiKhoan = ?`,
            [userId]
        );

        // Xóa đơn hàng
        await connection.query('DELETE FROM donhang WHERE MaTaiKhoan = ?', [userId]);

        // Xóa tài khoản
        await connection.query('DELETE FROM taikhoan WHERE MaTaiKhoan = ?', [userId]);

        // Xóa người dùng
        if (user[0].MaNguoiDung) {
            await connection.query('DELETE FROM nguoidung WHERE MaNguoiDung = ?', [user[0].MaNguoiDung]);
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi xóa người dùng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        connection.release();
    }
});

/**
 * @route PATCH /api/admin/users/:id/toggle-status
 * @desc Khóa/Mở khóa người dùng
 * @access Admin
 */
router.patch('/users/:id/toggle-status', verifyAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        const [user] = await db.promise().query(
            'SELECT TinhTrang FROM taikhoan WHERE MaTaiKhoan = ? AND MaVaiTro = 2',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        let newStatus;
        switch (user[0].TinhTrang) {
            case 'Active':
                newStatus = 'Inactive';
                break;
            case 'Inactive':
                newStatus = 'Active';
                break;
            case 'Pending':
                newStatus = 'Active';
                break;
            default:
                newStatus = 'Inactive';
        }
        
        await db.promise().query(
            'UPDATE taikhoan SET TinhTrang = ? WHERE MaTaiKhoan = ?',
            [newStatus, userId]
        );

        let statusText = '';
        if (newStatus === 'Active') statusText = 'kích hoạt';
        else if (newStatus === 'Inactive') statusText = 'vô hiệu hóa';
        else statusText = 'chờ xác thực';

        res.json({
            success: true,
            message: `Đã ${statusText} người dùng`,
            data: { 
                status: newStatus === 'Active' ? 'active' : newStatus === 'Pending' ? 'pending' : 'inactive'
            }
        });
    } catch (error) {
        console.error('Lỗi chuyển trạng thái người dùng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * @route GET /api/admin/users/:id
 * @desc Lấy chi tiết người dùng
 * @access Admin
 */
router.get('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        const [user] = await db.promise().query(
            `SELECT 
                tk.MaTaiKhoan as id,
                tk.TenTaiKhoan as username,
                tk.Email as email,
                tk.TinhTrang as status,
                tk.NgayTao as createdAt,
                nd.TenNguoiDung as name,
                nd.SoDienThoai as phone,
                nd.DiaChi as address,
                nd.NgaySinh as birthday,
                nd.GioiTinh as gender,
                COALESCE((
                    SELECT COUNT(*) FROM donhang dh 
                    WHERE dh.MaTaiKhoan = tk.MaTaiKhoan
                ), 0) as totalOrders,
                COALESCE((
                    SELECT SUM(TongTien) FROM donhang dh 
                    WHERE dh.MaTaiKhoan = tk.MaTaiKhoan AND dh.TrangThai = 'Hoàn thành'
                ), 0) as totalSpent,
                COALESCE((
                    SELECT COUNT(*) FROM donhang dh 
                    WHERE dh.MaTaiKhoan = tk.MaTaiKhoan AND dh.TrangThai = 'Đang giao'
                ), 0) as pendingOrders
            FROM taikhoan tk
            LEFT JOIN nguoidung nd ON tk.MaNguoiDung = nd.MaNguoiDung
            WHERE tk.MaTaiKhoan = ? AND tk.MaVaiTro = 2`,
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const userData = user[0];
        
        const getRank = (totalSpent) => {
            if (totalSpent >= 50000000) return 'Platinum';
            if (totalSpent >= 20000000) return 'Gold';
            if (totalSpent >= 10000000) return 'Silver';
            return 'Bronze';
        };

        res.json({
            success: true,
            data: {
                id: userData.id,
                name: userData.name || userData.username,
                email: userData.email,
                phone: userData.phone || 'Chưa cập nhật',
                address: userData.address || 'Chưa cập nhật',
                birthday: userData.birthday,
                gender: userData.gender,
                joinDate: formatDate(userData.createdAt),
                status: userData.status === 'Active' ? 'active' : userData.status === 'Pending' ? 'pending' : 'inactive',
                rank: getRank(parseFloat(userData.totalSpent) || 0),
                stats: {
                    totalOrders: parseInt(userData.totalOrders) || 0,
                    totalSpent: parseFloat(userData.totalSpent) || 0,
                    pendingOrders: parseInt(userData.pendingOrders) || 0
                }
            }
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết người dùng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== HÀM HỖ TRỢ ====================

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

module.exports = router;