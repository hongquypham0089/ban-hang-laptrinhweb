// Product data for related products
const relatedProducts = [
    { id: 1, name: "Laptop Gaming ASUS ROG Strix G16", price: "28.990.000 ₫", icon: "fas fa-laptop" },
    { id: 2, name: "PC Gaming RTX 4070 Ti", price: "42.990.000 ₫", icon: "fas fa-desktop" },
    { id: 3, name: "Bàn phím cơ Razer Huntsman V2", price: "3.890.000 ₫", icon: "fas fa-keyboard" },
    { id: 4, name: "Chuột Logitech G Pro X Superlight", price: "2.590.000 ₫", icon: "fas fa-mouse" },
    { id: 5, name: "Tai nghe SteelSeries Arctis Nova Pro", price: "7.490.000 ₫", icon: "fas fa-headphones" },
    { id: 6, name: "Màn hình Samsung Odyssey G7", price: "15.990.000 ₫", icon: "fas fa-tv" },
    { id: 7, name: "Ghế Gaming Secretlab Titan", price: "11.990.000 ₫", icon: "fas fa-chair" },
    { id: 8, name: "Loa Gaming Razer Nommo V2", price: "12.500.000 ₫", icon: "fas fa-volume-up" },
    { id: 9, name: "Bàn di chuột Artisan Hien", price: "1.890.000 ₫", icon: "fas fa-mouse-pointer" },
    { id: 10, name: "Webcam Logitech Brio 4K", price: "4.290.000 ₫", icon: "fas fa-video" }
];

// DOM Elements
const mainImage = document.getElementById('main-image');
const thumbnails = document.querySelectorAll('.thumbnail');
const variantButtons = document.querySelectorAll('.variant-btn');
const buyNowBtn = document.querySelector('.buy-now-btn');
const addToCartBtn = document.querySelector('.add-to-cart-btn');
const relatedGrid = document.getElementById('related-products');
const loadMoreBtn = document.getElementById('load-more');

let displayedRelatedProducts = 5;
let isProcessing = false; // Để tránh click nhiều lần

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadRelatedProducts();
    setupEventListeners();
    setupAnimations();
});

// Load related products
function loadRelatedProducts() {
    if (!relatedGrid) return;
    
    relatedGrid.innerHTML = '';
    
    const productsToShow = relatedProducts.slice(0, displayedRelatedProducts);
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'related-product-card';
        
        productCard.innerHTML = `
            <div class="related-product-img">
                <i class="${product.icon}"></i>
            </div>
            <div class="related-product-info">
                <h4 class="related-product-name">${product.name}</h4>
                <div class="related-product-price">${product.price}</div>
            </div>
        `;
        
        relatedGrid.appendChild(productCard);
    });
    
    // Update load more button text
    if (loadMoreBtn) {
        if (displayedRelatedProducts >= relatedProducts.length) {
            loadMoreBtn.textContent = "ĐÃ HIỂN THỊ TẤT CẢ";
            loadMoreBtn.disabled = true;
            loadMoreBtn.style.opacity = '0.7';
        } else {
            loadMoreBtn.textContent = `TẢI THÊM SẢN PHẨM (+${Math.min(5, relatedProducts.length - displayedRelatedProducts)})`;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Thumbnail click events
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const imageUrl = this.getAttribute('data-image');
            
            if (mainImage) {
                mainImage.style.opacity = '0';
                setTimeout(() => {
                    if (mainImage) {
                        mainImage.src = imageUrl;
                        mainImage.style.opacity = '1';
                    }
                }, 200);
            }
            
            playSoundEffect('click');
        });
    });
    
    // Variant button click events
    variantButtons.forEach(button => {
        button.addEventListener('click', function() {
            variantButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updatePriceForVariant(this.textContent.trim());
            playSoundEffect('click');
        });
    });
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            playSoundEffect('click');
            displayedRelatedProducts = Math.min(displayedRelatedProducts + 5, relatedProducts.length);
            loadRelatedProducts();
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (loadMoreBtn) loadMoreBtn.style.transform = 'scale(1)';
            }, 200);
        });
    }
}

// Function to get product ID from URL or data attribute
function getProductId() {
    // Lấy từ URL hoặc từ data attribute
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl) return idFromUrl;
    
    // Hoặc lấy từ data attribute trên container
    const productContainer = document.querySelector('.product-detail-container');
    if (productContainer && productContainer.dataset.productId) {
        return productContainer.dataset.productId;
    }
    
    return null;
}

// Function to add product to cart via API
async function addToCartAPI(maSanPham, soLuong = 1) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Gửi cookie token
            body: JSON.stringify({
                maSanPham: maSanPham,
                soLuong: soLuong
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { success: true, message: data.message };
        } else {
            // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
            if (response.status === 401) {
                return { success: false, message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', needLogin: true };
            }
            return { success: false, message: data.message || 'Có lỗi xảy ra' };
        }
    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        return { success: false, message: 'Lỗi kết nối đến server' };
    }
}

