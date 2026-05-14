// checkout.js - Xử lý thanh toán với 2 lựa chọn thông tin

let orderData = null;
let selectedInfoType = 'saved'; // 'saved' or 'new'
let selectedAddressId = null;
let userAddresses = [];
let userProfile = null;

// DOM Elements
const checkoutForm = document.getElementById('checkout-form');

document.addEventListener('DOMContentLoaded', async function() {
    // Lấy dữ liệu từ sessionStorage
    const storedData = sessionStorage.getItem('checkoutData');
    
    if (!storedData) {
        showNotification('Không có dữ liệu đơn hàng. Vui lòng quay lại giỏ hàng.', 'error');
        setTimeout(() => {
            window.location.href = '/cart';
        }, 2000);
        return;
    }
    
    orderData = JSON.parse(storedData);
    
    // Hiển thị thông tin đơn hàng
    renderOrderSummary();
    updateSummaryTotals();
    
    // Tải thông tin người dùng và địa chỉ
    await loadUserData();
});

// Tải thông tin người dùng và địa chỉ
async function loadUserData() {
    try {
        // Tải thông tin profile
        const profileRes = await fetch('/api/user/profile', {
            credentials: 'include'
        });
        
        if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.success) {
                userProfile = profileData.data;
            }
        }
        
        // Tải danh sách địa chỉ
        await loadSavedAddresses();
        
    } catch (error) {
        console.error('Lỗi tải thông tin user:', error);
    }
}

// Tải danh sách địa chỉ đã lưu
async function loadSavedAddresses() {
    try {
        const response = await fetch('/api/user/addresses', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                userAddresses = data.data;
                renderSavedAddresses();
            } else {
                renderEmptyAddresses();
            }
        } else {
            renderEmptyAddresses();
        }
    } catch (error) {
        console.error('Lỗi tải địa chỉ:', error);
        renderEmptyAddresses();
    }
}

