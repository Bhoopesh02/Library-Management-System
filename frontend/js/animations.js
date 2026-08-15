/**
 * animations.js - UI Animation Utilities & Micro-Interactions
 * Library Management System
 * Pure Vanilla JavaScript & CSS Animations
 */

(function () {
    // Check if user prefers reduced motion
    window.prefersReducedMotion = function () {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    /**
     * Animate count up of numerical values (e.g. stats, fines, counters)
     * @param {HTMLElement|string} target - DOM element or ID
     * @param {number} endVal - Final numeric value
     * @param {number} duration - Animation duration in ms (default 500ms)
     * @param {string} prefix - Optional prefix like '₹ '
     * @param {string} suffix - Optional suffix
     */
    window.animateCountUp = function (target, endVal, duration = 500, prefix = '', suffix = '') {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        if (!el) return;

        const parsedEnd = typeof endVal === 'number' ? endVal : parseFloat(endVal);
        if (isNaN(parsedEnd)) {
            el.textContent = `${prefix}${endVal}${suffix}`;
            return;
        }

        if (window.prefersReducedMotion() || duration <= 0) {
            el.textContent = `${prefix}${parsedEnd}${suffix}`;
            return;
        }

        const startTime = performance.now();
        const startVal = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic: 1 - Math.pow(1 - progress, 3)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startVal + (parsedEnd - startVal) * easeProgress);

            el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = `${prefix}${parsedEnd.toLocaleString()}${suffix}`;
            }
        }

        requestAnimationFrame(update);
    };

    /**
     * Subtle horizontal shake effect for form validation failure
     * @param {HTMLElement|string} target - DOM element or ID
     */
    window.shakeElement = function (target) {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        if (!el) return;

        if (window.prefersReducedMotion()) return;

        el.classList.remove('shake-animation');
        // Trigger reflow to restart animation
        void el.offsetWidth;
        el.classList.add('shake-animation');

        setTimeout(() => {
            el.classList.remove('shake-animation');
        }, 400);
    };

    /**
     * Smooth modal opener
     * @param {string|HTMLElement} modal - Modal element or ID
     */
    window.openAnimatedModal = function (modal) {
        const el = typeof modal === 'string' ? document.getElementById(modal) : modal;
        if (!el) return;

        el.style.display = 'flex';
        // Force reflow
        void el.offsetWidth;
        el.classList.add('modal-visible');
        document.body.style.overflow = 'hidden';
    };

    /**
     * Smooth modal closer
     * @param {string|HTMLElement} modal - Modal element or ID
     * @param {Function} [callback] - Optional callback after close
     */
    window.closeAnimatedModal = function (modal, callback) {
        const el = typeof modal === 'string' ? document.getElementById(modal) : modal;
        if (!el) return;

        el.classList.remove('modal-visible');
        document.body.style.overflow = '';

        const timeout = window.prefersReducedMotion() ? 0 : 200;
        setTimeout(() => {
            el.style.display = 'none';
            if (typeof callback === 'function') callback();
        }, timeout);
    };

    /**
     * Render animated skeleton rows in a table body
     * @param {HTMLElement|string} tbody - Table body element or ID
     * @param {number} rows - Number of skeleton rows
     * @param {number} cols - Number of columns
     */
    window.renderSkeletonTable = function (tbody, rows = 5, cols = 6) {
        const el = typeof tbody === 'string' ? document.getElementById(tbody) : tbody;
        if (!el) return;

        let html = '';
        for (let i = 0; i < rows; i++) {
            html += `<tr class="skeleton-row">`;
            for (let j = 0; j < cols; j++) {
                const width = j === 0 ? '70%' : (j === cols - 1 ? '50%' : '80%');
                html += `<td><div class="skeleton skeleton-text" style="width: ${width}; margin: 0 auto 0 0;"></div></td>`;
            }
            html += `</tr>`;
        }
        el.innerHTML = html;
    };

    /**
     * Render animated skeleton cards in a grid container
     * @param {HTMLElement|string} grid - Grid container element or ID
     * @param {number} count - Number of skeleton cards
     */
    window.renderSkeletonCards = function (grid, count = 8) {
        const el = typeof grid === 'string' ? document.getElementById(grid) : grid;
        if (!el) return;

        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="card skeleton-card-item">
                    <div class="skeleton" style="height: 120px; border-radius: 8px; margin-bottom: 1rem;"></div>
                    <div class="skeleton skeleton-text" style="width: 80%; height: 20px; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton skeleton-text" style="width: 50%; height: 14px; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton skeleton-text" style="width: 65%; height: 14px; margin-top: auto;"></div>
                </div>
            `;
        }
        el.innerHTML = html;
    };

    /**
     * Debounce helper for smooth real-time search without API spam
     */
    window.debounce = function (func, wait = 300) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    /**
     * Converts a native <select> into an animated custom dropdown
     */
    window.initCustomDropdown = function(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Hide native select but keep it in DOM for logic
        select.style.display = 'none';
        
        const container = document.createElement('div');
        container.className = 'category-dropdown-container';
        container.style.width = select.style.width || '100%';
        container.style.flex = select.style.flex || '';
        
        const toggle = document.createElement('div');
        toggle.className = 'form-control category-dropdown-toggle';
        
        // Get initial selected text
        let initialText = 'Select Option';
        if (select.options[select.selectedIndex]) {
            initialText = select.options[select.selectedIndex].textContent;
        }
        
        toggle.innerHTML = `<span class="category-toggle-text">${initialText}</span> <i class="fas fa-chevron-down category-chevron"></i>`;
        
        const menu = document.createElement('div');
        menu.className = 'category-dropdown-menu';
        
        function createItem(opt) {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.textContent = opt.textContent;
            if (opt.selected) item.classList.add('selected');
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                select.value = opt.value;
                toggle.querySelector('.category-toggle-text').textContent = opt.textContent;
                closeMenu();
                
                // Trigger change event for application logic
                select.dispatchEvent(new Event('change'));
                
                // Update selected styles
                menu.querySelectorAll('.category-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
            });
            return item;
        }

        Array.from(select.children).forEach(child => {
            if (child.tagName === 'OPTION') {
                if (!child.disabled) {
                    menu.appendChild(createItem(child));
                }
            } else if (child.tagName === 'OPTGROUP') {
                const groupLabel = document.createElement('div');
                groupLabel.className = 'category-optgroup-label';
                groupLabel.textContent = child.label;
                menu.appendChild(groupLabel);
                
                Array.from(child.children).forEach(opt => {
                    if (!opt.disabled) {
                        menu.appendChild(createItem(opt));
                    }
                });
            }
        });

        function closeMenu() {
            menu.classList.remove('is-open');
            toggle.classList.remove('is-open');
        }

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.prefersReducedMotion && window.prefersReducedMotion()) {
                // Keep classes but CSS handles the lack of transitions
            }
            const isOpen = menu.classList.contains('is-open');
            
            // Close other open menus
            document.querySelectorAll('.category-dropdown-menu').forEach(m => m.classList.remove('is-open'));
            document.querySelectorAll('.category-dropdown-toggle').forEach(t => t.classList.remove('is-open'));
            
            if (!isOpen) {
                menu.classList.add('is-open');
                toggle.classList.add('is-open');
            }
        });
        
        document.addEventListener('click', closeMenu);
        
        container.appendChild(toggle);
        container.appendChild(menu);
        select.parentNode.insertBefore(container, select.nextSibling);
    };

})();
