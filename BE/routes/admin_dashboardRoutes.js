const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// ==================== MIDDLEWARE KIỂM TRA ADMIN ====================
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        if (decoded.role !== 1 && decoded.MaVaiTro !== 1) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
    }
};

// ==================== API THỐNG KÊ TỔNG QUAN ====================

/**
 * @route GET /api/admin/dashboard/stats
 * @desc Lấy số liệu thống kê tổng quan
 * @access Admin
 */
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        // Tổng số đơn hàng
        const [totalOrdersResult] = await db.promise().query(`
            SELECT COUNT(*) as total FROM donhang
        `);
        
        // Tổng doanh thu (chỉ tính đơn hàng đã giao/hoàn thành)
        const [revenueResult] = await db.promise().query(`
            SELECT COALESCE(SUM(TongTien), 0) as total FROM donhang 
            WHERE TrangThai IN ('Đã giao', 'Hoàn thành')
        `);
        
        // Tổng số sản phẩm đã bán
        const [productsSoldResult] = await db.promise().query(`
            SELECT COALESCE(SUM(SoLuong), 0) as total FROM chitiet_donhang ct
            JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang
            WHERE dh.TrangThai IN ('Đã giao', 'Hoàn thành')
        `);
        
        // Số sản phẩm sắp hết hàng (tồn kho <= 10)
        const [lowStockResult] = await db.promise().query(`
            SELECT COUNT(*) as total FROM sanpham WHERE SoLuong <= 10
        `);
        
        // Số người dùng mới trong tháng này
        const [newUsersResult] = await db.promise().query(`
            SELECT COUNT(*) as total FROM taikhoan 
            WHERE MaVaiTro = 2 
            AND MONTH(NgayTao) = MONTH(CURRENT_DATE()) 
            AND YEAR(NgayTao) = YEAR(CURRENT_DATE())
        `);
        
        // Tính phần trăm thay đổi so với tháng trước
        const [lastMonthOrders] = await db.promise().query(`
            SELECT COUNT(*) as total FROM donhang 
            WHERE MONTH(NgayDat) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(NgayDat) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
        `);
        
        const [lastMonthRevenue] = await db.promise().query(`
            SELECT COALESCE(SUM(TongTien), 0) as total FROM donhang 
            WHERE TrangThai IN ('Đã giao', 'Hoàn thành')
            AND MONTH(NgayDat) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(NgayDat) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
        `);
        
        const [lastMonthProductsSold] = await db.promise().query(`
            SELECT COALESCE(SUM(ct.SoLuong), 0) as total FROM chitiet_donhang ct
            JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang
            WHERE dh.TrangThai IN ('Đã giao', 'Hoàn thành')
            AND MONTH(dh.NgayDat) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(dh.NgayDat) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
        `);
        
        const [lastMonthNewUsers] = await db.promise().query(`
            SELECT COUNT(*) as total FROM taikhoan 
            WHERE MaVaiTro = 2 
            AND MONTH(NgayTao) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND YEAR(NgayTao) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
        `);
        
        const currentOrders = totalOrdersResult[0].total;
        const currentRevenue = revenueResult[0].total;
        const currentProductsSold = productsSoldResult[0].total;
        const currentNewUsers = newUsersResult[0].total;
        
        const lastOrders = lastMonthOrders[0].total;
        const lastRevenue = lastMonthRevenue[0].total;
        const lastProductsSold = lastMonthProductsSold[0].total;
        const lastNewUsers = lastMonthNewUsers[0].total;
        
        // Tính phần trăm thay đổi
        const calcPercent = (current, last) => {
            if (last === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - last) / last) * 100);
        };
        
        res.json({
            success: true,
            data: {
                totalOrders: currentOrders,
                totalOrdersTrend: calcPercent(currentOrders, lastOrders),
                totalRevenue: currentRevenue,
                totalRevenueTrend: calcPercent(currentRevenue, lastRevenue),
                productsSold: currentProductsSold,
                productsSoldTrend: calcPercent(currentProductsSold, lastProductsSold),
                lowStock: lowStockResult[0].total,
                newUsers: currentNewUsers,
                newUsersTrend: calcPercent(currentNewUsers, lastNewUsers)
            }
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê dashboard:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== API DOANH THU THEO THÁNG ====================

/**
 * @route GET /api/admin/dashboard/revenue-by-month
 * @desc Lấy dữ liệu doanh thu theo tháng
 * @access Admin
 * @query period - 6, 12, or 'year' (default: 6)
 */
router.get('/revenue-by-month', verifyAdmin, async (req, res) => {
    try {
        const period = req.query.period || '6';
        let monthsToGet = 6;
        
        if (period === 'year') {
            monthsToGet = 12;
        } else {
            monthsToGet = parseInt(period);
        }
        
        let query = `
            SELECT 
                DATE_FORMAT(NgayDat, '%Y-%m') as month,
                DATE_FORMAT(NgayDat, '%M') as monthName,
                YEAR(NgayDat) as year,
                COALESCE(SUM(CASE WHEN TrangThai IN ('Đã giao', 'Hoàn thành') THEN TongTien ELSE 0 END), 0) as revenue
            FROM donhang
            WHERE NgayDat >= DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(NgayDat, '%Y-%m'), YEAR(NgayDat), DATE_FORMAT(NgayDat, '%M')
            ORDER BY month ASC
        `;
        
        const [revenueData] = await db.promise().query(query, [monthsToGet]);
        
        // Format dữ liệu cho chart
        const labels = [];
        const revenues = [];
        
        // Tạo mảng đủ số tháng
        const months = [];
        const currentDate = new Date();
        for (let i = monthsToGet - 1; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('vi', { month: 'long' });
            months.push({ key: monthKey, name: monthName, year: date.getFullYear() });
        }
        
        // Map dữ liệu vào các tháng
        const revenueMap = {};
        revenueData.forEach(item => {
            revenueMap[item.month] = item.revenue / 1000000; // Chuyển sang triệu đồng
        });
        
        months.forEach(month => {
            labels.push(`${month.name} ${month.year}`);
            revenues.push(revenueMap[month.key] || 0);
        });
        
        res.json({
            success: true,
            data: {
                labels: labels,
                revenues: revenues
            }
        });
    } catch (error) {
        console.error('Lỗi lấy doanh thu theo tháng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== API TOP SẢN PHẨM BÁN CHẠY ====================

/**
 * @route GET /api/admin/dashboard/top-products
 * @desc Lấy top sản phẩm bán chạy
 * @access Admin
 * @query limit - Số lượng sản phẩm (mặc định: 5)
 */
router.get('/top-products', verifyAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const [topProducts] = await db.promise().query(`
            SELECT 
                sp.MaSanPham as id,
                sp.TenSanPham as name,
                sp.HinhAnh as image,
                ls.TenLoai as category,
                COALESCE(SUM(ct.SoLuong), 0) as totalSold,
                sp.SoLuong as stock,
                sp.Gia as price
            FROM sanpham sp
            LEFT JOIN loaisanpham ls ON sp.MaLoai = ls.MaLoai
            LEFT JOIN chitiet_donhang ct ON sp.MaSanPham = ct.MaSanPham
            LEFT JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang AND dh.TrangThai IN ('Đã giao', 'Hoàn thành')
            GROUP BY sp.MaSanPham
            ORDER BY totalSold DESC
            LIMIT ?
        `, [limit]);
        
        // Tính tổng để lấy phần trăm
        const totalSold = topProducts.reduce((sum, p) => sum + p.totalSold, 0);
        
        const formattedProducts = topProducts.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category || 'Chưa phân loại',
            totalSold: product.totalSold,
            percentage: totalSold > 0 ? Math.round((product.totalSold / totalSold) * 100) : 0,
            stock: product.stock,
            price: product.price
        }));
        
        res.json({
            success: true,
            data: formattedProducts
        });
    } catch (error) {
        console.error('Lỗi lấy top sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== API SẢN PHẨM SẮP HẾT HÀNG ====================

/**
 * @route GET /api/admin/dashboard/low-stock-products
 * @desc Lấy danh sách sản phẩm sắp hết hàng
 * @access Admin
 * @query limit - Số lượng sản phẩm (mặc định: 10)
 */
router.get('/low-stock-products', verifyAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const [lowStockProducts] = await db.promise().query(`
            SELECT 
                sp.MaSanPham as id,
                sp.TenSanPham as name,
                sp.SoLuong as stock,
                ls.TenLoai as category,
                COALESCE((
                    SELECT SUM(ct.SoLuong) FROM chitiet_donhang ct
                    JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang
                    WHERE ct.MaSanPham = sp.MaSanPham AND dh.TrangThai IN ('Đã giao', 'Hoàn thành')
                ), 0) as totalSold,
                sp.Gia as price,
                CASE 
                    WHEN sp.SoLuong <= 3 THEN 'critical'
                    WHEN sp.SoLuong <= 10 THEN 'low'
                    ELSE 'normal'
                END as stockLevel
            FROM sanpham sp
            LEFT JOIN loaisanpham ls ON sp.MaLoai = ls.MaLoai
            WHERE sp.SoLuong <= 10
            ORDER BY sp.SoLuong ASC
            LIMIT ?
        `, [limit]);
        
        const formattedProducts = lowStockProducts.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category || 'Chưa phân loại',
            stock: product.stock,
            totalSold: product.totalSold,
            stockLevel: product.stockLevel,
            price: product.price
        }));
        
        res.json({
            success: true,
            data: formattedProducts
        });
    } catch (error) {
        console.error('Lỗi lấy sản phẩm sắp hết:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== API ĐƠN HÀNG GẦN ĐÂY ====================

/**
 * @route GET /api/admin/dashboard/recent-orders
 * @desc Lấy danh sách đơn hàng gần đây
 * @access Admin
 * @query limit - Số lượng đơn hàng (mặc định: 5)
 */
router.get('/recent-orders', verifyAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const [recentOrders] = await db.promise().query(`
            SELECT 
                dh.MaDonHang as id,
                dh.NgayDat as orderDate,
                dh.TongTien as total,
                dh.TrangThai as status,
                tk.TenTaiKhoan as customerEmail,
                nd.TenNguoiDung as customerName,
                (
                    SELECT GROUP_CONCAT(sp.TenSanPham SEPARATOR ', ')
                    FROM chitiet_donhang ct
                    JOIN sanpham sp ON ct.MaSanPham = sp.MaSanPham
                    WHERE ct.MaDonHang = dh.MaDonHang
                    LIMIT 2
                ) as products,
                (
                    SELECT COUNT(*) FROM chitiet_donhang 
                    WHERE MaDonHang = dh.MaDonHang
                ) as productCount
            FROM donhang dh
            LEFT JOIN taikhoan tk ON dh.MaTaiKhoan = tk.MaTaiKhoan
            LEFT JOIN nguoidung nd ON tk.MaNguoiDung = nd.MaNguoiDung
            ORDER BY dh.NgayDat DESC
            LIMIT ?
        `, [limit]);
        
        const formatStatus = (status) => {
            switch(status) {
                case 'Đã giao': return 'completed';
                case 'Hoàn thành': return 'completed';
                case 'Đang giao': return 'processing';
                case 'Chờ xác nhận': return 'pending';
                case 'Đã hủy': return 'cancelled';
                default: return 'pending';
            }
        };
        
        const getStatusText = (status) => {
            switch(status) {
                case 'Đã giao': return 'Hoàn thành';
                case 'Hoàn thành': return 'Hoàn thành';
                case 'Đang giao': return 'Đang xử lý';
                case 'Chờ xác nhận': return 'Chờ xác nhận';
                case 'Đã hủy': return 'Đã hủy';
                default: return status;
            }
        };
        
        const formattedOrders = recentOrders.map(order => ({
            id: order.id,
            orderCode: `#OD${String(order.id).padStart(5, '0')}`,
            customerName: order.customerName || order.customerEmail || 'Khách vãng lai',
            products: order.products || `+ ${order.productCount} sản phẩm`,
            total: order.total,
            status: formatStatus(order.status),
            statusText: getStatusText(order.status),
            orderDate: order.orderDate
        }));
        
        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Lỗi lấy đơn hàng gần đây:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==================== API DỮ LIỆU COMPLETE CHO DASHBOARD ====================

/**
 * @route GET /api/admin/dashboard/all
 * @desc Lấy toàn bộ dữ liệu cho dashboard (kết hợp nhiều API)
 * @access Admin
 */
router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const period = req.query.period || '6';
        
        // Chạy song song các queries
        const [
            statsResult,
            revenueResult,
            topProductsResult,
            lowStockResult,
            recentOrdersResult
        ] = await Promise.all([
            // Stats
            (async () => {
                const [totalOrders] = await db.promise().query(`SELECT COUNT(*) as total FROM donhang`);
                const [revenue] = await db.promise().query(`SELECT COALESCE(SUM(TongTien), 0) as total FROM donhang WHERE TrangThai IN ('Đã giao', 'Hoàn thành')`);
                const [productsSold] = await db.promise().query(`SELECT COALESCE(SUM(ct.SoLuong), 0) as total FROM chitiet_donhang ct JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang WHERE dh.TrangThai IN ('Đã giao', 'Hoàn thành')`);
                const [lowStock] = await db.promise().query(`SELECT COUNT(*) as total FROM sanpham WHERE SoLuong <= 10`);
                const [newUsers] = await db.promise().query(`SELECT COUNT(*) as total FROM taikhoan WHERE MaVaiTro = 2 AND MONTH(NgayTao) = MONTH(CURRENT_DATE()) AND YEAR(NgayTao) = YEAR(CURRENT_DATE())`);
                
                const [lastMonthOrders] = await db.promise().query(`SELECT COUNT(*) as total FROM donhang WHERE MONTH(NgayDat) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(NgayDat) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)`);
                const [lastMonthRevenue] = await db.promise().query(`SELECT COALESCE(SUM(TongTien), 0) as total FROM donhang WHERE TrangThai IN ('Đã giao', 'Hoàn thành') AND MONTH(NgayDat) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(NgayDat) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)`);
                const [lastMonthProductsSold] = await db.promise().query(`SELECT COALESCE(SUM(ct.SoLuong), 0) as total FROM chitiet_donhang ct JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang WHERE dh.TrangThai IN ('Đã giao', 'Hoàn thành') AND MONTH(dh.NgayDat) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(dh.NgayDat) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)`);
                const [lastMonthNewUsers] = await db.promise().query(`SELECT COUNT(*) as total FROM taikhoan WHERE MaVaiTro = 2 AND MONTH(NgayTao) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(NgayTao) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)`);
                
                const calcPercent = (current, last) => {
                    if (last === 0) return current > 0 ? 100 : 0;
                    return Math.round(((current - last) / last) * 100);
                };
                
                return {
                    totalOrders: totalOrders[0].total,
                    totalOrdersTrend: calcPercent(totalOrders[0].total, lastMonthOrders[0].total),
                    totalRevenue: revenue[0].total,
                    totalRevenueTrend: calcPercent(revenue[0].total, lastMonthRevenue[0].total),
                    productsSold: productsSold[0].total,
                    productsSoldTrend: calcPercent(productsSold[0].total, lastMonthProductsSold[0].total),
                    lowStock: lowStock[0].total,
                    newUsers: newUsers[0].total,
                    newUsersTrend: calcPercent(newUsers[0].total, lastMonthNewUsers[0].total)
                };
            })(),
            
            // Revenue by month
            (async () => {
                let monthsToGet = period === 'year' ? 12 : parseInt(period);
                const [revenueData] = await db.promise().query(`
                    SELECT 
                        DATE_FORMAT(NgayDat, '%Y-%m') as month,
                        DATE_FORMAT(NgayDat, '%M') as monthName,
                        YEAR(NgayDat) as year,
                        COALESCE(SUM(CASE WHEN TrangThai IN ('Đã giao', 'Hoàn thành') THEN TongTien ELSE 0 END), 0) as revenue
                    FROM donhang
                    WHERE NgayDat >= DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH)
                    GROUP BY DATE_FORMAT(NgayDat, '%Y-%m'), YEAR(NgayDat), DATE_FORMAT(NgayDat, '%M')
                    ORDER BY month ASC
                `, [monthsToGet]);
                
                const months = [];
                const currentDate = new Date();
                for (let i = monthsToGet - 1; i >= 0; i--) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const monthName = date.toLocaleString('vi', { month: 'long' });
                    months.push({ key: monthKey, name: monthName, year: date.getFullYear() });
                }
                
                const revenueMap = {};
                revenueData.forEach(item => {
                    revenueMap[item.month] = item.revenue / 1000000;
                });
                
                return {
                    labels: months.map(m => `${m.name} ${m.year}`),
                    revenues: months.map(m => revenueMap[m.key] || 0)
                };
            })(),
            
            // Top products
            (async () => {
                const [products] = await db.promise().query(`
                    SELECT 
                        sp.TenSanPham as name,
                        ls.TenLoai as category,
                        COALESCE(SUM(ct.SoLuong), 0) as totalSold
                    FROM sanpham sp
                    LEFT JOIN loaisanpham ls ON sp.MaLoai = ls.MaLoai
                    LEFT JOIN chitiet_donhang ct ON sp.MaSanPham = ct.MaSanPham
                    LEFT JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang AND dh.TrangThai IN ('Đã giao', 'Hoàn thành')
                    GROUP BY sp.MaSanPham
                    ORDER BY totalSold DESC
                    LIMIT 5
                `);
                
                const totalSold = products.reduce((sum, p) => sum + p.totalSold, 0);
                
                return {
                    labels: products.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
                    data: products.map(p => p.totalSold),
                    percentages: products.map(p => totalSold > 0 ? Math.round((p.totalSold / totalSold) * 100) : 0)
                };
            })(),
            
            // Low stock products
            (async () => {
                const [products] = await db.promise().query(`
                    SELECT 
                        sp.TenSanPham as name,
                        ls.TenLoai as category,
                        sp.SoLuong as stock,
                        COALESCE((
                            SELECT SUM(ct.SoLuong) FROM chitiet_donhang ct
                            JOIN donhang dh ON ct.MaDonHang = dh.MaDonHang
                            WHERE ct.MaSanPham = sp.MaSanPham AND dh.TrangThai IN ('Đã giao', 'Hoàn thành')
                        ), 0) as totalSold,
                        CASE 
                            WHEN sp.SoLuong <= 3 THEN 'critical'
                            WHEN sp.SoLuong <= 10 THEN 'low'
                            ELSE 'normal'
                        END as stockLevel
                    FROM sanpham sp
                    LEFT JOIN loaisanpham ls ON sp.MaLoai = ls.MaLoai
                    WHERE sp.SoLuong <= 10
                    ORDER BY sp.SoLuong ASC
                    LIMIT 5
                `);
                
                return products;
            })(),
            
            // Recent orders
            (async () => {
                const [orders] = await db.promise().query(`
                    SELECT 
                        dh.MaDonHang as id,
                        dh.TongTien as total,
                        dh.TrangThai as status,
                        nd.TenNguoiDung as customerName,
                        DATE_FORMAT(dh.NgayDat, '%d/%m/%Y') as orderDate
                    FROM donhang dh
                    LEFT JOIN taikhoan tk ON dh.MaTaiKhoan = tk.MaTaiKhoan
                    LEFT JOIN nguoidung nd ON tk.MaNguoiDung = nd.MaNguoiDung
                    ORDER BY dh.NgayDat DESC
                    LIMIT 5
                `);
                
                const formatStatus = (status) => {
                    switch(status) {
                        case 'Đã giao': return 'completed';
                        case 'Hoàn thành': return 'completed';
                        case 'Đang giao': return 'processing';
                        case 'Chờ xác nhận': return 'pending';
                        case 'Đã hủy': return 'cancelled';
                        default: return 'pending';
                    }
                };
                
                const getStatusText = (status) => {
                    switch(status) {
                        case 'Đã giao': return 'Hoàn thành';
                        case 'Hoàn thành': return 'Hoàn thành';
                        case 'Đang giao': return 'Đang xử lý';
                        case 'Chờ xác nhận': return 'Chờ xác nhận';
                        case 'Đã hủy': return 'Đã hủy';
                        default: return status;
                    }
                };
                
                return orders.map(order => ({
                    orderCode: `#OD${String(order.id).padStart(5, '0')}`,
                    customerName: order.customerName || 'Khách vãng lai',
                    total: order.total,
                    status: formatStatus(order.status),
                    statusText: getStatusText(order.status),
                    orderDate: order.orderDate
                }));
            })()
        ]);
        
        res.json({
            success: true,
            data: {
                stats: statsResult,
                revenueChart: revenueResult,
                topProducts: topProductsResult,
                lowStockProducts: lowStockResult,
                recentOrders: recentOrdersResult
            }
        });
    } catch (error) {
        console.error('Lỗi lấy toàn bộ dữ liệu dashboard:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;