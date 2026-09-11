'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

const API_BASE = 'http://localhost:7500/backend/api/v1';

interface SellerStats {
  totalSellers: number;
  activeSellers: number;
  suspendedSellers: number;
  deletedSellers: number;
  newToday: number;
  totalRevenue: number;
}

interface Seller {
  id: string;
  sellerGoogleId: string;
  email: string;
  name: string | null;
  storeName: string | null;
  storeSlug: string | null;
  phone: string | null;
  city: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  subscriptionPlan: string | null;
  totalOrders: number;
  totalRevenue: number;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  ACTIVE:    { bg: '#d9e6dd', color: '#00855c', border: '#66dca8' },
  INACTIVE:  { bg: '#f0f4f0', color: '#3d4a42', border: '#c8d4c8' },
  SUSPENDED: { bg: '#ffdad6', color: '#93000a', border: '#ffc9c2' },
  DELETED:   { bg: '#ffdad6', color: '#93000a', border: '#ffc9c2' },
};

function getInitials(name: string | null, email: string) {
  const src = name ?? email;
  return src.split(/[\s@]/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SellersPage() {
  const [stats, setStats]     = useState<SellerStats | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [meta, setMeta]       = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch stats once
  useEffect(() => {
    fetch(`${API_BASE}/sellers/stats`)
      .then(r => r.json())
      .then(res => { if (res.success) setStats(res.data); })
      .catch(console.error);
  }, []);

  // Fetch sellers list
  const fetchSellers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });
    fetch(`${API_BASE}/sellers?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setSellers(res.data);
          setMeta(res.meta);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/sellers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSellers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as Seller['status'] } : s));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    { label: 'Total Sellers', value: stats?.totalSellers.toLocaleString() ?? '—', icon: 'group', bg: '#dce9ff', color: '#0369a1' },
    { label: 'New Today', value: stats?.newToday.toLocaleString() ?? '—', icon: 'person_add', bg: '#d9e6dd', color: '#0e9b6d' },
    { label: 'Active Stores', value: stats?.activeSellers.toLocaleString() ?? '—', icon: 'store', bg: '#d3e4fe', color: '#006948' },
  ];

  const totalPages = meta.totalPages;

  return (
    <AdminLayout title="Seller Management" subtitle="Manage and monitor registered vendors across the platform." activeItem="Sellers">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '28px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3d4a42', fontSize: '18px' }}>search</span>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search sellers..."
                style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', width: '240px', outline: 'none', background: '#fff' }}
              />
            </div>
            <button
              onClick={handleSearch}
              style={{ padding: '8px 14px', border: '1px solid #006948', borderRadius: '8px', background: '#006948', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >Search</button>
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', background: '#fff', color: '#3d4a42', cursor: 'pointer' }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Seller Name', 'Contact Info', 'Store Name', 'Plan', 'Joined Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Loading...</td></tr>
              ) : sellers.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42' }}>No sellers found.</td></tr>
              ) : sellers.map(seller => {
                const st = STATUS_STYLE[seller.status] ?? STATUS_STYLE.INACTIVE;
                const initials = getInitials(seller.name, seller.email);
                const isUpdating = actionLoading === seller.id;
                return (
                  <tr key={seller.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d3e4fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', color: '#006948', border: '1px solid #e2e8f0' }}>
                          {initials}
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0b1c30' }}>{seller.name ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#6d7a72' }}>mail</span>
                        {seller.email}
                      </div>
                      {seller.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>phone</span>
                          {seller.phone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#0b1c30' }}>{seller.storeName ?? '—'}</div>
                      {seller.city && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9ca3af' }}>{seller.city}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>{seller.subscriptionPlan ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>{fmtDate(seller.createdAt)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, fontFamily: 'Inter, sans-serif', background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                        {seller.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {seller.status === 'ACTIVE' ? (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(seller.id, 'SUSPENDED')}
                            style={{ color: '#ba1a1a', border: '1px solid #ba1a1a', padding: '5px 10px', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, background: '#fff', cursor: 'pointer', opacity: isUpdating ? 0.5 : 1 }}
                          >Suspend</button>
                        ) : seller.status === 'SUSPENDED' ? (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                            style={{ color: '#0e9b6d', border: '1px solid #0e9b6d', padding: '5px 10px', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, background: '#fff', cursor: 'pointer', opacity: isUpdating ? 0.5 : 1 }}
                          >Activate</button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>
            {meta.total > 0 ? `Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total.toLocaleString()} sellers` : 'No sellers'}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
            >Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)} style={{ padding: '4px 10px', border: '1px solid', borderColor: p === page ? '#006948' : '#e2e8f0', borderRadius: '6px', background: p === page ? '#006948' : '#fff', color: p === page ? '#fff' : '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: 'pointer' }}>{p}</button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
            >Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
