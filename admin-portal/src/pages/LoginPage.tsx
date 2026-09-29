import React, { useState } from 'react';

// ── Demo mode: bypass OTP login completely ──
export const LoginPage: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: 'Demo Admin', userType: 'Admin', userId: 1 });
      setLoading(false);
    }, 800);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🚌</div>
        <h2 style={styles.title}>KidTrack</h2>
        <p style={styles.subtitle}>School Admin Portal</p>
        <p style={styles.subtitle}>Safe, Smart, School Transport</p>

        <div style={styles.demoBox}>
          <span style={styles.demoBadge}>🎯 DEMO MODE</span>
          <p style={styles.demoText}>No login required — click below to explore the full portal</p>
        </div>

        <button style={styles.button} onClick={handleDemoLogin} disabled={loading}>
          {loading ? '⏳ Loading...' : '🚀 Enter Demo Portal'}
        </button>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>✅ Dashboard &nbsp; ✅ Students &nbsp; ✅ Buses</p>
          <p style={styles.infoText}>✅ Drivers &nbsp; ✅ Attendance &nbsp; ✅ Reports</p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
  },
  card: {
    background: '#fff', borderRadius: 20, padding: '48px 40px',
    width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center',
  },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 800, color: '#1e3a5f', margin: '8px 0 4px' },
  subtitle: { color: '#6b7280', marginBottom: 4, fontSize: 14 },
  demoBox: {
    background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 12,
    padding: '14px 16px', margin: '20px 0',
  },
  demoBadge: {
    background: '#f59e0b', color: '#fff', borderRadius: 6,
    padding: '2px 10px', fontSize: 12, fontWeight: 700,
  },
  demoText: { color: '#92400e', fontSize: 13, marginTop: 8 },
  button: {
    width: '100%', padding: '16px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 17, fontWeight: 700,
    cursor: 'pointer', marginBottom: 16,
  },
  infoBox: { background: '#f0fdf4', borderRadius: 10, padding: '12px 16px' },
  infoText: { color: '#166534', fontSize: 13, margin: '2px 0' },
};
