
        // Tab switching functionality
        const menuItems = document.querySelectorAll('.menu-item');
        const pageTitle = document.getElementById('page-title');

        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all menu items
                menuItems.forEach(mi => mi.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Hide all tab panes
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Show selected tab pane
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                
                // Update page title
                const tabName = this.querySelector('span').textContent;
                pageTitle.textContent = tabName;
                
                // Play sound effect
                playSoundEffect('click');
            });
        });

        // Show notification function
        function showNotification(message, type = 'success') {
            // Remove existing notifications
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

        // Save profile function
        function saveProfile() {
            const fullname = document.getElementById('fullname').value;
            const birthday = document.getElementById('birthday').value;
            const phone = document.getElementById('phone').value;
            const gender = document.getElementById('gender').value;
            
            playSoundEffect('success');
            showNotification('Cập nhật thông tin thành công!', 'success');
        }

        // Change password function
        function changePassword() {
            playSoundEffect('click');
            showNotification('Tính năng đang phát triển', 'info');
        }

        // View order function
        function viewOrder(orderId) {
            playSoundEffect('click');
            showNotification(`Đang xem chi tiết đơn hàng #${orderId}`, 'info');
        }

        // Add address function
        function addAddress() {
            playSoundEffect('click');
            showNotification('Tính năng thêm địa chỉ đang phát triển', 'info');
        }

        // Edit address function
        function editAddress() {
            playSoundEffect('click');
            showNotification('Tính năng sửa địa chỉ đang phát triển', 'info');
        }

        // Delete address function
        function deleteAddress() {
            playSoundEffect('error');
            if (confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
                showNotification('Đã xóa địa chỉ', 'success');
            }
        }

        // Remove from wishlist
        function removeFromWishlist(productId) {
            playSoundEffect('click');
            if (confirm('Bạn có chắc muốn xóa sản phẩm khỏi danh sách yêu thích?')) {
                showNotification('Đã xóa sản phẩm khỏi danh sách yêu thích', 'success');
            }
        }

        // Add to cart from wishlist
        function addToCart() {
            playSoundEffect('cart');
            showNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');
        }

        // Save settings
        function saveSettings() {
            const language = document.getElementById('language').value;
            const twoFA = document.getElementById('2fa').checked;
            
            playSoundEffect('success');
            showNotification('Đã lưu cài đặt thành công!', 'success');
        }

        // Delete account
        function deleteAccount() {
            playSoundEffect('error');
            if (confirm('Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
                showNotification('Tài khoản của bạn đã được gửi yêu cầu xóa', 'info');
            }
        }

        // Logout function
        function logout() {
            playSoundEffect('click');
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                showNotification('Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
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
                } else if (type === 'cart') {
                    oscillator.frequency.value = 600;
                    gainNode.gain.value = 0.1;
                }
                
                oscillator.start();
                setTimeout(() => oscillator.stop(), 150);
            } catch (e) {
                // Web Audio API not available, continue silently
            }
        }

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
