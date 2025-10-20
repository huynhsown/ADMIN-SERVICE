// Global variables
let authToken = localStorage.getItem('adminToken');
let charts = {};
let refreshInterval;
let currentPage = 1;
let currentFilters = {};
let postsData = {};

// DOM elements
const loginModal = document.getElementById('loginModal');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const currentTime = document.getElementById('currentTime');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    if (authToken) {
        showDashboard();
        loadDashboardData();
    } else {
        showLoginModal();
    }
    
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Refresh health button
    const refreshHealthBtn = document.getElementById('refreshHealthBtn');
    if (refreshHealthBtn) {
        refreshHealthBtn.addEventListener('click', loadHealthData);
    }
    
    // Post management event listeners
    setupPostManagementListeners();
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        showLoading();
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            hideLoading();
            showDashboard();
            loadDashboardData();
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Lỗi kết nối đến server');
    }
}

function handleLogout() {
    authToken = null;
    localStorage.removeItem('adminToken');
    showLoginModal();
    clearInterval(refreshInterval);
}

// UI functions
function showLoginModal() {
    loginModal.style.display = 'flex';
    dashboard.style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    hideError();
}

function showDashboard() {
    loginModal.style.display = 'none';
    dashboard.style.display = 'block';
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Load section-specific data
    loadSectionData(sectionName);
    
    // Load posts data when posts section is active
    if (sectionName === 'posts') {
        loadPostsData();
    }
}

function showLoading() {
    loadingSpinner.classList.add('show');
}

function hideLoading() {
    loadingSpinner.classList.remove('show');
}

function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function hideError() {
    loginError.style.display = 'none';
}

function updateCurrentTime() {
    const now = new Date();
    currentTime.textContent = now.toLocaleString('vi-VN');
}

