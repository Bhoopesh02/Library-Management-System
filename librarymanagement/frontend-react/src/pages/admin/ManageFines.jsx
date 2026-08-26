import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCircle, AlertCircle, CheckCheck, FileText } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchApi } from '../../utils/api';

export const ManageFines = () => {
  const [page, setPage] = useState(0);
  const [payError, setPayError] = useState('');
  
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminFines', page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10'
      });
      return fetchApi(`/fines?${params.toString()}`);
    },
    keepPreviousData: true
  });

  const payMutation = useMutation({
    mutationFn: (fineId) => fetchApi(`/fines/${fineId}/pay`, { method: 'POST' }),
    onSuccess: () => {
      // Intentionally NOT using optimistic updates to prevent money-related bugs
      queryClient.invalidateQueries({ queryKey: ['adminFines'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      setPayError('');
    },
    onError: (err) => {
      setPayError(err.message || 'Failed to process payment');
    }
  });

  const fines = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  const handlePay = (fineId) => {
    if (window.confirm('Mark this fine as paid / collected?')) {
      setPayError('');
      payMutation.mutate(fineId);
    }
  };

  return (
    <DashboardLayout 
      title="Manage Fines" 
      subtitle="Review library penalties and collect payments"
    >
      {payError && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,76,76,0.1)', color: 'var(--danger-color)', borderRadius: '8px' }}>
          {payError}
        </div>
      )}

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Fine ID</th>
              <th>User ID</th>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date Incurred</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading fines...</td></tr>
            ) : isError ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>Failed to load fines.</td></tr>
            ) : fines.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <EmptyState icon={FileText} title="No fines recorded" description="There are currently no overdue fines in the system." />
                </td>
              </tr>
            ) : (
              fines.map(f => {
                const isUnpaid = f.status === 'UNPAID';
                
                return (
                  <tr key={f.id}>
                    <td><code>{f.id ? f.id.substring(0, 8) : '-'}...</code></td>
                    <td><code>{f.userId ? f.userId.substring(0, 8) : '-'}...</code></td>
                    <td><code>{f.transactionId ? f.transactionId.substring(0, 8) : '-'}...</code></td>
                    <td style={{ fontWeight: 700, color: isUnpaid ? 'var(--danger-color)' : 'var(--success-color)' }}>
                      ₹ {f.amount}
                    </td>
                    <td>{f.reason || 'Late return'}</td>
                    <td>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      {isUnpaid ? <Badge variant="danger"><AlertCircle size={14} /> Unpaid</Badge>
                       : <Badge variant="success"><CheckCircle size={14} /> Paid</Badge>}
                    </td>
                    <td>
                      {isUnpaid ? (
                        <Button 
                          size="sm" 
                          onClick={() => handlePay(f.id)}
                          isLoading={payMutation.isPending && payMutation.variables === f.id}
                        >
                          <Check size={14} /> Collect Payment
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCheck size={14} /> Settled
                        </span>
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
    </DashboardLayout>
  );
};