// Hiển thị danh sách địa chỉ đã lưu
function renderSavedAddresses() {
    const container = document.getElementById('saved-addresses-list');
    if (!container) return;
    
    if (!userAddresses || userAddresses.length === 0) {
        container.innerHTML = `
            <div class="no-address-message">
                <i class="fas fa-map-marker-alt"></i>
                <p>Bạn chưa có địa chỉ nào trong sổ địa chỉ</p>
                <button type="button" class="btn btn-secondary" style="margin-top: 10px;" onclick="selectInfoType('new')">
                    <i class="fas fa-plus"></i> Thêm địa chỉ mới
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    userAddresses.forEach(addr => {
        const isDefault = addr.isDefault === 1 || addr.isDefault === true;
        html += `
            <div class="address-option ${selectedAddressId === addr.id ? 'selected' : ''}" onclick="selectAddress(${addr.id})">
                <div class="address-option-radio"></div>
                <div class="address-option-content">
                    <div class="address-option-name">
                        ${escapeHtml(addr.fullname || userProfile?.TenNguoiDung || 'Khách hàng')}
                        ${isDefault ? '<span class="address-default-badge">Mặc định</span>' : ''}
                    </div>
                    <div class="address-option-detail">
                        ${escapeHtml(addr.address || '')}<br>
                        SĐT: ${escapeHtml(addr.phone || '')}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Tự động chọn địa chỉ mặc định nếu có
    const defaultAddress = userAddresses.find(addr => addr.isDefault === 1 || addr.isDefault === true);
    if (defaultAddress && !selectedAddressId) {
        selectAddress(defaultAddress.id);
    }
}

function renderEmptyAddresses() {
    const container = document.getElementById('saved-addresses-list');
    if (container) {
        container.innerHTML = `
            <div class="no-address-message">
                <i class="fas fa-map-marker-alt"></i>
                <p>Không thể tải danh sách địa chỉ</p>
            </div>
        `;
    }
}

// Chọn loại thông tin
function selectInfoType(type) {
    selectedInfoType = type;
    
    // Cập nhật UI
    document.querySelectorAll('.info-type-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector(`.info-type-option[data-type="${type}"]`).classList.add('active');
    
    // Hiển thị section tương ứng
    document.getElementById('saved-info-section').classList.toggle('active', type === 'saved');
    document.getElementById('new-info-section').classList.toggle('active', type === 'new');
    
    // Nếu chọn thông tin mới, focus vào ô đầu tiên
    if (type === 'new') {
        document.getElementById('newHoTen').focus();
    }
}

// Chọn địa chỉ từ danh sách
function selectAddress(addressId) {
    selectedAddressId = addressId;
    
    // Cập nhật UI
    document.querySelectorAll('.address-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    const selectedElement = document.querySelector(`.address-option[onclick="selectAddress(${addressId})"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
}

// Render order summary
function renderOrderSummary() {
    const container = document.getElementById('order-items-container');
    if (!container) return;
    
    if (!orderData.items || orderData.items.length === 0) {
        container.innerHTML = '<p>Không có sản phẩm nào</p>';
        return;
    }
    
    let html = '';
    orderData.items.forEach(item => {
        html += `
            <div class="checkout-item">
                <div class="checkout-item-img">
                    ${item.hinhAnh ? 
                        `<img src="${item.hinhAnh}" alt="${escapeHtml(item.tenSanPham)}" onerror="this.src='/img/default-product.png'">` : 
                        '<i class="fas fa-box"></i>'
                    }
                </div>
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${escapeHtml(item.tenSanPham)}</div>
                    <div class="checkout-item-price">${formatPrice(item.gia)} x ${item.soLuong}</div>
                </div>
                <div class="checkout-item-total">${formatPrice(item.thanhTien)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update summary totals
function updateSummaryTotals() {
    const subtotal = orderData.items.reduce((sum, item) => sum + item.thanhTien, 0);
    const discount = orderData.discountAmount || 0;
    const shipping = orderData.shippingFee || 0;
    const total = subtotal - discount + shipping;
    
    document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('checkout-discount').textContent = formatPrice(discount);
    document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    document.getElementById('checkout-total').textContent = formatPrice(total);
}

// Lấy thông tin giao hàng từ form
function getShippingInfo() {
    if (selectedInfoType === 'saved' && selectedAddressId) {
        const address = userAddresses.find(addr => addr.id === selectedAddressId);
        if (address) {
            return {
                hoTen: address.fullname || userProfile?.TenNguoiDung || '',
                soDienThoai: address.phone || '',
                diaChi: address.address || ''
            };
        }
    }
    
    // Lấy từ form thông tin mới
    return {
        hoTen: document.getElementById('newHoTen')?.value.trim() || userProfile?.TenNguoiDung || '',
        soDienThoai: document.getElementById('newSoDienThoai')?.value.trim() || '',
        diaChi: document.getElementById('newDiaChi')?.value.trim() || ''
    };
}

// Validate thông tin
function validateShippingInfo(shippingInfo) {
    if (!shippingInfo.soDienThoai) {
        showNotification('Vui lòng nhập số điện thoại', 'error');
        return false;
    }
    
    if (!shippingInfo.diaChi) {
        showNotification('Vui lòng nhập địa chỉ giao hàng', 'error');
        return false;
    }
    
    // Validate số điện thoại (10-11 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingInfo.soDienThoai.replace(/[^0-9]/g, ''))) {
        showNotification('Số điện thoại không hợp lệ (10-11 số)', 'error');
        return false;
    }
    
    return true;
}

// Xử lý submit form thanh toán
checkoutForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Lấy thông tin giao hàng
    const shippingInfo = getShippingInfo();
    
    // Validate
    if (!validateShippingInfo(shippingInfo)) {
        return;
    }
    
    const ghiChu = document.getElementById('ghiChu').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Tính tổng tiền
    const subtotal = orderData.items.reduce((sum, item) => sum + item.thanhTien, 0);
    const discount = orderData.discountAmount || 0;
    const shipping = orderData.shippingFee || 0;
    const total = subtotal - discount + shipping;
    
    const requestData = {
        hoTen: shippingInfo.hoTen,
        diaChi: shippingInfo.diaChi,
        soDienThoai: shippingInfo.soDienThoai,
        ghiChu: ghiChu,
        phuongThucThanhToan: paymentMethod,
        tongTien: total,
        phiVanChuyen: shipping,
        giamGia: discount
    };
    
    showLoading();
    
    try {
        const response = await fetch('/api/orders/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Đặt hàng thành công!', 'success');
            playSoundEffect('success');
            
            // Xóa dữ liệu checkout khỏi sessionStorage
            sessionStorage.removeItem('checkoutData');
            
            // Chuyển đến trang đơn hàng
            setTimeout(() => {
                window.location.href = `/user?tab=orders`;
            }, 2000);
        } else {
            showNotification(result.message || 'Đặt hàng thất bại', 'error');
            playSoundEffect('error');
        }
    } catch (error) {
        console.error('Lỗi thanh toán:', error);
        showNotification('Lỗi kết nối server', 'error');
        playSoundEffect('error');
    } finally {
        hideLoading();
    }
});

function formatPrice(price) {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '₫';
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

function showLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    let icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function playSoundEffect(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
        
        oscillator.frequency.value = type === 'success' ? 1200 : 400;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 150);
    } catch (e) {}
}