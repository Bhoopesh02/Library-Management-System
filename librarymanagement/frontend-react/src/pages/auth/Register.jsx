import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OtpInput } from '../../components/ui/OtpInput';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otpCode: ''
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(60);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const sendOtpMutation = useMutation({
    mutationFn: (email) => fetchApi('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    onSuccess: () => {
      setStep(2);
      setTimer(60);
    },
    onError: (err) => {
      setError(err.message || 'Failed to send verification code. Please try again.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: (userData) => fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    onSuccess: (response) => {
      if (response.success) {
        const { accessToken, refreshToken, token, user } = response.data;
        const finalToken = accessToken || token;
        login(user, finalToken, refreshToken);
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

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    sendOtpMutation.mutate(formData.email);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.otpCode || formData.otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    
    const { confirmPassword, ...payload } = formData;
    registerMutation.mutate(payload);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setError('');
    sendOtpMutation.mutate(formData.email);
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
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>
        {step === 1 ? 'Create Account' : 'Verify Email'}
      </h2>
      
      {error && (
        <div className="shake-animation" style={{ backgroundColor: 'var(--danger-hover)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
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

          <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem', marginTop: '1rem' }} isLoading={sendOtpMutation.isPending}>
            Continue <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', marginLeft: '8px' }} />
          </Button>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
            <p>We've sent a 6-digit verification code to</p>
            <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: '0.5rem 0' }}>{formData.email}</p>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
            >
              Change email
            </button>
          </div>

          <OtpInput 
            length={6} 
            value={formData.otpCode} 
            onChange={(code) => setFormData(prev => ({ ...prev, otpCode: code }))} 
          />

          <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
            {timer > 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Resend code in {timer}s
              </p>
            ) : (
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={sendOtpMutation.isPending}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600' }}
              >
                {sendOtpMutation.isPending ? 'Sending...' : 'Resend Verification Code'}
              </button>
            )}
          </div>

          <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem' }} isLoading={registerMutation.isPending}>
            <CheckCircle size={20} /> Verify & Register
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
