
        // Sample cart data
        let cartItems = [
            {
                id: 1,
                name: "Laptop Gaming ASUS ROG Zephyrus G14",
                category: "Laptop Gaming",
                specs: ["Ryzen 9", "RTX 4060", "32GB RAM"],
                price: 32990000,
                oldPrice: 36990000,
                quantity: 1,
                selected: true,
                image: "fas fa-laptop",
                inStock: true
            },
            {
                id: 2,
                name: "Bàn phím cơ Razer Huntsman V2",
                category: "Bàn phím Gaming",
                specs: ["Switch Purple", "RGB", "Linear"],
                price: 3890000,
                oldPrice: 0,
                quantity: 2,
                selected: true,
                image: "fas fa-keyboard",
                inStock: true
            },
            {
                id: 3,
                name: "Chuột Logitech G Pro X Superlight",
                category: "Chuột Gaming",
                specs: ["Không dây", "25K DPI", "63g"],
                price: 2590000,
                oldPrice: 2990000,
                quantity: 1,
                selected: true,
                image: "fas fa-mouse",
                inStock: true
            },
            {
                id: 4,
                name: "Tai nghe SteelSeries Arctis Nova Pro",
                category: "Tai nghe Gaming",
                specs: ["Wireless", "ANC", "Dolby Atmos"],
                price: 7490000,
                oldPrice: 0,
                quantity: 1,
                selected: false,
                image: "fas fa-headphones",
                inStock: true
            },
            {
                id: 5,
                name: "Màn hình Samsung Odyssey G7",
                category: "Màn hình Gaming",
                specs: ["32 inch", "240Hz", "1ms"],
                price: 15990000,
                oldPrice: 18990000,
                quantity: 1,
                selected: true,
                image: "fas fa-tv",
                inStock: false
            }
        ];

        // DOM Elements
        const cartItemsBody = document.getElementById('cart-items-body');
        const selectAllCheckbox = document.getElementById('select-all');
        const cartCount = document.getElementById('cart-count');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');

        // Initialize cart
        document.addEventListener('DOMContentLoaded', function() {
            renderCartItems();
            updateCartSummary();
            playSoundEffect('click');
        });

        // Render cart items
        function renderCartItems() {
            if (cartItems.length === 0) {
                cartItemsBody.innerHTML = `
                    <div class="empty-cart">
                        <div class="empty-cart-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <h3>Giỏ hàng trống</h3>
                        <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                        <a href="#" class="shop-now-btn" onclick="continueShopping()">
                            <i class="fas fa-shopping-bag"></i>
                            Mua sắm ngay
                        </a>
                    </div>
                `;
                return;
            }

            let html = '';
            cartItems.forEach(item => {
                const itemTotal = item.price * item.quantity;
                const formattedPrice = formatPrice(item.price);
                const formattedOldPrice = item.oldPrice ? formatPrice(item.oldPrice) : '';
                const formattedTotal = formatPrice(itemTotal);

                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <input type="checkbox" class="item-checkbox" ${item.selected ? 'checked' : ''} onchange="toggleItemSelect(${item.id})">
                        
                        <div class="item-image">
                            <i class="${item.image}"></i>
                        </div>
                        
                        <div class="item-info">
                            <h4 class="item-name">${item.name}</h4>
                            <p class="item-category">${item.category}</p>
                            <div class="item-specs">
                                ${item.specs.map(spec => `<span><i class="fas " style="font-size: 6px; vertical-align: middle;"></i> ${spec}</span>`).join('')}
                            </div>
                            ${!item.inStock ? '<p style="color: var(--neon-pink); margin-top: 5px;">Hết hàng tạm thời</p>' : ''}
                        </div>

                        <div class="item-price-group">
                            <div class="item-price">
                                ${item.oldPrice ? `<span class="old-price">${formattedOldPrice}</span>` : ''}
                                <span class="current-price">${formattedPrice}</span>
                                
                            </div>
                            
                            <div class="item-quantity">
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            
                            <div class="item-total">
                                ${formattedTotal}
                            </div>
                        </div>
                        
                        <div class="item-actions">
                            <div class="action-btn wishlist" onclick="moveToWishlist(${item.id})" title="Lưu vào yêu thích">
                                <i class="far fa-heart"></i>
                            </div>
                            <div class="action-btn delete" onclick="removeItem(${item.id})" title="Xóa sản phẩm">
                                <i class="fas fa-trash-alt"></i>
                            </div>
                        </div>
                    </div>
                `;
            });

            cartItemsBody.innerHTML = html;
        }

        // Format price
        function formatPrice(price) {
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫';
    }

        // Update quantity
        function updateQuantity(productId, change) {
            const item = cartItems.find(item => item.id === productId);
            if (item) {
                const newQuantity = item.quantity + change;
                if (newQuantity >= 1 && newQuantity <= 10) {
                    item.quantity = newQuantity;
                    renderCartItems();
                    updateCartSummary();
                    playSoundEffect('click');
                }
            }
        }

        // Toggle item select
        function toggleItemSelect(productId) {
            const item = cartItems.find(item => item.id === productId);
            if (item) {
                item.selected = !item.selected;
                updateSelectAllState();
                updateCartSummary();
                playSoundEffect('click');
            }
        }

        // Toggle select all
        function toggleSelectAll() {
            const selectAll = selectAllCheckbox.checked;
            cartItems.forEach(item => {
                item.selected = selectAll;
            });
            renderCartItems();
            updateCartSummary();
            playSoundEffect('click');
        }

        // Update select all state
        function updateSelectAllState() {
            const allSelected = cartItems.every(item => item.selected);
            selectAllCheckbox.checked = allSelected;
            
            const selectedCount = cartItems.filter(item => item.selected).length;
            document.querySelector('.select-all span').textContent = 
                `Chọn tất cả (${cartItems.length} sản phẩm) - Đã chọn ${selectedCount}`;
        }

        // Remove single item
        function removeItem(productId) {
            if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                cartItems = cartItems.filter(item => item.id !== productId);
                renderCartItems();
                updateCartSummary();
                playSoundEffect('delete');
                showNotification('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
                
                if (cartItems.length === 0) {
                    updateSelectAllState();
                }
            }
        }

        // Delete selected items
        function deleteSelected() {
            const selectedItems = cartItems.filter(item => item.selected);
            if (selectedItems.length === 0) {
                showNotification('Vui lòng chọn sản phẩm cần xóa', 'error');
                return;
            }

            if (confirm(`Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
                cartItems = cartItems.filter(item => !item.selected);
                renderCartItems();
                updateCartSummary();
                playSoundEffect('delete');
                showNotification('Đã xóa các sản phẩm đã chọn', 'success');
            }
        }

        // Move to wishlist
        function moveToWishlist(productId) {
            const item = cartItems.find(item => item.id === productId);
            if (item) {
                showNotification(`Đã lưu "${item.name}" vào danh sách yêu thích`, 'success');
                playSoundEffect('click');
            }
        }

        // Update cart summary
        function updateCartSummary() {
            const selectedItems = cartItems.filter(item => item.selected);
            const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Calculate discount (sample discount)
            const discount = 5000000;
            const total = subtotal - discount;
            
            // Update counts
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = `${totalItems} sản phẩm`;
            
            // Update prices
            subtotalElement.textContent = formatPrice(subtotal);
            totalElement.textContent = formatPrice(total);
            
            // Update select all text
            const selectedCount = selectedItems.length;
            document.querySelector('.select-all span').textContent = 
                `Chọn tất cả (${cartItems.length} sản phẩm) - Đã chọn ${selectedCount}`;
        }

        // Apply discount code
        function applyDiscount() {
            const discountCode = document.getElementById('discount-code').value;
            if (discountCode) {
                playSoundEffect('click');
                showNotification('Mã giảm giá không hợp lệ!', 'error');
            } else {
                showNotification('Vui lòng nhập mã giảm giá', 'info');
            }
        }

        // Checkout
        function checkout() {
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

            playSoundEffect('success');
            showNotification('Đang chuyển đến trang thanh toán...', 'success');
            
            setTimeout(() => {
                // Redirect to checkout page (simulated)
                window.location.href = '#checkout';
            }, 1500);
        }

        // Continue shopping
        function continueShopping() {
            playSoundEffect('click');
            showNotification('Đang chuyển đến trang sản phẩm...', 'info');
            setTimeout(() => {
                window.location.href = '#products';
            }, 1000);
        }

        // Show notification
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

        // Play sound effects
        function playSoundEffect(type) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                if (type === 'click') {
                    oscillator.frequency.value = 800;
                    gainNode.gain.value = 0.1;
                } else if (type === 'success') {
                    oscillator.frequency.value = 1200;
                    gainNode.gain.value = 0.1;
                } else if (type === 'error') {
                    oscillator.frequency.value = 400;
                    gainNode.gain.value = 0.1;
                } else if (type === 'delete') {
                    oscillator.frequency.value = 300;
                    gainNode.gain.value = 0.1;
                }
                
                oscillator.start();
                setTimeout(() => oscillator.stop(), 150);
            } catch (e) {
                // Web Audio API not available, continue silently
            }
        }

        // Add fadeOut animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
