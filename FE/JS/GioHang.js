// API Base URL
const API_BASE_URL = '/api/cart';

// Cart data - sẽ được load từ API
let cartItems = [];
let appliedDiscount = null;
let discountAmount = 0;
let shippingFee = 0;

// Discount codes (giả lập - thực tế nên lưu ở backend)
const discountCodes = {
    "GAMING50": { discount: 0.5, type: "percent" },
    "SAVE100K": { discount: 100000, type: "fixed" },
    "FREESHIP": { discount: 50000, type: "fixed" },
    "WELCOME": { discount: 0.1, type: "percent" }
};

// DOM Elements
const cartItemsBody = document.getElementById('cart-items-body');
const selectAllCheckbox = document.getElementById('select-all');
const cartCount = document.getElementById('cart-count');
const subtotalElement = document.getElementById('subtotal');
const discountAmountElement = document.getElementById('discount-amount');
const totalElement = document.getElementById('total');
const shippingElement = document.getElementById('shipping');

// Initialize cart - Load từ API
document.addEventListener('DOMContentLoaded', async function() {
    await loadCartFromAPI();
    renderCartItems();
    updateCartSummary();
    updateCartCount();
    
    // Add loading overlay to body if not exists
    if (!document.querySelector('.loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    }
});

// Load cart từ API
async function loadCartFromAPI() {
    showLoading();
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Quan trọng: gửi cookie token
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Chuyển đổi dữ liệu từ API sang format hiển thị
            cartItems = result.data.map(item => ({
                MaChiTiet: item.MaChiTiet,
                MaSanPham: item.MaSanPham,
                name: item.TenSanPham,
                price: parseFloat(item.Gia),
                quantity: item.SoLuong,
                selected: true,
                image: item.HinhAnh || null, // Lưu URL hình ảnh thật
                inStock: true,
                specs: []
            }));
        } else {
            showNotification('Vui lòng đăng nhập để xem giỏ hàng', 'error');
        }
    } catch (error) {
        console.error('Lỗi tải giỏ hàng:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        hideLoading();
    }
}

// Helper: Xử lý URL hình ảnh
function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    // Nếu URL bắt đầu bằng /uploads/ hoặc http thì giữ nguyên
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/uploads')) {
        return imageUrl;
    }
    // Nếu là đường dẫn tương đối, thêm prefix
    return imageUrl;
}

