// user.js - Kết nối frontend với API (Phiên bản nâng cấp)

// Hàm hiển thị thông báo
function showNotification(message, type = 'success') {
    let notification = document.querySelector('.custom-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'custom-notification';
        document.body.appendChild(notification);
        
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '9999';
        notification.style.fontSize = '14px';
        notification.style.fontWeight = '500';
        notification.style.transition = 'all 0.3s ease';
    }
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#ffc107';
        notification.style.color = '#333';
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Biến phân trang
let currentOrderPage = 1;
let currentOrderStatus = '';
let totalOrderPages = 1;

// Lấy thông tin người dùng khi load trang
async function loadUserData() {
    try {
        const profileRes = await fetch('/api/user/profile', {
            credentials: 'include'
        });
        
        if (profileRes.status === 401) {
            console.log("Khách chưa đăng nhập. Duyệt web ẩn danh.");
            if (window.location.pathname === '/user') {
                window.location.href = '/dangnhap'; 
            }
            return;
        }
        
        const profileData = await profileRes.json();
        
        if (profileData.success) {
            const user = profileData.data;
            
            // Cập nhật Header (Avatar, Tên...)
            const headerAvatarImg = document.getElementById('header-avatar-img');
            const headerAvatarIcon = document.getElementById('header-avatar-icon');
            if (headerAvatarImg && user.avatar) {
                headerAvatarImg.src = user.avatar;
                if (headerAvatarIcon) headerAvatarIcon.style.display = 'none';
                headerAvatarImg.style.display = 'inline-block';
            }
            
            // Cập nhật tên hiển thị trên sidebar nếu cần
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement && user.tenNguoiDung) {
                userNameElement.textContent = user.tenNguoiDung;
            }
            
            // Load các dữ liệu khác
            await loadUserStats();
            await loadRecentOrders();
            await loadOrders();
            await loadAddresses();
            await loadWishlist();
        }
    } catch (err) {
        console.log("Lỗi tải thông tin user: ", err);
    }
}

