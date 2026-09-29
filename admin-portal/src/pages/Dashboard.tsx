import React, { useState, useEffect } from 'react';
import { schoolApi, studentApi, busApi, driverApi, tripApi, attendanceApi } from '../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalStudents: number;
  totalBuses: number;
  activeTrips: number;
  todayAttendanceCount: number;
  pendingAlerts: number;
}

const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({
  label, value, icon, color
}) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flex: 1, minWidth: 160 }}>
    <div style={{ fontSize: 32 }}>{icon}</div>
    <div style={{ fontSize: 36, fontWeight: 800, color, marginTop: 8 }}>{value}</div>
    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{label}</div>
  </div>
);

export const Dashboard: React.FC<{ schoolId: number }> = ({ schoolId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tripsRes] = await Promise.all([
          schoolApi.getDashboard(schoolId),
          tripApi.getAll(schoolId),
        ]);
        setStats(statsRes.data);
        setTrips(tripsRes.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [schoolId]);

  if (loading) return <div style={{ padding: 32 }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1e3a5f' }}>
        📊 Today's Overview
      </h2>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon="👧" color="#2563eb" />
        <StatCard label="Active Buses" value={stats?.totalBuses ?? 0} icon="🚌" color="#16a34a" />
        <StatCard label="Active Trips" value={stats?.activeTrips ?? 0} icon="📍" color="#f59e0b" />
        <StatCard label="Present Today" value={stats?.todayAttendanceCount ?? 0} icon="✅" color="#0891b2" />
        <StatCard label="Pending Alerts" value={stats?.pendingAlerts ?? 0} icon="🔔" color="#dc2626" />
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
        🚌 Today's Trips
      </h3>

      {trips.length === 0 ? (
        <div style={{ color: '#6b7280', padding: 24, textAlign: 'center', background: '#f9fafb', borderRadius: 8 }}>
          No trips today yet
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Route', 'Bus', 'Driver', 'Type', 'Status', 'Start Time'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, i) => (
                <tr key={trip.id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px' }}>{trip.routeName}</td>
                  <td style={{ padding: '12px 16px' }}>{trip.busRegNumber}</td>
                  <td style={{ padding: '12px 16px' }}>{trip.driverName}</td>
                  <td style={{ padding: '12px 16px' }}>{trip.tripType}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: trip.status === 'InProgress' ? '#dcfce7' : trip.status === 'Completed' ? '#dbeafe' : '#f3f4f6',
                      color: trip.status === 'InProgress' ? '#16a34a' : trip.status === 'Completed' ? '#2563eb' : '#6b7280'
                    }}>{trip.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                    {trip.startTime ? new Date(trip.startTime).toLocaleTimeString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
