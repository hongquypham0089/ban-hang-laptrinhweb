// API Base URL
const API_BASE_URL = '/api/admin/dashboard';

// Chart instances
let revenueChart = null;
let topProductsChart = null;

// State
let currentPeriod = '6';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAllDashboardData();
    setupEventListeners();
    loadAdminInfo();
});

function setupEventListeners() {
    // Period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.textContent.includes('6')) currentPeriod = '6';
            else if (this.textContent.includes('12')) currentPeriod = '12';
            else if (this.textContent.includes('Năm')) currentPeriod = 'year';
            
            loadRevenueData();
        });
    });
    
    // Search
    const searchBtn = document.querySelector('.search-box button');
    const searchInput = document.querySelector('.search-box input');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = searchInput.value;
            if (searchTerm) {
                showNotification(`Đang tìm kiếm: "${searchTerm}"`, 'info');
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchBtn.click();
        });
    }
    
    // View all links
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', function() {
            const parentCard = this.closest('.table-card');
            const title = parentCard?.querySelector('.table-title span')?.textContent || '';
            showNotification(`Chức năng xem tất cả ${title} đang phát triển`, 'info');
        });
    });
}

async function loadAdminInfo() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const result = await response.json();
        if (result.success && result.data) {
            const adminNameEl = document.querySelector('.admin-details h4');
            const adminEmailEl = document.querySelector('.admin-details p');
            if (adminNameEl) adminNameEl.textContent = result.data.name || 'Admin N9';
            if (adminEmailEl) adminEmailEl.textContent = result.data.email || 'admin@computern9.vn';
        }
    } catch (error) {
        console.error('Lỗi lấy thông tin admin:', error);
    }
}

async function loadAllDashboardData() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/all?period=${currentPeriod}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            // Update stats
            updateStats(result.data.stats);
            
            // Update revenue chart
            updateRevenueChart(result.data.revenueChart);
            
            // Update top products chart
            updateTopProductsChart(result.data.topProducts);
            
            // Update low stock table
            updateLowStockTable(result.data.lowStockProducts);
            
            // Update recent orders table
            updateRecentOrdersTable(result.data.recentOrders);
        } else {
            showNotification('Lỗi tải dữ liệu: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi tải dashboard:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadRevenueData() {
    try {
        const response = await fetch(`${API_BASE_URL}/revenue-by-month?period=${currentPeriod}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            updateRevenueChart(result.data);
        }
    } catch (error) {
        console.error('Lỗi tải doanh thu:', error);
    }
}

function updateStats(stats) {
    // Update values
    document.getElementById('totalOrders').textContent = formatNumber(stats.totalOrders);
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('productsSold').textContent = formatNumber(stats.productsSold);
    document.getElementById('lowStock').textContent = stats.lowStock;
    document.getElementById('newUsers').textContent = formatNumber(stats.newUsers);
    
    // Update trends
    updateTrendBadge('totalOrders', stats.totalOrdersTrend);
    updateTrendBadge('totalRevenue', stats.totalRevenueTrend);
    updateTrendBadge('productsSold', stats.productsSoldTrend);
    updateTrendBadge('newUsers', stats.newUsersTrend);
}

function updateTrendBadge(elementId, trend) {
    const statCard = document.getElementById(elementId)?.closest('.stat-card');
    if (!statCard) return;
    
    let trendBadge = statCard.querySelector('.trend-badge');
    if (!trendBadge) {
        const header = statCard.querySelector('.stat-header');
        trendBadge = document.createElement('span');
        trendBadge.className = 'trend-badge';
        header.appendChild(trendBadge);
    }
    
    const isPositive = trend >= 0;
    trendBadge.className = `trend-badge ${isPositive ? 'up' : 'down'}`;
    trendBadge.textContent = `${isPositive ? '+' : ''}${trend}%`;
    
    // Update footer text
    const footer = statCard.querySelector('.stat-footer');
    if (footer) {
        const changeText = isPositive ? `Tăng ${trend}%` : `Giảm ${Math.abs(trend)}%`;
        footer.textContent = `${changeText} so với tháng trước`;
    }
}

function updateRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Doanh thu (triệu ₫)',
                data: data.revenues,
                borderColor: '#00f3ff',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#00f3ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#b8b8d1',
                        font: { family: 'Exo 2', size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Doanh thu: ${context.raw.toFixed(1)} triệu ₫`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#b8b8d1',
                        callback: function(value) {
                            return value + 'M';
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#b8b8d1' }
                }
            }
        }
    });
}

