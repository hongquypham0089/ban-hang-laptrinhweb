// admin_donhang.js - Quản lý đơn hàng với API

// State management
let orders = [];
let currentPage = 1;
let itemsPerPage = 10;
let totalOrders = 0;
let currentFilters = {
    status: 'all',
    fromDate: '',
    toDate: '',
    search: ''
};

// DOM Elements
const ordersTableBody = document.getElementById('ordersTableBody');
const orderModal = document.getElementById('orderModal');
const statusFilter = document.getElementById('statusFilter');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const searchInput = document.getElementById('searchInput');

// Map status for display
const statusMap = {
    'Chờ xác nhận': { text: 'Chờ xác nhận', class: 'status-pending', icon: '⏳' },
    'Đang xử lý': { text: 'Đang xử lý', class: 'status-processing', icon: '⚙️' },
    'Đang giao': { text: 'Đang giao', class: 'status-shipping', icon: '🚚' },
    'Hoàn thành': { text: 'Hoàn thành', class: 'status-completed', icon: '✅' },
    'Đã hủy': { text: 'Đã hủy', class: 'status-cancelled', icon: '❌' },
    'Hoàn tiền': { text: 'Hoàn tiền', class: 'status-refunded', icon: '🔄' }
};

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await loadOrders();
    setupEventListeners();
    updateStats();
});

// Setup event listeners
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            currentFilters.search = this.value;
            currentPage = 1;
            loadOrders();
        }, 500));
    }
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load orders from API
async function loadOrders() {
    showLoading();
    
    try {
        let url = `/api/orders/admin?page=${currentPage}&limit=${itemsPerPage}`;
        
        if (currentFilters.status && currentFilters.status !== 'all') {
            url += `&status=${currentFilters.status}`;
        }
        if (currentFilters.fromDate) {
            url += `&fromDate=${currentFilters.fromDate}`;
        }
        if (currentFilters.toDate) {
            url += `&toDate=${currentFilters.toDate}`;
        }
        if (currentFilters.search) {
            url += `&search=${encodeURIComponent(currentFilters.search)}`;
        }
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/dangnhap';
                return;
            }
            throw new Error('Failed to load orders');
        }
        
        const result = await response.json();
        
        if (result.success) {
            orders = result.data;
            totalOrders = result.pagination.totalItems;
            renderOrdersTable();
            updatePagination(result.pagination);
        } else {
            showNotification(result.message || 'Không thể tải đơn hàng', 'error');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        hideLoading();
    }
}

// Render orders table
function renderOrdersTable() {
    if (!ordersTableBody) return;
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 60px;">
                    <i class="fas fa-box-open" style="font-size: 48px; opacity: 0.5;"></i>
                    <p style="margin-top: 15px;">Không có đơn hàng nào</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    orders.forEach(order => {
        const productCount = order.SoLuongSanPham || 1;
        const status = statusMap[order.TrangThai] || { text: order.TrangThai, class: 'status-pending' };
        
        html += `
            <tr onclick="viewOrderDetails(${order.MaDonHang})">
                <td class="order-id">#${order.MaDonHang}</td>
                <td>
                    <div class="customer-info">
                        <div class="customer-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="customer-details">
                            <div class="customer-name">${escapeHtml(order.TenKhachHang || 'Khách hàng')}</div>
                            <div class="customer-phone">${escapeHtml(order.SoDienThoai || '---')}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="product-info">
                        <div class="product-name">${productCount} sản phẩm</div>
                        <div class="product-qty">Xem chi tiết</div>
                    </div>
                </td>
                <td class="order-total">${formatPrice(order.TongTien)}</td>
                <td class="order-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formatDate(order.NgayDat)}
                </td>
                <td>
                    <span class="status-badge ${order.PhuongThucThanhToan === 'COD' ? 'status-pending' : 'status-completed'}">
                        ${order.PhuongThucThanhToan || 'COD'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${status.class}">${status.text}</span>
                </td>
                <td onclick="event.stopPropagation()">
                    <div class="action-buttons">
                        <div class="action-btn view" onclick="viewOrderDetails(${order.MaDonHang})">
                            <i class="fas fa-eye"></i>
                        </div>
                        ${order.TrangThai === 'Chờ xác nhận' ? `
                        <div class="action-btn edit" onclick="confirmOrder(${order.MaDonHang})">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        ` : ''}
                        <div class="action-btn print" onclick="printOrder(${order.MaDonHang})">
                            <i class="fas fa-print"></i>
                        </div>
                    </div>
                 </td>
             </tr>
        `;
    });
    
    ordersTableBody.innerHTML = html;
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
// Xác nhận đơn hàng (chuyển từ Chờ xác nhận -> Đang giao)
async function confirmOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn xác nhận đơn hàng này?')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`/api/orders/admin/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ status: 'Đang giao' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Xác nhận đơn hàng thành công!', 'success');
            await loadOrders();
            updateStats();
        } else {
            showNotification(result.message || 'Xác nhận thất bại', 'error');
        }
    } catch (error) {
        console.error('Error confirming order:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        hideLoading();
    }
}

