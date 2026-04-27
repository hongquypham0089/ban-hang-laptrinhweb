
// DOM Elements
const formSection = document.getElementById('form-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const backToLoginBtn = document.getElementById('back-to-login');
const loginSubmitBtn = document.getElementById('login-submit');
const registerSubmitBtn = document.getElementById('register-submit');
const registerFormData = document.getElementById('register-form-data');

// Password toggle elements
const toggleLoginPassword = document.getElementById('toggle-login-password');
const toggleRegisterPassword = document.getElementById('toggle-register-password');
const toggleConfirmPassword = document.getElementById('toggle-confirm-password');

// Password strength elements
const passwordStrengthBar = document.getElementById('password-strength-bar');
const passwordStrengthText = document.getElementById('password-strength-text');

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    setupPasswordValidation();
    loadSavedLoginData();
});

// Setup event listeners
function setupEventListeners() {
    // Toggle between login and register forms
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Ẩn Login
        loginForm.style.opacity = '0';
        loginForm.style.visibility = 'hidden';
        loginForm.style.zIndex = '1';

        // Hiện Register
        registerForm.style.opacity = '1';
        registerForm.style.visibility = 'visible';
        registerForm.style.zIndex = '2';
    });

    // Khi nhấn Quay lại Đăng nhập
    backToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Hiện Login
        loginForm.style.opacity = '1';
        loginForm.style.visibility = 'visible';
        loginForm.style.zIndex = '2';

        // Ẩn Register
        registerForm.style.opacity = '0';
        registerForm.style.visibility = 'hidden';
        registerForm.style.zIndex = '1';
    });

    // Password toggle functionality
    toggleLoginPassword.addEventListener('click', function () {
        togglePasswordVisibility('login-password', this);
    });

    toggleRegisterPassword.addEventListener('click', function () {
        togglePasswordVisibility('register-password', this);
    });

    toggleConfirmPassword.addEventListener('click', function () {
        togglePasswordVisibility('register-confirm-password', this);
    });

    // Login form submission
    loginSubmitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        validateLoginForm();
    });

    // Register form submission
    registerFormData.addEventListener('submit', function (e) {
        e.preventDefault();
        validateRegisterForm();
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const platform = this.classList.contains('google') ? 'Google' : 'Facebook';
            showNotification(`Đang kết nối với tài khoản ${platform}...`, 'info');
        });
    });

    // Forgot password link
    document.querySelector('.forgot-password').addEventListener('click', function (e) {
        e.preventDefault();
        showNotification('Đang chuyển hướng đến trang khôi phục mật khẩu...', 'info');
    });

    // Real-time password strength check
    document.getElementById('register-password').addEventListener('input', function () {
        checkPasswordStrength(this.value);
    });
}

// Toggle password visibility
function togglePasswordVisibility(inputId, toggleIcon) {
    const passwordInput = document.getElementById(inputId);

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }

    // Play sound effect
    playSoundEffect('click');
}

// Setup password validation
function setupPasswordValidation() {
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('register-confirm-password');

    // Real-time confirmation check
    confirmInput.addEventListener('input', function () {
        const password = passwordInput.value;
        const confirm = this.value;

        if (confirm === '') {
            this.classList.remove('error', 'success');
            document.getElementById('register-confirm-password-error').textContent = '';
        } else if (password !== confirm) {
            this.classList.add('error');
            this.classList.remove('success');
            document.getElementById('register-confirm-password-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Mật khẩu xác nhận không khớp';
        } else {
            this.classList.add('success');
            this.classList.remove('error');
            document.getElementById('register-confirm-password-error').innerHTML = '<i class="fas fa-check-circle"></i> Mật khẩu khớp';
        }
    });
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    let message = '';
    let strengthClass = '';

    // Length check
    if (password.length >= 6) strength += 1;

    // Contains number check
    if (/\d/.test(password)) strength += 1;

    // Contains letter check
    if (/[a-zA-Z]/.test(password)) strength += 1;

    // Contains special character check
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    // Update UI based on strength
    switch (strength) {
        case 0:
        case 1:
            strengthClass = 'weak';
            message = 'Mật khẩu yếu';
            break;
        case 2:
            strengthClass = 'medium';
            message = 'Mật khẩu trung bình';
            break;
        case 3:
            strengthClass = 'medium';
            message = 'Mật khẩu khá';
            break;
        case 4:
            strengthClass = 'strong';
            message = 'Mật khẩu mạnh';
            break;
    }

    // Update strength bar
    passwordStrengthBar.className = 'strength-fill ' + strengthClass;
    passwordStrengthText.textContent = message;
}

// Validate login form
function validateLoginForm() {
    let isValid = true;

    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const identifierError = document.getElementById('login-identifier-error');
    const passwordError = document.getElementById('login-password-error');

    // Reset errors
    identifierError.textContent = '';
    passwordError.textContent = '';

    document.getElementById('login-identifier').classList.remove('error');
    document.getElementById('login-password').classList.remove('error');

    // Validate identifier
    if (!identifier) {
        identifierError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập email hoặc số điện thoại';
        document.getElementById('login-identifier').classList.add('error');
        isValid = false;
    } else if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
        identifierError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Email hoặc số điện thoại không hợp lệ';
        document.getElementById('login-identifier').classList.add('error');
        isValid = false;
    }

    // Validate password
    if (!password) {
        passwordError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập mật khẩu';
        document.getElementById('login-password').classList.add('error');
        isValid = false;
    } else if (password.length < 6) {
        passwordError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Mật khẩu phải có ít nhất 6 ký tự';
        document.getElementById('login-password').classList.add('error');
        isValid = false;
    }

    const rememberMe = document.getElementById('remember-me').checked;

    // If valid, submit form
    if (isValid) {
        submitLogin({ identifier, password, rememberMe });
    } else {
        playSoundEffect('error');
    }

    return isValid;
}

async function submitLogin({ identifier, password, rememberMe }) {
    loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
    loginSubmitBtn.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ TenTaiKhoan: identifier, MatKhau: password })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
            document.getElementById('login-identifier-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + errorMessage;
            document.getElementById('login-identifier').classList.add('error');
            playSoundEffect('error');
        } else {
            if (rememberMe) {
                localStorage.setItem('savedLoginIdentifier', identifier);
            } else {
                localStorage.removeItem('savedLoginIdentifier');
            }

            showNotification('Đăng nhập thành công! Đang chuyển hướng...', 'success');
            playSoundEffect('success');

            setTimeout(() => {
                loginSubmitBtn.innerHTML = 'Đăng nhập';
                loginSubmitBtn.disabled = false;
                window.location.href = '/';
            }, 1000);
        }
    } catch (error) {
        showNotification('Lỗi kết nối tới máy chủ. Vui lòng thử lại.', 'error');
        playSoundEffect('error');
        console.error('Login error:', error);
    } finally {
        loginSubmitBtn.innerHTML = 'Đăng nhập';
        loginSubmitBtn.disabled = false;
    }
}

function loadSavedLoginData() {
    const savedIdentifier = localStorage.getItem('savedLoginIdentifier');
    if (savedIdentifier) {
        const loginIdentifierInput = document.getElementById('login-identifier');
        const rememberCheckbox = document.getElementById('remember-me');

        loginIdentifierInput.value = savedIdentifier;
        rememberCheckbox.checked = true;
    }
}

// Validate register form
function validateRegisterForm() {
    let isValid = true;

    // Get form values
    const name = document.getElementById('register-name').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const termsAgreed = document.getElementById('terms-agreement').checked;

    // Reset all errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });

    document.querySelectorAll('.form-input').forEach(el => {
        el.classList.remove('error');
    });

    // Validate name
    if (!name) {
        document.getElementById('register-name-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập họ và tên';
        document.getElementById('register-name').classList.add('error');
        isValid = false;
    }

    // Validate phone
    if (!phone) {
        document.getElementById('register-phone-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập số điện thoại';
        document.getElementById('register-phone').classList.add('error');
        isValid = false;
    } else if (!isValidPhone(phone)) {
        document.getElementById('register-phone-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Số điện thoại không hợp lệ';
        document.getElementById('register-phone').classList.add('error');
        isValid = false;
    }

    // Validate email
    if (!email) {
        document.getElementById('register-email-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập email';
        document.getElementById('register-email').classList.add('error');
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('register-email-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Email không hợp lệ';
        document.getElementById('register-email').classList.add('error');
        isValid = false;
    }

    // Validate password
    if (!password) {
        document.getElementById('register-password-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập mật khẩu';
        document.getElementById('register-password').classList.add('error');
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('register-password-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Mật khẩu phải có ít nhất 6 ký tự';
        document.getElementById('register-password').classList.add('error');
        isValid = false;
    } else if (!/\d/.test(password)) {
        document.getElementById('register-password-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Mật khẩu phải có ít nhất 1 chữ số';
        document.getElementById('register-password').classList.add('error');
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        document.getElementById('register-confirm-password-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng xác nhận mật khẩu';
        document.getElementById('register-confirm-password').classList.add('error');
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('register-confirm-password-error').innerHTML = '<i class="fas fa-exclamation-circle"></i> Mật khẩu xác nhận không khớp';
        document.getElementById('register-confirm-password').classList.add('error');
        isValid = false;
    }

    // Validate terms agreement
    if (!termsAgreed) {
        showNotification('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật', 'error');
        isValid = false;
    }

    // If valid, submit form
    if (isValid) {
        // Play success sound
        playSoundEffect('success');

        // Show loading state
        registerSubmitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            showNotification('Đăng ký thành công! Chào mừng bạn đến với Computer N9 Gaming', 'success');

            // Reset button
            setTimeout(() => {
                registerSubmitBtn.innerHTML = 'Đăng ký tài khoản';
                registerSubmitBtn.disabled = false;
            }, 1500);

            // Switch back to login form after successful registration
            setTimeout(() => {
                switchToLogin();

                // Clear form
                registerFormData.reset();
                passwordStrengthBar.className = 'strength-fill';
                passwordStrengthText.textContent = 'Mật khẩu chưa đủ mạnh';
            }, 2000);
        }, 2000);
    } else {
        playSoundEffect('error');
    }

    return isValid;
}

// Helper functions for validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Accept Vietnamese phone numbers: 0xxxxxxxxx or +84xxxxxxxxx
    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    return phoneRegex.test(phone);
}

function switchToLogin() {
    // Hiện Login
    loginForm.style.opacity = '1';
    loginForm.style.visibility = 'visible';
    loginForm.style.zIndex = '2';

    // Ẩn Register
    registerForm.style.opacity = '0';
    registerForm.style.visibility = 'hidden';
    registerForm.style.zIndex = '1';
}

// Play sound effects
function playSoundEffect(type) {
    try {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set frequency based on type
        if (type === 'click') {
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
        } else if (type === 'success') {
            oscillator.frequency.value = 1200;
            gainNode.gain.value = 0.1;
        } else if (type === 'error') {
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.1;
        }

        // Play sound
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 150);
    } catch (e) {
        // Web Audio API not available, continue silently
        console.log('Sound effect:', type);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Add icon based on type
    let icon = '';
    if (type === 'success') {
        icon = '<i class="fas fa-check-circle"></i> ';
    } else if (type === 'error') {
        icon = '<i class="fas fa-exclamation-circle"></i> ';
    } else if (type === 'info') {
        icon = '<i class="fas fa-info-circle"></i> ';
    }

    notification.innerHTML = icon + message;

    // Add to body
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
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
        `;
document.head.appendChild(style);