// Lấy thống kê của người dùng
async function loadUserStats() {
    try {
        const response = await fetch('/api/user/stats', {
            credentials: 'include'
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            
            // Cập nhật dashboard cards
            const totalOrdersEl = document.getElementById('dashboard-total-orders');
            if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders || 0;
            
            const shippingOrdersEl = document.getElementById('dashboard-shipping-orders');
            if (shippingOrdersEl) shippingOrdersEl.textContent = stats.shippingOrders || 0;
            
            const deliveredOrdersEl = document.getElementById('dashboard-delivered-orders');
            if (deliveredOrdersEl) deliveredOrdersEl.textContent = stats.deliveredOrders || 0;
            
            // Cập nhật sidebar stats
            const sidebarTotal = document.getElementById('sidebar-total-orders');
            if (sidebarTotal) sidebarTotal.textContent = stats.totalOrders || 0;
            
            // Cập nhật badge đơn hàng chờ
            const pendingBadge = document.getElementById('pending-orders-badge');
            if (pendingBadge) {
                if (stats.pendingOrders > 0) {
                    pendingBadge.textContent = stats.pendingOrders;
                    pendingBadge.style.display = 'inline-block';
                } else {
                    pendingBadge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.log("Lỗi tải thống kê: ", error);
    }
}

// Cập nhật danh sách đơn hàng gần đây
async function loadRecentOrders() {
    try {
        const response = await fetch('/api/user/recent-orders?limit=3', {
            credentials: 'include'
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success && data.data) {
            updateRecentOrders(data.data);
        } else {
            const container = document.getElementById('recent-orders-container');
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 40px;">Chưa có đơn hàng nào</div>';
            }
        }
    } catch (error) {
        console.log("Lỗi tải đơn hàng gần đây: ", error);
        const container = document.getElementById('recent-orders-container');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;">Không thể tải đơn hàng</div>';
        }
    }
}

function updateRecentOrders(orders) {
    const container = document.getElementById('recent-orders-container');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;">Chưa có đơn hàng nào</div>';
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        let statusClass = '';
        switch(order.statusText) {
            case 'Đã giao': statusClass = 'status-delivered'; break;
            case 'Đang giao': statusClass = 'status-shipping'; break;
            case 'Chờ xác nhận': statusClass = 'status-pending'; break;
            default: statusClass = 'status-cancelled';
        }
        
        html += `
            <div class="order-item" onclick="viewOrderDetail('${order.id}')" style="cursor: pointer;">
                <div class="order-img">
                    <i class="fas fa-box"></i>
                </div>
                <div class="order-info">
                    <div class="order-name">Đơn hàng #${order.id}</div>
                    <div class="order-meta">
                        <span>Mã: #${order.id}</span>
                        <span>Ngày: ${order.date}</span>
                    </div>
                </div>
                <div class="order-status ${statusClass}">${order.statusText}</div>
                <div class="order-price">${parseInt(order.total).toLocaleString('vi-VN')} ₫</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Tải danh sách đơn hàng
async function loadOrders(page = 1, status = '') {
    try {
        currentOrderPage = page;
        currentOrderStatus = status;
        
        let url = `/api/user/orders?page=${page}&limit=10`;
        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
        }
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success && data.data) {
            displayOrdersCards(data.data, data.pagination);
        } else {
            const container = document.getElementById('orders-table-body');
            if (container) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-bag"></i><p>Chưa có đơn hàng nào</p></div>';
            }
        }
    } catch (error) {
        console.log("Lỗi tải danh sách đơn hàng: ", error);
        const container = document.getElementById('orders-table-body');
        if (container) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Không thể tải đơn hàng</p></div>';
        }
    }
}

function displayOrdersCards(orders, pagination) {
    const container = document.getElementById('orders-table-body');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-bag"></i><p>Chưa có đơn hàng nào</p></div>';
        return;
    }
    
    let html = '<div class="orders-cards">';
    orders.forEach(order => {
        let statusClass = '';
        let statusIcon = '';
        switch(order.TrangThai) {
            case 'Đã giao': 
                statusClass = 'status-delivered'; 
                statusIcon = 'fa-check-circle';
                break;
            case 'Đang giao': 
                statusClass = 'status-shipping'; 
                statusIcon = 'fa-truck';
                break;
            case 'Chờ xác nhận': 
                statusClass = 'status-pending'; 
                statusIcon = 'fa-clock';
                break;
            default: 
                statusClass = 'status-cancelled';
                statusIcon = 'fa-times-circle';
        }
        
        html += `
            <div class="order-card" onclick="viewOrderDetail('${order.MaDonHang}')">
                <div class="order-card-header">
                    <div class="order-card-id">
                        <i class="fas fa-hashtag"></i>
                        <span>#${order.MaDonHang}</span>
                    </div>
                    <div class="order-card-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(order.NgayDat).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
                <div class="order-card-body">
                    <div class="order-card-info">
                        <div class="order-card-products">
                            <i class="fas fa-box"></i>
                            <span>${order.SoLuongSanPham || 1} sản phẩm</span>
                        </div>
                        <div class="order-card-total">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>${parseInt(order.TongTien).toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>
                    <div class="order-card-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        <span>${order.TrangThai}</span>
                    </div>
                </div>
                <div class="order-card-footer">
                    <button class="view-detail-btn" onclick="event.stopPropagation(); viewOrderDetail('${order.MaDonHang}')">
                        <i class="fas fa-eye"></i> Xem chi tiết
                    </button>
                    ${order.TrangThai === 'Chờ xác nhận' ? `
                        <button class="cancel-order-btn" onclick="event.stopPropagation(); cancelOrder('${order.MaDonHang}')">
                            <i class="fas fa-times"></i> Hủy đơn
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // Hiển thị phân trang
    if (pagination && pagination.totalPages > 1) {
        const paginationContainer = document.getElementById('orders-pagination');
        if (paginationContainer) {
            let pageHtml = '';
            for (let i = 1; i <= pagination.totalPages; i++) {
                pageHtml += `<button class="page-btn" onclick="loadOrders(${i}, '${currentOrderStatus}')" ${i === currentOrderPage ? 'class="active"' : ''}>${i}</button>`;
            }
            paginationContainer.innerHTML = pageHtml;
        }
    }
}

// Xem chi tiết đơn hàng (Modal mới)
async function viewOrderDetail(orderId) {
    try {
        // Hiển thị modal
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
        // Hiển thị loading
        const content = document.getElementById('order-detail-content');
        if (content) {
            content.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Đang tải chi tiết đơn hàng...</div>';
        }
        
        // Gọi API lấy chi tiết đơn hàng
        const response = await fetch(`/api/user/orders/${orderId}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            displayOrderDetail(data.data);
        } else {
            if (content) {
                content.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>Không thể tải chi tiết đơn hàng</p></div>';
            }
            showNotification('Không thể tải chi tiết đơn hàng', 'error');
        }
    } catch (error) {
        console.error('Lỗi tải chi tiết đơn hàng:', error);
        const content = document.getElementById('order-detail-content');
        if (content) {
            content.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>Lỗi kết nối đến server</p></div>';
        }
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

function displayOrderDetail(order) {
    const content = document.getElementById('order-detail-content');
    if (!content) return;
    
    let statusClass = '';
    let statusIcon = '';
    switch(order.TrangThai) {
        case 'Đã giao': 
            statusClass = 'status-delivered'; 
            statusIcon = 'fa-check-circle';
            break;
        case 'Đang giao': 
            statusClass = 'status-shipping'; 
            statusIcon = 'fa-truck';
            break;
        case 'Chờ xác nhận': 
            statusClass = 'status-pending'; 
            statusIcon = 'fa-clock';
            break;
        default: 
            statusClass = 'status-cancelled';
            statusIcon = 'fa-times-circle';
    }
    
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-detail-item">
                    <div class="item-image">
                        <img src="${item.HinhAnh || '/images/default-product.png'}" alt="${item.TenSanPham}" onerror="this.src='/images/default-product.png'">
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.TenSanPham}</div>
                        <div class="item-sku">Mã: ${item.MaSanPham || 'N/A'}</div>
                    </div>
                    <div class="item-price">${item.Gia.toLocaleString('vi-VN')} ₫</div>
                    <div class="item-quantity">x${item.SoLuong}</div>
                    <div class="item-total">${(item.Gia * item.SoLuong).toLocaleString('vi-VN')} ₫</div>
                </div>
            `;
        });
    }
    
    const html = `
        <div class="order-detail-container">
            <div class="order-detail-header">
                <div class="order-info-summary">
                    <div class="order-code">
                        <i class="fas fa-hashtag"></i>
                        <span>Mã đơn hàng: <strong>#${order.MaDonHang}</strong></span>
                    </div>
                    <div class="order-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Ngày đặt: ${new Date(order.NgayDat).toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="order-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        <span>${order.TrangThai}</span>
                    </div>
                </div>
            </div>
            
            <div class="order-detail-body">
                <div class="detail-section">
                    <h4 class="section-title">
                        <i class="fas fa-boxes"></i>
                        Danh sách sản phẩm
                    </h4>
                    <div class="order-items-list">
                        <div class="order-items-header">
                            <div>Sản phẩm</div>
                            <div>Đơn giá</div>
                            <div>Số lượng</div>
                            <div>Thành tiền</div>
                        </div>
                        ${itemsHtml}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="section-title">
                        <i class="fas fa-info-circle"></i>
                        Thông tin đơn hàng
                    </h4>
                    <div class="order-info-grid">
                        <div class="info-row">
                            <span class="info-label">Phương thức thanh toán:</span>
                            <span class="info-value">${order.PhuongThucThanhToan || 'Thanh toán khi nhận hàng'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phí vận chuyển:</span>
                            <span class="info-value">${(order.PhiVanChuyen || 0).toLocaleString('vi-VN')} ₫</span>
                        </div>
                        ${order.GiamGia ? `
                        <div class="info-row">
                            <span class="info-label">Giảm giá:</span>
                            <span class="info-value">-${order.GiamGia.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        ` : ''}
                        <div class="info-row total-row">
                            <span class="info-label">Tổng cộng:</span>
                            <span class="info-value">${order.TongTien.toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="section-title">
                        <i class="fas fa-map-marker-alt"></i>
                        Địa chỉ giao hàng
                    </h4>
                    <div class="shipping-address">
                        <div class="address-name">${order.TenNguoiNhan || order.user?.TenNguoiDung || 'Khách hàng'}</div>
                        <div class="address-phone">${order.SoDienThoaiNhan || order.user?.SoDienThoai || ''}</div>
                        <div class="address-detail">${order.DiaChiGiaoHang || 'Chưa cập nhật'}</div>
                    </div>
                </div>
                
                ${order.GhiChu ? `
                <div class="detail-section">
                    <h4 class="section-title">
                        <i class="fas fa-sticky-note"></i>
                        Ghi chú
                    </h4>
                    <div class="order-note">${order.GhiChu}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="order-detail-footer">
                <button class="btn btn-secondary" onclick="closeOrderDetailModal()">
                    <i class="fas fa-times"></i> Đóng
                </button>
                ${order.TrangThai === 'Chờ xác nhận' ? `
                    <button class="btn btn-danger" onclick="cancelOrder('${order.MaDonHang}')">
                        <i class="fas fa-times-circle"></i> Hủy đơn hàng
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// Đóng modal chi tiết đơn hàng
function closeOrderDetailModal() {
    const modal = document.getElementById('order-detail-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Hủy đơn hàng
async function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    try {
        const response = await fetch(`/api/user/orders/${orderId}/cancel`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Khách hàng yêu cầu hủy' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Hủy đơn hàng thành công!', 'success');
            closeOrderDetailModal(); // Đóng modal nếu đang mở
            await loadUserStats();
            await loadRecentOrders();
            await loadOrders(currentOrderPage, currentOrderStatus);
        } else {
            showNotification(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Tải danh sách địa chỉ
async function loadAddresses() {
    try {
        const response = await fetch('/api/user/addresses', {
            credentials: 'include'
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success && data.data) {
            displayAddresses(data.data);
        }
    } catch (error) {
        console.log("Lỗi tải địa chỉ: ", error);
        const container = document.getElementById('addresses-container');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;">Không thể tải địa chỉ</div>';
        }
    }
}

function displayAddresses(addresses) {
    const container = document.getElementById('addresses-container');
    if (!container) return;
    
    if (!addresses || addresses.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;">Chưa có địa chỉ nào</div>';
        return;
    }
    
    let html = '';
    addresses.forEach(addr => {
        html += `
            <div class="address-card">
                ${addr.isDefault ? '<span class="address-badge">Mặc định</span>' : ''}
                <h4 class="address-name">${addr.fullname || 'Người dùng'}</h4>
                <p class="address-detail">
                    ${addr.address || ''}<br>
                    SĐT: ${addr.phone || ''}
                </p>
                <div class="address-actions">
                    <span onclick="editAddress(${addr.id})"><i class="fas fa-edit"></i> Sửa</span>
                    <span onclick="deleteAddress(${addr.id})"><i class="fas fa-trash"></i> Xóa</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Tải danh sách yêu thích
async function loadWishlist() {
    try {
        const response = await fetch('/api/user/wishlist', {
            credentials: 'include'
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success && data.data) {
            displayWishlist(data.data);
        } else {
            const container = document.getElementById('wishlist-container');
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 40px;">Tính năng đang phát triển</div>';
            }
        }
    } catch (error) {
        console.log("Lỗi tải wishlist: ", error);
        const container = document.getElementById('wishlist-container');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;">Không thể tải danh sách yêu thích</div>';
        }
    }
}

function displayWishlist(items) {
    const container = document.getElementById('wishlist-container');
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;">Chưa có sản phẩm yêu thích nào</div>';
        return;
    }
    
    let html = '';
    items.forEach(item => {
        html += `
            <div class="wishlist-item">
                <div class="wishlist-img">
                    <img src="${item.image || ''}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src=''">
                    <i class="fas fa-box" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; opacity: 0.3;"></i>
                    <div class="remove-btn" onclick="removeFromWishlist(${item.id})">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div class="wishlist-info">
                    <div class="wishlist-name">${item.name}</div>
                    <div class="wishlist-price">${parseInt(item.price).toLocaleString('vi-VN')} ₫</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Cập nhật thông tin cá nhân
async function updateProfile(event) {
    event.preventDefault();
    
    const formData = {
        tenNguoiDung: document.querySelector('#profile-fullname')?.value,
        ngaySinh: document.querySelector('#profile-birthday')?.value,
        gioiTinh: document.querySelector('#profile-gender')?.value,
        soDienThoai: document.querySelector('#profile-phone')?.value,
        diaChi: document.querySelector('#profile-address')?.value
    };
    
    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Cập nhật thông tin thành công!', 'success');
            document.querySelector('.user-name').textContent = formData.tenNguoiDung;
        } else {
            showNotification(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Upload avatar
async function uploadAvatar(input) {
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn file ảnh', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Kích thước file không được vượt quá 5MB', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
        const response = await fetch('/api/user/upload-avatar', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            const avatarImg = document.querySelector('#user-avatar-img');
            const defaultIcon = document.querySelector('#default-avatar-icon');
            if (avatarImg) {
                avatarImg.src = data.data.avatarUrl;
                avatarImg.style.display = 'block';
            }
            if (defaultIcon) {
                defaultIcon.style.display = 'none';
            }
            
            const headerAvatarImg = document.querySelector('#header-avatar-img');
            const headerAvatarIcon = document.querySelector('#header-avatar-icon');
            if (headerAvatarImg) {
                headerAvatarImg.src = data.data.avatarUrl;
                headerAvatarImg.style.display = 'inline-block';
            }
            if (headerAvatarIcon) {
                headerAvatarIcon.style.display = 'none';
            }
            
            showNotification('Cập nhật avatar thành công!', 'success');
        } else {
            showNotification(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Mở modal đổi mật khẩu
function openChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset form
        document.getElementById('change-password-form').reset();
        // Reset password strength
        resetPasswordStrength();
        // Clear match status
        const matchStatus = document.getElementById('password-match-status');
        if (matchStatus) matchStatus.innerHTML = '';
    }
}

// Đóng modal đổi mật khẩu
function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form nhập liệu
        document.getElementById('change-password-form').reset();
        
        // Reset lại icon con mắt (nếu đang xem mật khẩu thì tắt đi)
        const inputs = modal.querySelectorAll('.password-input-wrapper input');
        const icons = modal.querySelectorAll('.toggle-password i');
        inputs.forEach(input => input.type = 'password');
        icons.forEach(icon => {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        });
    }
}

// Reset password strength indicators
function resetPasswordStrength() {
    const bars = document.querySelectorAll('.strength-bar');
    bars.forEach(bar => bar.classList.remove('active'));
    const strengthText = document.querySelector('.strength-text');
    if (strengthText) strengthText.textContent = '';
    
    // Reset requirement items
    const requirements = ['req-length', 'req-uppercase', 'req-lowercase', 'req-number', 'req-special'];
    requirements.forEach(req => {
        const element = document.getElementById(req);
        if (element) {
            element.classList.remove('valid', 'invalid');
            element.classList.add('invalid');
            const icon = element.querySelector('i');
            if (icon) icon.className = 'fas fa-circle';
        }
    });
}

// Đánh giá độ mạnh của mật khẩu
function evaluatePasswordStrength(password) {
    let strength = 0;
    const checks = {
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Update requirement UI
    const requirements = {
        'req-length': checks.length,
        'req-uppercase': checks.uppercase,
        'req-lowercase': checks.lowercase,
        'req-number': checks.number,
        'req-special': checks.special
    };
    
    Object.entries(requirements).forEach(([id, isValid]) => {
        const element = document.getElementById(id);
        if (element) {
            if (isValid) {
                element.classList.remove('invalid');
                element.classList.add('valid');
                const icon = element.querySelector('i');
                if (icon) icon.className = 'fas fa-check-circle';
                strength++;
            } else {
                element.classList.remove('valid');
                element.classList.add('invalid');
                const icon = element.querySelector('i');
                if (icon) icon.className = 'fas fa-circle';
            }
        }
    });
    
    // Update strength bars
    const bars = document.querySelectorAll('.strength-bar');
    const strengthLevel = Math.floor(strength * bars.length / 5);
    
    bars.forEach((bar, index) => {
        if (index < strengthLevel) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    });
    
    // Update strength text
    const strengthText = document.querySelector('.strength-text');
    if (strengthText) {
        if (strength <= 2) {
            strengthText.textContent = 'Yếu';
            strengthText.style.color = '#ff4444';
        } else if (strength <= 3) {
            strengthText.textContent = 'Trung bình';
            strengthText.style.color = '#ffde59';
        } else if (strength <= 4) {
            strengthText.textContent = 'Mạnh';
            strengthText.style.color = '#05ffa1';
        } else if (strength === 5) {
            strengthText.textContent = 'Rất mạnh';
            strengthText.style.color = '#00f3ff';
        }
    }
    
    return strength;
}

// Kiểm tra mật khẩu xác nhận
function checkPasswordMatch() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const matchStatus = document.getElementById('password-match-status');
    
    if (confirmPassword === '') {
        matchStatus.innerHTML = '';
        return;
    }
    
    if (newPassword === confirmPassword) {
        matchStatus.innerHTML = '<i class="fas fa-check-circle"></i> Mật khẩu xác nhận chính xác';
        matchStatus.className = 'password-match-status match';
    } else {
        matchStatus.innerHTML = '<i class="fas fa-times-circle"></i> Mật khẩu xác nhận không khớp';
        matchStatus.className = 'password-match-status not-match';
    }
}

// Hiển thị/ẩn mật khẩu
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Submit đổi mật khẩu
async function submitChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate
    if (!currentPassword) {
        showNotification('Vui lòng nhập mật khẩu hiện tại', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }
    
    // Check password strength
    const strength = evaluatePasswordStrength(newPassword);
    if (strength < 3) {
        if (!confirm('Mật khẩu của bạn khá yếu. Bạn có chắc muốn tiếp tục?')) {
            return;
        }
    }
    
    // Disable submit button
    const submitBtn = document.getElementById('submit-password-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    
    try {
        // Gọi API đổi mật khẩu
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                currentPassword, 
                newPassword, 
                confirmPassword 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
            closeChangePasswordModal();
            
            // Tự động đăng xuất sau 2 giây
            setTimeout(() => {
                if (confirm('Mật khẩu đã được thay đổi. Bạn có muốn đăng nhập lại không?')) {
                    window.location.href = '/dangnhap';
                }
            }, 2000);
        } else {
            showNotification(data.message || 'Đổi mật khẩu thất bại', 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification('Lỗi kết nối đến server', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Đóng modal khi click outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('change-password-modal');
    if (modal && modal.style.display === 'flex') {
        if (e.target.classList.contains('modal-overlay')) {
            closeChangePasswordModal();
        }
    }
    
    const orderModal = document.getElementById('order-detail-modal');
    if (orderModal && orderModal.style.display === 'flex') {
        if (e.target.classList.contains('modal-overlay')) {
            closeOrderDetailModal();
        }
    }
});

// Đóng modal bằng phím Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeChangePasswordModal();
        closeOrderDetailModal();
    }
});

// Thêm event listeners cho password fields
document.addEventListener('DOMContentLoaded', function() {
    // Password strength checker
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            evaluatePasswordStrength(e.target.value);
            checkPasswordMatch();
        });
    }
    
    // Confirm password checker
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
});

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

// Các hàm placeholder
function addAddress() {
    showNotification('Tính năng đang phát triển', 'info');
}

function editAddress(id) {
    showNotification('Tính năng đang phát triển', 'info');
}

function deleteAddress(id) {
    if (confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
        showNotification('Tính năng đang phát triển', 'info');
    }
}

function removeFromWishlist(productId) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm khỏi danh sách yêu thích?')) {
        showNotification('Tính năng đang phát triển', 'info');
    }
}

function addToCart(productId) {
    showNotification('Đã thêm vào giỏ hàng!', 'success');
}

function saveSettings() {
    showNotification('Đã lưu cài đặt!', 'success');
}

function deleteAccount() {
    if (confirm('Hành động này không thể hoàn tác. Bạn có chắc muốn xóa tài khoản?')) {
        showNotification('Vui lòng liên hệ support để xóa tài khoản', 'info');
    }
}

// Gán sự kiện khi trang load
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    
    // Xử lý chuyển tab
    const menuItems = document.querySelectorAll('.menu-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('page-title');
    
    const tabTitles = {
        'dashboard': 'Tổng quan',
        'profile': 'Thông tin tài khoản',
        'orders': 'Đơn hàng của tôi',
        'addresses': 'Sổ địa chỉ',
        'wishlist': 'Yêu thích',
        'rewards': 'Điểm thưởng',
        'settings': 'Cài đặt'
    };

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            const targetTabId = this.getAttribute('data-tab');
            const targetPane = document.getElementById(targetTabId);

            if (targetPane) {
                menuItems.forEach(menu => menu.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                this.classList.add('active');
                targetPane.classList.add('active');
                
                if (pageTitle && tabTitles[targetTabId]) {
                    const iconClass = this.querySelector('i').className;
                    pageTitle.innerHTML = `<i class="${iconClass}"></i> ${tabTitles[targetTabId]}`;
                }
                
                // Load dữ liệu khi chuyển tab
                if (targetTabId === 'orders') {
                    loadOrders(1, currentOrderStatus);
                } else if (targetTabId === 'addresses') {
                    loadAddresses();
                } else if (targetTabId === 'wishlist') {
                    loadWishlist();
                }
            }
        });
    });

    // Gán sự kiện cho form
    const profileForm = document.getElementById('update-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }
    
    // Gán sự kiện lọc đơn hàng
    const orderFilter = document.getElementById('order-status-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', (e) => {
            loadOrders(1, e.target.value);
        });
    }
});