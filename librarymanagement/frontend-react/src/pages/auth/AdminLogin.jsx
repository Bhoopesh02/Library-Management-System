import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, LogIn, User } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials) => fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    onSuccess: (response) => {
      if (response.success) {
        const { accessToken, refreshToken, token, user } = response.data;
        const finalToken = accessToken || token;
        
        if (user.role !== 'ADMIN') {
          setError('Access denied. Administrator privileges required.');
          return;
        }

        login(user, finalToken, refreshToken);
        navigate('/admin');
      }
    },
    onError: (err) => {
      setError(err.message || 'Invalid admin credentials.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password, adminPortal: true });
  };

  const leftContent = (
    <>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={32} /> Admin Portal
      </h1>
      <p style={{ marginTop: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
        Secure access for library administrators. Manage the catalog, monitor transactions, and oversee user accounts.
      </p>
      <div style={{ marginTop: '3rem' }}>
        <div style={{
          width: '120px', height: '120px', backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ShieldCheck size={64} style={{ opacity: 0.9 }} />
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>Administrator Login</h2>
      
      {error && (
        <div className="shake-animation" style={{ backgroundColor: 'var(--danger-hover)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Admin Email"
          type="email"
          id="email"
          placeholder="Enter admin email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ marginBottom: '2rem' }}>
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="Enter password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem' }} isLoading={loginMutation.isPending}>
          <LogIn size={20} /> Secure Login
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Return to Member Login
          </Link>
          <Link to="/admin-register" style={{ color: 'var(--text-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} /> Register Admin
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
