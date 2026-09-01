import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const sendOtpMutation = useMutation({
    mutationFn: (data) => fetchApi('/auth/forgot-password-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (response) => {
      if (response.success) {
        setStep(2);
        setError('');
        setSuccessMsg(response.message || 'OTP sent to your email.');
      }
    },
    onError: (err) => {
      setError(err.message || 'Failed to send OTP.');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => fetchApi('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (response) => {
      if (response.success) {
        setStep(3);
        setError('');
      }
    },
    onError: (err) => {
      setError(err.message || 'Failed to reset password.');
    }
  });

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    sendOtpMutation.mutate({ email });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    resetPasswordMutation.mutate({ email, otpCode, newPassword });
  };

  const leftContent = (
    <>
      <h1>Reset Password</h1>
      <p style={{ marginTop: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
        Forgot your password? No worries. Enter your email address and we'll send you an OTP to reset it.
      </p>
      <div style={{ marginTop: '3rem' }}>
        <KeyRound size={64} style={{ opacity: 0.85 }} />
      </div>
    </>
  );

  if (step === 3) {
    return (
      <AuthLayout leftContent={leftContent}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <ShieldCheck size={64} color="var(--success-color)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>Password Reset Successful!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Your password has been changed successfully. You can now login with your new password.
          </p>
          <Button onClick={() => navigate('/login')} style={{ width: '100%' }}>
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout leftContent={leftContent}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>
        {step === 1 ? 'Forgot Password' : 'Enter OTP'}
      </h2>
      
      {error && (
        <div className="shake-animation" style={{ backgroundColor: 'var(--danger-hover)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}
      {successMsg && step === 2 && (
        <div style={{ backgroundColor: 'var(--success-color)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {successMsg}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <Input
            label="Email Address"
            type="email"
            id="email"
            placeholder="Enter your registered email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ marginTop: '2rem' }}>
            <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem' }} isLoading={sendOtpMutation.isPending}>
              <Mail size={20} /> Send OTP
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <Input
            label="6-Digit Verification Code"
            type="text"
            id="otp"
            placeholder="Enter 6-digit code"
            required
            maxLength="6"
            autoComplete="one-time-code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />
          <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <Input
              label="New Password"
              type="password"
              id="newPassword"
              placeholder="Enter your new password"
              required
              minLength="6"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem' }} isLoading={resetPasswordMutation.isPending}>
            <ArrowRight size={20} /> Reset Password
          </Button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
        <Link to="/login" style={{ fontWeight: 600 }}>Back to Login</Link>
      </div>
    </AuthLayout>
  );
};
