'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

const API_BASE = 'http://localhost:7500/backend/api/v1/packages';

interface SubscriptionRow {
  subscription: {
    subscriptionId: string;
    sellerGoogleId: string;
    packageId: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    createdAt: string;
  };
  package: { packageId: string; name: string; price: number; badge: string | null } | null;
  platform: { platformNameId: string; platformName: string } | null;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: '#e6f4ea', color: '#1e8e3e' },
  EXPIRED: { bg: '#fff3e0', color: '#f57c00' },
  CANCELED: { bg: 'rgba(186,26,26,0.1)', color: '#ba1a1a' },
};

export default function SubscriptionsPage() {
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set('search', search);
      if (status) params.set('status', status);

      const res = await fetch(`${API_BASE}/subscriptions/list?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data);
        setTotal(json.meta.total);
        setTotalPages(json.meta.totalPages);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, limit, search, status, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const sortIcon = (col: string) => {
    if (sortBy !== col) return 'unfold_more';
    return sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <AdminLayout title="Active Subscriptions" subtitle="View and manage all seller subscription records across platforms." activeItem="Subscriptions">
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search by seller ID..."
            style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', width: '240px', color: '#0b1c30' }}
          />
          <button onClick={handleSearch} style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#3d4a42', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span> Search
          </button>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', background: '#fff', color: '#0b1c30' }}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42', fontWeight: 600 }}>Rows:</label>
          <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', background: '#fff', color: '#0b1c30' }}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6d7a72' }}>{total} total</span>
        </div>
      </div>

      {/* Table */}
      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6d7a72', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#c4c4c4', display: 'block', marginBottom: '12px' }}>hourglass_empty</span>
            Loading subscriptions...
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c4c4c4', display: 'block', marginBottom: '12px' }}>group</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: '#3d4a42', margin: '0 0 4px' }}>No subscriptions found</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6d7a72', margin: 0 }}>No seller subscriptions match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {[
                    { label: 'Seller', key: 'sellerGoogleId' },
                    { label: 'Package', key: 'package' },
                    { label: 'Platform', key: 'platform' },
                    { label: 'Price', key: 'price' },
                    { label: 'Status', key: 'status' },
                    { label: 'Start Date', key: 'startDate' },
                    { label: 'End Date', key: 'endDate' },
                    { label: 'Auto-Renew', key: 'autoRenew' },
                  ].map(h => (
                    <th
                      key={h.key}
                      onClick={() => toggleSort(h.key)}
                      style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#545f73', letterSpacing: '0.02em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {h.label}
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: sortBy === h.key ? '#006948' : '#b0bec5' }}>{sortIcon(h.key)}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const sc = STATUS_STYLE[row.subscription.status] ?? { bg: '#f0f0f0', color: '#666' };
                  const initials = row.subscription.sellerGoogleId.slice(0, 2).toUpperCase();
                  return (
                    <tr key={row.subscription.subscriptionId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d3e4fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006948', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0b1c30', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.subscription.sellerGoogleId}>{row.subscription.sellerGoogleId}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>{row.package?.name ?? '-'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: '#e5eeff', color: '#006948' }}>{row.platform?.platformName ?? 'Unknown'}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0e9b6d' }}>{'\u09F3'}{row.package?.price ?? 0}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: sc.bg, color: sc.color }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                          {row.subscription.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42' }}>{new Date(row.subscription.startDate).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42' }}>{new Date(row.subscription.endDate).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: row.subscription.autoRenew ? '#1e8e3e' : '#6d7a72', fontWeight: 600 }}>{row.subscription.autoRenew ? 'Yes' : 'No'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6d7a72', margin: 0 }}>
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, color: '#3d4a42' }}
            >
              Prev
            </button>
            {pages.map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{ width: 32, height: 32, borderRadius: '6px', border: p === page ? '1px solid #0e9b6d' : '1px solid #e2e8f0', background: p === page ? '#006948' : '#fff', color: p === page ? '#fff' : '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, color: '#3d4a42' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}