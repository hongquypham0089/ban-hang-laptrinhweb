/**
 * ADMIN.JS - Quản lý sản phẩm và danh mục
 */

// Trạng thái ứng dụng
let products = [];
let categories = [];
let currentPage = 1;
let itemsPerPage = 5;
let deleteId = null;
let deleteType = null; // 'product' or 'category'
let currentView = 'products'; // 'products' or 'categories'

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    
    // Đăng ký sự kiện filter
    document.getElementById('categoryFilter')?.addEventListener('change', () => {
        currentPage = 1;
        renderProducts();
    });

    document.getElementById('stockFilter')?.addEventListener('change', () => {
        currentPage = 1;
        renderProducts();
    });
    
    // Search input
    document.getElementById('searchInput')?.addEventListener('input', () => {
        currentPage = 1;
        if (currentView === 'products') {
            renderProducts();
        } else {
            renderCategories();
        }
    });
});

// ==========================================
// 1. LOAD DỮ LIỆU
// ==========================================

async function loadData() {
    await Promise.all([fetchProducts(), fetchCategories()]);
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        products = await response.json();
        
        updateStats();
        if (currentView === 'products') renderProducts();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Không thể kết nối với database!', 'error');
    }
}

async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Không thể tải danh mục');
        const result = await response.json();
        categories = result.success ? result.data : result;
        
        renderCategoryFilter();
        if (currentView === 'categories') renderCategories();
    } catch (error) {
        console.error('Category error:', error);
        categories = [];
    }
}

// ==========================================
// 2. QUẢN LÝ SẢN PHẨM (CRUD)
// ==========================================

async function saveProduct() {
    const id = document.getElementById('productId').value;
    const ten = document.getElementById('tenSanPham').value;
    const loai = document.getElementById('maLoai').value;
    const gia = document.getElementById('gia').value;
    const sl = document.getElementById('soLuong').value || 0;
    const mota = document.getElementById('moTa').value;
    const fileInput = document.getElementById('hinhAnhFile');

    if (!ten || !gia || !loai) {
        showNotification("Vui lòng nhập đầy đủ Tên, Giá và Danh mục!", 'error');
        return;
    }

    const formData = new FormData();
    formData.append('TenSanPham', ten);
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
            body: formData
        });

        if (response.ok) {
            showNotification(id ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!', 'success');
            closeModal('productModal');
            await fetchProducts();
            resetProductForm();
        } else {
            const err = await response.json();
            showNotification('Lỗi: ' + (err.error || err.message || 'Không thể lưu dữ liệu'), 'error');
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        showNotification('Lỗi kết nối server!', 'error');
    }
}

function openEditProductModal(id) {
    const product = products.find(p => p.MaSanPham == id);
    if (!product) return;

    document.getElementById('productModalTitle').innerHTML = '<i class="fas fa-edit"></i> Sửa sản phẩm';
    document.getElementById('productId').value = product.MaSanPham;
    document.getElementById('tenSanPham').value = product.TenSanPham;
    document.getElementById('maLoai').value = product.MaLoai;
    document.getElementById('gia').value = product.Gia;
    document.getElementById('soLuong').value = product.SoLuong;
    document.getElementById('moTa').value = product.MoTa || '';
    
    document.getElementById('productModal').classList.add('active');
}

function openAddProductModal() {
    resetProductForm();
    document.getElementById('productModalTitle').innerHTML = '<i class="fas fa-plus"></i> Thêm sản phẩm mới';
    document.getElementById('productModal').classList.add('active');
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imgPreview').src = '';
}

// ==========================================
// 3. QUẢN LÝ DANH MỤC (CRUD)
// ==========================================

async function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const tenLoai = document.getElementById('tenLoai').value;
    const moTa = document.getElementById('categoryMoTa').value;

    if (!tenLoai) {
        showNotification("Vui lòng nhập tên danh mục!", 'error');
        return;
    }

    try {
        const url = id ? `/api/categories/${id}` : '/api/categories';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ TenLoai: tenLoai, MoTa: moTa })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(id ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!', 'success');
            closeModal('categoryModal');
            await fetchCategories();
            resetCategoryForm();
        } else {
            showNotification('Lỗi: ' + (result.message || 'Không thể lưu danh mục'), 'error');
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        showNotification('Lỗi kết nối server!', 'error');
    }
}

function openEditCategoryModal(id) {
    const category = categories.find(c => c.MaLoai == id);
    if (!category) return;

    document.getElementById('categoryModalTitle').innerHTML = '<i class="fas fa-edit"></i> Sửa danh mục';
    document.getElementById('categoryId').value = category.MaLoai;
    document.getElementById('tenLoai').value = category.TenLoai;
    document.getElementById('categoryMoTa').value = category.MoTa || '';
    
    document.getElementById('categoryModal').classList.add('active');
}

function openAddCategoryModal() {
    resetCategoryForm();
    document.getElementById('categoryModalTitle').innerHTML = '<i class="fas fa-plus"></i> Thêm danh mục mới';
    document.getElementById('categoryModal').classList.add('active');
}

function resetCategoryForm() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
}

// ==========================================
// 4. XÓA DỮ LIỆU
// ==========================================

function openDeleteModal(id, type) {
    deleteId = id;
    deleteType = type;
    const messageEl = document.getElementById('deleteMessage');
    
    if (type === 'product') {
        const product = products.find(p => p.MaSanPham == id);
        messageEl.innerHTML = `Bạn có chắc muốn xóa sản phẩm "${product?.TenSanPham || 'này'}"? Hành động này không thể hoàn tác.`;
    } else if (type === 'category') {
        const category = categories.find(c => c.MaLoai == id);
        messageEl.innerHTML = `Bạn có chắc muốn xóa danh mục "${category?.TenLoai || 'này'}"? Sản phẩm thuộc danh mục này sẽ không bị ảnh hưởng.`;
    }
    
    document.getElementById('deleteModal').classList.add('active');
}

