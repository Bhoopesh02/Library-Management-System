import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Book, CheckCircle, Ban, BookOpen } from 'lucide-react';
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

export const BrowseBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read from URL, fallback to defaults
  const page = parseInt(searchParams.get('page') || '0', 10);
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  // Local state for the input before form submission
  const [searchInput, setSearchInput] = useState(searchTerm);

  // Sync local input if URL changes externally
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['browseBooks', page, searchTerm, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10'
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      
      return fetchApi(`/books?${params.toString()}`);
    },
    keepPreviousData: true
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) newParams.set('search', searchInput);
    else newParams.delete('search');
    newParams.set('page', '0'); // reset to page 0 on new search
    setSearchParams(newParams);
  };

  const handleCategoryFilter = (e) => {
    const newCategory = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) newParams.set('category', newCategory);
    else newParams.delete('category');
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const setPage = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const books = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <DashboardLayout 
      title="Browse Books" 
      subtitle="Search and discover books in our library"
    >
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
                outline: 'none',
                fontFamily: 'inherit'
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
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading catalog...</td></tr>
            ) : isError ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>Failed to load books.</td></tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <EmptyState icon={BookOpen} title="No books found" description="Try adjusting your search or category filter." />
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
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <Button variant="secondary" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0 || isLoading}>
            Prev
          </Button>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Page {page + 1} of {totalPages}</span>
          <Button variant="secondary" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1 || isLoading}>
            Next
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  );
};
