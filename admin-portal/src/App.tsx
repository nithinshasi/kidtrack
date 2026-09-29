import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';

// ── DEMO DATA ──────────────────────────────────────────────
const DEMO_STUDENTS = [
  { id: 1, firstName: 'Arjun', lastName: 'Kumar', grade: '5', section: 'A', rollNumber: 'R001', route: 'Route A - Velachery', status: 'Present' },
  { id: 2, firstName: 'Priya', lastName: 'Sharma', grade: '3', section: 'B', rollNumber: 'R002', route: 'Route B - Anna Nagar', status: 'Present' },
  { id: 3, firstName: 'Rahul', lastName: 'Verma', grade: '6', section: 'A', rollNumber: 'R003', route: 'Route A - Velachery', status: 'Absent' },
  { id: 4, firstName: 'Sneha', lastName: 'Patel', grade: '4', section: 'C', rollNumber: 'R004', route: 'Route C - Tambaram', status: 'Present' },
  { id: 5, firstName: 'Karthik', lastName: 'Raj', grade: '2', section: 'A', rollNumber: 'R005', route: 'Route B - Anna Nagar', status: 'Present' },
  { id: 6, firstName: 'Divya', lastName: 'Nair', grade: '7', section: 'B', rollNumber: 'R006', route: 'Route C - Tambaram', status: 'Present' },
];

const DEMO_BUSES = [
  { id: 1, reg: 'TN01AB1234', driver: 'Murugan K', route: 'Route A - Velachery', students: 18, status: 'On Trip', lat: 13.0827, lng: 80.2707 },
  { id: 2, reg: 'TN01CD5678', driver: 'Ravi S', route: 'Route B - Anna Nagar', students: 22, status: 'Completed', lat: 13.0900, lng: 80.2500 },
  { id: 3, reg: 'TN01EF9012', driver: 'Selvam P', route: 'Route C - Tambaram', students: 15, status: 'On Trip', lat: 12.9249, lng: 80.1000 },
];

const DEMO_ATTENDANCE = [
  { name: 'Arjun Kumar', grade: '5A', boarding: '7:45 AM', status: 'Present', qr: true },
  { name: 'Priya Sharma', grade: '3B', boarding: '7:52 AM', status: 'Present', qr: true },
  { name: 'Rahul Verma', grade: '6A', boarding: '—', status: 'Absent', qr: false },
  { name: 'Sneha Patel', grade: '4C', boarding: '8:01 AM', status: 'Present', qr: true },
  { name: 'Karthik Raj', grade: '2A', boarding: '7:58 AM', status: 'Present', qr: false },
  { name: 'Divya Nair', grade: '7B', boarding: '8:05 AM', status: 'Present', qr: true },
];

const DEMO_NOTIFICATIONS = [
  { id: 1, title: 'Arjun Kumar has boarded', body: 'Arjun boarded Bus TN01AB1234 at 7:45 AM at Velachery stop', type: 'Boarding', time: '7:45 AM', read: true },
  { id: 2, title: 'Priya Sharma has boarded', body: 'Priya boarded Bus TN01CD5678 at 7:52 AM at Anna Nagar stop', type: 'Boarding', time: '7:52 AM', read: true },
  { id: 3, title: 'Bus TN01AB1234 delayed', body: 'Route A bus is delayed by 10 minutes due to traffic at OMR', type: 'Delay', time: '8:10 AM', read: false },
  { id: 4, title: 'Sneha Patel has alighted', body: 'Sneha safely reached school at 8:20 AM', type: 'Alighting', time: '8:20 AM', read: false },
];

type Page = 'dashboard' | 'students' | 'buses' | 'attendance' | 'notifications' | 'reports';

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: '📊' },
  { id: 'students' as Page, label: 'Students', icon: '👧' },
  { id: 'buses' as Page, label: 'Buses & Drivers', icon: '🚌' },
  { id: 'attendance' as Page, label: 'Attendance', icon: '📋' },
  { id: 'notifications' as Page, label: 'Notifications', icon: '🔔' },
  { id: 'reports' as Page, label: 'Reports', icon: '📈' },
];