async function confirmDelete() {
    if (!deleteId) return;

    try {
        let response;
        if (deleteType === 'product') {
            response = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' });
        } else if (deleteType === 'category') {
            response = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' });
        }

        const result = await response.json();

        if (response.ok && result.success !== false) {
            showNotification(deleteType === 'product' ? 'Đã xóa sản phẩm!' : 'Đã xóa danh mục!', 'success');
            await loadData();
            closeModal('deleteModal');
        } else {
            showNotification(result.message || 'Không thể xóa!', 'error');
        }
    } catch (error) {
        showNotification('Lỗi hệ thống!', 'error');
    } finally {
        deleteId = null;
        deleteType = null;
    }
}

// ==========================================
// 5. RENDER GIAO DIỆN
// ==========================================

function switchView(view) {
    currentView = view;
    currentPage = 1;
    
    const productsSection = document.getElementById('productsSection');
    const categoriesSection = document.getElementById('categoriesSection');
    const filterSection = document.getElementById('filterSection');
    const statsGrid = document.getElementById('statsGrid');
    const pageTitle = document.getElementById('pageTitle');
    
    if (view === 'products') {
        productsSection.style.display = 'block';
        categoriesSection.style.display = 'none';
        filterSection.style.display = 'flex';
        statsGrid.style.display = 'grid';
        pageTitle.innerHTML = '<i class="fas fa-box"></i> Quản lý Sản phẩm';
        renderProducts();
    } else {
        productsSection.style.display = 'none';
        categoriesSection.style.display = 'block';
        filterSection.style.display = 'none';
        statsGrid.style.display = 'none';
        pageTitle.innerHTML = '<i class="fas fa-list"></i> Quản lý Danh mục';
        renderCategories();
    }
}

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const filterCategory = document.getElementById('categoryFilter').value;
    const filterStock = document.getElementById('stockFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = [...products];
    
    if (filterCategory !== 'all') {
        filtered = filtered.filter(p => p.MaLoai == filterCategory);
    }
    
    if (filterStock === 'low') {
        filtered = filtered.filter(p => p.SoLuong < 10);
    } else if (filterStock === 'medium') {
        filtered = filtered.filter(p => p.SoLuong >= 10 && p.SoLuong < 50);
    } else if (filterStock === 'high') {
        filtered = filtered.filter(p => p.SoLuong >= 50);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(p => p.TenSanPham.toLowerCase().includes(searchTerm));
    }

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
                    <td>#${product.MaSanPham}</td>
                    <td>
                        <div class="product-info">
                            <img src="${product.HinhAnh || '/img/default-product.png'}" class="product-image" onerror="this.src='/img/default-product.png'">
                            <div>
                                <div class="product-name">${escapeHtml(product.TenSanPham)}</div>
                                <div class="product-id">ID: ${product.MaSanPham}</div>
                            </div>
                        </div>
                    </td>
                    <td>${cat ? escapeHtml(cat.TenLoai) : 'Loại ' + product.MaLoai}</td>
                    <td class="price">${formatPrice(product.Gia)}₫</td>
                    <td><span class="stock-badge ${stockClass}">${product.SoLuong}</span></td>
                    <td>${product.MoTa ? escapeHtml(product.MoTa.substring(0, 30)) + '...' : '---'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="openEditProductModal(${product.MaSanPham})"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" onclick="openDeleteModal(${product.MaSanPham}, 'product')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    renderPagination(filtered.length);
}

function renderCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = [...categories];
    
    if (searchTerm) {
        filtered = filtered.filter(c => c.TenLoai.toLowerCase().includes(searchTerm));
    }
    
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Không tìm thấy danh mục nào</td></tr>';
    } else {
        filtered.forEach(category => {
            const productCount = products.filter(p => p.MaLoai == category.MaLoai).length;
            
            tbody.innerHTML += `
                <tr>
                    <td>#${category.MaLoai}</td>
                    <td><strong>${escapeHtml(category.TenLoai)}</strong></td>
                    <td>${category.MoTa ? escapeHtml(category.MoTa) : '---'}</td>
                    <td><span class="product-count-badge">${productCount} sản phẩm</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="openEditCategoryModal(${category.MaLoai})"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" onclick="openDeleteModal(${category.MaLoai}, 'category')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
}

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
        invV.textContent = formatPrice(totalValue) + '₫';
    }
}

function renderCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    const modalSelect = document.getElementById('maLoai');
    
    if (!filter || !modalSelect) return;
    
    let options = categories.map(cat => `<option value="${cat.MaLoai}">${escapeHtml(cat.TenLoai)}</option>`).join('');
    
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

// ==========================================
// 6. HELPER FUNCTIONS
// ==========================================

function changePage(page) {
    currentPage = page;
    if (currentView === 'products') {
        renderProducts();
    } else {
        renderCategories();
    }
}

function previewImage(event) {
    const container = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imgPreview');
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            container.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        container.style.display = 'none';
    }
}

function formatPrice(price) {
    return parseInt(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
// Logout function
async function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();

            if (data.success) {
                showNotification('Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    window.location.href = '/dangnhap';
                }, 1500);
            } else {
                showNotification(data.message || 'Có lỗi xảy ra!', 'error');
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        }
    }
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        window.location.href = '/logout';
    }
}