// DOM Elements
const productsGrid = document.getElementById('products-grid');
const slides = document.querySelectorAll('.slide');
const sliderDots = document.querySelectorAll('.slider-dot');
const cartCount = document.querySelector('.cart-count');
const mobileSearchBtn = document.getElementById('mobile-search-btn');
const searchContainer = document.querySelector('.search-container');

// Enhanced Search Elements
const enhancedSearchInput = document.getElementById('enhanced-search-input');
const searchSubmitBtn = document.getElementById('search-submit-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const searchSuggestions = document.getElementById('search-suggestions');
const searchResultInfo = document.getElementById('search-result-info');
const searchResultText = document.getElementById('search-result-text');
const clearSearchResultBtn = document.getElementById('clear-search-result');

// Biến lưu trữ toàn bộ sản phẩm để lọc không cần gọi lại API
let allProducts = [];
let searchTimeout;

// Initialize the page
document.addEventListener('DOMContentLoaded', async function () {
    // 1. Gọi hàm fetch danh mục trước để tạo các nút lọc
    await fetchCategories();
    // 2. Gọi hàm fetch dữ liệu sản phẩm từ API
    await fetchProductsFromAPI(); 
    
    initSlider();
    setupEventListeners();
    setupEnhancedSearch(); // Thêm setup tìm kiếm nâng cao
    createParticles();
    createNeonEffects();
});

// Hàm lấy danh mục từ API
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories'); // Thay đổi URL nếu route danh mục của bạn khác
        const result = await response.json();

        // Tùy thuộc vào backend của bạn trả về mảng trực tiếp hay bọc trong { data: [...] }
        const categories = result.data || result; 
        
        if (categories && categories.length > 0) {
            renderCategoryButtons(categories);
        } else {
            // Nếu không có danh mục nào từ API, vẫn setup sự kiện cho nút "TẤT CẢ" mặc định
            setupFilterEvents();
        }
    } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        setupFilterEvents(); // Fallback setup event cho nút có sẵn
    }
}

// Hàm render các nút danh mục ra UI
function renderCategoryButtons(categories) {
    // Tìm thẻ chứa các nút filter (đảm bảo HTML có class .filter-buttons)
    const filterContainer = document.querySelector('.filter-buttons');
    if (!filterContainer) return;

    // Chỉ giữ lại nút TẤT CẢ, xóa các nút tĩnh cũ đi (nếu có)
    filterContainer.innerHTML = '<button class="filter-btn active" data-filter="all">TẤT CẢ</button>';

    // Tạo các nút mới từ dữ liệu DB
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', category.MaLoai); 
        button.textContent = category.TenLoai ? category.TenLoai.toUpperCase() : 'DANH MỤC';
        filterContainer.appendChild(button);
    });

    // Sau khi tạo xong nút mới gắn sự kiện click cho chúng
    setupFilterEvents();
}

// API lấy sản phẩm
async function fetchProductsFromAPI() {
    try {
        const response = await fetch('/api/products');
        const dbProducts = await response.json();

        allProducts = dbProducts.map(item => {
            return {
                id: item.MaSanPham,
                name: item.TenSanPham,
                price: Number(item.Gia),
                oldPrice: Math.round(Number(item.Gia) * 1.1),
                // Đảm bảo đường dẫn ảnh chính xác
                image: item.HinhAnh || 'https://via.placeholder.com/300x200?text=No+Image',
                rating: 5,
                MaLoai: item.MaLoai, // Cần thiết cho việc lọc
                category: "Sản phẩm" 
            };
        });

        // Mặc định ban đầu render tất cả sản phẩm
        renderProducts(allProducts);
        
    } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
    }
}