// Render cart items với dữ liệu từ API
function renderCartItems() {
    if (cartItems.length === 0) {
        cartItemsBody.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>Giỏ hàng trống</h3>
                <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <button class="shop-now-btn" onclick="continueShopping()">
                    <i class="fas fa-shopping-bag"></i>
                    Mua sắm ngay
                </button>
            </div>
        `;
        return;
    }

    let html = '';
    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const formattedPrice = formatPrice(item.price);
        const formattedTotal = formatPrice(itemTotal);
        const imageUrl = getImageUrl(item.image);

        html += `
            <div class="cart-item" data-id="${item.MaChiTiet}" data-product="${item.MaSanPham}" style="animation: slideInRight 0.3s ease ${index * 0.05}s both;">
                <input type="checkbox" class="item-checkbox" ${item.selected ? 'checked' : ''} onchange="toggleItemSelect(${item.MaChiTiet})">
                
                <div class="item-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-box\\'></i>';">` : 
                        `<i class="fas fa-box"></i>`
                    }
                </div>
                
                <div class="item-info">
                    <h4 class="item-name">${escapeHtml(item.name)}</h4>
                    <div class="item-specs">
                        ${item.specs.map(spec => `<span><i class="fas fa-microchip"></i> ${escapeHtml(spec)}</span>`).join('')}
                    </div>
                    ${!item.inStock ? '<p style="color: var(--neon-pink); margin-top: 8px; font-size: 0.85rem;"><i class="fas fa-exclamation-triangle"></i> Hết hàng tạm thời</p>' : ''}
                </div>

                <div class="item-price-group">
                    <div class="item-price">
                        <span class="current-price">${formattedPrice}</span>
                    </div>
                    
                    <div class="item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.MaChiTiet}, ${item.MaSanPham}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn" onclick="updateQuantity(${item.MaChiTiet}, ${item.MaSanPham}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="item-total">
                        ${formattedTotal}
                    </div>
                </div>
                
                <div class="item-actions">
                    <button class="action-btn delete" onclick="removeItem(${item.MaChiTiet})" title="Xóa sản phẩm">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });

    cartItemsBody.innerHTML = html;
}

// Escape HTML để tránh XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Format price
function formatPrice(price) {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '₫';
}

// Update quantity - Gọi API
async function updateQuantity(maChiTiet, maSanPham, change) {
    const item = cartItems.find(item => item.MaChiTiet === maChiTiet);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            showLoading();
            
            try {
                // Gọi API thêm sản phẩm (sẽ cập nhật số lượng)
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        maSanPham: maSanPham,
                        soLuong: change
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Reload lại giỏ hàng để lấy dữ liệu mới
                    await loadCartFromAPI();
                    renderCartItems();
                    updateCartSummary();
                    updateCartCount();
                    
                    // Highlight the updated item
                    const itemElement = document.querySelector(`.cart-item[data-id="${maChiTiet}"]`);
                    if (itemElement) {
                        itemElement.style.borderColor = 'var(--neon-green)';
                        setTimeout(() => {
                            itemElement.style.borderColor = '';
                        }, 500);
                    }
                    
                    playSoundEffect('click');
                } else {
                    showNotification(result.message || 'Cập nhật thất bại', 'error');
                }
            } catch (error) {
                console.error('Lỗi cập nhật số lượng:', error);
                showNotification('Lỗi kết nối server', 'error');
            } finally {
                hideLoading();
            }
        }
    }
}

// Toggle item select
function toggleItemSelect(maChiTiet) {
    const item = cartItems.find(item => item.MaChiTiet === maChiTiet);
    if (item) {
        item.selected = !item.selected;
        updateSelectAllState();
        updateCartSummary();
        playSoundEffect('click');
        
        const checkbox = document.querySelector(`.cart-item[data-id="${maChiTiet}"] .item-checkbox`);
        if (checkbox) {
            checkbox.style.transform = 'scale(1.2)';
            setTimeout(() => {
                if (checkbox) checkbox.style.transform = '';
            }, 200);
        }
    }
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = selectAllCheckbox.checked;
    cartItems.forEach(item => {
        item.selected = selectAll;
    });
    
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(cb => {
        cb.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cb.style.transform = '';
        }, 200);
    });
    
    renderCartItems();
    updateCartSummary();
    playSoundEffect('click');
}

// Update select all state
function updateSelectAllState() {
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allSelected;
    }
    
    const selectedCount = cartItems.filter(item => item.selected).length;
    const selectAllSpan = document.querySelector('.select-all span');
    if (selectAllSpan) {
        selectAllSpan.innerHTML = `<i class="fas fa-check-square"></i> Chọn tất cả (${cartItems.length}) - Đã chọn ${selectedCount}`;
    }
}

// Remove single item - Gọi API
async function removeItem(maChiTiet) {
    const item = cartItems.find(item => item.MaChiTiet === maChiTiet);
    if (!item) return;
    
    const result = await showConfirmDialog(`Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng?`);
    if (result) {
        const itemElement = document.querySelector(`.cart-item[data-id="${maChiTiet}"]`);
        if (itemElement) {
            itemElement.style.animation = 'fadeOut 0.3s ease forwards';
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        showLoading();
        
        try {
            const response = await fetch(`${API_BASE_URL}/remove/${maChiTiet}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                await loadCartFromAPI();
                renderCartItems();
                updateCartSummary();
                updateCartCount();
                playSoundEffect('delete');
                showNotification('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
                
                if (cartItems.length === 0) {
                    updateSelectAllState();
                }
            } else {
                showNotification(data.message || 'Xóa thất bại', 'error');
            }
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
            showNotification('Lỗi kết nối server', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Delete selected items
async function deleteSelected() {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
        showNotification('Vui lòng chọn sản phẩm cần xóa', 'error');
        return;
    }

    const result = await showConfirmDialog(`Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`);
    if (result) {
        showLoading();
        
        try {
            // Xóa từng sản phẩm một
            let successCount = 0;
            for (const item of selectedItems) {
                const response = await fetch(`${API_BASE_URL}/remove/${item.MaChiTiet}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) successCount++;
            }
            
            await loadCartFromAPI();
            renderCartItems();
            updateCartSummary();
            updateCartCount();
            playSoundEffect('delete');
            showNotification(`Đã xóa ${successCount} sản phẩm khỏi giỏ hàng`, 'success');
        } catch (error) {
            console.error('Lỗi xóa:', error);
            showNotification('Lỗi kết nối server', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Update cart summary
function updateCartSummary() {
    const selectedItems = cartItems.filter(item => item.selected && item.inStock);
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    calculateDiscount(subtotal);
    
    const finalSubtotal = subtotal - discountAmount;
    shippingFee = finalSubtotal > 1000000 ? 0 : 30000;
    
    const total = finalSubtotal + shippingFee;
    
    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (discountAmountElement) discountAmountElement.textContent = formatPrice(discountAmount);
    if (totalElement) totalElement.textContent = formatPrice(total);
    
    if (shippingElement) {
        if (shippingFee === 0) {
            shippingElement.innerHTML = '<span style="color: var(--neon-green);"><i class="fas fa-truck"></i> Miễn phí vận chuyển</span>';
        } else {
            shippingElement.textContent = formatPrice(shippingFee);
        }
    }
    
    const selectedCount = selectedItems.length;
    const selectAllSpan = document.querySelector('.select-all span');
    if (selectAllSpan) {
        selectAllSpan.innerHTML = `<i class="fas fa-check-square"></i> Chọn tất cả (${cartItems.length}) - Đã chọn ${selectedCount}`;
    }
}

// Calculate discount
function calculateDiscount(subtotal) {
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percent') {
            discountAmount = subtotal * appliedDiscount.discount;
        } else {
            discountAmount = Math.min(appliedDiscount.discount, subtotal);
        }
    } else {
        discountAmount = 0;
    }
}

// Apply discount code
function applyDiscount() {
    const discountCode = document.getElementById('discount-code').value.trim().toUpperCase();
    
    if (!discountCode) {
        showNotification('Vui lòng nhập mã giảm giá', 'info');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        if (discountCodes[discountCode]) {
            appliedDiscount = discountCodes[discountCode];
            
            let discountText = '';
            if (appliedDiscount.type === 'percent') {
                discountText = `${appliedDiscount.discount * 100}%`;
            } else {
                discountText = formatPrice(appliedDiscount.discount);
            }
            
            showNotification(`Áp dụng mã giảm giá thành công! Giảm ${discountText}`, 'success');
            playSoundEffect('success');
            
            const discountInput = document.getElementById('discount-code');
            discountInput.style.borderColor = 'var(--neon-green)';
            setTimeout(() => {
                discountInput.style.borderColor = '';
            }, 1000);
        } else {
            appliedDiscount = null;
            showNotification('Mã giảm giá không hợp lệ!', 'error');
            playSoundEffect('error');
        }
        
        updateCartSummary();
        hideLoading();
    }, 500);
}

// Update cart count
function updateCartCount() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.innerHTML = `<i class="fas fa-shopping-cart"></i> ${totalItems} sản phẩm`;
    }
}

// checkout function
async function checkout() {
    const selectedItems = cartItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        showNotification('Vui lòng chọn sản phẩm để thanh toán', 'error');
        return;
    }

    const outOfStockItems = selectedItems.filter(item => !item.inStock);
    if (outOfStockItems.length > 0) {
        showNotification('Một số sản phẩm đã hết hàng. Vui lòng kiểm tra lại.', 'error');
        return;
    }

    showLoading();
    playSoundEffect('success');
    
    // Lưu thông tin đơn hàng vào session storage
    const orderData = {
        items: selectedItems.map(item => ({
            maSanPham: item.MaSanPham,
            tenSanPham: item.name,
            soLuong: item.quantity,
            gia: item.price,
            thanhTien: item.price * item.quantity,
            hinhAnh: item.image
        })),
        discountAmount: discountAmount,
        shippingFee: shippingFee
    };
    
    sessionStorage.setItem('checkoutData', JSON.stringify(orderData));
    
    setTimeout(() => {
        hideLoading();
        window.location.href = '/checkout';
    }, 500);
}

// Continue shopping
function continueShopping() {
    playSoundEffect('click');
    showNotification('Đang chuyển đến trang sản phẩm...', 'info');
    setTimeout(() => {
        window.location.href = '/';
    }, 800);
}

// Show loading overlay
function showLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Custom confirm dialog
function showConfirmDialog(message) {
    return new Promise((resolve) => {
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'notification info';
        confirmDiv.style.position = 'fixed';
        confirmDiv.style.top = '50%';
        confirmDiv.style.left = '50%';
        confirmDiv.style.transform = 'translate(-50%, -50%)';
        confirmDiv.style.zIndex = '10001';
        confirmDiv.style.maxWidth = '400px';
        confirmDiv.style.textAlign = 'center';
        confirmDiv.style.flexDirection = 'column';
        confirmDiv.style.gap = '20px';
        
        confirmDiv.innerHTML = `
            <i class="fas fa-question-circle" style="font-size: 48px;"></i>
            <p style="margin: 0;">${escapeHtml(message)}</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button class="apply-btn" style="background: var(--neon-green); color: var(--dark-bg);" onclick="this.closest('.notification').remove(); window.__confirmResult(true)">Đồng ý</button>
                <button class="apply-btn" style="background: var(--neon-pink);" onclick="this.closest('.notification').remove(); window.__confirmResult(false)">Hủy</button>
            </div>
        `;
        
        window.__confirmResult = (result) => {
            delete window.__confirmResult;
            resolve(result);
        };
        
        document.body.appendChild(confirmDiv);
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification:not([style*="top: 50%"])');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    else if (type === 'info') icon = '<i class="fas fa-info-circle"></i>';
    
    notification.innerHTML = `${icon} ${escapeHtml(message)}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, 3000);
}

// Play sound effects
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
        
        if (type === 'click') {
            oscillator.frequency.value = 800;
        } else if (type === 'success') {
            oscillator.frequency.value = 1200;
        } else if (type === 'error') {
            oscillator.frequency.value = 400;
        } else if (type === 'delete') {
            oscillator.frequency.value = 300;
        }
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 150);
    } catch (e) {}
}

// Add CSS animation for fadeOut
if (!document.querySelector('#cart-animation-style')) {
    const style = document.createElement('style');
    style.id = 'cart-animation-style';
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Add keyboard event for discount code input
document.addEventListener('keypress', function(e) {
    if (e.target.id === 'discount-code' && e.key === 'Enter') {
        applyDiscount();
    }
});