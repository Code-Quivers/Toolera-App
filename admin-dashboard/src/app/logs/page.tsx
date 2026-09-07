'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

const API = 'http://localhost:7500/backend/api/v1/logs';

interface LogRow {
  logId: string;
  product: string;
  toolName: string | null;
  action: string;
  userId: string | null;
  userEmail: string | null;
  userPlan: string | null;
  ip: string | null;
  success: boolean;
  durationMs: number | null;
  fileSizeBytes: number | null;
  createdAt: string;
}

interface Stats {
  total: number;
  successCount: number;
  failCount: number;
  freeUsers: number;
  paidUsers: number;
  todayCount: number;
  toolBreakdown: { toolName: string | null; count: number }[];
  productBreakdown: { product: string; count: number }[];
}

const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  FREE:    { bg: '#f0f4f0', color: '#3d4a42' },
  PRO:     { bg: 'rgba(3,105,161,0.1)', color: '#0369a1' },
  WEEKLY:  { bg: 'rgba(0,105,72,0.1)', color: '#006948' },
  MONTHLY: { bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
  PREMIUM: { bg: 'rgba(245,124,0,0.1)', color: '#f57c00' },
};

const PRODUCT_COLORS: Record<string, string> = {
  PDF_TOOL: '#006948',
};

function fmtBytes(b: number | null) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;

  // IP geolocation cache: ip → "City, Country"
  const [geoCache, setGeoCache] = useState<Record<string, string>>({});

  // Filters
  const [product, setProduct] = useState('');
  const [toolName, setToolName] = useState('');
  const [userPlan, setUserPlan] = useState('');
  const [success, setSuccess] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (product)  p.set('product', product);
      if (toolName) p.set('toolName', toolName);
      if (userPlan) p.set('userPlan', userPlan);
      if (success)  p.set('success', success);
      if (search)   p.set('search', search);
      if (dateFrom) p.set('dateFrom', dateFrom);
      if (dateTo)   p.set('dateTo', dateTo);

      const res = await fetch(`${API}?${p}`).then(r => r.json());
      if (res.success) {
        setLogs(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, product, toolName, userPlan, success, search, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats${product ? `?product=${product}` : ''}`).then(r => r.json());
      if (res.success) setStats(res.data);
    } catch { /* ignore */ }
  }, [product]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Batch IP geolocation via ip-api.com (free, no key needed, up to 100 IPs)
  useEffect(() => {
    const uniqueIps = [...new Set(logs.map(l => l.ip).filter((ip): ip is string => !!ip && !geoCache[ip]))];
    if (uniqueIps.length === 0) return;
    fetch('http://ip-api.com/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uniqueIps.map(q => ({ query: q, fields: 'query,city,country,status' }))),
    })
      .then(r => r.json())
      .then((results: { query: string; city?: string; country?: string; status: string }[]) => {
        const next: Record<string, string> = {};
        results.forEach(r => {
          next[r.query] = r.status === 'success' ? `${r.city ?? ''}, ${r.country ?? ''}`.replace(/^, |, $/, '') : 'Unknown';
        });
        setGeoCache(prev => ({ ...prev, ...next }));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`${API}/sync?${product ? `product=${product}` : ''}`, { method: 'POST' }).then(r => r.json());
      if (res.success) {
        const counts = Object.entries(res.data as Record<string, { synced: number; errors: string[] }>)
          .map(([k, v]) => `${k}: ${v.synced} new${v.errors.length ? ` (${v.errors.length} errors)` : ''}`)
          .join(' · ');
        setSyncResult(counts || 'No new logs');
        fetchLogs();
        fetchStats();
      }
    } catch { setSyncResult('Sync failed — check server logs'); }
    setSyncing(false);
  };

  const applyFilters = () => { setSearch(searchInput); setPage(1); };

  const resetFilters = () => {
    setProduct(''); setToolName(''); setUserPlan(''); setSuccess('');
    setSearchInput(''); setSearch(''); setDateFrom(''); setDateTo('');
    setPage(1);
  };

  return (
    <AdminLayout title="Product Logs" subtitle="Track usage across all Toolera products and tools." activeItem="Logs">

      {/* Sync Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: syncing ? '#e2e8f0' : '#006948', color: syncing ? '#6d7a72' : '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, cursor: syncing ? 'not-allowed' : 'pointer' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: syncing ? 'spin 1s linear infinite' : 'none' }}>sync</span>
          {syncing ? 'Syncing...' : 'Sync Logs Now'}
        </button>
        {syncResult && (
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0e9b6d', background: 'rgba(14,155,109,0.08)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(14,155,109,0.2)' }}>
            ✓ {syncResult}
          </span>
        )}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Events', value: stats.total, icon: 'bar_chart', bg: 'rgba(0,105,72,0.1)', color: '#006948' },
            { label: 'Today', value: stats.todayCount, icon: 'today', bg: 'rgba(3,105,161,0.1)', color: '#0369a1' },
            { label: 'Success Rate', value: stats.total > 0 ? `${Math.round(stats.successCount / stats.total * 100)}%` : '—', icon: 'check_circle', bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
            { label: 'Free Users', value: stats.freeUsers, icon: 'person', bg: '#f0f4f0', color: '#3d4a42' },
            { label: 'Paid Users', value: stats.paidUsers, icon: 'workspace_premium', bg: 'rgba(245,124,0,0.1)', color: '#f57c00' },
            { label: 'Failed', value: stats.failCount, icon: 'error', bg: 'rgba(186,26,26,0.08)', color: '#ba1a1a' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', margin: '0 0 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</p>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{s.value}</h3>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Tools */}
      {stats?.toolBreakdown && stats.toolBreakdown.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: 700, color: '#0b1c30', margin: '0 0 16px' }}>Top Tools</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {stats.toolBreakdown.map(t => {
              const max = stats.toolBreakdown[0]?.count ?? 1;
              const pct = Math.round((t.count / max) * 100);
              return (
                <div key={t.toolName} onClick={() => { setToolName(t.toolName ?? ''); setPage(1); }} style={{ flex: '1 1 140px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#3d4a42', textTransform: 'capitalize' }}>{t.toolName ?? 'unknown'}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6d7a72' }}>{t.count}</span>
                  </div>
                  <div style={{ height: 6, background: '#f0f4f0', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#006948', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '16px' }}>search</span>
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') applyFilters(); }} placeholder="Email, user ID, tool, IP..." style={{ width: '100%', paddingLeft: '30px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box', color: '#0b1c30' }} />
            </div>
          </div>
          {[
            { label: 'Product', value: product, set: setProduct, options: [{ value: '', label: 'All Products' }, { value: 'PDF_TOOL', label: 'PDF Tool' }] },
            { label: 'Plan', value: userPlan, set: setUserPlan, options: [{ value: '', label: 'All Plans' }, { value: 'FREE', label: 'Free' }, { value: 'WEEKLY', label: 'Weekly' }, { value: 'MONTHLY', label: 'Monthly' }] },
            { label: 'Status', value: success, set: setSuccess, options: [{ value: '', label: 'All Status' }, { value: 'true', label: 'Success' }, { value: 'false', label: 'Failed' }] },
          ].map(f => (
            <div key={f.label} style={{ flex: '0 1 140px' }}>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <select value={f.value} onChange={e => { f.set(e.target.value); setPage(1); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', background: '#fff', color: '#0b1c30' }}>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
          <div style={{ flex: '0 1 130px' }}>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', color: '#0b1c30', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '0 1 130px' }}>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', color: '#0b1c30', boxSizing: 'border-box' }} />
          </div>
          <button onClick={applyFilters} style={{ padding: '8px 16px', background: '#006948', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Apply</button>
          <button onClick={resetFilters} style={{ padding: '8px 14px', background: '#fff', color: '#3d4a42', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Reset</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', color: '#c4c4c4' }}>hourglass_empty</span>
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c4c4c4', display: 'block', marginBottom: '12px' }}>receipt_long</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: '#3d4a42', margin: '0 0 4px' }}>No logs found</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6d7a72', margin: '0 0 16px' }}>Click "Sync Logs Now" to pull data from products.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Product / Tool', 'User', 'Plan', 'Status', 'Duration', 'File Size', 'Location', 'Time'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const planStyle = PLAN_STYLE[log.userPlan ?? 'FREE'] ?? PLAN_STYLE.FREE;
                  const productColor = PRODUCT_COLORS[log.product] ?? '#3d4a42';
                  return (
                    <tr key={log.logId} style={{ borderBottom: '1px solid #f0f4f0' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: productColor, flexShrink: 0 }} />
                          <div>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: productColor, display: 'block' }}>{log.product.replace('_', ' ')}</span>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6d7a72', textTransform: 'capitalize' }}>{log.toolName ?? log.action}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0b1c30', display: 'block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.userEmail ?? log.userId ?? ''}>{log.userEmail ?? log.userId ?? 'Guest'}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af' }}>{log.ip ?? '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, fontFamily: 'Inter, sans-serif', background: planStyle.bg, color: planStyle.color }}>{log.userPlan ?? 'FREE'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: log.success ? '#0e9b6d' : '#ba1a1a' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{log.success ? 'check_circle' : 'cancel'}</span>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42' }}>
                        {log.durationMs != null ? `${log.durationMs}ms` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42' }}>
                        {fmtBytes(log.fileSizeBytes)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#9ca3af' }}>location_on</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', whiteSpace: 'nowrap' }}>
                            {log.ip ? (geoCache[log.ip] ?? '...') : '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', display: 'block', whiteSpace: 'nowrap' }}>{fmtDateTime(log.createdAt)}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af' }}>{timeAgo(log.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6d7a72' }}>
            {total > 0 ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}` : '0 logs'}
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, color: '#3d4a42' }}>Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)} style={{ width: 32, height: 32, borderRadius: '6px', border: pg === page ? '1px solid #0e9b6d' : '1px solid #e2e8f0', background: pg === page ? '#006948' : '#fff', color: pg === page ? '#fff' : '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{pg}</button>
                );
              })}
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, color: '#3d4a42' }}>Next</button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