function updateTopProductsChart(products) {
    const ctx = document.getElementById('topProductsChart').getContext('2d');
    
    const colors = [
        '#00f3ff', '#b967ff', '#ff2a6d', '#05ffa1', '#ffde59',
        '#ff6b2b', '#00ff88', '#ff44cc', '#44ffaa', '#ffaa44'
    ];
    
    if (topProductsChart) {
        topProductsChart.destroy();
    }
    
    const hasData = products.data && products.data.length > 0 && products.data.some(v => v > 0);
    
    if (!hasData) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px "Exo 2"';
        ctx.fillStyle = '#b8b8d1';
        ctx.textAlign = 'center';
        ctx.fillText('Chưa có dữ liệu bán hàng', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    topProductsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: products.labels,
            datasets: [{
                data: products.data,
                backgroundColor: colors.slice(0, products.labels.length),
                borderColor: '#13132e',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b8b8d1',
                        font: { family: 'Exo 2', size: 11 },
                        padding: 15,
                        generateLabels: function(chart) {
                            const original = Chart.defaults.plugins.legend.labels.generateLabels;
                            const labels = original.call(this, chart);
                            labels.forEach((label, i) => {
                                const percentage = products.percentages[i] || 0;
                                label.text = `${label.text} (${percentage}%)`;
                            });
                            return labels;
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} sản phẩm (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function updateLowStockTable(products) {
    const tbody = document.getElementById('lowStockTable');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có sản phẩm sắp hết hàng</td></tr>';
        return;
    }
    
    const getStockBadgeClass = (level) => {
        switch(level) {
            case 'critical': return 'stock-critical';
            case 'low': return 'stock-low';
            default: return 'stock-medium';
        }
    };
    
    const getStockText = (level, stock) => {
        if (level === 'critical') return 'Rất ít';
        if (level === 'low') return 'Sắp hết';
        return 'Còn ít';
    };
    
    const getIcon = (category) => {
        const icons = {
            'Laptop': 'fa-laptop',
            'PC': 'fa-desktop',
            'Bàn phím': 'fa-keyboard',
            'Chuột': 'fa-mouse',
            'Tai nghe': 'fa-headphones',
            'Màn hình': 'fa-tv'
        };
        for (const [key, icon] of Object.entries(icons)) {
            if (category?.includes(key)) return icon;
        }
        return 'fa-microchip';
    };
    
    let html = '';
    products.forEach(product => {
        const stockLevel = product.stockLevel;
        const badgeClass = getStockBadgeClass(stockLevel);
        const stockText = getStockText(stockLevel, product.stock);
        
        html += `
            <tr>
                <td>
                    <div class="product-name">
                        <div class="product-icon"><i class="fas ${getIcon(product.category)}"></i></div>
                        <span>${escapeHtml(product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name)}</span>
                    </div>
                </td>
                <td>${escapeHtml(product.category || 'Chưa phân loại')}</td>
                <td class="${stockLevel === 'critical' ? 'text-critical' : ''}">${product.stock}</td>
                <td>${formatNumber(product.totalSold)}</td>
                <td><span class="stock-badge ${badgeClass}">${stockText}</span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function updateRecentOrdersTable(orders) {
    const tbody = document.getElementById('recentOrdersTable');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có đơn hàng nào</td></tr>';
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        let statusClass = '';
        switch(order.status) {
            case 'completed': statusClass = 'status-completed'; break;
            case 'processing': statusClass = 'status-processing'; break;
            case 'pending': statusClass = 'status-pending'; break;
            case 'cancelled': statusClass = 'status-cancelled'; break;
            default: statusClass = 'status-pending';
        }
        
        html += `
            <tr>
                <td>${escapeHtml(order.orderCode)}</td>
                <td>${escapeHtml(order.customerName)}</td>
                <td>${escapeHtml(order.products || 'Đang cập nhật')}</td>
                <td>${formatCurrency(order.total)}</td>
                <td><span class="status-badge ${statusClass}">${order.statusText}</span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Utility functions
function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0₫';
    if (amount >= 1e9) return (amount / 1e9).toFixed(1) + 'B';
    if (amount >= 1e6) return (amount / 1e6).toFixed(1) + 'M';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '₫';
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (!spinner) {
        const newSpinner = document.createElement('div');
        newSpinner.id = 'loadingSpinner';
        newSpinner.style.cssText = 'display: none; text-align: center; padding: 40px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--card-bg); border-radius: 20px; z-index: 1000;';
        newSpinner.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 40px; color: var(--neon-blue);"></i><p style="margin-top: 10px;">Đang tải dữ liệu...</p>';
        document.body.appendChild(newSpinner);
    }
    const spinnerEl = document.getElementById('loadingSpinner');
    if (spinnerEl) spinnerEl.style.display = show ? 'flex' : 'none';
}

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
 
// Logout function
async function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();

            if (data.success) {
                showNotification('Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    window.location.href = '/dangnhap';
                }, 1500);
            } else {
                showNotification(data.message || 'Có lỗi xảy ra!', 'error');
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        }
    }
}

// Handle sidebar menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (this.getAttribute('onclick') === 'logout()') return;
        if (!this.classList.contains('active') && !this.querySelector('a')) {
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// Handle notification button
document.querySelector('.notification-btn')?.addEventListener('click', function() {
    showNotification('Bạn có 3 thông báo mới', 'info');
});

// Add necessary CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    .stock-critical {
        background: rgba(255, 42, 109, 0.2);
        color: var(--neon-pink);
        animation: pulse 1s infinite;
    }
    .text-critical {
        color: var(--neon-pink);
        font-weight: bold;
    }
    .status-completed { background: rgba(5, 255, 161, 0.2); color: var(--neon-green); }
    .status-processing { background: rgba(0, 243, 255, 0.2); color: var(--neon-blue); }
    .status-pending { background: rgba(255, 222, 89, 0.2); color: var(--neon-yellow); }
    .status-cancelled { background: rgba(255, 42, 109, 0.2); color: var(--neon-pink); }
`;
document.head.appendChild(style);