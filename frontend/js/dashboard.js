document.addEventListener('DOMContentLoaded', () => {
    
    // Auth Check
    if (!requireAdmin()) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Set Header Info
    if (user && user.name) {
        document.getElementById('userName').textContent = user.name;
    }
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString(undefined, dateOptions);
    }
    
    // Load Dashboard Stats
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const response = await fetchApi('/dashboard/admin');
        if (response.success) {
            const stats = response.data;
            
            if (typeof animateCountUp === 'function') {
                animateCountUp('statTotalBooks', stats.totalBooks || 0, 500);
                animateCountUp('statTotalUsers', stats.totalUsers || 0, 500);
                animateCountUp('statCurrentlyIssued', stats.currentlyIssued || 0, 500);
                animateCountUp('statActiveFines', stats.activeFines || 0, 500);
            } else {
                document.getElementById('statTotalBooks').textContent = stats.totalBooks || 0;
                document.getElementById('statTotalUsers').textContent = stats.totalUsers || 0;
                document.getElementById('statCurrentlyIssued').textContent = stats.currentlyIssued || 0;
                document.getElementById('statActiveFines').textContent = stats.activeFines || 0;
            }
            
            initCharts(stats);
        }
    } catch (error) {
        showToast('Failed to load dashboard statistics', 'error');
    }
}

function initCharts(stats) {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E0E0E0' : '#333333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    
    // Activity Chart
    const activityCanvas = document.getElementById('activityChart');
    if (activityCanvas) {
        const ctxActivity = activityCanvas.getContext('2d');
        new Chart(ctxActivity, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Books Issued',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: '#00B4A8',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(0, 180, 168, 0.1)',
                    pointBackgroundColor: '#00B4A8',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: window.prefersReducedMotion && window.prefersReducedMotion() ? 0 : 750
                },
                plugins: {
                    legend: { labels: { color: textColor, font: { family: 'Inter' } } }
                },
                scales: {
                    x: { 
                        ticks: { color: textColor, font: { family: 'Inter' } },
                        grid: { color: gridColor }
                    },
                    y: { 
                        ticks: { color: textColor, font: { family: 'Inter' } },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }
    
    // Category Chart
    const categoryCanvas = document.getElementById('categoryChart');
    if (categoryCanvas) {
        const ctxCategory = categoryCanvas.getContext('2d');
        new Chart(ctxCategory, {
            type: 'doughnut',
            data: {
                labels: ['Mathematics', 'Programming Languages', 'Fiction', 'Science and Nature'],
                datasets: [{
                    data: [30, 20, 15, 35],
                    backgroundColor: [
                        '#00B4A8',
                        '#45D1C7',
                        '#008F85',
                        '#7CEAE2'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: window.prefersReducedMotion && window.prefersReducedMotion() ? 0 : 750
                },
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { color: textColor, font: { family: 'Inter' }, boxWidth: 12, padding: 15 } 
                    }
                }
            }
        });
    }
}
