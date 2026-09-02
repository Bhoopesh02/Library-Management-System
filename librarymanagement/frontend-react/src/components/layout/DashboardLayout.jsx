import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Home, Search, Book, Users, ArrowRightLeft, CreditCard, LogOut, User as UserIcon, Crown } from 'lucide-react';
import styles from './DashboardLayout.module.css';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { MasterAccessModal } from '../features/MasterAccessModal';

export const DashboardLayout = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';
  const isMasterAdmin = Boolean(user?.masterAdmin);

  const userLinks = [
    { id: 'dashboard', to: '/dashboard', icon: Home, text: 'Dashboard' },
    { id: 'books', to: '/books', icon: Search, text: 'Browse Books' },
    { id: 'my-books', to: '/my-books', icon: Book, text: 'My Books' },
    { id: 'fines', to: '/fines', icon: CreditCard, text: 'My Fines' }
  ];
  
  const adminLinks = [
    { id: 'dashboard', to: '/admin', icon: Home, text: 'Dashboard' },
    { id: 'manage-books', to: '/admin/books', icon: Book, text: 'Manage Books' },
    { id: 'manage-users', to: '/admin/users', icon: Users, text: 'Manage Users' },
    { id: 'transactions', to: '/admin/transactions', icon: ArrowRightLeft, text: 'Transactions' },
    { id: 'manage-fines', to: '/admin/fines', icon: CreditCard, text: 'Manage Fines' }
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className={styles.container}>
      <Sidebar links={links} onLogout={logout} />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1>{title}</h1>
            {subtitle && <p style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              type="button"
              className={`${styles.avatarBtn} ${isMasterAdmin ? styles.avatarMaster : ''}`}
              onClick={() => {
                if (isAdmin) {
                  setIsMasterModalOpen(true);
                }
              }}
              title={
                isAdmin 
                  ? (isMasterAdmin ? "Master Administrator (Click for Details)" : "Admin Profile (Click to enter Master Key)") 
                  : `Signed in as ${user?.name || 'Member'}`
              }
            >
              <UserIcon size={20} />
              {isMasterAdmin && (
                <span className={styles.crownBadge} title="Master Admin Active">
                  <Crown size={11} />
                </span>
              )}
            </button>
          </div>
        </header>

        {children}

        {isAdmin && (
          <MasterAccessModal
            isOpen={isMasterModalOpen}
            onClose={() => setIsMasterModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

