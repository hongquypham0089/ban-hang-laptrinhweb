
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

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            loadRelatedProducts();
            setupEventListeners();
            setupAnimations();
        });

        // Load related products
        function loadRelatedProducts() {
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
            if (displayedRelatedProducts >= relatedProducts.length) {
                loadMoreBtn.textContent = "ĐÃ HIỂN THỊ TẤT CẢ";
                loadMoreBtn.disabled = true;
                loadMoreBtn.style.opacity = '0.7';
            } else {
                loadMoreBtn.textContent = `TẢI THÊM SẢN PHẨM (+${Math.min(5, relatedProducts.length - displayedRelatedProducts)})`;
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Thumbnail click events
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', function() {
                    // Remove active class from all thumbnails
                    thumbnails.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked thumbnail
                    this.classList.add('active');
                    
                    // Get image data
                    const imageUrl = this.getAttribute('data-image');
                    
                    // Update main image with transition effect
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = imageUrl;
                        mainImage.style.opacity = '1';
                    }, 200);
                    
                    // Play sound effect
                    playSoundEffect('click');
                });
            });
            
            // Variant button click events
            variantButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all variant buttons
                    variantButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Update price based on variant (simulated)
                    updatePriceForVariant(this.textContent.trim());
                    
                    // Play sound effect
                    playSoundEffect('click');
                });
            });
            
            // Buy now button
            buyNowBtn.addEventListener('click', function() {
                playSoundEffect('buy');
                showNotification("Đang chuyển đến trang thanh toán...", "success");
                
                // Add animation effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            });
            
            // Add to cart button
            addToCartBtn.addEventListener('click', function() {
                playSoundEffect('cart');
                showNotification("Sản phẩm đã được thêm vào giỏ hàng!", "success");
                
                // Add animation effect
                this.innerHTML = '<i class="fas fa-check"></i> ĐÃ THÊM';
                this.style.borderColor = 'var(--neon-green)';
                this.style.color = 'var(--neon-green)';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-cart-plus"></i> THÊM VÀO GIỎ';
                    this.style.borderColor = 'var(--neon-blue)';
                    this.style.color = 'var(--neon-blue)';
                }, 2000);
            });
            
            // Load more button
            loadMoreBtn.addEventListener('click', function() {
                playSoundEffect('click');
                
                // Add more products
                displayedRelatedProducts = Math.min(displayedRelatedProducts + 5, relatedProducts.length);
                loadRelatedProducts();
                
                // Add animation effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                // Scroll to newly loaded products
                setTimeout(() => {
                    relatedGrid.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            });
        }

        // Update price based on variant
        function updatePriceForVariant(variant) {
            const currentPrice = document.querySelector('.current-price');
            const oldPrice = document.querySelector('.old-price');
            const discountBadge = document.querySelector('.discount-badge');
            
            // Simulate price changes based on variant
            let newPrice, newOldPrice, discount;
            
            switch(variant) {
                case "Bạc Moonlight White":
                    newPrice = "32.990.000 ₫";
                    newOldPrice = "36.990.000 ₫";
                    discount = "-11%";
                    break;
                case "Đen Eclipse Gray":
                    newPrice = "33.490.000 ₫";
                    newOldPrice = "37.490.000 ₫";
                    discount = "-11%";
                    break;
                case "Xám Anime Matrix":
                    newPrice = "35.990.000 ₫";
                    newOldPrice = "39.990.000 ₫";
                    discount = "-10%";
                    break;
                default:
                    newPrice = "32.990.000 ₫";
                    newOldPrice = "36.990.000 ₫";
                    discount = "-11%";
            }
            
            // Add transition effect
            currentPrice.style.opacity = '0.5';
            oldPrice.style.opacity = '0.5';
            
            setTimeout(() => {
                currentPrice.textContent = newPrice;
                oldPrice.textContent = newOldPrice;
                discountBadge.textContent = discount;
                
                currentPrice.style.opacity = '1';
                oldPrice.style.opacity = '1';
            }, 300);
        }

        // Setup animations
        function setupAnimations() {
            // Add hover effect to guarantee items
            const guaranteeItems = document.querySelectorAll('.guarantee-item');
            
            guaranteeItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    const icon = this.querySelector('.guarantee-icon i');
                    const colors = ['var(--neon-blue)', 'var(--neon-purple)', 'var(--neon-pink)', 'var(--neon-green)'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    icon.style.color = randomColor;
                    icon.style.textShadow = `0 0 20px ${randomColor}`;
                });
                
                item.addEventListener('mouseleave', function() {
                    const icon = this.querySelector('.guarantee-icon i');
                    icon.style.color = 'var(--neon-blue)';
                    icon.style.textShadow = '0 0 15px var(--neon-blue)';
                });
            });
            
            // Add hover effect to related products
            const relatedCards = document.querySelectorAll('.related-product-card');
            
            relatedCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    const icon = this.querySelector('.related-product-img i');
                    const colors = ['var(--neon-blue)', 'var(--neon-purple)', 'var(--neon-pink)'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    icon.style.color = randomColor;
                    icon.style.transform = 'scale(1.2)';
                });
                
                card.addEventListener('mouseleave', function() {
                    const icon = this.querySelector('.related-product-img i');
                    icon.style.color = 'var(--neon-blue)';
                    icon.style.transform = 'scale(1)';
                });
                
                // Click event for related products
                card.addEventListener('click', function() {
                    playSoundEffect('click');
                    showNotification("Đang chuyển đến trang sản phẩm...", "info");
                });
            });
        }

        // Play sound effects
        function playSoundEffect(type) {
            // In a real implementation, you would play actual sound files
            // For this demo, we'll just simulate with console log
            console.log(`Playing ${type} sound effect`);
            
            // Try to use Web Audio API if available
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                if (type === 'click') {
                    oscillator.frequency.value = 800;
                    gainNode.gain.value = 0.1;
                } else if (type === 'cart') {
                    oscillator.frequency.value = 1200;
                    gainNode.gain.value = 0.1;
                } else if (type === 'buy') {
                    oscillator.frequency.value = 600;
                    gainNode.gain.value = 0.1;
                }
                
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                }, 150);
            } catch (e) {
                // Web Audio API not available, just continue silently
            }
        }

        // Show notification
        function showNotification(message, type = 'success') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            
            // Set color based on type
            let color, bgColor;
            if (type === 'success') {
                color = 'var(--neon-green)';
                bgColor = 'rgba(5, 255, 161, 0.1)';
            } else if (type === 'info') {
                color = 'var(--neon-blue)';
                bgColor = 'rgba(0, 243, 255, 0.1)';
            } else {
                color = 'var(--neon-pink)';
                bgColor = 'rgba(255, 42, 109, 0.1)';
            }
            
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: linear-gradient(90deg, ${bgColor}, rgba(10, 10, 22, 0.9));
                color: ${color};
                padding: 20px 25px;
                border-radius: 10px;
                border-left: 4px solid ${color};
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                z-index: 10000;
                animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), fadeOut 0.5s ease 2.5s;
                max-width: 350px;
                font-weight: 600;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            // Add to body
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'fadeOut 0.5s ease';
                    setTimeout(() => notification.remove(), 500);
                }
            }, 3000);
        }

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;
        document.head.appendChild(style);
