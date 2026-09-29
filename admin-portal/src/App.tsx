import React, { useState, useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import { AuthProvider } from './components/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { StudentsPage } from './pages/StudentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { Toaster } from 'react-hot-toast';

type Page = 'dashboard' | 'students' | 'buses' | 'drivers' | 'routes' | 'attendance' | 'reports';

const SCHOOL_ID = 1; // Retrieved from user context in production

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'students', label: 'Students', icon: '👧' },
  { id: 'buses', label: 'Buses', icon: '🚌' },
  { id: 'drivers', label: 'Drivers', icon: '👤' },
  { id: 'routes', label: 'Routes', icon: '🗺️' },
  { id: 'attendance', label: 'Attendance', icon: '📋' },
  { id: 'reports', label: 'Reports', icon: '📈' },
];

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, "Segoe UI", sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#1e3a5f', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 28 }}>🚌</div>
          <div style={{ fontWeight: 800, fontSize: 20, marginTop: 4 }}>KidTrack</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Admin Portal</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '12px 20px',
                background: page === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14,
                fontWeight: page === item.id ? 600 : 400,
                borderLeft: page === item.id ? '3px solid #60a5fa' : '3px solid transparent',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, marginBottom: 8, opacity: 0.8 }}>👤 {user?.name}</div>
          <button onClick={logout} style={{
            width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
            cursor: 'pointer', fontSize: 13
          }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: '#f3f4f6', overflowY: 'auto' }}>
        {page === 'dashboard' && <Dashboard schoolId={SCHOOL_ID} />}
        {page === 'students' && <StudentsPage schoolId={SCHOOL_ID} />}
        {page === 'attendance' && <AttendancePage schoolId={SCHOOL_ID} />}
        {(page === 'buses' || page === 'drivers' || page === 'routes' || page === 'reports') && (
          <div style={{ padding: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>
              {navItems.find(n => n.id === page)?.icon} {navItems.find(n => n.id === page)?.label}
            </h2>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
              <p>This module is ready for integration. Full CRUD components follow the same pattern as Students.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Toaster position="top-right" />
    <AppContent />
  </AuthProvider>
);

export default App;
