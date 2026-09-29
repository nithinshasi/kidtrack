import React, { useState, useEffect } from 'react';
import { studentApi, routeApi } from '../services/api';
import toast from 'react-hot-toast';

interface Student {
  id: number; firstName: string; lastName: string; grade: string;
  section: string; rollNumber: string; routeId?: number; isActive: boolean;
}

export const StudentsPage: React.FC<{ schoolId: number }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', grade: '', section: '', rollNumber: '', routeId: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        studentApi.getAll({ schoolId }),
        routeApi.getAll({ schoolId }),
      ]);
      setStudents(sRes.data);
      setRoutes(rRes.data);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [schoolId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentApi.create({ ...form, schoolId, routeId: form.routeId ? Number(form.routeId) : null });
      toast.success('Student added successfully');
      setShowForm(false);
      setForm({ firstName: '', lastName: '', grade: '', section: '', rollNumber: '', routeId: '' });
      load();
    } catch {
      toast.error('Failed to add student');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this student?')) return;
    try {
      await studentApi.delete(id);
      toast.success('Student deactivated');
      load();
    } catch {
      toast.error('Failed to deactivate student');
    }
  };

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.rollNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f' }}>👧 Students ({students.length})</h2>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
          {showForm ? '✕ Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: 16, color: '#374151' }}>New Student</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'firstName', label: 'First Name', type: 'text' },
              { key: 'lastName', label: 'Last Name', type: 'text' },
              { key: 'grade', label: 'Grade', type: 'text' },
              { key: 'section', label: 'Section', type: 'text' },
              { key: 'rollNumber', label: 'Roll Number', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={labelStyle}>{field.label}</label>
                <input
                  style={inputStyle}
                  type={field.type}
                  value={(form as any)[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  required
                />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Route</label>
              <select style={inputStyle} value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })}>
                <option value="">-- Select Route --</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" style={{ ...btnStyle, marginTop: 16 }}>Save Student</button>
        </form>
      )}

      <div style={{ marginBottom: 16 }}>
        <input
          style={{ ...inputStyle, maxWidth: 320 }}
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Name', 'Grade', 'Section', 'Roll No.', 'Route', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                  <td style={{ padding: '12px 16px' }}>{s.grade}</td>
                  <td style={{ padding: '12px 16px' }}>{s.section}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{s.rollNumber}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {routes.find(r => r.id === s.routeId)?.name ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 12, background: s.isActive ? '#dcfce7' : '#fee2e2', color: s.isActive ? '#16a34a' : '#dc2626' }}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(s.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>No students found</p>
          )}
        </div>
      )}
    </div>
  );
};

const btnStyle: React.CSSProperties = { padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };
