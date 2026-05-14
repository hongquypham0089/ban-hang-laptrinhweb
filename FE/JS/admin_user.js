// ==================== CẤU HÌNH API ====================
const API_BASE_URL = '/api/admin/users';

// State management
let adminsData = [];
let usersData = [];
let currentAdminPage = 1;
let currentUserPage = 1;
let currentAdminSearch = '';
let currentUserSearch = '';
let currentDeleteId = null;
let currentDeleteType = null;
let currentEditAdminId = null;
let currentEditUserId = null;
const ITEMS_PER_PAGE = 10;

// ==================== KHỞI TẠO ====================
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadAdmins();
    loadUsers();
    setupEventListeners();
    loadAdminInfo();
});

// Load thông tin admin từ cookie/token
function loadAdminInfo() {
    // Có thể gọi API lấy thông tin user hiện tại nếu cần
    // Hoặc lấy từ localStorage/token
    const adminNameEl = document.getElementById('adminName');
    const adminEmailEl = document.getElementById('adminEmail');
    
    // Thử lấy từ localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            if (adminNameEl) adminNameEl.textContent = user.name || user.TenNguoiDung || 'Admin';
            if (adminEmailEl) adminEmailEl.textContent = user.email || user.Email || 'admin@computern9.vn';
        } catch(e) {}
    }
}

function setupEventListeners() {
    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.tab-pane.active').id;
            const searchTerm = searchInput.value;
            
            if (activeTab === 'adminsTab') {
                currentAdminSearch = searchTerm;
                currentAdminPage = 1;
                loadAdmins();
            } else {
                currentUserSearch = searchTerm;
                currentUserPage = 1;
                loadUsers();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

// ==================== API THỐNG KÊ ====================
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('totalUsers').textContent = formatNumber(result.data.totalUsers);
            document.getElementById('activeUsers').textContent = formatNumber(result.data.activeUsers);
            document.getElementById('pendingUsers').textContent = formatNumber(result.data.pendingUsers);
            document.getElementById('totalAdmins').textContent = formatNumber(result.data.totalAdmins);
        } else {
            console.error('Lỗi tải stats:', result.message);
        }
    } catch (error) {
        console.error('Lỗi tải stats:', error);
    }
}

