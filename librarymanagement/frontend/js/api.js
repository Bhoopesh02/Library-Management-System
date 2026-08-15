const API_BASE_URL = 'http://localhost:8080/api';

async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Handle unauthorized (expired token)
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                const isAdminPath = window.location.pathname.includes('admin') || 
                                    window.location.pathname.includes('manage-') || 
                                    window.location.pathname.includes('transactions');
                const redirectTarget = isAdminPath 
                    ? (window.location.pathname.includes('/pages/') ? '../admin-login.html' : 'admin-login.html') 
                    : (window.location.pathname.includes('/pages/') ? '../login.html' : 'login.html');
                window.location.href = redirectTarget;
                throw new Error(data.message || 'Session expired. Please log in again.');
            }
            throw new Error(data.message || 'An error occurred');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Global UI Toast Helper
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const iconColor = type === 'success' ? 'var(--primary-color)' : 'var(--danger-color)';
    
    toast.innerHTML = `<i class="fas ${iconClass}" style="margin-right: 10px; color: ${iconColor}; font-size: 1.1rem;"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 250);
    }, 3000);
}

function logout() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user && user.role === 'ADMIN';
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    const isPagesDir = window.location.pathname.includes('/pages/');
    if (isAdmin) {
        window.location.href = isPagesDir ? '../admin-login.html' : 'admin-login.html';
    } else {
        window.location.href = isPagesDir ? '../login.html' : 'login.html';
    }
}

function requireAdmin() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!token || !user || user.role !== 'ADMIN') {
        const isPagesDir = window.location.pathname.includes('/pages/');
        window.location.href = isPagesDir ? '../admin-login.html' : 'admin-login.html';
        return false;
    }
    return true;
}