// API functions
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    const response = await fetch(endpoint, { ...defaultOptions, ...options });
    
    if (response.status === 401) {
        handleLogout();
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Data loading functions
async function loadDashboardData() {
    try {
        showLoading();
        
        const response = await apiCall('/api/stats/dashboard');
        const data = await response.json();
        
        if (response.ok) {
            updateOverviewData(data);
            createCharts(data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Lỗi tải dữ liệu dashboard: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function loadSectionData(section) {
    try {
        showLoading();
        
        let endpoint;
        switch (section) {
            case 'users':
                endpoint = '/api/stats/users';
                break;
            case 'posts':
                endpoint = '/api/stats/posts';
                break;
            case 'comments':
                endpoint = '/api/stats/comments';
                break;
            case 'reactions':
                endpoint = '/api/stats/reactions';
                break;
            case 'notifications':
                endpoint = '/api/stats/notifications';
                break;
            case 'health':
                await loadHealthData();
                hideLoading();
                return;
            default:
                hideLoading();
                return;
        }
        
        const response = await apiCall(endpoint);
        const data = await response.json();
        
        if (response.ok) {
            updateSectionData(section, data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error(`Error loading ${section} data:`, error);
        alert(`Lỗi tải dữ liệu ${section}: ` + error.message);
    } finally {
        hideLoading();
    }
}

async function loadHealthData() {
    try {
        const response = await apiCall('/api/stats/health');
        const data = await response.json();
        
        if (response.ok) {
            updateHealthData(data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading health data:', error);
        alert('Lỗi tải dữ liệu hệ thống: ' + error.message);
    }
}

// Data update functions
function updateOverviewData(data) {
    // Update user stats
    document.getElementById('totalUsers').textContent = data.users.total.toLocaleString();
    document.getElementById('todayUsers').textContent = `Hôm nay: ${data.users.today.toLocaleString()}`;
    
    // Update post stats
    document.getElementById('totalPosts').textContent = data.posts.total.toLocaleString();
    document.getElementById('todayPosts').textContent = `Hôm nay: ${data.posts.today.toLocaleString()}`;
    
    // Update comment stats
    document.getElementById('totalComments').textContent = data.comments.total.toLocaleString();
    document.getElementById('todayComments').textContent = `Hôm nay: ${data.comments.today.toLocaleString()}`;
    
    // Update reaction stats
    document.getElementById('totalReactions').textContent = data.reactions.total.toLocaleString();
    const reactionTypes = data.reactions.byType.length;
    document.getElementById('reactionTypes').textContent = `${reactionTypes} loại`;
}

function updateSectionData(section, data) {
    switch (section) {
        case 'users':
            updateUserData(data);
            break;
        case 'posts':
            updatePostData(data);
            break;
        case 'comments':
            updateCommentData(data);
            break;
        case 'reactions':
            updateReactionData(data);
            break;
        case 'notifications':
            updateNotificationData(data);
            break;
    }
}

function updateUserData(data) {
    document.getElementById('userTotal').textContent = data.total.toLocaleString();
    document.getElementById('userToday').textContent = data.today.toLocaleString();
    document.getElementById('userWeek').textContent = data.week.toLocaleString();
    document.getElementById('userMonth').textContent = data.month.toLocaleString();
    
    // Update recent users table
    const tbody = document.querySelector('#recentUsersTable tbody');
    tbody.innerHTML = '';
    
    data.recent.forEach(user => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = user.userId;
        row.insertCell(1).textContent = user.username;
        row.insertCell(2).textContent = `${user.firstName} ${user.lastName}`;
        row.insertCell(3).textContent = user.email;
        row.insertCell(4).textContent = new Date(user.createdAt).toLocaleString('vi-VN');
    });
}

function updatePostData(data) {
    document.getElementById('postTotal').textContent = data.total.toLocaleString();
    document.getElementById('postToday').textContent = data.today.toLocaleString();
    document.getElementById('postWeek').textContent = data.week.toLocaleString();
    
    // Update recent posts table
    const tbody = document.querySelector('#recentPostsTable tbody');
    tbody.innerHTML = '';
    
    data.recent.forEach(post => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = post.post_id;
        row.insertCell(1).textContent = post.author_id;
        row.insertCell(2).textContent = post.type;
        row.insertCell(3).textContent = post.content.substring(0, 50) + '...';
        row.insertCell(4).textContent = new Date(post.created_at).toLocaleString('vi-VN');
    });
}

// Post Management Functions
function setupPostManagementListeners() {
    // Search button
    const searchBtn = document.getElementById('postSearchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handlePostSearch);
    }
    
    // Filter button
    const filterBtn = document.getElementById('postFilterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', handlePostFilter);
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('postRefreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadPostsData);
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // Export button
    const exportBtn = document.getElementById('exportPostsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportPosts);
    }
}

async function loadPostsData() {
    try {
        showLoading();
        
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: 20,
            ...currentFilters
        });
        
        const response = await apiCall(`/api/posts?${queryParams}`);
        const data = await response.json();
        
        if (response.ok) {
            postsData = data;
            updatePostsTable(data);
            updatePagination(data.pagination);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Lỗi tải dữ liệu bài viết: ' + error.message);
    } finally {
        hideLoading();
    }
}

function updatePostsTable(data) {
    const tbody = document.querySelector('#postsTable tbody');
    tbody.innerHTML = '';
    
    data.posts.forEach(post => {
        const row = tbody.insertRow();
        
        // ID
        const idCell = row.insertCell(0);
        idCell.textContent = post.post_id.substring(0, 8) + '...';
        idCell.title = post.post_id;
        
        // Author
        const authorCell = row.insertCell(1);
        if (post.author) {
            authorCell.innerHTML = `
                <div>
                    <strong>${post.author.username}</strong><br>
                    <small>${post.author.firstName} ${post.author.lastName}</small>
                </div>
            `;
        } else {
            authorCell.textContent = 'Unknown';
        }
        
        // Type
        const typeCell = row.insertCell(2);
        typeCell.textContent = post.type || 'Unknown';
        
        // Visibility
        const visibilityCell = row.insertCell(3);
        visibilityCell.textContent = post.visibility || 'Unknown';
        
        // Content
        const contentCell = row.insertCell(4);
        contentCell.innerHTML = `
            <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                ${post.content ? post.content.substring(0, 100) + '...' : 'No content'}
            </div>
        `;
        
        // Likes (placeholder)
        const likesCell = row.insertCell(5);
        likesCell.textContent = post.reactions?.total || 0;
        
        // Comments (placeholder)
        const commentsCell = row.insertCell(6);
        commentsCell.textContent = post.commentsCount || 0;
        
        // Created date
        const dateCell = row.insertCell(7);
        dateCell.textContent = new Date(post.created_at).toLocaleString('vi-VN');
        
        // Status
        const statusCell = row.insertCell(8);
        const statusClass = post.delete_flag ? 'status-deleted' : 'status-active';
        const statusText = post.delete_flag ? 'Đã xóa' : 'Hoạt động';
        statusCell.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
        
        // Actions
        const actionsCell = row.insertCell(9);
        actionsCell.innerHTML = `
            <button class="action-btn view" onclick="viewPostDetails('${post.post_id}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn view" onclick="viewPostComments('${post.post_id}')">
                <i class="fas fa-comments"></i>
            </button>
            ${post.delete_flag ? 
                `<button class="action-btn restore" onclick="restorePost('${post.post_id}')">
                    <i class="fas fa-undo"></i>
                </button>` :
                `<button class="action-btn delete" onclick="deletePost('${post.post_id}')">
                    <i class="fas fa-trash"></i>
                </button>`
            }
        `;
    });
}

function updatePagination(pagination) {
    const { page, limit, total, totalPages } = pagination;
    
    document.getElementById('currentPage').textContent = page;
    document.getElementById('paginationInfo').textContent = 
        `Hiển thị ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} của ${total}`;
    
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
}

function changePage(newPage) {
    if (newPage >= 1) {
        currentPage = newPage;
        loadPostsData();
    }
}

async function handlePostSearch() {
    const searchQuery = document.getElementById('postSearchInput').value.trim();
    if (searchQuery) {
        currentFilters = { search: searchQuery };
        currentPage = 1;
        await loadPostsData();
    }
}

async function handlePostFilter() {
    const type = document.getElementById('postTypeFilter').value;
    const visibility = document.getElementById('postVisibilityFilter').value;
    const status = document.getElementById('postStatusFilter').value;
    
    currentFilters = {};
    if (type) currentFilters.type = type;
    if (visibility) currentFilters.visibility = visibility;
    if (status) currentFilters.delete_flag = status === 'deleted';
    
    currentPage = 1;
    await loadPostsData();
}

async function viewPostDetails(postId) {
    try {
        showLoading();
        
        const response = await apiCall(`/api/posts/${postId}`);
        const post = await response.json();
        
        if (response.ok) {
            showPostDetailsModal(post);
        } else {
            throw new Error(post.error);
        }
    } catch (error) {
        console.error('Error loading post details:', error);
        alert('Lỗi tải chi tiết bài viết: ' + error.message);
    } finally {
        hideLoading();
    }
}

function showPostDetailsModal(post) {
    const modal = document.getElementById('postDetailsModal');
    const content = document.getElementById('postDetailsContent');
    
    content.innerHTML = `
        <div class="post-details">
            <div class="post-info">
                <h4>Thông tin bài viết</h4>
                <div class="info-item">
                    <span class="info-label">ID:</span>
                    <span class="info-value">${post.post_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tác giả:</span>
                    <span class="info-value">${post.author ? post.author.username : 'Unknown'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Loại:</span>
                    <span class="info-value">${post.type || 'Unknown'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Quyền riêng tư:</span>
                    <span class="info-value">${post.visibility || 'Unknown'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ngày tạo:</span>
                    <span class="info-value">${new Date(post.created_at).toLocaleString('vi-VN')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ngày cập nhật:</span>
                    <span class="info-value">${new Date(post.updated_at).toLocaleString('vi-VN')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Trạng thái:</span>
                    <span class="info-value">
                        <span class="status-badge ${post.delete_flag ? 'status-deleted' : 'status-active'}">
                            ${post.delete_flag ? 'Đã xóa' : 'Hoạt động'}
                        </span>
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Likes:</span>
                    <span class="info-value">${post.reactions?.total || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Comments:</span>
                    <span class="info-value">${post.commentsCount || 0}</span>
                </div>
            </div>
            
            <div class="post-content">
                <h4>Nội dung</h4>
                <div class="post-text">${post.content || 'Không có nội dung'}</div>
                
                ${post.media && post.media.length > 0 ? `
                    <h4>Media (${post.media.length})</h4>
                    <div class="post-media">
                        ${post.media.map(media => `
                            <div class="media-item">
                                <img src="${media.media_url}" alt="Media" onerror="this.style.display='none'">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${post.hashtags && post.hashtags.length > 0 ? `
                    <h4>Hashtags</h4>
                    <div style="margin-top: 1rem;">
                        ${post.hashtags.map(hashtag => `
                            <span class="status-badge" style="margin-right: 0.5rem;">#${hashtag.tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="post-actions">
                    <button class="btn btn-primary" onclick="viewPostComments('${post.post_id}')">
                        <i class="fas fa-comments"></i> Xem bình luận
                    </button>
                    ${post.delete_flag ? 
                        `<button class="btn btn-warning" onclick="restorePost('${post.post_id}')">
                            <i class="fas fa-undo"></i> Khôi phục
                        </button>` :
                        `<button class="btn btn-danger" onclick="deletePost('${post.post_id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>`
                    }
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function closePostDetailsModal() {
    document.getElementById('postDetailsModal').classList.remove('show');
}

async function viewPostComments(postId) {
    try {
        showLoading();
        
        const response = await apiCall(`/api/posts/${postId}/comments`);
        const data = await response.json();
        
        if (response.ok) {
            showCommentsModal(postId, data.comments);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        alert('Lỗi tải bình luận: ' + error.message);
    } finally {
        hideLoading();
    }
}

function showCommentsModal(postId, comments) {
    const modal = document.getElementById('commentsModal');
    const content = document.getElementById('commentsContent');
    
    content.innerHTML = `
        <h4>Bình luận cho bài viết: ${postId.substring(0, 8)}...</h4>
        <div class="comments-list">
            ${comments.length > 0 ? comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-avatar">
                        ${comment.author ? comment.author.firstName.charAt(0) : '?'}
                    </div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">
                                ${comment.author ? comment.author.username : 'Unknown'}
                            </span>
                            <span class="comment-date">
                                ${new Date(comment.created_at).toLocaleString('vi-VN')}
                            </span>
                        </div>
                        <div class="comment-text">${comment.content}</div>
                        <div class="comment-actions">
                            <button class="action-btn delete" onclick="deleteComment('${comment.comment_id}')">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            `).join('') : '<p>Không có bình luận nào.</p>'}
        </div>
    `;
    
    modal.classList.add('show');
}

function closeCommentsModal() {
    document.getElementById('commentsModal').classList.remove('show');
}

async function deletePost(postId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    
    try {
        showLoading();
        
        const response = await apiCall(`/api/posts/${postId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (response.ok) {
            alert('Xóa bài viết thành công!');
            loadPostsData();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Lỗi xóa bài viết: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function restorePost(postId) {
    if (!confirm('Bạn có chắc chắn muốn khôi phục bài viết này?')) return;
    
    try {
        showLoading();
        
        const response = await apiCall(`/api/posts/${postId}/restore`, {
            method: 'PATCH'
        });
        const result = await response.json();
        
        if (response.ok) {
            alert('Khôi phục bài viết thành công!');
            loadPostsData();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error restoring post:', error);
        alert('Lỗi khôi phục bài viết: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteComment(commentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    
    try {
        showLoading();
        
        const response = await apiCall(`/api/posts/comments/${commentId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (response.ok) {
            alert('Xóa bình luận thành công!');
            closeCommentsModal();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Lỗi xóa bình luận: ' + error.message);
    } finally {
        hideLoading();
    }
}

function exportPosts() {
    // Simple CSV export
    if (!postsData.posts || postsData.posts.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const csvContent = [
        ['ID', 'Tác giả', 'Loại', 'Quyền riêng tư', 'Nội dung', 'Ngày tạo', 'Trạng thái'],
        ...postsData.posts.map(post => [
            post.post_id,
            post.author ? post.author.username : 'Unknown',
            post.type || 'Unknown',
            post.visibility || 'Unknown',
            (post.content || '').replace(/\n/g, ' ').substring(0, 100),
            new Date(post.created_at).toLocaleString('vi-VN'),
            post.delete_flag ? 'Đã xóa' : 'Hoạt động'
        ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `posts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateCommentData(data) {
    document.getElementById('commentTotal').textContent = data.total.toLocaleString();
    document.getElementById('commentToday').textContent = data.today.toLocaleString();
    document.getElementById('commentWeek').textContent = data.week.toLocaleString();
    
    // Update top commented posts table
    const tbody = document.querySelector('#topCommentedPostsTable tbody');
    tbody.innerHTML = '';
    
    data.topCommentedPosts.forEach(post => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = post.post_id;
        row.insertCell(1).textContent = post.comment_count.toLocaleString();
    });
}

function updateReactionData(data) {
    document.getElementById('reactionTotal').textContent = data.total.toLocaleString();
    
    // Update top reacted posts table
    const tbody = document.querySelector('#topReactedPostsTable tbody');
    tbody.innerHTML = '';
    
    data.topReactedPosts.forEach(post => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = post.target_id;
        row.insertCell(1).textContent = post.target_type;
        row.insertCell(2).textContent = post.reaction_count.toLocaleString();
    });
}

function updateNotificationData(data) {
    document.getElementById('notificationTotal').textContent = data.total.toLocaleString();
    document.getElementById('notificationUnread').textContent = data.unread.toLocaleString();
    
    // Update recent notifications table
    const tbody = document.querySelector('#recentNotificationsTable tbody');
    tbody.innerHTML = '';
    
    data.recent.forEach(notification => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = notification.notification_id;
        row.insertCell(1).textContent = notification.to_user_id;
        row.insertCell(2).textContent = notification.from_user_id;
        row.insertCell(3).textContent = notification.event_type;
        row.insertCell(4).textContent = notification.message;
        row.insertCell(5).textContent = new Date(notification.created_at).toLocaleString('vi-VN');
    });
}

function updateHealthData(data) {
    Object.keys(data.databases).forEach(db => {
        const card = document.getElementById(`${db}Health`);
        if (card) {
            const statusElement = card.querySelector('.health-status');
            statusElement.textContent = data.databases[db].status;
            statusElement.className = `health-status ${data.databases[db].status}`;
        }
    });
}

// Chart functions
function createCharts(data) {
    createUserChart(data.users);
    createPostTypeChart(data.posts.byType);
    createReactionTypeChart(data.reactions.byType);
    createReactionTargetChart(data.reactions.byTargetType);
}

function createUserChart(userData) {
    const ctx = document.getElementById('userChart');
    if (!ctx) return;
    
    if (charts.userChart) {
        charts.userChart.destroy();
    }
    
    charts.userChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Tổng', 'Hôm nay', 'Tuần này', 'Tháng này'],
            datasets: [{
                label: 'Người dùng',
                data: [userData.total, userData.today, userData.week, userData.month],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createPostTypeChart(postTypeData) {
    const ctx = document.getElementById('postTypeChart');
    if (!ctx) return;
    
    if (charts.postTypeChart) {
        charts.postTypeChart.destroy();
    }
    
    const labels = postTypeData.map(item => item.type);
    const data = postTypeData.map(item => item.count);
    
    charts.postTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe',
                    '#00f2fe'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createReactionTypeChart(reactionTypeData) {
    const ctx = document.getElementById('reactionTypeChart');
    if (!ctx) return;
    
    if (charts.reactionTypeChart) {
        charts.reactionTypeChart.destroy();
    }
    
    const labels = reactionTypeData.map(item => item.reaction_type);
    const data = reactionTypeData.map(item => item.count);
    
    charts.reactionTypeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng',
                data: data,
                backgroundColor: '#43e97b'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createReactionTargetChart(reactionTargetData) {
    const ctx = document.getElementById('reactionTargetChart');
    if (!ctx) return;
    
    if (charts.reactionTargetChart) {
        charts.reactionTargetChart.destroy();
    }
    
    const labels = reactionTargetData.map(item => item.target_type);
    const data = reactionTargetData.map(item => item.count);
    
    charts.reactionTargetChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#38f9d7',
                    '#4facfe',
                    '#667eea',
                    '#764ba2'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Auto-refresh functionality
function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            const sectionId = activeSection.id;
            if (sectionId === 'health') {
                loadHealthData();
            } else if (sectionId === 'overview') {
                loadDashboardData();
            }
        }
    }, 30000); // Refresh every 30 seconds
}

// Start auto-refresh when dashboard is shown
if (authToken) {
    startAutoRefresh();
}
