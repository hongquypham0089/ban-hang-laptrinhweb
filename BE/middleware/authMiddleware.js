const jwt = require("jsonwebtoken");

// Middleware kiểm tra quyền Admin
function adminMiddleware(req, res, next) {
    const token = req.cookies.token; 

    if (!token) {
        return res.redirect("/dangnhap");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        // Kiểm tra mã vai trò (1 là Admin)
        if (decoded.role === 1) { 
            req.user = decoded;
            next();
        } else {
            res.status(403).send("Bạn không có quyền truy cập vào khu vực này!");
        }
    } catch (err) {
        res.redirect("/dangnhap");
    }
}

// Middleware kiểm tra đăng nhập cho User thông thường (cho Web)
function authenticateToken(req, res, next) {
    const token = req.cookies.token; 

    if (!token) {
        return res.redirect("/dangnhap");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        req.user = decoded;
        next();
    } catch (err) {
        res.redirect("/dangnhap");
    }
}

// Middleware xác thực cho API (trả về JSON thay vì redirect)
function authenticateTokenAPI(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục." 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." 
            });
        }
        return res.status(403).json({ 
            success: false, 
            message: "Token không hợp lệ. Vui lòng đăng nhập lại." 
        });
    }
}

// Export tất cả các hàm
module.exports = { adminMiddleware, authenticateToken, authenticateTokenAPI };