// Function: Add to cart (chỉ thêm vào giỏ)
async function addToCart(productId) {
    if (isProcessing) return;
    isProcessing = true;
    
    const maSanPham = productId || getProductId();
    
    if (!maSanPham) {
        showNotification('Không xác định được sản phẩm', 'error');
        isProcessing = false;
        return;
    }
    
    // Disable button temporarily
    const btn = document.querySelector('.add-to-cart-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
    }
    
    const result = await addToCartAPI(maSanPham, 1);
    
    if (result.success) {
        playSoundEffect('cart');
        showNotification('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
        
        // Cập nhật badge giỏ hàng nếu có
        updateCartBadge();
        
        // Animation effect
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> ĐÃ THÊM';
            btn.style.borderColor = 'var(--neon-green)';
            btn.style.color = 'var(--neon-green)';
            
            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-cart-plus"></i> THÊM VÀO GIỎ';
                    btn.style.borderColor = 'var(--neon-blue)';
                    btn.style.color = 'var(--neon-blue)';
                    btn.disabled = false;
                }
            }, 2000);
        }
    } else {
        if (result.needLogin) {
            showNotification(result.message, 'info');
            setTimeout(() => {
                window.location.href = '/dangnhap?redirect=' + encodeURIComponent(window.location.pathname);
            }, 1500);
        } else {
            showNotification(result.message, 'error');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> THÊM VÀO GIỎ';
                btn.disabled = false;
            }
        }
    }
    
    isProcessing = false;
}

// Function: Buy now (thêm vào giỏ và chuyển đến trang giỏ hàng)
async function buyNow(productId) {
    if (isProcessing) return;
    isProcessing = true;
    
    const maSanPham = productId || getProductId();
    
    if (!maSanPham) {
        showNotification('Không xác định được sản phẩm', 'error');
        isProcessing = false;
        return;
    }
    
    // Disable button
    const btn = document.querySelector('.buy-now-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
    }
    
    const result = await addToCartAPI(maSanPham, 1);
    
    if (result.success) {
        playSoundEffect('buy');
        showNotification('Đã thêm vào giỏ hàng! Chuyển đến trang thanh toán...', 'success');
        
        // Cập nhật badge
        updateCartBadge();
        
        // Chuyển hướng đến trang giỏ hàng
        setTimeout(() => {
            window.location.href = '/cart';
        }, 500);
    } else {
        if (result.needLogin) {
            showNotification(result.message, 'info');
            setTimeout(() => {
                window.location.href = '/dangnhap?redirect=' + encodeURIComponent(window.location.pathname);
            }, 1500);
        } else {
            showNotification(result.message, 'error');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-bolt"></i> MUA NGAY';
                btn.disabled = false;
            }
        }
    }
    
    isProcessing = false;
}

// Update cart badge
async function updateCartBadge() {
    try {
        const response = await fetch('/api/cart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                const totalQuantity = result.data.reduce((sum, item) => sum + item.SoLuong, 0);
                const cartCountElement = document.querySelector('.cart-count');
                if (cartCountElement) {
                    cartCountElement.textContent = totalQuantity;
                }
            }
        }
    } catch (error) {
        console.error("Lỗi cập nhật badge giỏ hàng:", error);
    }
}

// Update price based on variant
function updatePriceForVariant(variant) {
    const currentPrice = document.querySelector('.current-price');
    
    if (!currentPrice) return;
    
    // Simulate price changes based on variant
    let newPrice;
    switch(variant) {
        case "Tiêu chuẩn":
            newPrice = "32.990.000 ₫";
            break;
        case "Nâng cấp RAM":
            newPrice = "35.990.000 ₫";
            break;
        default:
            newPrice = "32.990.000 ₫";
    }
    
    currentPrice.style.opacity = '0.5';
    setTimeout(() => {
        if (currentPrice) {
            currentPrice.textContent = newPrice;
            currentPrice.style.opacity = '1';
        }
    }, 300);
}

// Setup animations
function setupAnimations() {
    const guaranteeItems = document.querySelectorAll('.guarantee-item');
    
    guaranteeItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.guarantee-icon i');
            if (icon) {
                const colors = ['var(--neon-blue)', 'var(--neon-purple)', 'var(--neon-pink)', 'var(--neon-green)'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                icon.style.color = randomColor;
                icon.style.textShadow = `0 0 20px ${randomColor}`;
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.guarantee-icon i');
            if (icon) {
                icon.style.color = 'var(--neon-blue)';
                icon.style.textShadow = '0 0 15px var(--neon-blue)';
            }
        });
    });
    
    const relatedCards = document.querySelectorAll('.related-product-card');
    relatedCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.related-product-img i');
            if (icon) {
                const colors = ['var(--neon-blue)', 'var(--neon-purple)', 'var(--neon-pink)'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                icon.style.color = randomColor;
                icon.style.transform = 'scale(1.2)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.related-product-img i');
            if (icon) {
                icon.style.color = 'var(--neon-blue)';
                icon.style.transform = 'scale(1)';
            }
        });
        
        card.addEventListener('click', function() {
            playSoundEffect('click');
            showNotification("Đang chuyển đến trang sản phẩm...", "info");
        });
    });
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
        } else if (type === 'cart') {
            oscillator.frequency.value = 1200;
        } else if (type === 'buy') {
            oscillator.frequency.value = 600;
        }
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
        // Web Audio API not available
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i> ';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i> ';
    else if (type === 'info') icon = '<i class="fas fa-info-circle"></i> ';
    
    notification.innerHTML = icon + message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, rgba(15, 25, 35, 0.98), rgba(10, 20, 30, 0.98));
        color: ${type === 'success' ? 'var(--neon-green)' : type === 'error' ? 'var(--neon-pink)' : 'var(--neon-blue)'};
        padding: 15px 25px;
        border-radius: 12px;
        border-left: 4px solid ${type === 'success' ? 'var(--neon-green)' : type === 'error' ? 'var(--neon-pink)' : 'var(--neon-blue)'};
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px ${type === 'success' ? 'rgba(5, 255, 161, 0.3)' : type === 'error' ? 'rgba(255, 42, 109, 0.3)' : 'rgba(0, 243, 255, 0.3)'};
        z-index: 10000;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        max-width: 350px;
        font-weight: 600;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: 'Exo 2', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        to { opacity: 0; visibility: hidden; }
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    .notification {
        pointer-events: none;
    }
`;
document.head.appendChild(style);