import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book, Users, ArrowRightLeft, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import styles from './Dashboard.module.css';

export const AdminDashboard = () => {
  const { data: statsData, isLoading, isError } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => fetchApi('/dashboard/admin')
  });

  const stats = statsData?.data || {
    totalBooks: 0,
    totalUsers: 0,
    currentlyIssued: 0,
    activeFines: 0
  };

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const subtitle = today.toLocaleDateString(undefined, dateOptions);

  const activityData = stats.activityData || [];
  const categoryData = stats.categoryData || [];
  
  const COLORS = ['#00B4A8', '#45D1C7', '#008F85', '#7CEAE2', '#2DD4BF', '#0EA5E9', '#F59E0B', '#10B981'];

  return (
    <DashboardLayout title="Overview" subtitle={subtitle}>
      {isError && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(255,76,76,0.1)', color: 'var(--danger-color)', borderRadius: '8px' }}>
          Failed to load dashboard statistics. Please ensure the server is running.
        </div>
      )}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(0, 180, 168, 0.1)', color: 'var(--primary-color)' }}>
            <Book size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>{isLoading ? '-' : isError ? '!' : stats.totalBooks}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(0, 180, 168, 0.1)', color: 'var(--primary-color)' }}>
            <Users size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>{isLoading ? '-' : isError ? '!' : stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: 'var(--warning-color)' }}>
            <ArrowRightLeft size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>{isLoading ? '-' : isError ? '!' : stats.currentlyIssued}</h3>
            <p>Currently Issued</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(255, 76, 76, 0.1)', color: 'var(--danger-color)' }}>
            <CreditCard size={24} />
          </div>
          <div className={styles.statDetails}>
            <h3>{isLoading ? '-' : isError ? '!' : stats.activeFines}</h3>
            <p>Active Fines</p>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Library Activity</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: '0.8rem' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: '0.8rem' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="issued" 
                  stroke="var(--primary-color)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--primary-color)', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Book Categories</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle" 
                  iconSize={10}
                  wrapperStyle={{ 
                    fontSize: '0.8rem', 
                    paddingTop: '8px',
                    lineHeight: '1.4'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