// ── DASHBOARD ──────────────────────────────────────────────
const Dashboard = () => (
  <div style={{ padding: 24 }}>
    <h2 style={s.pageTitle}>📊 Today's Overview</h2>
    <p style={{ color: '#6b7280', marginBottom: 24 }}>Sunrise Public School — {new Date().toDateString()}</p>

    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
      {[
        { label: 'Total Students', value: 248, icon: '👧', color: '#2563eb', bg: '#dbeafe' },
        { label: 'Active Buses', value: 3, icon: '🚌', color: '#16a34a', bg: '#dcfce7' },
        { label: 'Trips In Progress', value: 2, icon: '📍', color: '#d97706', bg: '#fef3c7' },
        { label: 'Present Today', value: 5, icon: '✅', color: '#0891b2', bg: '#cffafe' },
        { label: 'Absent Today', value: 1, icon: '❌', color: '#dc2626', bg: '#fee2e2' },
      ].map(stat => (
        <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: 20, minWidth: 150, flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
        </div>
      ))}
    </div>

    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: '#374151' }}>🚌 Live Bus Status</h3>
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 32 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            {['Bus', 'Driver', 'Route', 'Students', 'Status'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO_BUSES.map((bus, i) => (
            <tr key={bus.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f3f4f6' }}>
              <td style={s.td}><strong>{bus.reg}</strong></td>
              <td style={s.td}>{bus.driver}</td>
              <td style={s.td}>{bus.route}</td>
              <td style={s.td}>{bus.students}</td>
              <td style={s.td}>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: bus.status === 'On Trip' ? '#dcfce7' : '#dbeafe',
                  color: bus.status === 'On Trip' ? '#16a34a' : '#2563eb' }}>
                  {bus.status === 'On Trip' ? '🟢 ' : '✅ '}{bus.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: '#374151' }}>🔔 Recent Alerts</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {DEMO_NOTIFICATIONS.slice(0, 3).map(n => (
        <div key={n.id} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>{n.type === 'Boarding' ? '🟢' : n.type === 'Delay' ? '⏰' : '🏠'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{n.time} — {n.body}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── STUDENTS ───────────────────────────────────────────────
const Students = () => {
  const [search, setSearch] = useState('');
  const filtered = DEMO_STUDENTS.filter(s =>
    `${s.firstName} ${s.lastName} ${s.rollNumber}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={s.pageTitle}>👧 Students ({DEMO_STUDENTS.length})</h2>
        <button style={s.btn}>+ Add Student</button>
      </div>
      <input style={{ ...s.input, maxWidth: 300, marginBottom: 16 }} placeholder="🔍 Search students..."
        value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f3f4f6' }}>
            {['Name', 'Grade', 'Roll No.', 'Route', 'Today'].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((st, i) => (
              <tr key={st.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f3f4f6' }}>
                <td style={s.td}><strong>{st.firstName} {st.lastName}</strong></td>
                <td style={s.td}>{st.grade}-{st.section}</td>
                <td style={{ ...s.td, fontFamily: 'monospace' }}>{st.rollNumber}</td>
                <td style={s.td}>{st.route}</td>
                <td style={s.td}>
                  <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: st.status === 'Present' ? '#dcfce7' : '#fee2e2',
                    color: st.status === 'Present' ? '#16a34a' : '#dc2626' }}>
                    {st.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── BUSES ──────────────────────────────────────────────────
const Buses = () => (
  <div style={{ padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h2 style={s.pageTitle}>🚌 Buses & Drivers</h2>
      <button style={s.btn}>+ Add Bus</button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {DEMO_BUSES.map(bus => (
        <div key={bus.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 40 }}>🚌</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f' }}>{bus.reg}</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>👤 Driver: {bus.driver}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>🗺️ {bus.route}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>👧 {bus.students} students</div>
          </div>
          <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: bus.status === 'On Trip' ? '#dcfce7' : '#dbeafe',
            color: bus.status === 'On Trip' ? '#16a34a' : '#2563eb' }}>
            {bus.status === 'On Trip' ? '🟢 On Trip' : '✅ Completed'}
          </span>
        </div>
      ))}
    </div>

    {/* Mock Map */}
    <h3 style={{ fontSize: 17, fontWeight: 700, margin: '24px 0 12px', color: '#374151' }}>📍 Live Bus Map</h3>
    <div style={{ background: '#e8f4f8', borderRadius: 12, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #93c5fd', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #dbeafe 0%, #e0f2fe 50%, #dcfce7 100%)', opacity: 0.5 }} />
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 48 }}>🗺️</div>
        <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 16 }}>Live GPS Map</div>
        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>2 buses currently active</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center' }}>
          {DEMO_BUSES.filter(b => b.status === 'On Trip').map(b => (
            <span key={b.id} style={{ background: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
              🚌 {b.reg}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── ATTENDANCE ─────────────────────────────────────────────
const Attendance = () => (
  <div style={{ padding: 24 }}>
    <h2 style={s.pageTitle}>📋 Attendance — Morning Trip</h2>
    <p style={{ color: '#6b7280', marginBottom: 16 }}>{new Date().toDateString()}</p>

    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
      {[
        { label: 'Present', value: 5, color: '#16a34a', bg: '#dcfce7' },
        { label: 'Absent', value: 1, color: '#dc2626', bg: '#fee2e2' },
        { label: 'Total', value: 6, color: '#2563eb', bg: '#dbeafe' },
      ].map(stat => (
        <div key={stat.label} style={{ background: stat.bg, borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          <div style={{ fontSize: 13, color: stat.color }}>{stat.label}</div>
        </div>
      ))}
    </div>

    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f3f4f6' }}>
          {['Student', 'Grade', 'Boarding Time', 'QR Scan', 'Status'].map(h => <th key={h} style={s.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {DEMO_ATTENDANCE.map((a, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f3f4f6' }}>
              <td style={s.td}><strong>{a.name}</strong></td>
              <td style={s.td}>{a.grade}</td>
              <td style={s.td}>{a.boarding}</td>
              <td style={s.td}>{a.qr ? '✅ Scanned' : '—'}</td>
              <td style={s.td}>
                <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: a.status === 'Present' ? '#dcfce7' : '#fee2e2',
                  color: a.status === 'Present' ? '#16a34a' : '#dc2626' }}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── NOTIFICATIONS ──────────────────────────────────────────
const Notifications = () => (
  <div style={{ padding: 24 }}>
    <h2 style={s.pageTitle}>🔔 Notifications</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
      {DEMO_NOTIFICATIONS.map(n => (
        <div key={n.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: n.read ? 'none' : '4px solid #2563eb' }}>
          <span style={{ fontSize: 28 }}>{n.type === 'Boarding' ? '🟢' : n.type === 'Delay' ? '⏰' : n.type === 'Alighting' ? '🏠' : '🔔'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 15 }}>{n.title}</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 3 }}>{n.body}</div>
            <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>Today at {n.time}</div>
          </div>
          {!n.read && <span style={{ background: '#2563eb', color: '#fff', borderRadius: 10, fontSize: 10, padding: '2px 6px', fontWeight: 700 }}>NEW</span>}
        </div>
      ))}
    </div>
  </div>
);

// ── REPORTS ────────────────────────────────────────────────
const Reports = () => (
  <div style={{ padding: 24 }}>
    <h2 style={s.pageTitle}>📈 Reports & Analytics</h2>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
      {[
        { label: 'This Week Attendance', value: '94%', icon: '📊', color: '#2563eb' },
        { label: 'Total Trips This Month', value: '62', icon: '🚌', color: '#16a34a' },
        { label: 'Avg Boarding Time', value: '7:52 AM', icon: '⏱️', color: '#d97706' },
        { label: 'On-Time Rate', value: '91%', icon: '✅', color: '#0891b2' },
      ].map(r => (
        <div key={r.label} style={{ background: '#fff', borderRadius: 12, padding: 20, flex: 1, minWidth: 160, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>{r.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: r.color, marginTop: 8 }}>{r.value}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{r.label}</div>
        </div>
      ))}
    </div>

    {/* Weekly bar chart using CSS */}
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h3 style={{ marginBottom: 20, color: '#374151' }}>Weekly Attendance %</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 150 }}>
        {[
          { day: 'Mon', pct: 96 }, { day: 'Tue', pct: 94 }, { day: 'Wed', pct: 91 },
          { day: 'Thu', pct: 97 }, { day: 'Fri', pct: 88 },
        ].map(d => (
          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>{d.pct}%</div>
            <div style={{ width: '100%', background: '#2563eb', borderRadius: '6px 6px 0 0', height: `${d.pct * 1.3}px`, opacity: 0.85 }} />
            <div style={{ fontSize: 12, color: '#6b7280' }}>{d.day}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── MAIN APP ───────────────────────────────────────────────
const AppContent: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => {
  const [page, setPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'buses': return <Buses />;
      case 'attendance': return <Attendance />;
      case 'notifications': return <Notifications />;
      case 'reports': return <Reports />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, "Segoe UI", sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#1e3a5f', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 28 }}>🚌</div>
          <div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>KidTrack</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Admin Portal · Demo</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '11px 16px', background: page === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: page === item.id ? 700 : 400,
              borderLeft: page === item.id ? '3px solid #60a5fa' : '3px solid transparent',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: '#fef3c7', borderRadius: 8, padding: '6px 10px', marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e' }}>🎯 DEMO MODE</div>
            <div style={{ fontSize: 11, color: '#78350f' }}>Sunrise Public School</div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>👤 {user.name}</div>
          <button onClick={onLogout} style={{ width: '100%', padding: '7px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: '#f3f4f6', overflowY: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  return user
    ? <AppContent user={user} onLogout={() => setUser(null)} />
    : <LoginPage onLogin={setUser} />;
};

// ── SHARED STYLES ──────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase' },
  td: { padding: '12px 16px', fontSize: 14, color: '#374151' },
  btn: { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 14, width: '100%' },
};

export default App;
