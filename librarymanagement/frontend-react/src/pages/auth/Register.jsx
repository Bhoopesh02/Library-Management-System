import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, UserPlus } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (userData) => fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    onSuccess: (response) => {
      if (response.success) {
        const { token, user } = response.data;
        login(user, token);
        navigate('/dashboard');
      }
    },
    onError: (err) => {
      setError(err.message || 'Registration failed. Please try again.');
    }
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    // Omit confirmPassword from the API payload
    const { confirmPassword, ...payload } = formData;
    registerMutation.mutate(payload);
  };

  const leftContent = (
    <>
      <h1>Join the Library</h1>
      <p style={{ marginTop: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
        Create an account to borrow books, reserve upcoming titles, and keep track of your reading journey.
      </p>
      <div style={{ marginTop: '3rem' }}>
        <BookOpen size={64} style={{ opacity: 0.85 }} />
      </div>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>Create Account</h2>
      
      {error && (
        <div className="shake-animation" style={{ backgroundColor: 'var(--danger-hover)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          id="name"
          placeholder="Enter your full name"
          required
          value={formData.name}
          onChange={handleChange}
        />
        
        <Input
          label="Email Address"
          type="email"
          id="email"
          placeholder="Enter your email"
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
        />
        
        <Input
          label="Phone Number (Optional)"
          type="tel"
          id="phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleChange}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="Create password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            placeholder="Confirm password"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem', marginTop: '1rem' }} isLoading={registerMutation.isPending}>
          <UserPlus size={20} /> Register
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
      </p>
    </AuthLayout>
  );
};
