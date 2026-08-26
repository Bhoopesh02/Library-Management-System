import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Smile, Check } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import styles from '../dashboard/Dashboard.module.css';

export const MyFines = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [payError, setPayError] = useState('');
  
  const queryClient = useQueryClient();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['userFines', user?.id, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10'
      });
      return fetchApi(`/fines/user/${user.id}?${params.toString()}`);
    },
    enabled: !!user?.id,
    keepPreviousData: true
  });

  const payMutation = useMutation({
    mutationFn: (fineId) => fetchApi(`/fines/${fineId}/pay`, { method: 'POST' }),
    onSuccess: () => {
      // Intentionally NOT using optimistic updates to prevent money-related bugs
      queryClient.invalidateQueries({ queryKey: ['userFines'] });
      setPayError('');
    },
    onError: (err) => {
      setPayError(err.message || 'Failed to process payment');
    }
  });

  const handlePay = (fineId) => {
    if (window.confirm('Proceed to pay this fine?')) {
      setPayError('');
      payMutation.mutate(fineId);
    }
  };

  const fines = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  let unpaid = 0;
  let paid = 0;
  
  // Calculate totals from current page (Note: ideally backend provides total aggregations)
  fines.forEach(fine => {
    if (fine.status === 'UNPAID') unpaid += fine.amount;
    else paid += fine.amount;
  });

  return (
    <DashboardLayout 
      title="My Fines" 
      subtitle="View and review your overdue penalties"
    >
      <div className={styles.statsGrid} style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(255, 76, 76, 0.1)', color: 'var(--danger-color)' }}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>₹ {unpaid}</h3>
            <p>Unpaid Fines (This Page)</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(0, 180, 168, 0.1)', color: 'var(--success-color)' }}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>₹ {paid}</h3>
            <p>Paid Fines (This Page)</p>
          </div>
        </div>
      </div>

      <Card>
        {payError && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,76,76,0.1)', color: 'var(--danger-color)', borderRadius: '8px' }}>
            {payError}
          </div>
        )}
        <Table>
          <thead>
            <tr>
              <th>Fine ID</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date Incurred</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading fines...</td></tr>
            ) : isError ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>Failed to load fine history.</td></tr>
            ) : fines.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <EmptyState icon={Smile} title="No fines recorded" description="You have no overdue penalties. Keep up the great reading habits!" />
                </td>
              </tr>
            ) : (
              fines.map(fine => {
                const isUnpaid = fine.status === 'UNPAID';

                return (
                  <tr key={fine.id}>
                    <td><code>{fine.id ? fine.id.substring(0, 8) : '-'}...</code></td>
                    <td style={{ fontWeight: 700, color: isUnpaid ? 'var(--danger-color)' : 'var(--success-color)' }}>
                      ₹ {fine.amount}
                    </td>
                    <td>{fine.reason || 'Late Book Return'}</td>
                    <td>{fine.createdAt ? new Date(fine.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      {isUnpaid ? <Badge variant="danger"><AlertCircle size={14} /> Unpaid</Badge>
                       : <Badge variant="success"><CheckCircle size={14} /> Paid</Badge>}
                    </td>
                    <td>
                      {isUnpaid && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePay(fine.id)}
                          isLoading={payMutation.isPending && payMutation.variables === fine.id}
                        >
                          <Check size={14} /> Pay Now
                        </Button>
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
