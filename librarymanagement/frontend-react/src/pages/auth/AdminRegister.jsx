import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, UserPlus, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';

export const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    secretKey: ''
  });
  
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (data) => fetchApi('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (response) => {
      if (response.success) {
        const { token, user } = response.data;
        login(user, token);
        navigate('/admin');
      }
    },
    onError: (err) => {
      if (err.status === 429) {
        setError('Too many registration attempts. Please try again in 15 minutes.');
      } else {
        setError(err.message || 'Registration failed. Please check your details.');
      }
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    registerMutation.mutate(formData);
  };

  const leftContent = (
    <>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={32} /> Admin Registration
      </h1>
      <p style={{ marginTop: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
        Register a new library administrator account. This requires a valid Admin Security Key provided by your system administrator.
      </p>
      <div style={{ marginTop: '3rem' }}>
        <div style={{
          width: '120px', height: '120px', backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <UserPlus size={64} style={{ opacity: 0.9 }} />
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>Register Admin</h2>
      
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
          label="Admin Email"
          type="email"
          id="email"
          placeholder="Enter admin email address"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password (min 8 chars)"
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Create a strong password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <Input
          label="Phone Number (Optional)"
          type="tel"
          id="phone"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={handleChange}
        />
        
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Input
            label="Admin Security Key"
            type={showSecretKey ? 'text' : 'password'}
            id="secretKey"
            placeholder="Enter the master security key"
            required
            value={formData.secretKey}
            onChange={handleChange}
          />
          <button 
            type="button"
            onClick={() => setShowSecretKey(!showSecretKey)}
            style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem' }} isLoading={registerMutation.isPending}>
          <UserPlus size={20} /> Complete Registration
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <Link to="/admin-login" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          Already registered? Login to Admin Portal
        </Link>
      </div>
    </AuthLayout>
  );
};
