import React, { useState, useEffect } from 'react';
import { attendanceApi, studentApi } from '../services/api';
import toast from 'react-hot-toast';

export const AttendancePage: React.FC<{ schoolId: number }> = ({ schoolId }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tripType, setTripType] = useState('Morning');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.get({ schoolId, from: date, to: date, tripType });
      setRecords(res.data);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [date, tripType, schoolId]);

  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', marginBottom: 24 }}>📋 Attendance</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Trip Type</label>
          <select value={tripType} onChange={e => setTripType(e.target.value)} style={inputStyle}>
            <option>Morning</option>
            <option>Evening</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#dcfce7', borderRadius: 8, padding: '12px 20px' }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#16a34a' }}>{present}</span>
          <span style={{ color: '#166534', marginLeft: 8 }}>Present</span>
        </div>
        <div style={{ background: '#fee2e2', borderRadius: 8, padding: '12px 20px' }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#dc2626' }}>{absent}</span>
          <span style={{ color: '#991b1b', marginLeft: 8 }}>Absent</span>
        </div>
        <div style={{ background: '#dbeafe', borderRadius: 8, padding: '12px 20px' }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#2563eb' }}>{records.length}</span>
          <span style={{ color: '#1e40af', marginLeft: 8 }}>Total</span>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Student', 'Status', 'Boarding Time', 'QR Scanned'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.studentName}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                      background: r.status === 'Present' ? '#dcfce7' : '#fee2e2',
                      color: r.status === 'Present' ? '#16a34a' : '#dc2626'
                    }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                    {r.boardingTime ? new Date(r.boardingTime).toLocaleTimeString() : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{r.qrScanned ? '✅' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <p style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>No attendance records found</p>
          )}
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 14 };
