import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Book, Edit, Trash2, CheckCircle, Ban, BookOpen } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchApi, API_BASE_URL } from '../../utils/api';
import { BookCategories, isCategoryValid } from '../../utils/categories';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

export const ManageBooks = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publicationYear: '',
    totalCopies: 1,
    frontCoverUrl: null,
    backCoverUrl: null
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminBooks', page, searchTerm, categoryFilter],
    queryFn: () => {
      let url = `/books?page=${page}&size=10`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      return fetchApi(url);
    },
    keepPreviousData: true
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (payload.id) {
        return fetchApi(`/books/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
      return fetchApi('/books', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.message || 'Failed to save book')
  });

  const deleteMutation = useMutation({
    mutationFn: (bookId) => fetchApi(`/books/${bookId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
    onError: (err) => alert(`Cannot delete book: ${err.message}`)
  });

  const uploadCoverMutation = useMutation({
    mutationFn: ({ bookId, side, file }) => {
      const formDataBody = new FormData();
      formDataBody.append('file', file);
      return fetchApi(`/books/${bookId}/cover?side=${side}`, {
        method: 'POST',
        body: formDataBody,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      // Update local form state with the new URL so preview updates immediately
      if (res.data) {
        setFormData(prev => ({
          ...prev,
          frontCoverUrl: res.data.frontCoverUrl,
          backCoverUrl: res.data.backCoverUrl
        }));
      }
    },
    onError: (err) => alert(`Failed to upload cover: ${err.message}`)
  });

  const handleCoverUpload = (side, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!formData.id) {
      alert("Please save the book first before uploading a cover.");
      e.target.value = null; // Reset file input
      return;
    }
    
    uploadCoverMutation.mutate({ bookId: formData.id, side, file });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(0);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setPage(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const payload = {
      ...formData,
      publicationYear: formData.publicationYear ? parseInt(formData.publicationYear, 10) : null
    };
    saveMutation.mutate(payload);
  };

  const resetForm = () => {
    setFormData({
      id: '', title: '', author: '', isbn: '', category: '', 
      publisher: '', publicationYear: '', totalCopies: 1, frontCoverUrl: null, backCoverUrl: null
    });
    setFormError('');
  };

  const openEditModal = (book) => {
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      totalCopies: book.totalCopies,
      frontCoverUrl: book.frontCoverUrl,
      backCoverUrl: book.backCoverUrl
    });
    setIsModalOpen(true);
  };

  const books = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <DashboardLayout 
      title="Manage Books" 
      subtitle="Add, edit, and remove books from the library"
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Book
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <Input 
              type="text" 
              placeholder="Search by Title, Author, or ISBN..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              containerStyle={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ width: '240px' }}>
            <select 
              value={categoryFilter} 
              onChange={handleCategoryFilter}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              <option value="">All Categories</option>
              {BookCategories.map((group, idx) => (
                <optgroup key={idx} label={group.group}>
                  {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <Button type="submit">
            <Search size={18} /> Search
          </Button>
        </form>

        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
            ) : isError ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>Failed to load books.</td></tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <EmptyState icon={BookOpen} title="No books found" description="Adjust your filters or add a new book." />
                </td>
              </tr>
            ) : (
              books.map(b => {
                const available = b.availableCopies > 0;
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {b.frontCoverUrl ? (
                        <img 
                          src={getImageUrl(b.frontCoverUrl)} 
                          alt="Cover" 
                          style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f0f0f0' }} 
                        />
                      ) : (
                        <div style={{ width: '40px', height: '60px', borderRadius: '4px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Book size={20} style={{ color: '#94a3b8' }} />
                        </div>
                      )}
                      <div>
                        {b.title}
                      </div>
                    </td>
                    <td>{b.author}</td>
                    <td>
                      {!isCategoryValid(b.category) ? (
                        <span style={{ color: 'var(--warning-color)' }}>{b.category} (Legacy)</span>
                      ) : b.category}
                    </td>
                    <td><code>{b.isbn}</code></td>
                    <td>
                      {available ? (
                        <Badge variant="success"><CheckCircle size={14} /> Available ({b.availableCopies})</Badge>
                      ) : (
                        <Badge variant="danger"><Ban size={14} /> Issued (0 left)</Badge>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="secondary" size="sm" onClick={() => openEditModal(b)}>
                          <Edit size={14} /> Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => {
                            if (window.confirm('Delete this book permanently?')) {
                              deleteMutation.mutate(b.id);
                            }
                          }}
                          isLoading={deleteMutation.isPending && deleteMutation.variables === b.id}
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <Button variant="secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || isLoading}>
            Prev
          </Button>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Page {page + 1} of {totalPages}</span>
          <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || isLoading}>
            Next
          </Button>
        </div>
      </Card>

      {/* Basic Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--border-radius)', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{formData.id ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            {formError && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(255,76,76,0.1)', borderRadius: '8px' }}>{formError}</div>}
            
            <form onSubmit={handleSubmit}>
              <Input 
                label="Title *" 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
              <Input 
                label="Author *" 
                required 
                value={formData.author} 
                onChange={e => setFormData({...formData, author: e.target.value})} 
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    label="ISBN *" 
                    required 
                    value={formData.isbn} 
                    onChange={e => setFormData({...formData, isbn: e.target.value})} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category *</label>
                    <select 
                      required
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    >
                      <option value="" disabled>Select a category</option>
                      {formData.category && !isCategoryValid(formData.category) && (
                        <option value={formData.category} disabled>Legacy: {formData.category}</option>
                      )}
                      {BookCategories.map((group, idx) => (
                        <optgroup key={idx} label={group.group}>
                          {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    label="Publisher" 
                    value={formData.publisher} 
                    onChange={e => setFormData({...formData, publisher: e.target.value})} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input 
                    label="Year" 
                    type="number"
                    value={formData.publicationYear} 
                    onChange={e => setFormData({...formData, publicationYear: e.target.value})} 
                  />
                </div>
              </div>

              <Input 
                label="Total Copies *" 
                type="number"
                min="1"
                required 
                value={formData.totalCopies} 
                onChange={e => setFormData({...formData, totalCopies: parseInt(e.target.value, 10)})} 
              />
              
              {/* Cover Uploads */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Front Cover</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                    {formData.frontCoverUrl ? (
                      <img src={getImageUrl(formData.frontCoverUrl)} alt="Front Cover" style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                    ) : (
                      <div style={{ width: '100px', height: '150px', backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No Cover</div>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleCoverUpload('front', e)} disabled={uploadCoverMutation.isPending} style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Back Cover (Optional)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                    {formData.backCoverUrl ? (
                      <img src={getImageUrl(formData.backCoverUrl)} alt="Back Cover" style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                    ) : (
                      <div style={{ width: '100px', height: '150px', backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No Cover</div>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleCoverUpload('back', e)} disabled={uploadCoverMutation.isPending} style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>
              </div>

              {!formData.id && (
                <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <em>Note: You can upload covers after saving the book for the first time.</em>
                </div>
              )}

              <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} isLoading={saveMutation.isPending}>
                <CheckCircle size={18} /> Save Book Details
              </Button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
