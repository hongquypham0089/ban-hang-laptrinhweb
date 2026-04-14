

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const slides = document.querySelectorAll('.slide');
const sliderDots = document.querySelectorAll('.slider-dot');
const cartCount = document.querySelector('.cart-count');
const particlesContainer = document.getElementById('particles-container');
const mobileSearchBtn = document.getElementById('mobile-search-btn');
const searchContainer = document.querySelector('.search-container');


// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    renderProducts(products);
    initSlider();
    setupEventListeners();
    createParticles();
    createNeonEffects();
});

// Render products to the grid
function renderProducts(productsArray) {
    productsGrid.innerHTML = '';

    productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Format price
        const formattedPrice = formatPrice(product.price);
        const formattedOldPrice = product.oldPrice ? formatPrice(product.oldPrice) : '';

        // Create rating stars
        const ratingStars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
        // Giới hạn 30 ký tự, nếu dài hơn thì thêm dấu ...
        const displayName = product.name.length > 30
            ? product.name.substring(0, 27) + "..."
            : product.name;
        productCard.innerHTML = `
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-img">
                <i class="${product.icon}"></i>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">${ratingStars}</div>
                <div class="product-price">
                    ${formattedPrice}
                    ${product.oldPrice ? `<span class="old-price">${formattedOldPrice}</span>` : ''}
                </div>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });

    // Add event listeners to product buttons
    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
            // Add animation effect
            this.innerHTML = '<i class="fas fa-check"></i> ĐÃ THÊM';
            this.style.background = 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cart-plus"></i> THÊM VÀO GIỎ';
                this.style.background = 'linear-gradient(90deg, var(--neon-blue), var(--neon-purple))';
            }, 1500);
        });
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            showNotification(`Đang xem chi tiết: ${product.name}`, 'info');
        });
    });
}

// Format price with dots as thousand separators
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫';
}

// Filter products
filterButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Play sound effect
        playSoundEffect('click');

        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');
        let filteredProducts = [...products];

        if (filter === 'gaming' || filter === 'streaming' || filter === 'graphic' || filter === 'study') {
            filteredProducts = products.filter(product => product.type === filter);
        } else if (filter === 'price-asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (filter === 'price-desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }
        // "all" filter shows all products

        // Add transition effect
        productsGrid.style.opacity = '0.5';
        setTimeout(() => {
            renderProducts(filteredProducts);
            productsGrid.style.opacity = '1';
        }, 300);
    });
});

// Slider functionality
function initSlider() {
    let currentSlide = 0;

    // Auto slide every 5 seconds
    const slideInterval = setInterval(() => {
        // Remove active class from current slide and dot
        slides[currentSlide].classList.remove('active');
        sliderDots[currentSlide].classList.remove('active');

        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;

        // Add active class to new slide and dot
        slides[currentSlide].classList.add('active');
        sliderDots[currentSlide].classList.add('active');
    }, 5000);

    // Click on dots to change slide
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            // Clear auto slide interval
            clearInterval(slideInterval);

            // Remove active class from current slide and dot
            slides[currentSlide].classList.remove('active');
            sliderDots[currentSlide].classList.remove('active');

            // Set new slide
            currentSlide = index;

            // Add active class to new slide and dot
            slides[currentSlide].classList.add('active');
            sliderDots[currentSlide].classList.add('active');

            // Restart auto slide
            setTimeout(() => initSlider(), 10000);
        });
    });
}

// Add to cart functionality
function addToCart(productId) {
    // Play sound effect
    playSoundEffect('cart');

    // Update cart count with animation
    let currentCount = parseInt(cartCount.textContent);
    cartCount.textContent = currentCount + 1;

    // Add animation to cart icon
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 300);

    // Show notification
    const product = products.find(p => p.id === productId);
    showNotification(`ĐÃ THÊM "${product.name}" VÀO GIỎ HÀNG!`, 'success');
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
    // In a real implementation, you would play actual sound files
    // For this demo, we'll just simulate with console log
    console.log(`Playing ${type} sound effect`);

    // Try to use Web Audio API if available
    try {
        if (type === 'click') {
            // Simulate click sound with a beep
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 100);
        } else if (type === 'cart') {
            // Simulate cart sound with a different beep
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
    document.getElementById('notification-btn').addEventListener('click', function () {
        playSoundEffect('click');
        showNotification("Bạn có 3 thông báo mới từ Computer N9 Gaming!", 'info');
    });

    document.getElementById('cart-btn').addEventListener('click', function () {
        playSoundEffect('click');
        showNotification("Đang mở giỏ hàng của bạn...", 'info');
    });

    document.getElementById('user-btn').addEventListener('click', function () {
        playSoundEffect('click');
        showNotification("Đăng nhập để nhận ưu đãi đặc biệt!", 'info');
    });

    // Search functionality
    document.querySelector('.search-btn').addEventListener('click', function () {
        playSoundEffect('click');
        const searchTerm = document.querySelector('.search-input').value.trim();
        if (searchTerm) {
            showNotification(`Đang tìm kiếm: "${searchTerm}"`, 'info');
        }
    });

    // Enter key in search
    document.querySelector('.search-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.querySelector('.search-btn').click();
        }
    });

    // Newsletter form
    document.querySelector('.newsletter-form').addEventListener('submit', function (e) {
        e.preventDefault();
        playSoundEffect('click');
        const email = this.querySelector('.newsletter-input').value;
        if (email) {
            showNotification(`ĐÃ ĐĂNG KÝ THÀNH CÔNG VỚI EMAIL: ${email}`, 'success');
            this.querySelector('.newsletter-input').value = '';
        }
    });

    // Add hover effects to product cards
    document.addEventListener('mousemove', function (e) {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const angleY = (x - centerX) * 0.01;
            const angleX = (centerY - y) * 0.01;

            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-15px)`;
        });
    });

    // Reset product card transforms when mouse leaves
    document.addEventListener('mouseleave', function () {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
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

