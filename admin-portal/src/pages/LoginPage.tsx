import React, { useState } from 'react';
import { authApi } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.sendOtp(phone, 'Admin');
      toast.success('OTP sent to your phone');
      setStep('otp');
    } catch {
      toast.error('Phone number not found. Contact your school admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, otp, 'Admin');
      toast.success('Welcome to KidTrack Admin!');
    } catch {
      toast.error('Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🚌 KidTrack</div>
        <h2 style={styles.title}>School Admin Portal</h2>
        <p style={styles.subtitle}>Safe, Smart, School Transport</p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <label style={styles.label}>Mobile Number</label>
            <input
              style={styles.input}
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <label style={styles.label}>Enter OTP sent to {phone}</label>
            <input
              style={styles.input}
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button
              style={{ ...styles.button, background: '#6b7280', marginTop: 8 }}
              type="button"
              onClick={() => setStep('phone')}
            >
              ← Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '48px 40px',
    width: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: '8px 0 4px' },
  subtitle: { color: '#6b7280', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1.5px solid #d1d5db',
    fontSize: 16,
    outline: 'none',
  },
  button: {
    padding: '12px 16px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
};
