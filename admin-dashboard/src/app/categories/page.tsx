'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

const API_BASE = 'http://localhost:7500/backend/api/v1';

const ICON_OPTIONS = [
  { value: 'checkroom', label: 'Clothing' },
  { value: 'restaurant', label: 'Food' },
  { value: 'devices', label: 'Electronics' },
  { value: 'home', label: 'Home & Living' },
  { value: 'health_and_safety', label: 'Health' },
  { value: 'sports_soccer', label: 'Sports' },
  { value: 'auto_awesome', label: 'Beauty' },
  { value: 'build', label: 'Tools & Hardware' },
  { value: 'school', label: 'Education' },
  { value: 'more_horiz', label: 'Other' },
];

interface Category {
  categoryId: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface Stats { total: number; active: number }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', icon: 'more_horiz', description: '' });
  const [formError, setFormError] = useState('');

  const fetchCategories = useCallback(() => {
    setLoading(true);
    const url = search ? `${API_BASE}/categories?search=${encodeURIComponent(search)}` : `${API_BASE}/categories`;
    fetch(url)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setCategories(res.data);
          setStats(res.meta ?? { total: res.data.length, active: res.data.filter((c: Category) => c.isActive).length });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAdd = async () => {
    if (!form.name.trim()) { setFormError('Category name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), icon: form.icon, description: form.description.trim() }),
      });
      const data = await res.json();
      if (!data.success) { setFormError(data.message ?? 'Failed to create category'); return; }
      setShowModal(false);
      setForm({ name: '', icon: 'more_horiz', description: '' });
      fetchCategories();
    } catch {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (categoryId: string) => {
    setTogglingId(categoryId);
    try {
      const res = await fetch(`${API_BASE}/categories/${categoryId}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.map(c => c.categoryId === categoryId ? { ...c, isActive: data.data.isActive } : c));
        setStats(prev => ({
          ...prev,
          active: prev.active + (data.data.isActive ? 1 : -1),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/categories/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c.categoryId !== deleteId));
        setStats(prev => ({ total: prev.total - 1, active: prev.active - (data.data.isActive ? 1 : 0) }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
      setDeleteName('');
    }
  };

  return (
    <AdminLayout title="Business Categories" subtitle="Define the types of businesses sellers operate." activeItem="Business Categories">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', flex: 1, maxWidth: '640px' }}>
          {[
            { label: 'Total Categories', value: stats.total, icon: 'category', bg: '#dce9ff', color: '#0369a1' },
            { label: 'Active', value: stats.active, icon: 'check_circle', bg: '#d9e6dd', color: '#0e9b6d' },
            { label: 'Inactive', value: stats.total - stats.active, icon: 'block', bg: '#ffdad6', color: '#ba1a1a' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', color: '#0b1c30', margin: 0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(''); }}
          style={{ background: '#0e9b6d', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add Category
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3d4a42', fontSize: '18px' }}>search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', width: '260px', outline: 'none', background: '#fff' }}
            />
          </div>
          <span style={{ fontSize: '13px', color: '#3d4a42', fontFamily: 'Inter, sans-serif' }}>{categories.length} categories</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Category', 'Description', 'Slug', 'Created', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Actions' ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42' }}>No categories found.</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.categoryId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#e5eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006948', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{cat.icon ?? 'category'}</span>
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0b1c30' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42', maxWidth: '260px' }}>{cat.description ?? '—'}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>{cat.slug}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>{fmtDate(cat.createdAt)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      disabled={togglingId === cat.categoryId}
                      onClick={() => handleToggle(cat.categoryId)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', border: 'none', cursor: 'pointer', opacity: togglingId === cat.categoryId ? 0.6 : 1,
                        background: cat.isActive ? 'rgba(14,155,109,0.1)' : 'rgba(186,26,26,0.1)',
                        color: cat.isActive ? '#0e9b6d' : '#ba1a1a',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => { setDeleteId(cat.categoryId); setDeleteName(cat.name); }}
                      style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a', border: 'none', borderRadius: '6px', padding: '6px 12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>Add Business Category</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4a42', padding: '4px' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Category Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Clothing & Fashion"
                  style={{ width: '100%', padding: '10px 14px', border: `1px solid ${formError ? '#ba1a1a' : '#e2e8f0'}`, borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }}
                />
                {formError && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#ba1a1a', margin: '4px 0 0' }}>{formError}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Icon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, icon: opt.value }))}
                      title={opt.label}
                      style={{ padding: '10px', borderRadius: '8px', border: form.icon === opt.value ? '2px solid #006948' : '1px solid #e2e8f0', background: form.icon === opt.value ? '#e5eeff' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: form.icon === opt.value ? '#006948' : '#3d4a42' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{opt.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this business type..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#0b1c30' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={saving} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#006948', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => { setDeleteId(null); setDeleteName(''); }} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(186,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '28px' }}>delete</span>
              </div>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0b1c30', marginBottom: '8px' }}>Delete "{deleteName}"?</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42' }}>This action cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setDeleteId(null); setDeleteName(''); }} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#ba1a1a', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
