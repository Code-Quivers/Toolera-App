'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

const API_BASE = 'http://localhost:7500/backend/api/v1/employees';

type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
type AdminStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

interface Employee {
  adminId: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  activeAdmins: number;
  moderators: number;
}

const ROLE_STYLE: Record<AdminRole, { bg: string; color: string; icon: string }> = {
  SUPER_ADMIN: { bg: 'rgba(3,105,161,0.1)', color: '#0369a1', icon: 'shield' },
  ADMIN:       { bg: 'rgba(0,105,72,0.08)', color: '#006948', icon: 'admin_panel_settings' },
  MODERATOR:   { bg: '#e5eeff', color: '#3d4a42', icon: 'support_agent' },
};

const STATUS_STYLE: Record<AdminStatus, { bg: string; color: string }> = {
  ACTIVE:    { bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
  INACTIVE:  { bg: '#f0f4f0', color: '#6d7a72' },
  SUSPENDED: { bg: 'rgba(186,26,26,0.1)', color: '#ba1a1a' },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function fmtDate(iso: string | null) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, activeAdmins: 0, moderators: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' as AdminRole });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      const [empRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}?${params}`).then(r => r.json()),
        fetch(`${API_BASE}/stats`).then(r => r.json()),
      ]);
      if (empRes.success) setEmployees(empRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSearch = () => { setSearch(searchInput); };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Name, email, and password are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setFormError(data.message ?? 'Failed to add employee'); return; }
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'ADMIN' });
      fetchAll();
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (adminId: string, current: AdminStatus) => {
    const next: AdminStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await fetch(`${API_BASE}/${adminId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setEmployees(prev => prev.map(e => e.adminId === adminId ? { ...e, status: next } : e));
  };

  const handleRoleChange = async (adminId: string, role: AdminRole) => {
    await fetch(`${API_BASE}/${adminId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setEmployees(prev => prev.map(e => e.adminId === adminId ? { ...e, role } : e));
  };

  const handleDelete = async (adminId: string) => {
    await fetch(`${API_BASE}/${adminId}`, { method: 'DELETE' });
    setEmployees(prev => prev.filter(e => e.adminId !== adminId));
    setDeleteId(null);
    fetchAll();
  };

  return (
    <AdminLayout title="Employee & Access Control" subtitle="Manage platform administrators and support agents." activeItem="Settings">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Total Employees', value: stats.total, icon: 'group', bg: 'rgba(0,133,92,0.1)', color: '#006948' },
          { label: 'Active Users', value: stats.active, icon: 'check_circle', bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
          { label: 'Active Admins', value: stats.activeAdmins, icon: 'admin_panel_settings', bg: 'rgba(3,105,161,0.1)', color: '#0369a1' },
          { label: 'Moderators', value: stats.moderators, icon: 'support_agent', bg: 'rgba(245,124,0,0.1)', color: '#f57c00' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#3d4a42', margin: '0 0 4px', letterSpacing: '0.02em' }}>{s.label}</p>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{s.value}</h3>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3d4a42', fontSize: '18px' }}>search</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search employees..."
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', color: '#0b1c30' }}
            />
          </div>
          <button onClick={handleSearch} style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Search</button>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(''); }}
          style={{ background: '#0e9b6d', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add New Employee
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', color: '#c4c4c4' }}>hourglass_empty</span>
            Loading employees...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Name', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 24px', textAlign: h === 'Actions' ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#3d4a42', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42' }}>No employees found.</td>
                  </tr>
                ) : employees.map(emp => {
                  const roleStyle = ROLE_STYLE[emp.role];
                  const statusStyle = STATUS_STYLE[emp.status];
                  return (
                    <tr key={emp.adminId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d3e4fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', color: '#006948', border: '1px solid #e2e8f0' }}>
                            {getInitials(emp.name)}
                          </div>
                          <div>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0b1c30', margin: 0 }}>{emp.name}</p>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', margin: 0 }}>{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <select
                          value={emp.role}
                          onChange={e => handleRoleChange(emp.adminId, e.target.value as AdminRole)}
                          style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: roleStyle.bg, color: roleStyle.color, border: 'none', cursor: 'pointer', appearance: 'auto' }}
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MODERATOR">Moderator</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button
                          onClick={() => handleToggleStatus(emp.adminId, emp.status)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', border: 'none', cursor: 'pointer', background: statusStyle.bg, color: statusStyle.color }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                          {emp.status}
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42', whiteSpace: 'nowrap' }}>{fmtDate(emp.lastLoginAt)}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42', whiteSpace: 'nowrap' }}>{fmtDate(emp.createdAt)}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button
                          onClick={() => setDeleteId(emp.adminId)}
                          style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                          title="Remove employee"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>{employees.length} employee{employees.length !== 1 ? 's' : ''} shown</span>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>Add New Employee</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4a42' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {formError && (
              <div style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#ba1a1a' }}>{formError}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. Raju Ahmed' },
                { label: 'Email *', key: 'email', type: 'text', placeholder: 'name@toolera.com' },
                { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min. 8 characters' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={(form as Record<string, string>)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminRole }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }}>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Cancel</button>
                <button onClick={handleAdd} disabled={submitting} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#006948', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeleteId(null)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(186,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '28px' }}>delete</span>
            </div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0b1c30', marginBottom: '8px' }}>Remove Employee?</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42', marginBottom: '24px' }}>This will revoke all platform access for this user.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#ba1a1a', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
