'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';

const API_BASE = 'http://localhost:7500/backend/api/v1/packages';

interface Platform {
  platformNameId: string;
  platformName: string;
}

interface PackageItem {
  packageId: string;
  name: string;
  slug: string;
  platformNameId: string;
  description: string | null;
  price: number;
  currency: string;
  billingCycle: string;
  customMonths: string | null;
  customDays: string | null;
  features: string[];
  trialDays: number;
  isHighlighted: boolean;
  isActive: boolean;
  sortOrder: number;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
}

interface PackageRow {
  package: PackageItem;
  platform: { platformNameId: string; platformName: string } | null;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: '#e6f4ea', color: '#1e8e3e' },
  EXPIRED: { bg: '#fff3e0', color: '#f57c00' },
  CANCELED: { bg: 'rgba(186,26,26,0.1)', color: '#ba1a1a' },
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [platformNameInput, setPlatformNameInput] = useState('');
  const [form, setForm] = useState({ name: '', price: '', platformNameId: '', billingCycle: 'monthly', customMonths: '', customDays: '', features: [''] });
  const [recentSubs, setRecentSubs] = useState<{ subscription: { subscriptionId: string; sellerGoogleId: string; status: string; createdAt: string }; package: { name: string; price: number } | null }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editPkg, setEditPkg] = useState<{ packageId: string; name: string; price: string; billingCycle: string; customMonths: string; customDays: string; platformNameId: string; features: string[]; isHighlighted: boolean } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlatforms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/platforms`);
      const json = await res.json();
      if (json.success) setPlatforms(json.data);
    } catch { /* ignore */ }
  }, []);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      if (json.success) setPackages(json.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const fetchRecentSubs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/subscriptions/recent`);
      const json = await res.json();
      if (json.success) setRecentSubs(json.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchPlatforms();
    fetchPackages();
    fetchRecentSubs();
  }, [fetchPlatforms, fetchPackages, fetchRecentSubs]);

  const handleAddPlatform = async () => {
    if (!platformNameInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/platforms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformName: platformNameInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setPlatforms(prev => [...prev, json.data]);
        setPlatformNameInput('');
        setShowPlatformModal(false);
        showToast('Platform created successfully!', 'success');
      } else {
        showToast(json.message || 'Failed to create platform', 'error');
      }
    } catch {
      showToast('Failed to create platform', 'error');
    }
  };

  const handleAddPackage = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.platformNameId) return;
    const slug = form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    let billingCycle = form.billingCycle;
    if (form.billingCycle === 'custom') {
      const parts = [];
      if (form.customMonths) parts.push(`${form.customMonths}months`);
      if (form.customDays) parts.push(`${form.customDays}days`);
      billingCycle = parts.join('+') || 'monthly';
    }
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug,
          platformNameId: form.platformNameId,
          price: parseInt(form.price, 10),
          billingCycle,
          features: form.features.filter(f => f.trim()),
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPackages();
        setForm({ name: '', price: '', platformNameId: '', billingCycle: 'monthly', customMonths: '', customDays: '', features: [''] });
        setShowAddModal(false);
        showToast('Package created successfully!', 'success');
      } else {
        showToast(json.message || 'Failed to create package', 'error');
      }
    } catch {
      showToast('Failed to create package', 'error');
    }
  };

  const handleDelete = async (packageId: string) => {
    try {
      await fetch(`${API_BASE}/${packageId}`, { method: 'DELETE' });
      setPackages(prev => prev.filter(p => p.package.packageId !== packageId));
      setDeleteId(null);
      showToast('Package deleted successfully!', 'success');
    } catch {
      showToast('Failed to delete package', 'error');
    }
  };

  const handleEditPackage = async () => {
    if (!editPkg) return;
    let billingCycle = editPkg.billingCycle;
    if (editPkg.billingCycle === 'custom') {
      const parts = [];
      if (editPkg.customMonths) parts.push(`${editPkg.customMonths}months`);
      if (editPkg.customDays) parts.push(`${editPkg.customDays}days`);
      billingCycle = parts.join('+') || 'monthly';
    }
    try {
      const res = await fetch(`${API_BASE}/${editPkg.packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editPkg.name.trim(),
          price: parseInt(String(editPkg.price), 10),
          billingCycle,
          platformNameId: editPkg.platformNameId,
          features: editPkg.features.filter(f => f.trim()),
          isHighlighted: editPkg.isHighlighted,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPackages();
        setEditPkg(null);
        showToast('Package updated successfully!', 'success');
      } else {
        showToast(json.message || 'Failed to update package', 'error');
      }
    } catch {
      showToast('Failed to update package', 'error');
    }
  };

  const handleToggleActive = async (packageId: string, current: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/${packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      const json = await res.json();
      if (json.success) {
        setPackages(prev => prev.map(p =>
          p.package.packageId === packageId
            ? { ...p, package: { ...p.package, isActive: !current } }
            : p
        ));
        showToast(`Package ${!current ? 'activated' : 'deactivated'} successfully!`, 'success');
      } else {
        showToast(json.message || 'Failed to update package', 'error');
      }
    } catch {
      showToast('Failed to update package', 'error');
    }
  };

  const filteredPackages = filterPlatform === 'all'
    ? packages
    : packages.filter(p => p.package.platformNameId === filterPlatform);

  return (
    <AdminLayout title="Subscriptions & Packages" subtitle="Manage seller subscription plans and view active subscriber metrics." activeItem="Packages">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#3d4a42' }}>Filter by Platform:</label>
          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', background: '#fff', color: '#0b1c30' }}
          >
            <option value="all">All Platforms</option>
            {platforms.map(p => (
              <option key={p.platformNameId} value={p.platformNameId}>{p.platformName}</option>
            ))}
          </select>
          <button
            onClick={() => setShowPlatformModal(true)}
            style={{ padding: '8px 16px', border: '1px solid #0e9b6d', borderRadius: '8px', background: '#fff', color: '#0e9b6d', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add Platform
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: '#0e9b6d', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> Add New Package
        </button>
      </div>

      {/* Package Cards */}
      <section style={{ marginBottom: '48px' }}>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0b1c30' }}>
          <span className="material-symbols-outlined" style={{ color: '#006948' }}>inventory_2</span> Package Management
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6d7a72', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#c4c4c4', display: 'block', marginBottom: '12px' }}>hourglass_empty</span>
            Loading packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c4c4c4', display: 'block', marginBottom: '12px' }}>inventory_2</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: '#3d4a42', margin: '0 0 4px' }}>No package found</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6d7a72', margin: 0 }}>Create a new package to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredPackages.map(row => {
              const pkg = row.package;
              const featuresList = (pkg.features ?? []).map(f => ({ label: f, included: true }));
              return (
                <div
                  key={pkg.packageId}
                  style={{
                    background: '#fff', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden',
                    border: pkg.isHighlighted ? '1px solid #0e9b6d' : '1px solid #e2e8f0',
                    boxShadow: pkg.isHighlighted ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
                    transform: pkg.isHighlighted ? 'translateY(-4px)' : 'none',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: '#f0f4ff', borderBottomLeftRadius: '100%', marginRight: -24, marginTop: -24 }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative' }}>
                    <div>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '8px', background: '#e5eeff', color: '#006948' }}>
                        {row.platform?.platformName ?? 'Unknown'}
                      </span>
                      <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{pkg.name}</h4>
                    </div>
                    {/* Active / Inactive toggle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggleActive(pkg.packageId, pkg.isActive)}
                        title={pkg.isActive ? 'Deactivate' : 'Activate'}
                        style={{
                          width: 40, height: 22, borderRadius: '9999px', border: 'none', cursor: 'pointer',
                          background: pkg.isActive ? '#0e9b6d' : '#cbd5e1',
                          position: 'relative', transition: 'background 0.2s', padding: 0,
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 3, left: pkg.isActive ? 21 : 3,
                          width: 16, height: 16, borderRadius: '50%', background: '#fff',
                          transition: 'left 0.2s', display: 'block',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, color: pkg.isActive ? '#0e9b6d' : '#94a3b8' }}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 700, color: '#0e9b6d' }}>{'\u09F3'}{pkg.price}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#545f73' }}>/{pkg.billingCycle}</span>
                  </div>

                  {featuresList.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {featuresList.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0e9b6d' }}>check_circle</span>
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setDeleteId(pkg.packageId)}
                      style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'rgba(186,26,26,0.05)', color: '#ba1a1a', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span> Delete
                    </button>
                    <button
                      onClick={() => setEditPkg({ packageId: pkg.packageId, name: pkg.name, price: String(pkg.price), billingCycle: pkg.billingCycle ?? 'monthly', customMonths: pkg.customMonths ?? '', customDays: pkg.customDays ?? '', platformNameId: pkg.platformNameId, features: pkg.features?.length ? [...pkg.features] : [''], isHighlighted: pkg.isHighlighted })}
                      style={{ padding: '6px 12px', border: '1px solid #0e9b6d', borderRadius: '6px', background: '#fff', color: '#0e9b6d', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Purchases */}
      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '48px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 600, margin: 0, color: '#0b1c30' }}>Recent Purchases</h3>
          <Link href="/subscriptions" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0e9b6d', textDecoration: 'none' }}>
            View All
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </Link>
        </div>
        <div>
          {recentSubs.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6d7a72', margin: 0 }}>No recent purchases.</p>
            </div>
          ) : (
            recentSubs.map(item => {
              const st = STATUS_STYLE[item.subscription.status] ?? { bg: '#f0f0f0', color: '#666' };
              const timeAgo = (() => {
                const diff = Date.now() - new Date(item.subscription.createdAt).getTime();
                const mins = Math.floor(diff / 60000);
                if (mins < 1) return 'just now';
                if (mins < 60) return `${mins}m ago`;
                const hrs = Math.floor(mins / 60);
                if (hrs < 24) return `${hrs}h ago`;
                const days = Math.floor(hrs / 24);
                return `${days}d ago`;
              })();
              return (
                <div key={item.subscription.subscriptionId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#006948', flexShrink: 0 }}>
                    {item.subscription.sellerGoogleId.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0b1c30', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.subscription.sellerGoogleId.slice(0, 16)}…</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6d7a72', marginTop: '2px' }}>{item.package?.name ?? 'Unknown'}</div>
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42', fontWeight: 600, flexShrink: 0 }}>{'\u09F3'}{item.package?.price ?? 0}</div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: st.color, fontWeight: 600 }}>{item.subscription.status}</span>
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{timeAgo}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Add Package Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>{`.pkg-input::placeholder { color: #94a3b8; opacity: 1; } .pkg-input { color: #0b1c30; }`}</style>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>Add New Package</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4a42' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Package Name *</label>
                <input className="pkg-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Growth Plan" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Platform *</label>
                  <select value={form.platformNameId} onChange={e => setForm(f => ({ ...f, platformNameId: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }}>
                    <option value="">Select platform</option>
                    {platforms.map(p => (
                      <option key={p.platformNameId} value={p.platformNameId}>{p.platformName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Price (BDT) *</label>
                  <input className="pkg-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 149" type="number" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Billing Cycle *</label>
                <select value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value, customMonths: e.target.value === 'custom' ? '' : f.customMonths }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }}>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
                {form.billingCycle === 'custom' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#6d7a72', marginBottom: '4px' }}>Months</label>
                      <input
                        className="pkg-input"
                        value={form.customMonths}
                        onChange={e => setForm(f => ({ ...f, customMonths: e.target.value }))}
                        placeholder="e.g. 3, 6"
                        type="number"
                        min="1"
                        max="24"
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#6d7a72', marginBottom: '4px' }}>Days</label>
                      <input
                        className="pkg-input"
                        value={form.customDays}
                        onChange={e => setForm(f => ({ ...f, customDays: e.target.value }))}
                        placeholder="e.g. 45, 90"
                        type="number"
                        min="1"
                        max="365"
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42' }}>Features</label>
                  <button
                    onClick={() => { if (form.features.length < 6) setForm(f => ({ ...f, features: [...f.features, ''] })); }}
                    disabled={form.features.length >= 6}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #0e9b6d', background: '#fff', color: '#0e9b6d', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: form.features.length >= 6 ? 'not-allowed' : 'pointer', opacity: form.features.length >= 6 ? 0.5 : 1 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span> Add Feature
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        className="pkg-input"
                        value={feat}
                        onChange={e => setForm(f => { const fs = [...f.features]; fs[i] = e.target.value; return { ...f, features: fs }; })}
                        placeholder={`e.g. Unlimited Products`}
                        style={{ flex: 1, padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))}
                        disabled={form.features.length <= 1}
                        style={{ width: 32, height: 32, borderRadius: '6px', border: '1px solid #e2e8f0', background: form.features.length <= 1 ? '#f8fafc' : 'rgba(186,26,26,0.07)', color: form.features.length <= 1 ? '#c4c4c4' : '#ba1a1a', cursor: form.features.length <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Cancel</button>
                <button onClick={handleAddPackage} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#006948', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Create Package</button>
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
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0b1c30', marginBottom: '8px' }}>Delete Package?</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42', marginBottom: '24px' }}>Active subscribers will not be affected until their current billing cycle ends.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#ba1a1a', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Platform Modal */}
      {showPlatformModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>{`.pkg-input::placeholder { color: #94a3b8; opacity: 1; } .pkg-input { color: #0b1c30; }`}</style>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => { setShowPlatformModal(false); setPlatformNameInput(''); }} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>Add New Platform</h3>
              <button onClick={() => { setShowPlatformModal(false); setPlatformNameInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4a42' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Platform Name *</label>
                <input
                  className="pkg-input"
                  value={platformNameInput}
                  onChange={e => setPlatformNameInput(e.target.value)}
                  placeholder="e.g. Toolera Store"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddPlatform(); }}
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => { setShowPlatformModal(false); setPlatformNameInput(''); }} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Cancel</button>
                <button onClick={handleAddPlatform} disabled={!platformNameInput.trim()} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: platformNameInput.trim() ? '#006948' : '#ccc', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: platformNameInput.trim() ? 'pointer' : 'not-allowed' }}>Add Platform</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Package Modal */}
      {editPkg && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>{`.pkg-input::placeholder { color: #94a3b8; opacity: 1; } .pkg-input { color: #0b1c30; }`}</style>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setEditPkg(null)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>Edit Package</h3>
              <button onClick={() => setEditPkg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4a42' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Package Name *</label>
                <input className="pkg-input" value={editPkg.name} onChange={e => setEditPkg(p => p ? { ...p, name: e.target.value } : p)} placeholder="e.g. Growth Plan" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Platform *</label>
                  <select value={editPkg.platformNameId} onChange={e => setEditPkg(p => p ? { ...p, platformNameId: e.target.value } : p)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }}>
                    {platforms.map(p => (
                      <option key={p.platformNameId} value={p.platformNameId}>{p.platformName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Price (BDT) *</label>
                  <input className="pkg-input" value={editPkg.price} onChange={e => setEditPkg(p => p ? { ...p, price: e.target.value } : p)} placeholder="e.g. 149" type="number" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Billing Cycle *</label>
                <select value={editPkg.billingCycle} onChange={e => setEditPkg(p => p ? { ...p, billingCycle: e.target.value, customMonths: e.target.value === 'custom' ? '' : p.customMonths } : p)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }}>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
                {editPkg.billingCycle === 'custom' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#6d7a72', marginBottom: '4px' }}>Months</label>
                      <input
                        className="pkg-input"
                        value={editPkg.customMonths}
                        onChange={e => setEditPkg(p => p ? { ...p, customMonths: e.target.value } : p)}
                        placeholder="e.g. 3, 6"
                        type="number"
                        min="1"
                        max="24"
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#6d7a72', marginBottom: '4px' }}>Days</label>
                      <input
                        className="pkg-input"
                        value={editPkg.customDays}
                        onChange={e => setEditPkg(p => p ? { ...p, customDays: e.target.value } : p)}
                        placeholder="e.g. 45, 90"
                        type="number"
                        min="1"
                        max="365"
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="editHighlighted" checked={editPkg.isHighlighted} onChange={e => setEditPkg(p => p ? { ...p, isHighlighted: e.target.checked } : p)} style={{ accentColor: '#006948', width: 16, height: 16 }} />
                <label htmlFor="editHighlighted" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', cursor: 'pointer' }}>Highlighted (featured on top)</label>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42' }}>Features</label>
                  <button
                    onClick={() => { if (editPkg.features.length < 6) setEditPkg(p => p ? { ...p, features: [...p.features, ''] } : p); }}
                    disabled={editPkg.features.length >= 6}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #0e9b6d', background: '#fff', color: '#0e9b6d', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: editPkg.features.length >= 6 ? 'not-allowed' : 'pointer', opacity: editPkg.features.length >= 6 ? 0.5 : 1 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span> Add Feature
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editPkg.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        className="pkg-input"
                        value={feat}
                        onChange={e => setEditPkg(p => { if (!p) return p; const fs = [...p.features]; fs[i] = e.target.value; return { ...p, features: fs }; })}
                        placeholder="e.g. Unlimited Products"
                        style={{ flex: 1, padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={() => setEditPkg(p => { if (!p) return p; return { ...p, features: p.features.filter((_, idx) => idx !== i) }; })}
                        disabled={editPkg.features.length <= 1}
                        style={{ width: 32, height: 32, borderRadius: '6px', border: '1px solid #e2e8f0', background: editPkg.features.length <= 1 ? '#f8fafc' : 'rgba(186,26,26,0.07)', color: editPkg.features.length <= 1 ? '#c4c4c4' : '#ba1a1a', cursor: editPkg.features.length <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setEditPkg(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42' }}>Cancel</button>
                <button onClick={handleEditPackage} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#006948', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 200, padding: '14px 24px', borderRadius: '10px', background: toast.type === 'success' ? '#006948' : '#dc2626', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'opacity 0.3s', opacity: 1 }}>
          {toast.message}
        </div>
      )}
    </AdminLayout>
  );
}