// View order details
async function viewOrderDetails(orderId) {
    showLoading();
    
    try {
        const response = await fetch(`/api/orders/admin/${orderId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to load order details');
        
        const result = await response.json();
        
        if (result.success) {
            const order = result.data.order;
            const items = result.data.items;
            
            updateModalWithOrderData(order, items);
            orderModal.classList.add('active');
        } else {
            showNotification(result.message || 'Không thể tải chi tiết đơn hàng', 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Lỗi tải chi tiết đơn hàng', 'error');
    } finally {
        hideLoading();
    }
}

// Update modal with order data
function updateModalWithOrderData(order, items) {
    const modalBody = document.getElementById('modalBody');
    
    let statusOptions = '';
    const statuses = [
        { value: 'Chờ xác nhận', text: 'Chờ xác nhận' },
        { value: 'Đang xử lý', text: 'Đang xử lý' },
        { value: 'Đang giao', text: 'Đang giao' },
        { value: 'Hoàn thành', text: 'Hoàn thành' },
        { value: 'Đã hủy', text: 'Đã hủy' },
        { value: 'Hoàn tiền', text: 'Hoàn tiền' }
    ];
    
    statuses.forEach(s => {
        const selected = order.TrangThai === s.value ? 'selected' : '';
        statusOptions += `<option value="${s.value}" ${selected}>${s.text}</option>`;
    });
    
    let productsHtml = '';
    let total = 0;
    
    items.forEach(item => {
        const thanhTien = item.SoLuong * item.Gia;
        total += thanhTien;
        productsHtml += `
            <tr>
                <td style="padding: 12px 8px;">${escapeHtml(item.TenSanPham)}</td>
                <td style="padding: 12px 8px; text-align: center;">${item.SoLuong}</td>
                <td style="padding: 12px 8px; text-align: right;">${formatPrice(item.Gia)}</td>
                <td style="padding: 12px 8px; text-align: right;">${formatPrice(thanhTien)}</td>
             </tr>
        `;
    });
    
    const shipping = Number(order.PhiVanChuyen) || 0;
    const discount = Number(order.GiamGia) || 0;
    const finalTotal = total + shipping - discount;
    
    modalBody.innerHTML = `
        <!-- Customer Info -->
        <div class="order-detail-section">
            <div class="detail-title">
                <i class="fas fa-user"></i>
                Thông tin khách hàng
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Mã tài khoản:</span>
                    <span class="detail-value">${order.MaTaiKhoan || '---'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Họ tên:</span>
                    <span class="detail-value">${escapeHtml(order.TenKhachHang || 'Khách hàng')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Số điện thoại:</span>
                    <span class="detail-value">${escapeHtml(order.SoDienThoai || '---')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${escapeHtml(order.Email || '---')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Địa chỉ:</span>
                    <span class="detail-value">${escapeHtml(order.DiaChiGiaoHang || '---')}</span>
                </div>
            </div>
        </div>

        <!-- Order Info -->
        <div class="order-detail-section">
            <div class="detail-title">
                <i class="fas fa-info-circle"></i>
                Thông tin đơn hàng
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Mã đơn hàng:</span>
                    <span class="detail-value">#${order.MaDonHang}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ngày đặt:</span>
                    <span class="detail-value">${formatDateTime(order.NgayDat)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ngày giao:</span>
                    <span class="detail-value">${order.NgayGiao ? formatDate(order.NgayGiao) : 'Chưa giao'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phương thức thanh toán:</span>
                    <span class="detail-value">${order.PhuongThucThanhToan || 'COD'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mã giảm giá:</span>
                    <span class="detail-value">${order.MaGiamGia || 'Không có'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phí vận chuyển:</span>
                    <span class="detail-value">${formatPrice(shipping)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Giảm giá:</span>
                    <span class="detail-value">${formatPrice(discount)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Trạng thái đơn hàng:</span>
                    <select class="status-select" id="orderStatusSelect" onchange="updateOrderStatus(${order.MaDonHang}, this.value)">
                        ${statusOptions}
                    </select>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ghi chú:</span>
                    <span class="detail-value">${escapeHtml(order.GhiChu || 'Không có')}</span>
                </div>
            </div>
        </div>

        <!-- Products List -->
        <div class="order-detail-section">
            <div class="detail-title">
                <i class="fas fa-box"></i>
                Sản phẩm đã đặt
            </div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th style="text-align: center;">SL</th>
                        <th style="text-align: right;">Đơn giá</th>
                        <th style="text-align: right;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: 600;">Tổng cộng:</td>
                        <td style="text-align: right; color: var(--neon-green); font-weight: 700; font-size: 1.1rem;">${formatPrice(finalTotal)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    showLoading();
    
    try {
        const response = await fetch(`/api/orders/admin/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Cập nhật trạng thái thành công', 'success');
            await loadOrders();
            updateStats();
            closeModal();
        } else {
            showNotification(result.message || 'Cập nhật thất bại', 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        hideLoading();
    }
}

// Apply filters
function applyFilters() {
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.fromDate = document.getElementById('fromDate').value;
    currentFilters.toDate = document.getElementById('toDate').value;
    currentPage = 1;
    loadOrders();
}

// Reset filters
function resetFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    
    currentFilters = {
        status: 'all',
        fromDate: '',
        toDate: '',
        search: currentFilters.search
    };
    currentPage = 1;
    loadOrders();
    showNotification('Đã đặt lại bộ lọc', 'info');
}

// Filter by status from stats bar
function filterByStatus(status) {
    document.getElementById('statusFilter').value = status;
    applyFilters();
    
    document.querySelectorAll('.stat-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-status') === status) {
            item.classList.add('active');
        }
    });
}

// Update stats counters
async function updateStats() {
    try {
        const response = await fetch('/api/orders/admin/stats', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const stats = result.data;
                
                document.getElementById('statAll').textContent = stats.all_orders || 0;
                document.getElementById('statPending').textContent = stats.pending || 0;
                document.getElementById('statProcessing').textContent = stats.processing || 0;
                document.getElementById('statShipping').textContent = stats.shipping || 0;
                document.getElementById('statCompleted').textContent = stats.completed || 0;
                document.getElementById('statCancelled').textContent = stats.cancelled || 0;
            }
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update pagination
function updatePagination(pagination) {
    const paginationInfo = document.querySelector('.pagination-info');
    const paginationButtons = document.querySelector('.pagination-buttons');
    
    if (paginationInfo) {
        const start = (pagination.currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(pagination.currentPage * itemsPerPage, totalOrders);
        paginationInfo.innerHTML = `Hiển thị ${start}-${end} của ${totalOrders} đơn hàng`;
    }
    
    if (paginationButtons) {
        let buttonsHtml = `
            <button class="page-btn" onclick="changePage(${pagination.currentPage - 1})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        for (let i = 1; i <= pagination.totalPages; i++) {
            if (i === 1 || i === pagination.totalPages || (i >= pagination.currentPage - 1 && i <= pagination.currentPage + 1)) {
                buttonsHtml += `
                    <button class="page-btn ${i === pagination.currentPage ? 'active' : ''}" onclick="changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === pagination.currentPage - 2 || i === pagination.currentPage + 2) {
                buttonsHtml += `<button class="page-btn" disabled>...</button>`;
            }
        }
        
        buttonsHtml += `
            <button class="page-btn" onclick="changePage(${pagination.currentPage + 1})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationButtons.innerHTML = buttonsHtml;
    }
}

// Change page
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    loadOrders();
}

// Export orders to Excel
async function exportOrders() {
    showLoading();
    
    try {
        // Xây dựng URL với các tham số filter
        let url = `/api/orders/admin/export?`;
        
        if (currentFilters.status && currentFilters.status !== 'all') {
            url += `status=${encodeURIComponent(currentFilters.status)}&`;
        }
        if (currentFilters.fromDate) {
            url += `fromDate=${currentFilters.fromDate}&`;
        }
        if (currentFilters.toDate) {
            url += `toDate=${currentFilters.toDate}&`;
        }
        if (currentFilters.search) {
            url += `search=${encodeURIComponent(currentFilters.search)}&`;
        }
        
        // Thêm timestamp để tránh cache
        url += `_=${Date.now()}`;
        
        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Accept': 'text/csv, application/vnd.ms-excel, */*'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Export failed: ${response.status} ${errorText}`);
        }
        
        // Lấy tên file từ Content-Disposition header nếu có
        let filename = `don_hang_${new Date().toISOString().split('T')[0]}.xlsx`;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
            }
        }
        
        const blob = await response.blob();
        
        // Kiểm tra xem blob có dữ liệu không
        if (blob.size === 0) {
            throw new Error('File export trống, không có dữ liệu');
        }
        
        // Tạo URL cho blob và trigger download
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        // Giải phóng URL sau 100ms
        setTimeout(() => {
            window.URL.revokeObjectURL(downloadUrl);
        }, 100);
        
        showNotification('Xuất file báo cáo thành công!', 'success');
        
    } catch (error) {
        console.error('Error exporting orders:', error);
        showNotification('Lỗi xuất file: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}
// Print order
async function printOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/admin/${orderId}`, {
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(getPrintHTML(result.data));
            printWindow.document.close();
            printWindow.print();
        }
    } catch (error) {
        console.error('Error printing order:', error);
        showNotification('Lỗi in đơn hàng', 'error');
    }
}

// Get print HTML
function getPrintHTML(orderData) {
    const order = orderData.order;
    const items = orderData.items;
    
    let itemsHtml = '';
    let total = 0;
    
    items.forEach(item => {
        const thanhTien = Number(item.SoLuong) * Number(item.Gia);
        total += thanhTien;
        itemsHtml += `
            <tr>
                <td>${item.TenSanPham}</td>
                <td style="text-align: center;">${item.SoLuong}</td>
                <td style="text-align: right;">${formatPrice(item.Gia)}</td>
                <td style="text-align: right;">${formatPrice(thanhTien)}</td>
             </tr>
        `;
    });
    
    const shipping = order.PhiVanChuyen || 0;
    const discount = order.GiamGia || 0;
    const finalTotal = total + shipping - discount;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Đơn hàng #${order.MaDonHang}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .order-info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; }
                th { background: #f5f5f5; }
                .total { font-size: 18px; font-weight: bold; text-align: right; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>HÓA ĐƠN ĐẶT HÀNG</h2>
                <p>Mã đơn hàng: #${order.MaDonHang}</p>
            </div>
            
            <div class="order-info">
                <h3>Thông tin khách hàng</h3>
                <p><strong>Họ tên:</strong> ${order.TenKhachHang || 'Khách hàng'}</p>
                <p><strong>Số điện thoại:</strong> ${order.SoDienThoai || '---'}</p>
                <p><strong>Địa chỉ:</strong> ${order.DiaChiGiaoHang || '---'}</p>
            </div>
            
            <div class="order-info">
                <h3>Thông tin đơn hàng</h3>
                <p><strong>Ngày đặt:</strong> ${formatDateTime(order.NgayDat)}</p>
                <p><strong>Ngày giao:</strong> ${order.NgayGiao ? formatDate(order.NgayGiao) : 'Chưa giao'}</p>
                <p><strong>Phương thức thanh toán:</strong> ${order.PhuongThucThanhToan || 'COD'}</p>
            </div>
            
            <h3>Chi tiết đơn hàng</h3>
            <table>
                <thead>
                    <tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <div class="total">
                <p>Tổng tiền hàng: ${formatPrice(total)}</p>
                <p>Phí vận chuyển: ${formatPrice(shipping)}</p>
                <p>Giảm giá: ${formatPrice(discount)}</p>
                <hr>
                <p>Tổng thanh toán: ${formatPrice(finalTotal)}</p>
            </div>
        </body>
        </html>
    `;
}

// Save order changes from modal
async function saveOrderChanges() {
    const statusSelect = document.getElementById('orderStatusSelect');
    if (statusSelect) {
        const newStatus = statusSelect.value;
        const orderIdMatch = document.querySelector('.modal-title').innerHTML.match(/#(\d+)/);
        if (orderIdMatch) {
            const orderId = orderIdMatch[1];
            await updateOrderStatus(orderId, newStatus);
        }
    }
    closeModal();
}

// Close modal
function closeModal() {
    orderModal.classList.remove('active');
}

// Show/hide loading
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// Helper functions
function formatPrice(price) {
    const number = Number(price) || 0;

    return number.toLocaleString('vi-VN') + '₫';
}

function formatDate(dateString) {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
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

function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i> ';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i> ';
    else if (type === 'info') icon = '<i class="fas fa-info-circle"></i> ';
    
    notification.innerHTML = icon + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }
    }, 3000);
}

// Global functions
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.filterByStatus = filterByStatus;
window.viewOrderDetails = viewOrderDetails;
window.printOrder = printOrder;
window.exportOrders = exportOrders;
window.closeModal = closeModal;
window.saveOrderChanges = saveOrderChanges;
window.changePage = changePage;
window.updateOrderStatus = updateOrderStatus;
window.confirmOrder = confirmOrder;