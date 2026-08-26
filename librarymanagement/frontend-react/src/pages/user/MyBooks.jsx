import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book, CheckCircle, AlertCircle, History, BookOpen } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import ImageLightbox from '../../components/ui/ImageLightbox';
import lightboxStyles from '../../components/ui/ImageLightbox.module.css';
import { fetchApi, API_BASE_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

export const MyBooks = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('ACTIVE'); // ACTIVE or ALL
  
  // State for image lightbox
  const [lightboxData, setLightboxData] = useState(null);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['userTransactionsHistory', user?.id, page],
    queryFn: () => fetchApi(`/transactions/user/${user.id}?page=${page}&size=10`),
    enabled: !!user?.id,
    keepPreviousData: true
  });

  const allTransactions = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  let filteredTransactions = allTransactions;
  if (filter === 'ACTIVE') {
    filteredTransactions = allTransactions.filter(t => t.status === 'ISSUED' || t.status === 'OVERDUE');
  }

  const emptyTitle = filter === 'ACTIVE' ? 'No currently borrowed books' : 'No books found';
  const emptyDescription = filter === 'ACTIVE' 
    ? 'You have no books currently checked out. Browse the catalog to find books.' 
    : 'No book transaction history found.';

  return (
    <DashboardLayout 
      title="My Books & History" 
      subtitle="Track your currently issued books and loan history"
    >
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <Button 
          variant={filter === 'ACTIVE' ? 'primary' : 'secondary'} 
          onClick={() => setFilter('ACTIVE')}
        >
          <BookOpen size={18} /> Currently Borrowed
        </Button>
        <Button 
          variant={filter === 'ALL' ? 'primary' : 'secondary'} 
          onClick={() => setFilter('ALL')}
        >
          <History size={18} /> All History
        </Button>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Book Details</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</td></tr>
            ) : isError ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>Failed to load transaction history.</td></tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <EmptyState icon={History} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              filteredTransactions.map(t => {
                const isOverdue = t.status === 'OVERDUE';
                const isReturned = t.status === 'RETURNED';
                const title = t.bookTitle || `Book ID: ${t.bookId ? t.bookId.substring(0, 8) : '-'}...`;

                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {t.frontCoverUrl ? (
                        <img 
                          src={getImageUrl(t.frontCoverUrl)} 
                          alt="Cover" 
                          className={lightboxStyles.clickableThumbnail}
                          style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f0f0f0' }} 
                          onClick={() => setLightboxData({ frontCoverUrl: getImageUrl(t.frontCoverUrl), initialSide: 'front' })}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '60px', borderRadius: '4px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Book size={20} style={{ color: '#94a3b8' }} />
                        </div>
                      )}
                      <div>
                        {title}
                      </div>
                    </td>
                    <td>{t.issueDate ? new Date(t.issueDate).toLocaleDateString() : '-'}</td>
                    <td style={{ color: isOverdue ? 'var(--danger-color)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td>{t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '-'}</td>
                    <td>
                      {isOverdue ? <Badge variant="danger"><AlertCircle size={14} /> Overdue</Badge>
                       : isReturned ? <Badge variant="secondary"><CheckCircle size={14} /> Returned</Badge>
                       : <Badge variant="success"><BookOpen size={14} /> Issued</Badge>}
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
      
      <ImageLightbox 
        isOpen={!!lightboxData}
        onClose={() => setLightboxData(null)}
        frontCoverUrl={lightboxData?.frontCoverUrl}
        backCoverUrl={lightboxData?.backCoverUrl}
        initialSide={lightboxData?.initialSide}
      />
    </DashboardLayout>
  );
};
