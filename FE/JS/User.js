// Thêm vào đầu file User.js - các hàm gọi API

// Lấy thông tin người dùng khi load trang
async function loadUserData() {
    try {
        const profileRes = await fetch('/api/user/profile', {
            credentials: 'include'
        });
        
        // --- THÊM ĐOẠN NÀY ---
        // Nếu server trả về 401 (Unauthorized - Chưa đăng nhập)
        if (profileRes.status === 401) {
            console.log("Khách chưa đăng nhập. Duyệt web ẩn danh.");
            
            // Tùy chọn: Nếu người dùng đang cố tình vào trang cá nhân (/user) thì mới đá ra trang login
            if (window.location.pathname === '/user') {
                 window.location.href = '/login'; 
            }
            return; // Dừng hàm tại đây, không báo lỗi, không làm chết Javascript
        }
        // ----------------------

        // Nếu có data trả về bình thường (Đã đăng nhập)
        const profileData = await profileRes.json();
        
        if (profileData.success) {
            const user = profileData.data;
            
            // Cập nhật Header (Avatar, Tên...)
            const headerAvatarImg = document.getElementById('header-avatar-img');
            if (headerAvatarImg && user.avatar) {
                headerAvatarImg.src = user.avatar;
                //... code xử lý giao diện tiếp theo của bạn
            }
        }
    } catch (err) {
        console.log("Lỗi tải thông tin user: ", err);
    }
}

// Cập nhật danh sách đơn hàng gần đây
function updateRecentOrders(orders) {
    const recentOrdersContainer = document.querySelector('.recent-orders');
    if (!recentOrdersContainer) return;
    
    let html = '<h3 class="section-title"><i class="fas fa-history"></i> Đơn hàng gần đây</h3>';
    
    orders.forEach(order => {
        html += `
            <div class="order-item" onclick="viewOrder('${order.id}')">
                <div class="order-img"><i class="fas fa-box"></i></div>
                <div class="order-info">
                    <div class="order-name">Đơn hàng #${order.id}</div>
                    <div class="order-meta">
                        <span>Ngày: ${order.date}</span>
                    </div>
                </div>
                <div class="order-status status-${order.statusClass}">${order.statusText}</div>
                <div class="order-price">${order.total.toLocaleString('vi-VN')}₫</div>
            </div>
        `;
    });
    
    recentOrdersContainer.innerHTML = html;
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
            // Cập nhật tên hiển thị trên sidebar
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
            // 1. Cập nhật avatar ở khu vực thông tin tài khoản (Giữa trang)
            const avatarImg = document.querySelector('#user-avatar-img');
            const defaultIcon = document.querySelector('#default-avatar-icon');
            if (avatarImg) {
                avatarImg.src = data.data.avatarUrl;
                avatarImg.style.display = 'block';
            }
            if (defaultIcon) {
                defaultIcon.style.display = 'none';
            }

            // 2. Cập nhật avatar trên Header (Góc trên cùng bên phải)
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

// Đổi mật khẩu
async function changePassword() {
    const currentPassword = prompt('Nhập mật khẩu hiện tại:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Nhập mật khẩu mới (ít nhất 6 ký tự):');
    if (!newPassword || newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    const confirmPassword = prompt('Xác nhận mật khẩu mới:');
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/user/change-password', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Đổi mật khẩu thành công!', 'success');
        } else {
            showNotification(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        showNotification('Lỗi kết nối đến server', 'error');
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
            // Tải lại danh sách đơn hàng
            loadUserData();
        } else {
            showNotification(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Xem chi tiết đơn hàng
async function viewOrder(orderId) {
    try {
        const response = await fetch(`/api/user/orders/${orderId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const order = data.data;
            let message = `Đơn hàng #${order.MaDonHang}\n`;
            message += `Ngày đặt: ${new Date(order.NgayDat).toLocaleDateString('vi-VN')}\n`;
            message += `Trạng thái: ${order.TrangThai}\n`;
            message += `Tổng tiền: ${order.TongTien?.toLocaleString('vi-VN')}₫\n`;
            message += `\nSản phẩm:\n`;
            
            order.items.forEach(item => {
                message += `- ${item.TenSanPham}: ${item.SoLuong} x ${item.Gia.toLocaleString('vi-VN')}₫\n`;
            });
            
            alert(message);
        } else {
            showNotification('Không thể tải chi tiết đơn hàng', 'error');
        }
    } catch (error) {
        showNotification('Lỗi kết nối đến server', 'error');
    }
}

// Logout function
async function logout() {
    playSoundEffect('click');
    
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        try {
            // Gọi API đăng xuất để Backend xóa Cookie chứa token
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();

            if (data.success) {
                showNotification('Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    // Chuyển hướng về route /dangnhap (không có đuôi .ejs)
                    window.location.href = '/dangnhap';
                }, 1500);
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error'); // Thay bằng hàm báo lỗi của bạn nếu có
        }
    }
}

// Gán sự kiện khi trang load
// Gán sự kiện khi trang load
document.addEventListener('DOMContentLoaded', () => {
    // Load dữ liệu
    loadUserData();
    
    // --- BỔ SUNG ĐOẠN CODE CHUYỂN TAB NÀY VÀO ĐÂY ---
    const menuItems = document.querySelectorAll('.menu-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // Ngăn chặn hành vi nhảy trang mặc định của thẻ <a>

            // Lấy ID của tab cần chuyển tới
            const targetTabId = this.getAttribute('data-tab');
            const targetPane = document.getElementById(targetTabId);

            // Chỉ xử lý nếu tìm thấy tab nội dung tương ứng
            if (targetPane) {
                // 1. Xóa class 'active' khỏi tất cả menu và tab-pane hiện tại
                menuItems.forEach(menu => menu.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // 2. Thêm class 'active' cho menu vừa click và tab-pane tương ứng
                this.classList.add('active');
                targetPane.classList.add('active');
            }
        });
    });
    // -----------------------------------------------

    // Gán sự kiện cho form cập nhật profile
    const profileForm = document.getElementById('update-profile-form');
    // ... (Các code cũ của bạn giữ nguyên bên dưới)
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }
    
    // Gán sự kiện cho nút đổi mật khẩu (nếu có)
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
});