// ==================== API QUẢN LÝ ADMIN ====================
async function loadAdmins() {
    showLoading(true);
    try {
        let url = `${API_BASE_URL}/admins?page=${currentAdminPage}&limit=${ITEMS_PER_PAGE}`;
        if (currentAdminSearch) {
            url += `&search=${encodeURIComponent(currentAdminSearch)}`;
        }
        
        const response = await fetch(url, { credentials: 'include' });
        const result = await response.json();
        
        if (result.success) {
            adminsData = result.data.admins;
            renderAdmins();
            renderAdminPagination(result.data.pagination);
        } else {
            showNotification('Lỗi tải danh sách admin: ' + result.message, 'error');
            document.getElementById('adminsTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center;">Lỗi tải dữ liệu</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi tải admin:', error);
        document.getElementById('adminsTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center;">Lỗi kết nối server</td></tr>';
    } finally {
        showLoading(false);
    }
}

function renderAdmins() {
    const tbody = document.getElementById('adminsTableBody');
    
    if (!adminsData || adminsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }
    
    let html = '';
    
    adminsData.forEach(admin => {
        let roleClass = '';
        let roleText = '';
        
        switch(admin.role) {
            case 'super':
                roleClass = 'role-super';
                roleText = 'Super Admin';
                break;
            case 'admin':
                roleClass = 'role-admin';
                roleText = 'Admin';
                break;
            default:
                roleClass = 'role-admin';
                roleText = 'Admin';
        }

        let permissionsHtml = '';
        if (admin.permissions && admin.permissions.includes('all')) {
            permissionsHtml = '<span class="permission-tag">Tất cả quyền</span>';
        } else if (admin.permissions) {
            admin.permissions.forEach(perm => {
                let permText = '';
                switch(perm) {
                    case 'products': permText = 'Sản phẩm'; break;
                    case 'orders': permText = 'Đơn hàng'; break;
                    case 'users': permText = 'Người dùng'; break;
                    default: permText = perm;
                }
                permissionsHtml += `<span class="permission-tag">${permText}</span>`;
            });
        } else {
            permissionsHtml = '<span class="permission-tag">Cơ bản</span>';
        }

        html += `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${(admin.name || 'A').charAt(0)}</div>
                        <div class="user-info">
                            <div class="user-name">${escapeHtml(admin.name || '')}</div>
                            <div class="user-email">${escapeHtml(admin.email || '')}</div>
                        </div>
                    </div>
                </td>
                <td><span class="role-badge ${roleClass}">${roleText}</span></td>
                <td>${permissionsHtml}</td>
                <td><span class="status-badge ${admin.status === 'active' ? 'status-active' : 'status-inactive'}">${admin.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}</span></td>
                <td>${admin.lastLogin || 'Chưa đăng nhập'}</td>
                <td>
                    <div class="action-buttons">
                        <div class="action-btn edit" onclick="openEditAdminModal(${admin.id})">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="action-btn delete" onclick="openDeleteModal('admin', ${admin.id})">
                            <i class="fas fa-trash"></i>
                        </div>
                        <div class="action-btn lock" onclick="toggleAdminStatus(${admin.id})">
                            <i class="fas ${admin.status === 'active' ? 'fa-lock' : 'fa-unlock'}"></i>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function renderAdminPagination(pagination) {
    const infoDiv = document.getElementById('adminsPaginationInfo');
    const buttonsDiv = document.getElementById('adminsPaginationButtons');
    
    if (!pagination || pagination.totalItems === 0) {
        if (infoDiv) infoDiv.textContent = 'Không có dữ liệu';
        if (buttonsDiv) buttonsDiv.innerHTML = '';
        return;
    }
    
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(start + pagination.limit - 1, pagination.totalItems);
    
    if (infoDiv) {
        infoDiv.textContent = `Hiển thị ${start}-${end} của ${pagination.totalItems} quản trị viên`;
    }
    
    if (!buttonsDiv) return;
    
    let buttonsHtml = '';
    buttonsHtml += `<button class="page-btn" onclick="changeAdminPage(${pagination.currentPage - 1})" ${pagination.currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    
    const maxButtons = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        buttonsHtml += `<button class="page-btn ${i === pagination.currentPage ? 'active' : ''}" onclick="changeAdminPage(${i})">${i}</button>`;
    }
    
    buttonsHtml += `<button class="page-btn" onclick="changeAdminPage(${pagination.currentPage + 1})" ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    
    buttonsDiv.innerHTML = buttonsHtml;
}

function changeAdminPage(page) {
    if (page < 1) return;
    currentAdminPage = page;
    loadAdmins();
}

async function saveAdmin() {
    const id = document.getElementById('adminId').value;
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const role = document.getElementById('adminRole').value;
    const status = document.getElementById('adminStatus').value;
    
    if (!name || !email) {
        showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    if (!id && !password) {
        showNotification('Vui lòng nhập mật khẩu', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        let url = `${API_BASE_URL}/admins`;
        let method = 'POST';
        let body = { name, email, role, status, permissions: ['products', 'orders', 'users'] };
        
        if (password) {
            body.password = password;
        }
        
        if (id) {
            method = 'PUT';
            url += `/${id}`;
            delete body.password; // Không gửi password khi update
        }
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            closeAdminModal();
            loadAdmins();
            loadStats();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi lưu admin:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        showLoading(false);
    }
}

async function toggleAdminStatus(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admins/${id}/toggle-status`, {
            method: 'PATCH',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadAdmins();
            loadStats();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi chuyển trạng thái:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

async function deleteAdmin(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadAdmins();
            loadStats();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi xóa admin:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

// ==================== API QUẢN LÝ NGƯỜI DÙNG ====================
async function loadUsers() {
    showLoading(true);
    try {
        let url = `${API_BASE_URL}/users?page=${currentUserPage}&limit=${ITEMS_PER_PAGE}`;
        if (currentUserSearch) {
            url += `&search=${encodeURIComponent(currentUserSearch)}`;
        }
        
        const response = await fetch(url, { credentials: 'include' });
        const result = await response.json();
        
        if (result.success) {
            usersData = result.data.users;
            renderUsers();
            renderUserPagination(result.data.pagination);
        } else {
            showNotification('Lỗi tải danh sách người dùng: ' + result.message, 'error');
            document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" style="text-align: center;">Lỗi tải dữ liệu</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi tải users:', error);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" style="text-align: center;">Lỗi kết nối server</td></tr>';
    } finally {
        showLoading(false);
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    if (!usersData || usersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }
    
    let html = '';
    
    usersData.forEach(user => {
        html += `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${(user.name || 'U').charAt(0)}</div>
                        <div class="user-info">
                            <div class="user-name">${escapeHtml(user.name || '')}</div>
                            <div class="user-email">${escapeHtml(user.email || '')}</div>
                        </div>
                    </div>
                </td>
                <td>${user.phone || 'Chưa cập nhật'}</td>
                <td>${user.joinDate || 'N/A'}</td>
                <td>${user.orders || 0}</td>
                <td style="color: var(--neon-green); font-weight: 600;">${formatPrice(user.spent || 0)}</td>
                <td>
                    <span class="status-badge ${user.status === 'active' ? 'status-active' : user.status === 'pending' ? 'status-pending' : 'status-inactive'}">
                        ${user.status === 'active' ? 'Hoạt động' : user.status === 'pending' ? 'Chờ xác thực' : 'Vô hiệu'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <div class="action-btn view" onclick="viewUserDetail(${user.id})">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div class="action-btn edit" onclick="openEditUserModal(${user.id})">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="action-btn delete" onclick="openDeleteModal('user', ${user.id})">
                            <i class="fas fa-trash"></i>
                        </div>
                        <div class="action-btn lock" onclick="toggleUserStatus(${user.id})">
                            <i class="fas ${user.status === 'active' ? 'fa-lock' : 'fa-unlock'}"></i>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function renderUserPagination(pagination) {
    const infoDiv = document.getElementById('usersPaginationInfo');
    const buttonsDiv = document.getElementById('usersPaginationButtons');
    
    if (!pagination || pagination.totalItems === 0) {
        if (infoDiv) infoDiv.textContent = 'Không có dữ liệu';
        if (buttonsDiv) buttonsDiv.innerHTML = '';
        return;
    }
    
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(start + pagination.limit - 1, pagination.totalItems);
    
    if (infoDiv) {
        infoDiv.textContent = `Hiển thị ${start}-${end} của ${pagination.totalItems} người dùng`;
    }
    
    if (!buttonsDiv) return;
    
    let buttonsHtml = '';
    buttonsHtml += `<button class="page-btn" onclick="changeUserPage(${pagination.currentPage - 1})" ${pagination.currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    
    const maxButtons = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        buttonsHtml += `<button class="page-btn ${i === pagination.currentPage ? 'active' : ''}" onclick="changeUserPage(${i})">${i}</button>`;
    }
    
    buttonsHtml += `<button class="page-btn" onclick="changeUserPage(${pagination.currentPage + 1})" ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    
    buttonsDiv.innerHTML = buttonsHtml;
}

function changeUserPage(page) {
    if (page < 1) return;
    currentUserPage = page;
    loadUsers();
}

async function saveUser() {
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;
    const birthday = document.getElementById('userBirthday').value;
    const password = document.getElementById('userPassword').value;
    const address = document.getElementById('userAddress').value;
    const status = document.getElementById('userStatus').value;
    const rank = document.getElementById('userRank').value;
    
    if (!name || !email) {
        showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        let url = `${API_BASE_URL}/users`;
        let method = 'POST';
        let body = { name, email, phone, birthday, address, status, rank };
        
        if (password) {
            body.password = password;
        }
        
        if (id) {
            method = 'PUT';
            url += `/${id}`;
            delete body.password;
        }
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            closeUserModal();
            loadUsers();
            loadStats();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi lưu user:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        showLoading(false);
    }
}

async function toggleUserStatus(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
            method: 'PATCH',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadUsers();
            loadStats();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi chuyển trạng thái:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

async function deleteUser(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadUsers();
            loadStats();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi xóa user:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

async function viewUserDetail(id) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, { credentials: 'include' });
        const result = await response.json();
        
        if (result.success) {
            const user = result.data;
            const modalBody = document.getElementById('viewModalBody');
            
            modalBody.innerHTML = `
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); display: flex; align-items: center; justify-content: center; font-size: 32px; color: white;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 1.8rem; margin-bottom: 5px;">${escapeHtml(user.name)}</h2>
                        <p style="color: var(--text-secondary);">Thành viên từ: ${user.joinDate}</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: 5px;">Email</p>
                        <p style="font-weight: 600;">${escapeHtml(user.email)}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: 5px;">Số điện thoại</p>
                        <p style="font-weight: 600;">${user.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: 5px;">Ngày sinh</p>
                        <p style="font-weight: 600;">${user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: 5px;">Hạng thành viên</p>
                        <p><span class="role-badge role-user">${user.rank}</span></p>
                    </div>
                    <div style="grid-column: span 2;">
                        <p style="color: var(--text-secondary); margin-bottom: 5px;">Địa chỉ</p>
                        <p style="font-weight: 600;">${user.address || 'Chưa cập nhật'}</p>
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <h4 style="margin-bottom: 15px;">Thống kê</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 10px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--neon-blue);">${user.stats.totalOrders}</div>
                            <div style="color: var(--text-secondary);">Tổng đơn</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 10px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--neon-green);">${formatPrice(user.stats.totalSpent)}</div>
                            <div style="color: var(--text-secondary);">Chi tiêu</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 10px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--neon-yellow);">${user.stats.pendingOrders}</div>
                            <div style="color: var(--text-secondary);">Đơn đang giao</div>
                        </div>
                    </div>
                </div>
            `;
            
            viewModal.classList.add('active');
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Lỗi tải chi tiết user:', error);
        showNotification('Lỗi kết nối server', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== MODAL FUNCTIONS ====================
function openAddAdminModal() {
    document.getElementById('adminModalTitle').innerHTML = '<i class="fas fa-user-tie"></i> Thêm quản trị viên mới';
    document.getElementById('adminForm').reset();
    document.getElementById('adminId').value = '';
    document.getElementById('adminPassword').required = true;
    adminModal.classList.add('active');
}

function openEditAdminModal(id) {
    const admin = adminsData.find(a => a.id === id);
    if (admin) {
        document.getElementById('adminModalTitle').innerHTML = '<i class="fas fa-edit"></i> Sửa thông tin admin';
        document.getElementById('adminId').value = admin.id;
        document.getElementById('adminName').value = admin.name;
        document.getElementById('adminEmail').value = admin.email;
        document.getElementById('adminRole').value = admin.role;
        document.getElementById('adminStatus').value = admin.status;
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').required = false;
        adminModal.classList.add('active');
    }
}

function closeAdminModal() {
    adminModal.classList.remove('active');
}

function openAddUserModal() {
    document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user"></i> Thêm người dùng mới';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
    userModal.classList.add('active');
}

function openEditUserModal(id) {
    const user = usersData.find(u => u.id === id);
    if (user) {
        document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-edit"></i> Sửa thông tin người dùng';
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPhone').value = user.phone;
        document.getElementById('userStatus').value = user.status;
        document.getElementById('userRank').value = user.rank;
        document.getElementById('userAddress').value = user.address || '';
        document.getElementById('userBirthday').value = user.birthday ? user.birthday.split('T')[0] : '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userPassword').required = false;
        userModal.classList.add('active');
    }
}

function closeUserModal() {
    userModal.classList.remove('active');
}

function openDeleteModal(type, id) {
    currentDeleteType = type;
    currentDeleteId = id;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    currentDeleteId = null;
    currentDeleteType = null;
}

function confirmDelete() {
    if (currentDeleteType === 'admin') {
        deleteAdmin(currentDeleteId);
    } else if (currentDeleteType === 'user') {
        deleteUser(currentDeleteId);
    }
    closeDeleteModal();
}

function closeViewModal() {
    viewModal.classList.remove('active');
}

// ==================== UTILITY FUNCTIONS ====================
function formatPrice(price) {
    if (!price) return '0₫';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '₫';
}

function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    if (tab === 'admins') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('adminsTab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('usersTab').classList.add('active');
    }
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

// Logout function
function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        .then(() => {
            window.location.href = '/login';
        })
        .catch(() => {
            window.location.href = '/login';
        });
}

// Handle sidebar navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (this.onclick === logout) return;
        if (!this.classList.contains('active') && !this.querySelector('a')) {
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// Handle notification button
document.querySelector('.notification-btn')?.addEventListener('click', function() {
    showNotification('Bạn có 3 thông báo mới về người dùng', 'info');
});

// Handle click outside modal to close
window.onclick = function(event) {
    if (event.target === adminModal) closeAdminModal();
    if (event.target === userModal) closeUserModal();
    if (event.target === deleteModal) closeDeleteModal();
    if (event.target === viewModal) closeViewModal();
};
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
// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    .status-pending {
        background: rgba(255, 222, 89, 0.2);
        color: var(--neon-yellow);
        border: 1px solid var(--neon-yellow);
    }
`;
document.head.appendChild(style);