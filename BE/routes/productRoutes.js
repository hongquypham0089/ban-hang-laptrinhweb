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

// [GET] Lấy danh sách danh mục (để hiện thị trong ô Select)
router.get("/categories", (req, res) => {
    const sql = "SELECT * FROM LOAISANPHAM";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
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