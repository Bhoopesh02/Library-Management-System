import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, LogIn, ShieldAlert } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';

export const Login = () => {
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
        login(user, finalToken, refreshToken);
        
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    },
    onError: (err) => {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password, adminPortal: false });
  };

  const leftContent = (
    <>
      <h1>Welcome Back!</h1>
      <p style={{ marginTop: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
        Login to access your library account, manage books, track fines, and discover new reads in our modern Library Management System.
      </p>
      <div style={{ marginTop: '3rem' }}>
        <BookOpen size={64} style={{ opacity: 0.85 }} />
      </div>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>Login</h2>
      
      {error && (
        <div className="shake-animation" style={{ backgroundColor: 'var(--danger-hover)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          id="email"
          placeholder="Enter your email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ marginBottom: '1.5rem' }}>
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <Link to="/forgot-password" state={{ email }} style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 500 }}>
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem' }} isLoading={loginMutation.isPending}>
          <LogIn size={20} /> Login
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Register here</Link>
      </p>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <Link to="/admin-login" style={{ color: 'var(--primary-color)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} /> Administrator Portal
        </Link>
      </div>
    </AuthLayout>
  );
};
