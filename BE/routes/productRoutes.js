const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- 1. CẤU HÌNH MULTER (LƯU TRỮ ẢNH) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "public/uploads/";
        // Tự động tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// --- 2. CÁC ROUTE API ---

// [GET] Lấy danh sách sản phẩm
router.get("/products", (req, res) => {
    const sql = "SELECT * FROM SANPHAM ORDER BY MaSanPham DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// --- 1. LẤY DANH SÁCH DANH MỤC ---
// GET /api/categories
router.get("/categories", (req, res) => {
    const sql = "SELECT * FROM LOAISANPHAM ORDER BY MaLoai DESC";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi lấy danh mục:", err);
            return res.status(500).json({ success: false, message: "Lỗi Server: " + err.message });
        }
        res.json({ success: true, data: results });
    });
});

// --- 2. THÊM DANH MỤC MỚI ---
// POST /api/categories
router.post("/categories", (req, res) => {
    const { TenLoai, MoTa } = req.body; // Thêm trường MoTa nếu bảng của bạn có

    if (!TenLoai) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên danh mục!" });
    }

    // Nếu bảng LOAISANPHAM của bạn không có cột MoTa, hãy bỏ chữ MoTa đi nhé
    const sql = "INSERT INTO LOAISANPHAM (TenLoai, MoTa) VALUES (?, ?)";
    
    db.query(sql, [TenLoai, MoTa || null], (err, result) => {
        if (err) {
            console.error("Lỗi thêm danh mục:", err);
            return res.status(500).json({ success: false, message: "Lỗi Server: " + err.message });
        }
        res.json({ 
            success: true, 
            message: "Thêm danh mục thành công!", 
            id: result.insertId 
        });
    });
});

// --- 3. CẬP NHẬT DANH MỤC ---
// PUT /api/categories/:id
router.put("/categories/:id", (req, res) => {
    const { id } = req.params;
    const { TenLoai, MoTa } = req.body;

    if (!TenLoai) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên danh mục!" });
    }

    const sql = "UPDATE LOAISANPHAM SET TenLoai = ?, MoTa = ? WHERE MaLoai = ?";
    
    db.query(sql, [TenLoai, MoTa || null, id], (err, result) => {
        if (err) {
            console.error("Lỗi cập nhật danh mục:", err);
            return res.status(500).json({ success: false, message: "Lỗi Server: " + err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục này!" });
        }
        
        res.json({ success: true, message: "Cập nhật danh mục thành công!" });
    });
});

// --- 4. XÓA DANH MỤC (CÓ BẢO VỆ DỮ LIỆU) ---
// DELETE /api/categories/:id
router.delete("/categories/:id", (req, res) => {
    const { id } = req.params;

    // BƯỚC 1: Kiểm tra xem có sản phẩm nào đang dùng mã danh mục này không
    const checkSql = "SELECT COUNT(*) as count FROM SANPHAM WHERE MaLoai = ?";
    
    db.query(checkSql, [id], (err, results) => {
        if (err) {
            console.error("Lỗi kiểm tra khóa ngoại:", err);
            return res.status(500).json({ success: false, message: "Lỗi Server: " + err.message });
        }

        // Nếu có sản phẩm đang xài danh mục này -> Chặn xóa
        if (results[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Không thể xóa! Hiện đang có sản phẩm thuộc danh mục này." 
            });
        }

        // BƯỚC 2: Tiến hành xóa nếu danh mục trống
        const deleteSql = "DELETE FROM LOAISANPHAM WHERE MaLoai = ?";
        
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                console.error("Lỗi xóa danh mục:", err);
                return res.status(500).json({ success: false, message: "Lỗi Server: " + err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy danh mục để xóa!" });
            }
            
            res.json({ success: true, message: "Đã xóa danh mục thành công!" });
        });
    });
});


// [POST] Thêm sản phẩm mới
router.post("/products", upload.single("HinhAnh"), (req, res) => {
    const { TenSanPham, Gia, SoLuong, MoTa, MaLoai } = req.body;
    const hinhAnhPath = req.file ? `/uploads/${req.file.filename}` : "";

    const sql = "INSERT INTO SANPHAM (TenSanPham, Gia, SoLuong, MoTa, HinhAnh, MaLoai) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [TenSanPham, Gia, SoLuong, MoTa, hinhAnhPath, MaLoai];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Lỗi MySQL:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Thêm thành công!", id: result.insertId });
    });
});

// [PUT] Cập nhật sản phẩm
router.put("/products/:id", upload.single("HinhAnh"), (req, res) => {
    const { id } = req.params;
    const { TenSanPham, Gia, SoLuong, MoTa, MaLoai } = req.body;
    
    let sql = "UPDATE SANPHAM SET TenSanPham=?, Gia=?, SoLuong=?, MoTa=?, MaLoai=? ";
    let values = [TenSanPham, Gia, SoLuong, MoTa, MaLoai];

    if (req.file) {
        sql += ", HinhAnh=? ";
        values.push(`/uploads/${req.file.filename}`);
    }

    sql += " WHERE MaSanPham=?";
    values.push(id);

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cập nhật thành công!" });
    });
});

// [DELETE] Xóa sản phẩm
router.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM SANPHAM WHERE MaSanPham = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Xóa sản phẩm thành công!" });
    });
});

module.exports = router;