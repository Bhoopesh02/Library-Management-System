import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, BookOpen, CheckCircle, AlertCircle, Undo, ArrowRightLeft } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchApi } from '../../utils/api';

export const Transactions = () => {
  const [page, setPage] = useState(0);
  // Modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueData, setIssueData] = useState({ userId: '', bookId: '', dueDate: '' });
  const [issueError, setIssueError] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => fetchApi(`/transactions?page=${page}&size=10`),
    keepPreviousData: true
  });

  const issueMutation = useMutation({
    mutationFn: (payload) => fetchApi('/transactions/issue', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      setIsIssueModalOpen(false);
      setIssueData({ userId: '', bookId: '', dueDate: '' });
      setIssueError('');
    },
    onError: (err) => setIssueError(err.message || 'Failed to issue book')
  });

  const returnMutation = useMutation({
    mutationFn: (txId) => fetchApi(`/transactions/return/${txId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
    }
  });

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    setIssueError('');
    issueMutation.mutate(issueData);
  };

  const transactions = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <DashboardLayout 
      title="Book Transactions" 
      subtitle="Issue books to patrons and process returns smoothly"
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => setIsIssueModalOpen(true)}>
          <Plus size={18} /> Issue New Book
        </Button>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User ID</th>
              <th>Book ID</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
            ) : isError ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>Failed to load transactions.</td></tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <EmptyState icon={ArrowRightLeft} title="No transactions recorded" description="Newly issued book transactions will appear here." />
                </td>
              </tr>
            ) : (
              transactions.map(t => {
                const isOverdue = t.status === 'OVERDUE';
                const isReturned = t.status === 'RETURNED';
                const canReturn = t.status === 'ISSUED' || t.status === 'OVERDUE';

                return (
                  <tr key={t.id}>
                    <td><code>{t.id ? t.id.substring(0, 8) : '-'}...</code></td>
                    <td><code>{t.userId ? t.userId.substring(0, 8) : '-'}...</code></td>
                    <td><code>{t.bookId ? t.bookId.substring(0, 8) : '-'}...</code></td>
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
                    <td>
                      {canReturn ? (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Confirm return of this book?')) {
                              returnMutation.mutate(t.id);
                            }
                          }}
                          isLoading={returnMutation.isPending && returnMutation.variables === t.id}
                        >
                          <Undo size={14} /> Return
                        </Button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}><CheckCircle size={14} /> Completed</span>
                      )}
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

      {/* Simple Issue Modal implementation for now without a complex reusable Modal component */}
      {isIssueModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--border-radius)', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Issue Book to Patron</h3>
              <button onClick={() => setIsIssueModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            {issueError && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{issueError}</div>}
            
            <form onSubmit={handleIssueSubmit}>
              <Input 
                label="User ID *" 
                required 
                value={issueData.userId} 
                onChange={e => setIssueData({...issueData, userId: e.target.value})} 
              />
              <Input 
                label="Book ID *" 
                required 
                value={issueData.bookId} 
                onChange={e => setIssueData({...issueData, bookId: e.target.value})} 
              />
              <Input 
                label="Due Date *" 
                type="date"
                required 
                value={issueData.dueDate} 
                onChange={e => setIssueData({...issueData, dueDate: e.target.value})} 
              />
              <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} isLoading={issueMutation.isPending}>
                <CheckCircle size={18} /> Issue Book
              </Button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
