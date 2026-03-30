/**
 * ADMIN.JS - Quản lý sản phẩm kết nối Database
 */

// Trạng thái ứng dụng
let products = [];
let categories = [];
let currentPage = 1;
let itemsPerPage = 5;
let deleteId = null;

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', async function() {
    await fetchCategories(); // Tải danh mục trước để render filter/modal
    await fetchProducts();   // Sau đó tải sản phẩm
    
    // Đăng ký sự kiện filter
    document.getElementById('categoryFilter').addEventListener('change', () => {
        currentPage = 1;
        renderProducts();
    });

    document.getElementById('stockFilter').addEventListener('change', () => {
        currentPage = 1;
        renderProducts();
    });
});

// ==========================================
// 1. CÁC HÀM GỌI API (DATABASE CONNECT)
// ==========================================

// Tải danh sách sản phẩm từ Backend
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        products = await response.json();
        
        updateStats();
        renderProducts();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Không thể kết nối với database!', 'error');
    }
}

// Tải danh sách danh mục (Để map tên loại)
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Không thể tải danh mục');
        categories = await response.json();
        renderCategoryFilter();
    } catch (error) {
        console.error('Category error:', error);
        // Fallback: Mảng cứng nếu API lỗi
        categories = [{ MaLoai: 1, TenLoai: 'PC Gaming' }];
        renderCategoryFilter();
    }
}

// Hàm lưu sản phẩm (Thêm mới HOẶC Cập nhật)
async function saveProduct() {
    // 1. Lấy dữ liệu từ giao diện
    const id = document.getElementById('productId').value;
    const ten = document.getElementById('tenSanPham').value;
    const loai = document.getElementById('maLoai').value;
    const gia = document.getElementById('gia').value;
    const sl = document.getElementById('soLuong').value;
    const mota = document.getElementById('moTa').value;
    const fileInput = document.getElementById('hinhAnhFile'); // Đảm bảo ID này khớp với HTML

    if (!ten || !gia || !loai) {
        alert("Vui lòng nhập đầy đủ Tên, Giá và Danh mục!");
        return;
    }

    // 2. Tạo FormData (Tên key bên trái phải khớp với req.body ở file routes)
    const formData = new FormData();
    formData.append('TenSanPham', ten); // Đã sửa từ 'TenSanPhan' thành 'TenSanPham'
    formData.append('MaLoai', loai);
    formData.append('Gia', gia);
    formData.append('SoLuong', sl);
    formData.append('MoTa', mota);

    if (fileInput.files[0]) {
        formData.append('HinhAnh', fileInput.files[0]);
    }

    try {
        const url = id ? `/api/products/${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            body: formData // Không dùng JSON.stringify khi có file
        });

        if (response.ok) {
            alert('Lưu sản phẩm thành công!');
            closeModal();
            fetchProducts(); // Tải lại bảng mà không cần load lại trang
        } else {
            const err = await response.json();
            alert('Lỗi: ' + (err.error || 'Không thể lưu dữ liệu'));
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Lỗi kết nối server!');
    }
}

// Hàm xác nhận xóa sản phẩm
async function confirmDelete() {
    if (!deleteId) return;

    try {
        const response = await fetch(`/api/products/${deleteId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Đã xóa sản phẩm khỏi hệ thống!', 'success');
            await fetchProducts();
            closeDeleteModal();
        } else {
            showNotification('Không thể xóa sản phẩm này!', 'error');
        }
    } catch (error) {
        showNotification('Lỗi hệ thống!', 'error');
    }
}

// ==========================================
// 2. CÁC HÀM RENDER GIAO DIỆN (UI)
// ==========================================

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const filterCategory = document.getElementById('categoryFilter').value;
    const filterStock = document.getElementById('stockFilter').value;
    
    // Lọc dữ liệu tại chỗ (Client-side filtering)
    let filtered = [...products];
    if (filterCategory !== 'all') filtered = filtered.filter(p => p.MaLoai == filterCategory);
    
    if (filterStock === 'low') filtered = filtered.filter(p => p.SoLuong < 10);
    else if (filterStock === 'medium') filtered = filtered.filter(p => p.SoLuong >= 10 && p.SoLuong < 50);
    else if (filterStock === 'high') filtered = filtered.filter(p => p.SoLuong >= 50);

    // Phân trang
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    tbody.innerHTML = '';
    
    if (paginated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">Không tìm thấy sản phẩm nào</td></tr>';
    } else {
        paginated.forEach(product => {
            const cat = categories.find(c => c.MaLoai == product.MaLoai);
            const stockClass = product.SoLuong < 10 ? 'stock-low' : (product.SoLuong < 50 ? 'stock-medium' : 'stock-high');
            
            tbody.innerHTML += `
                <tr>
                    <td>#${product.MaSanPham}</td> <td>
                        <div class="product-info">
                            <img src="${product.HinhAnh ? product.HinhAnh : '/img/default-product.png'}" class="product-image">
                            <div>
                                <div class="product-name">${product.TenSanPham}</div>
                                <div class="product-id">ID: ${product.MaSanPham}</div>
                            </div>
                        </div>
                    </td>
                    <td>${cat ? cat.TenLoai : 'Loại ' + product.MaLoai}</td>
                    <td class="price">${formatPrice(product.Gia)}đ</td>
                    <td><span class="stock-badge ${stockClass}">${product.SoLuong}</span></td>
                    <td>${product.MoTa ? product.MoTa.substring(0, 30) + '...' : '---'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="openEditModal(${product.MaSanPham})"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" onclick="openDeleteModal(${product.MaSanPham})"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    renderPagination(filtered.length);
}

// Cập nhật các con số thống kê trên Dashboard
function updateStats() {
    const totalP = document.getElementById('totalProducts');
    const totalC = document.getElementById('totalCategories');
    const lowS = document.getElementById('lowStockProducts');
    const invV = document.getElementById('inventoryValue');

    if (totalP) totalP.textContent = products.length;
    if (totalC) totalC.textContent = categories.length;
    if (lowS) lowS.textContent = products.filter(p => p.SoLuong < 10).length;
    
    if (invV) {
        const totalValue = products.reduce((sum, p) => sum + (p.Gia * p.SoLuong), 0);
        invV.textContent = formatPrice(totalValue) + 'đ';
    }
}

// ==========================================
// 3. CÁC HÀM HELPER & MODAL
// ==========================================

function openEditModal(id) {
    const product = products.find(p => p.MaSanPham === id);
    if (!product) return;

    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Sửa sản phẩm';
    document.getElementById('productId').value = product.MaSanPham;
    document.getElementById('tenSanPham').value = product.TenSanPham;
    document.getElementById('maLoai').value = product.MaLoai;
    document.getElementById('gia').value = product.Gia;
    document.getElementById('soLuong').value = product.SoLuong;
    document.getElementById('moTa').value = product.MoTa || '';
    
    document.getElementById('productModal').classList.add('active');
}

function openAddProductModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Thêm sản phẩm mới';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('active');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

function openDeleteModal(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function renderCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    const modalSelect = document.getElementById('maLoai');
    
    let options = categories.map(cat => `<option value="${cat.MaLoai}">${cat.TenLoai}</option>`).join('');
    
    filter.innerHTML = '<option value="all">Tất cả danh mục</option>' + options;
    modalSelect.innerHTML = '<option value="">Chọn danh mục</option>' + options;
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    
    let html = `<div class="pagination-buttons">`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    html += `</div>`;
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderProducts();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas ${type==='success'?'fa-check-circle':'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}