function renderProducts(productsArray) {
    productsGrid.innerHTML = '';

    if(productsArray.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results-animation" style="grid-column: 1/-1;">
                <i class="fas fa-gamepad"></i>
                <h3>Không tìm thấy sản phẩm!</h3>
                <p>Hãy thử tìm kiếm với từ khóa khác hoặc xem các danh mục sản phẩm khác nhé!</p>
            </div>
        `;
        return;
    }

    productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const formattedPrice = formatPrice(product.price);
        const formattedOldPrice = product.oldPrice ? formatPrice(product.oldPrice) : '';
        const ratingStars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
        
        // Tính phần trăm giảm giá
        const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
        const badgeHtml = discount > 0 ? `<div class="product-badge">-${discount}%</div>` : '';

        productCard.innerHTML = `
            <div class="product-img" onclick="window.location.href='/chitiet/${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
                ${badgeHtml}
            </div>
            
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                
                <h3 class="product-name" onclick="window.location.href='/chitiet/${product.id}'" style="cursor: pointer;">
                    ${product.name}
                </h3>
                
                <div class="product-rating">${ratingStars}</div>
                <div class="product-price">
                    ${formattedPrice}
                    <span class="old-price">${formattedOldPrice}</span>
                </div>
                <button class="cart-btn" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> THÊM VÀO GIỎ
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Format price with dots as thousand separators
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫';
}

// Logic Lọc sản phẩm
function setupFilterEvents() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Play sound effect
            playSoundEffect('click');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');
            let filteredProducts = [];

            // Lọc sản phẩm từ mảng allProducts
            if (filterValue === 'all') {
                filteredProducts = allProducts;
            } else {
                // Lọc theo MaLoai (Chuyển về string để so sánh an toàn)
                filteredProducts = allProducts.filter(product => product.MaLoai && product.MaLoai.toString() === filterValue.toString());
            }

            // Add transition effect
            productsGrid.style.opacity = '0.5';
            setTimeout(() => {
                renderProducts(filteredProducts);
                productsGrid.style.opacity = '1';
            }, 300);
            
            // Ẩn thông báo tìm kiếm khi chuyển danh mục
            if (searchResultInfo) {
                searchResultInfo.style.display = 'none';
            }
            if (enhancedSearchInput) {
                enhancedSearchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            }
        });
    });
}

// Enhanced Search Functions
function setupEnhancedSearch() {
    if (!enhancedSearchInput) return;
    
    // Tìm kiếm khi gõ (debounce)
    enhancedSearchInput.addEventListener('input', function(e) {
        const value = e.target.value;
        
        // Hiển thị nút clear
        if (clearSearchBtn) {
            if (value) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
                if (searchSuggestions) searchSuggestions.style.display = 'none';
            }
        }
        
        // Debounce để tránh gọi nhiều lần
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (value && value.trim() !== '') {
                showSearchSuggestions(value);
            } else {
                if (searchSuggestions) searchSuggestions.style.display = 'none';
            }
        }, 300);
    });
    
    // Tìm kiếm khi nhấn Enter
    enhancedSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchProducts(this.value);
            if (searchSuggestions) searchSuggestions.style.display = 'none';
        }
    });
    
    // Nút tìm kiếm
    if (searchSubmitBtn) {
        searchSubmitBtn.addEventListener('click', function() {
            if (enhancedSearchInput) {
                searchProducts(enhancedSearchInput.value);
                if (searchSuggestions) searchSuggestions.style.display = 'none';
            }
        });
    }
    
    // Nút clear tìm kiếm
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            if (enhancedSearchInput) {
                enhancedSearchInput.value = '';
                this.style.display = 'none';
                searchProducts('');
                if (searchSuggestions) searchSuggestions.style.display = 'none';
                if (searchResultInfo) searchResultInfo.style.display = 'none';
                
                // Hiển thị lại tất cả sản phẩm
                if (allProducts.length > 0) {
                    renderProducts(allProducts);
                }
                
                // Active lại nút all
                const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allFilterBtn) {
                    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    allFilterBtn.classList.add('active');
                }
            }
        });
    }
    
    // Nút clear kết quả tìm kiếm
    if (clearSearchResultBtn) {
        clearSearchResultBtn.addEventListener('click', function() {
            if (enhancedSearchInput) {
                enhancedSearchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
                searchProducts('');
                if (searchResultInfo) searchResultInfo.style.display = 'none';
                if (searchSuggestions) searchSuggestions.style.display = 'none';
                
                // Hiển thị lại tất cả sản phẩm
                if (allProducts.length > 0) {
                    renderProducts(allProducts);
                }
                
                // Active lại nút all
                const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allFilterBtn) {
                    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    allFilterBtn.classList.add('active');
                }
            }
        });
    }
    
    // Click ra ngoài để đóng gợi ý
    if (searchSuggestions) {
        document.addEventListener('click', function(e) {
            if (searchSuggestions && !searchSuggestions.contains(e.target) && e.target !== enhancedSearchInput) {
                searchSuggestions.style.display = 'none';
            }
        });
    }
}

