const express = require("express");
const router = express.Router();
// Đổi đường dẫn này tới file kết nối database thực tế của bạn
const db = require("../config/db"); // Ví dụ: thư mục chứa file cấu hình mysql

// Route GET: /chitiet/:id
router.get("/:id", async (req, res) => {
    const productId = req.params.id;

    try {
        // Truy vấn CSDL lấy sản phẩm và tên loại sản phẩm (dùng Promise nếu bạn đang xài mysql2/promise)
        const [rows] = await db.promise().query(
            `SELECT s.*, l.TenLoai 
             FROM SANPHAM s 
             LEFT JOIN LOAISANPHAM l ON s.MaLoai = l.MaLoai 
             WHERE s.MaSanPham = ?`,
            [productId]
        );

        // Nếu không tìm thấy sản phẩm
        if (rows.length === 0) {
            return res.status(404).render("404", { message: "Không tìm thấy sản phẩm" }); // Hoặc trả về chữ
        }

        const productData = rows[0];

        // Xử lý ảnh: Nếu ảnh dạng icon FontAwesome thì gán ảnh mặc định để thẻ <img> không bị lỗi
        let imageUrl = productData.HinhAnh;
        if (!imageUrl || imageUrl.startsWith('fa-')) {
            imageUrl = 'https://via.placeholder.com/800x500?text=No+Image';
        }

        // Ánh xạ dữ liệu từ Database vào đúng cấu trúc object mà file ChiTiet.ejs đang cần gọi
        const product = {
            id: productData.MaSanPham,
            name: productData.TenSanPham,
            price: Number(productData.Gia),
            // Giả lập giá cũ đắt hơn giá hiện tại 10% để trang hiển thị tag giảm giá
            oldPrice: Math.round(Number(productData.Gia) * 1.1), 
            description: productData.MoTa || "Đang cập nhật mô tả...",
            image: imageUrl,
            specs: {
                "Loại sản phẩm": productData.TenLoai || "Chưa phân loại",
                "Số lượng kho": productData.SoLuong + " cái",
                "Tình trạng": productData.SoLuong > 0 ? "Còn hàng" : "Hết hàng"
            }
        };

        // Render file ChiTiet.ejs và truyền dữ liệu product sang
        res.render("ChiTiet", { product: product });

    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        res.status(500).send("Lỗi server kết nối CSDL!");
    }
});

module.exports = router;