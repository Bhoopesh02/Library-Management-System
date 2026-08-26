import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldAlert, User, CheckCircle, Ban, Users as UsersIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchApi } from '../../utils/api';

export const ManageUsers = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
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

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(0);
  };

  const users = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <DashboardLayout 
      title="Manage Users" 
      subtitle="View registered patrons, administrators, and manage account statuses"
    >
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
                      <Badge style={{ backgroundColor: 'rgba(114, 9, 183, 0.12)', color: '#7209b7' }}>
                        <ShieldAlert size={14} /> Admin
                      </Badge>
                    ) : (
                      <Badge style={{ backgroundColor: 'rgba(0, 180, 168, 0.12)', color: 'var(--primary-color)' }}>
                        <User size={14} /> Member
                      </Badge>
                    )}
                  </td>
                  <td>{u.phoneNumber || '-'}</td>
                  <td>
                    {u.status === 'ACTIVE' ? (
                      <Badge variant="success"><CheckCircle size={14} /> Active</Badge>
                    ) : (
                      <Badge variant="danger"><Ban size={14} /> Suspended</Badge>
                    )}
                  </td>
                  <td>
                    {u.role === 'ADMIN' ? (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}><ShieldAlert size={14} /> Protected</span>
                    ) : (
                      <Button 
                        variant={u.status === 'ACTIVE' ? 'danger' : 'primary'} 
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate({ userId: u.id, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                        isLoading={toggleStatusMutation.isPending && toggleStatusMutation.variables?.userId === u.id}
                      >
                        {u.status === 'ACTIVE' ? <><Ban size={14} /> Suspend</> : <><CheckCircle size={14} /> Activate</>}
                      </Button>
                    )}
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
    </DashboardLayout>
  );
};
