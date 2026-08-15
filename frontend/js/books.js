let currentPage = 0;
const pageSize = 10;
let totalPages = 1;
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!requireAdmin()) return;
    
    loadBooks(0);

    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', handleBookSubmit);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput && typeof debounce === 'function') {
        searchInput.addEventListener('input', debounce(() => {
            loadBooks(0);
        }, 300));
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            loadBooks(0);
        });
    }
});

async function loadBooks(page) {
    const tbody = document.getElementById('booksTableBody');
    if (tbody && typeof renderSkeletonTable === 'function') {
        renderSkeletonTable(tbody, 5, 6);
    }

    try {
        const searchInput = document.getElementById('searchInput');
        const search = searchInput ? searchInput.value.trim() : '';
        const categoryFilter = document.getElementById('categoryFilter');
        const category = categoryFilter ? categoryFilter.value : '';
        
        let url = `/books?page=${page}&size=${pageSize}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        
        const response = await fetchApi(url);
        
        if (response.success) {
            const pageData = response.data;
            currentPage = pageData.number || 0;
            totalPages = pageData.totalPages || 1;
            
            renderBooks(pageData.content || []);
            updatePagination();
        }
    } catch (error) {
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger-color); padding: 2rem;">Failed to load books.</td></tr>';
        }
        showToast('Failed to load books: ' + (error.message || 'Unknown error'), 'error');
    }
}

function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-book empty-state-icon"></i>
                        <h4>No books found</h4>
                        <p>Try refining your search terms or selecting a different category.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    books.forEach(book => {
        const tr = document.createElement('tr');
        tr.id = `book-row-${book.id}`;
        
        let statusBadge = book.availableCopies > 0 
            ? `<span class="badge badge-success"><i class="fas fa-check"></i> Available (${book.availableCopies})</span>` 
            : `<span class="badge badge-danger"><i class="fas fa-times"></i> Unavailable</span>`;
            
        let actionsHtml = '';
        if (user.role === 'ADMIN') {
            actionsHtml = `
                <div style="display: flex; gap: 6px;">
                    <button class="btn btn-sm btn-primary" title="Edit Book" onclick='openEditModal(${JSON.stringify(book).replace(/'/g, "&#39;")})'><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" title="Delete Book" onclick="deleteBook('${book.id}', this)"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }

        tr.innerHTML = `
            <td style="font-weight: 600;"><i class="fas fa-book" style="color: var(--primary-color); margin-right: 8px;"></i> ${book.title}</td>
            <td>${book.author}</td>
            <td>${isCategoryValid(book.category) ? book.category : `<span style="color: var(--warning-color);"><i class="fas fa-exclamation-triangle"></i> Legacy: ${book.category}</span>`}</td>
            <td><code>${book.isbn}</code></td>
            <td>${statusBadge}</td>
            <td>
                ${actionsHtml}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updatePagination() {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (pageInfo) pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages || 1}`;
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;
}

function prevPage() {
    if (currentPage > 0) loadBooks(currentPage - 1);
}

function nextPage() {
    if (currentPage < totalPages - 1) loadBooks(currentPage + 1);
}

function openBookModal() {
    const modal = document.getElementById('bookModal');
    if (typeof openAnimatedModal === 'function') {
        openAnimatedModal(modal);
    } else {
        modal.style.display = 'flex';
    }
    
    document.getElementById('modalTitle').textContent = 'Add Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    
    // Reset category dropdown without legacy options
    const categoryDropdown = document.getElementById('category');
    if (categoryDropdown) {
        categoryDropdown.innerHTML = generateCategoryOptions(false);
    }
}

function openEditModal(book) {
    const modal = document.getElementById('bookModal');
    if (typeof openAnimatedModal === 'function') {
        openAnimatedModal(modal);
    } else {
        modal.style.display = 'flex';
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Book';
    document.getElementById('bookId').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('isbn').value = book.isbn;
    
    const categoryDropdown = document.getElementById('category');
    if (categoryDropdown) {
        categoryDropdown.innerHTML = generateCategoryOptions(false, book.category);
    }
    
    document.getElementById('category').value = book.category;
    document.getElementById('publisher').value = book.publisher || '';
    document.getElementById('publicationYear').value = book.publicationYear || '';
    document.getElementById('totalCopies').value = book.totalCopies;
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    if (typeof closeAnimatedModal === 'function') {
        closeAnimatedModal(modal);
    } else {
        modal.style.display = 'none';
    }
}

async function handleBookSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    
    const id = document.getElementById('bookId').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    const payload = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        isbn: document.getElementById('isbn').value.trim(),
        category: document.getElementById('category').value,
        publisher: document.getElementById('publisher').value.trim(),
        publicationYear: parseInt(document.getElementById('publicationYear').value) || null,
        totalCopies: parseInt(document.getElementById('totalCopies').value)
    };
    
    if (!payload.category) {
        showToast('Please select a book category.', 'error');
        if (typeof shakeElement === 'function') shakeElement('bookForm');
        return;
    }
    
    if (!isCategoryValid(payload.category)) {
        showToast('Please select a valid category for this legacy book.', 'error');
        if (typeof shakeElement === 'function') shakeElement('bookForm');
        return;
    }
    
    try {
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving...';
        
        const url = id ? `/books/${id}` : '/books';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetchApi(url, {
            method: method,
            body: JSON.stringify(payload)
        });
        
        if (response.success) {
            showToast(id ? 'Book updated successfully' : 'Book added successfully');
            closeBookModal();
            loadBooks(currentPage);
        }
    } catch (error) {
        showToast(error.message, 'error');
        if (typeof shakeElement === 'function') shakeElement('bookForm');
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

async function deleteBook(id, btnElement) {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        try {
            if (btnElement) {
                btnElement.disabled = true;
                btnElement.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
            }
            
            const response = await fetchApi(`/books/${id}`, { method: 'DELETE' });
            if (response.success) {
                showToast('Book deleted successfully');
                const row = document.getElementById(`book-row-${id}`);
                if (row && !window.prefersReducedMotion()) {
                    row.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(20px)';
                    setTimeout(() => loadBooks(currentPage), 250);
                } else {
                    loadBooks(currentPage);
                }
            }
        } catch (error) {
            showToast(error.message, 'error');
            if (btnElement) {
                btnElement.disabled = false;
                btnElement.innerHTML = '<i class="fas fa-trash"></i>';
            }
        }
    }
}
