import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, AlertTriangle, Book, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import styles from './Dashboard.module.css';

export const UserDashboard = () => {
  const { user } = useAuth();

  // We can fetch transactions and fines in parallel
  const { data: txData, isLoading: isLoadingTx, isError: isErrorTx } = useQuery({
    queryKey: ['userTransactions', user?.id],
    queryFn: () => fetchApi(`/transactions/user/${user.id}`),
    enabled: !!user?.id
  });

  const { data: summaryData, isLoading: isLoadingSummary, isError: isErrorSummary } = useQuery({
    queryKey: ['userFineSummary', user?.id],
    queryFn: () => fetchApi(`/fines/summary/user/${user.id}`),
    enabled: !!user?.id
  });

  const { data: txSummaryData, isLoading: isLoadingTxSummary, isError: isErrorTxSummary } = useQuery({
    queryKey: ['userTransactionSummary', user?.id],
    queryFn: () => fetchApi(`/transactions/summary/user/${user.id}`),
    enabled: !!user?.id
  });

  const transactions = txData?.data?.content || [];

  const activeTransactions = transactions.filter(t => t.status === 'ISSUED' || t.status === 'OVERDUE');
  
  const txSummary = txSummaryData?.data || { currentlyBorrowed: 0, dueSoon: 0 };
  const currentlyBorrowed = isLoadingTxSummary ? '-' : isErrorTxSummary ? '!' : txSummary.currentlyBorrowed;
  const dueSoon = isLoadingTxSummary ? '-' : isErrorTxSummary ? '!' : txSummary.dueSoon;

  const pendingAmount = isErrorSummary ? '-' : (summaryData?.data?.unpaid || 0);

  const userName = user?.name ? user.name.split(' ')[0] : 'Reader';

  return (
    <DashboardLayout 
      title={`Welcome, ${userName}!`} 
      subtitle="Here is the overview of your library account"
    >
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(0, 180, 168, 0.1)', color: 'var(--primary-color)' }}>
            <BookOpen size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>{currentlyBorrowed}</h3>
            <p>Currently Borrowed</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: 'var(--warning-color)' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>{dueSoon}</h3>
            <p>Due Soon</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(255, 76, 76, 0.1)', color: 'var(--danger-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>₹ {pendingAmount}</h3>
            <p>Pending Fines</p>
          </div>
        </div>
      </div>

      <Card style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>My Current Books</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTx ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                </tr>
              ) : isErrorTx ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>
                    Failed to load account data. Please check your connection.
                  </td>
                </tr>
              ) : activeTransactions.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className={styles.emptyState}>
                      <BookOpen size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <h4>No currently borrowed books</h4>
                      <p>Browse the catalog and borrow books to start reading.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeTransactions.map(t => {
                  const dueDate = new Date(t.dueDate);
                  const isOverdue = t.status === 'OVERDUE';
                  const title = `Book ID: ${t.bookId ? t.bookId.substring(0, 8) : '-'}...`;

                  return (
                    <tr key={t.id}>
                      <td>
                        <Book size={16} style={{ marginRight: '8px', color: 'var(--primary-color)', verticalAlign: 'middle' }} />
                        {title}
                      </td>
                      <td>{t.issueDate ? new Date(t.issueDate).toLocaleDateString() : '-'}</td>
                      <td style={{ color: isOverdue ? 'var(--danger-color)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                        {dueDate.toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${isOverdue ? styles.badgeDanger : styles.badgeSuccess}`}>
                          {isOverdue ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                          {isOverdue ? 'Overdue' : 'Issued'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
};
