import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldAlert, User, CheckCircle, Ban, Users as UsersIcon, Trash2, KeyRound, AlertTriangle, Crown } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { fetchApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const ManageUsers = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Delete modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: () => {
      let url = `/users?page=${page}&size=10`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      return fetchApi(url);
    },
    keepPreviousData: true
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => fetchApi(`/users/${userId}/status?status=${status}`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: ({ userId }) => fetchApi(`/users/${userId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      setSuccessMessage(`Account for ${userToDelete?.name || 'user'} successfully deleted.`);
      handleCloseDeleteModal();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (err) => {
      setDeleteError(err.message || 'Failed to delete account.');
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(0);
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteError('');
  };

  const handleCloseDeleteModal = () => {
    setUserToDelete(null);
    setDeleteError('');
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();
    setDeleteError('');
    deleteAccountMutation.mutate({
      userId: userToDelete.id
    });
  };

  const users = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <DashboardLayout 
      title="Manage Users" 
      subtitle="View registered patrons, administrators, and manage account statuses"
    >
      {successMessage && (
        <div style={{
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid var(--success-color, #4CAF50)',
          color: 'var(--success-color, #4CAF50)',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 500
        }}>
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
          <div style={{ flexGrow: 1 }}>
            <Input 
              type="text" 
              placeholder="Search users by Name or Email..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
          <Button type="submit" style={{ marginBottom: '1.2rem' }}>
            <Search size={18} /> Search
          </Button>
        </form>

        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
            ) : isError ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>Failed to load users.</td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <EmptyState icon={UsersIcon} title="No users found" description="No patrons or admin records matched your search." />
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>
                    <User size={16} style={{ marginRight: '8px', color: 'var(--text-muted)', verticalAlign: 'middle' }} />
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {u.role === 'ADMIN' ? (
                      u.masterAdmin ? (
                        <Badge style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#333333', fontWeight: 700 }}>
                          <Crown size={13} /> Master Admin
                        </Badge>
                      ) : (
                        <Badge style={{ backgroundColor: 'rgba(114, 9, 183, 0.12)', color: '#7209b7' }}>
                          <ShieldAlert size={14} /> Admin
                        </Badge>
                      )
                    ) : (
                      <Badge style={{ backgroundColor: 'rgba(0, 180, 168, 0.12)', color: 'var(--primary-color)' }}>
                        <User size={14} /> Member
                      </Badge>
                    )}
                  </td>
                  <td>{u.phone || u.phoneNumber || '-'}</td>
                  <td>
                    {u.status === 'ACTIVE' ? (
                      <Badge variant="success"><CheckCircle size={14} /> Active</Badge>
                    ) : (
                      <Badge variant="danger"><Ban size={14} /> Suspended</Badge>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {u.role !== 'ADMIN' && (
                        <Button 
                          variant={u.status === 'ACTIVE' ? 'secondary' : 'primary'} 
                          size="sm"
                          onClick={() => toggleStatusMutation.mutate({ userId: u.id, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                          isLoading={toggleStatusMutation.isPending && toggleStatusMutation.variables?.userId === u.id}
                        >
                          {u.status === 'ACTIVE' ? <><Ban size={14} /> Suspend</> : <><CheckCircle size={14} /> Activate</>}
                        </Button>
                      )}
                      {user?.masterAdmin && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(u)}
                          title={u.role === 'ADMIN' ? "Delete Admin Account (Requires Master Key)" : "Delete User Account (Requires Master Key)"}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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

      {/* Delete Account Modal */}
      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={handleCloseDeleteModal}
        title={userToDelete?.role === 'ADMIN' ? "Delete Administrator Account" : "Delete Member Account"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={deleteAccountMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete} 
              isLoading={deleteAccountMutation.isPending}
            >
              <Trash2 size={16} /> Confirm Deletion
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmDelete}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(255, 76, 76, 0.08)',
            border: '1px solid rgba(255, 76, 76, 0.25)',
            borderRadius: '12px',
            marginBottom: '1.25rem'
          }}>
            <AlertTriangle size={24} style={{ color: 'var(--danger-color, #FF4C4C)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main, #333333)', lineHeight: 1.4 }}>
              <strong>Permanent Action:</strong> You are about to permanently delete{' '}
              <strong>{userToDelete?.name}</strong> ({userToDelete?.email}).
              {userToDelete?.role === 'ADMIN' ? (
                <div style={{ marginTop: '0.4rem', color: '#7209b7', fontWeight: 500 }}>
                  This is an Administrator account. All administrative privileges for this account will be permanently revoked.
                </div>
              ) : (
                <div style={{ marginTop: '0.4rem', color: 'var(--text-muted, #777777)' }}>
                  This action will invalidate all active sessions and delete member records.
                </div>
              )}
            </div>
          </div>

          {deleteError && (
            <div style={{
              backgroundColor: 'rgba(255, 76, 76, 0.1)',
              border: '1px solid var(--danger-color, #FF4C4C)',
              color: 'var(--danger-color, #FF4C4C)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              fontWeight: 500
            }}>
              {deleteError}
            </div>
          )}
        </form>
      </Modal>
    </DashboardLayout>
  );
};
