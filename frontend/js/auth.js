document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const togglePassword = document.getElementById('togglePassword');
    
    if (togglePassword) {
        togglePassword.addEventListener('click', function (e) {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
            
            if (!email || !password) return;
            
            const originalBtnHtml = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Authenticating...';
                
                const response = await fetchApi('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                if (response.success) {
                    const { token, user } = response.data;
                    
                    if (user.role !== 'ADMIN') {
                        showToast('This account does not have administrator access.', 'error');
                        if (typeof shakeElement === 'function') shakeElement(adminLoginForm);
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnHtml;
                        return;
                    }
                    
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Authenticated!';
                    showToast('Admin login successful!');
                    
                    setTimeout(() => {
                        window.location.href = 'pages/admin-dashboard.html';
                    }, 800);
                }
            } catch (error) {
                if (typeof shakeElement === 'function') shakeElement(adminLoginForm);
                const errorMsg = error.message.includes('Bad credentials') || error.message.includes('Invalid') 
                    ? 'Invalid admin credentials.' 
                    : error.message || 'Invalid admin credentials.';
                showToast(errorMsg, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            const originalBtnHtml = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Logging in...';
                
                const response = await fetchApi('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                if (response.success) {
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    showToast('Login successful!');
                    
                    setTimeout(() => {
                        if (user.role === 'ADMIN') {
                            window.location.href = 'pages/admin-dashboard.html';
                        } else {
                            window.location.href = 'pages/user-dashboard.html';
                        }
                    }, 800);
                }
            } catch (error) {
                if (typeof shakeElement === 'function') shakeElement(loginForm);
                showToast(error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            
            if (password !== confirmPassword) {
                if (typeof shakeElement === 'function') shakeElement(registerForm);
                showToast('Passwords do not match!', 'error');
                return;
            }
            
            const originalBtnHtml = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Creating Account...';
                
                const response = await fetchApi('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, phone })
                });
                
                if (response.success) {
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Account Created!';
                    showToast('Registration successful!');
                    
                    setTimeout(() => {
                        window.location.href = 'pages/user-dashboard.html';
                    }, 800);
                }
            } catch (error) {
                if (typeof shakeElement === 'function') shakeElement(registerForm);
                showToast(error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
});