// Hàm tìm kiếm sản phẩm
function searchProducts(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        // Nếu không có từ khóa, hiển thị tất cả sản phẩm
        renderProducts(allProducts);
        if (searchResultInfo) searchResultInfo.style.display = 'none';
        
        // Active lại nút all
        const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allFilterBtn) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            allFilterBtn.classList.add('active');
        }
        return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.category && product.category.toLowerCase().includes(term))
    );
    
    // Hiển thị kết quả
    renderProducts(filteredProducts);
    
    // Hiển thị thông báo kết quả tìm kiếm
    if (searchResultInfo && searchResultText) {
        if (filteredProducts.length > 0) {
            searchResultText.innerHTML = `<i class="fas fa-search"></i> Tìm thấy ${filteredProducts.length} kết quả cho từ khóa: "${searchTerm}"`;
            searchResultInfo.style.display = 'flex';
        } else {
            searchResultText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Không tìm thấy sản phẩm nào cho từ khóa: "${searchTerm}"`;
            searchResultInfo.style.display = 'flex';
        }
    }
    
    // Bỏ active các filter buttons khi đang tìm kiếm
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
}

// Hàm hiển thị gợi ý tìm kiếm
function showSearchSuggestions(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '' || !searchSuggestions) {
        if (searchSuggestions) searchSuggestions.style.display = 'none';
        return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const suggestions = allProducts
        .filter(product => product.name.toLowerCase().includes(term))
        .slice(0, 5); // Chỉ lấy 5 gợi ý đầu tiên
    
    if (suggestions.length > 0) {
        searchSuggestions.innerHTML = suggestions.map(product => `
            <div class="suggestion-item" data-product-name="${product.name.replace(/'/g, "\\'")}">
                <div class="suggestion-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="suggestion-text">${product.name}</div>
                <div class="suggestion-category">${product.category || 'Sản phẩm'}</div>
            </div>
        `).join('');
        searchSuggestions.style.display = 'block';
        
        // Thêm sự kiện click cho các gợi ý
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const productName = item.getAttribute('data-product-name');
                if (enhancedSearchInput) {
                    enhancedSearchInput.value = productName;
                    searchProducts(productName);
                }
                if (searchSuggestions) searchSuggestions.style.display = 'none';
                if (clearSearchBtn) clearSearchBtn.style.display = 'block';
            });
        });
    } else {
        searchSuggestions.style.display = 'none';
    }
}

// Slider functionality
function initSlider() {
    let currentSlide = 0;

    if(slides.length === 0) return;

    // Auto slide every 5 seconds
    const slideInterval = setInterval(() => {
        // Remove active class from current slide and dot
        slides[currentSlide].classList.remove('active');
        if(sliderDots[currentSlide]) sliderDots[currentSlide].classList.remove('active');

        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;

        // Add active class to new slide and dot
        slides[currentSlide].classList.add('active');
        if(sliderDots[currentSlide]) sliderDots[currentSlide].classList.add('active');
    }, 5000);

    // Click on dots to change slide
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            // Clear auto slide interval
            clearInterval(slideInterval);

            // Remove active class from current slide and dot
            slides[currentSlide].classList.remove('active');
            if(sliderDots[currentSlide]) sliderDots[currentSlide].classList.remove('active');

            // Set new slide
            currentSlide = index;

            // Add active class to new slide and dot
            slides[currentSlide].classList.add('active');
            if(sliderDots[currentSlide]) sliderDots[currentSlide].classList.add('active');

            // Restart auto slide
            setTimeout(() => initSlider(), 10000);
        });
    });
}

// Add to cart functionality (Old function kept for fallback/reference if needed)
function addToCart(productId) {
    playSoundEffect('cart');

    let currentCount = parseInt(cartCount.textContent) || 0;
    cartCount.textContent = currentCount + 1;

    const cartBtn = document.getElementById('cart-btn');
    if(cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
        }, 300);
    }

    const product = allProducts.find(p => p.id === productId);
    if(product) {
        showNotification(`ĐÃ THÊM "${product.name}" VÀO GIỎ HÀNG!`, 'success');
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

// Create floating particles
function createParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if(!particlesContainer) return;
    const colors = ['#00f3ff', '#b967ff', '#ff2a6d', '#05ffa1', '#ffde59'];

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random properties
        const size = Math.random() * 5 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;

        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;

        particlesContainer.appendChild(particle);
    }
}

// Create neon text effects
function createNeonEffects() {
    // Add neon effect to section titles
    const neonElements = document.querySelectorAll('.neon-text');
    neonElements.forEach(el => {
        setInterval(() => {
            const hue = Math.floor(Math.random() * 360);
            el.style.color = `hsl(${hue}, 100%, 70%)`;
        }, 3000);
    });
}

// Play sound effects (simulated with Web Audio API if available)
function playSoundEffect(type) {
    try {
        if (type === 'click') {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 100);
        } else if (type === 'cart') {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.value = 1200;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 150);
        }
    } catch (e) {
        // Web Audio API not available, just continue silently
    }
}

// Setup event listeners
function setupEventListeners() {
    if (mobileSearchBtn && searchContainer) {
        mobileSearchBtn.addEventListener('click', function () {
            playSoundEffect('click');
            searchContainer.classList.toggle('active');

            // Tự động focus vào ô input khi mở thanh search
            const searchInput = searchContainer.querySelector('.search-input');
            if (searchContainer.classList.contains('active') && searchInput) {
                searchInput.focus();
            }
        });
    }

    // Header icon buttons
    const notifBtn = document.getElementById('notification-btn');
    if(notifBtn) {
        notifBtn.addEventListener('click', function () {
            playSoundEffect('click');
            showNotification("Bạn có 3 thông báo mới từ Computer N9 Gaming!", 'info');
        });
    }

    const cartBtnHeader = document.getElementById('cart-btn');
    if(cartBtnHeader) {
        cartBtnHeader.addEventListener('click', function () {
            playSoundEffect('click');
            showNotification("Đang mở giỏ hàng của bạn...", 'info');
        });
    }

    const userBtn = document.getElementById('user-btn');
    if(userBtn) {
        userBtn.addEventListener('click', function () {
            playSoundEffect('click');
            showNotification("Đăng nhập để nhận ưu đãi đặc biệt!", 'info');
        });
    }

    // Newsletter form
    const newsForm = document.querySelector('.newsletter-form');
    if(newsForm) {
        newsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            playSoundEffect('click');
            const emailInput = this.querySelector('.newsletter-input');
            if (emailInput && emailInput.value) {
                showNotification(`ĐÃ ĐĂNG KÝ THÀNH CÔNG VỚI EMAIL: ${emailInput.value}`, 'success');
                emailInput.value = '';
            }
        });
    }
}

// Add CSS animations for notifications
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
    
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(10px, -10px); }
        50% { transform: translate(-5px, 5px); }
        75% { transform: translate(-10px, -5px); }
    }
`;
document.head.appendChild(style);

// Xử lý giỏ hàng API (Event Delegation)
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async function(e) {
        const cartBtn = e.target.closest('.cart-btn');
        
        if (cartBtn) {
            e.preventDefault();
            e.stopPropagation(); // Tránh bị click đè vào product card
            
            const maSanPham = cartBtn.getAttribute('data-id');
            
            if (!maSanPham) {
                console.error("Không tìm thấy mã sản phẩm!");
                return;
            }

            const originalText = cartBtn.innerHTML;
            cartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG THÊM...';
            cartBtn.disabled = true;

            try {
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        maSanPham: maSanPham, 
                        soLuong: 1 
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    playSoundEffect('cart');
                    showNotification(data.message || "Đã thêm sản phẩm vào giỏ hàng thành công!", 'success');
                } 
                else if (response.status === 401) {
                    alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
                    window.location.href = '/dangnhap';
                } 
                else {
                    showNotification(data.message || "Không thể thêm vào giỏ hàng.", 'error');
                }
            } catch (error) {
                console.error("Lỗi khi gọi API thêm giỏ hàng:", error);
                showNotification("Lỗi kết nối máy chủ. Vui lòng thử lại sau.", 'error');
            } finally {
                cartBtn.innerHTML = originalText;
                cartBtn.disabled = false;
            }
        }
    });
});