'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

const API_BASE = 'http://localhost:7500/backend/api/v1';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  paidRevenue: number;
}

interface Order {
  orderId: string;
  orderNumber: string;
  sellerGoogleId: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: string | null;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'REFUNDED';
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  notes: string | null;
  orderDate: string;
  createdAt: string;
}

interface Meta { page: number; limit: number; total: number; totalPages: number }

const ORDER_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: 'rgba(245,124,0,0.1)',  color: '#f57c00' },
  CONFIRMED: { bg: 'rgba(3,105,161,0.1)',  color: '#0369a1' },
  SHIPPED:   { bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
  DELIVERED: { bg: 'rgba(0,105,72,0.1)',   color: '#006948' },
  CANCELLED: { bg: 'rgba(186,26,26,0.1)',  color: '#ba1a1a' },
  REFUNDED:  { bg: 'rgba(61,74,66,0.1)',   color: '#3d4a42' },
};

const PAYMENT_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PAID:     { bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
  PARTIAL:  { bg: 'rgba(245,124,0,0.1)',  color: '#f57c00' },
  UNPAID:   { bg: 'rgba(186,26,26,0.1)',  color: '#ba1a1a' },
  REFUNDED: { bg: 'rgba(61,74,66,0.1)',   color: '#3d4a42' },
};

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMoney(amount: number) {
  return `৳${amount.toLocaleString()}`;
}

interface ToolOrder {
  id: string; product: string; userId: string;
  userEmail: string; userName: string | null;
  plan: string; amount: number; method: string;
  txnId: string | null; status: string;
  startsAt: string; expiresAt: string; createdAt: string;
}
interface ToolOrderStats { total: number; active: number; expired: number; totalRevenue: number; }

const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  WEEKLY:  { bg: 'rgba(0,105,72,0.1)',   color: '#006948' },
  MONTHLY: { bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
};
const TOOL_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
  EXPIRED:   { bg: 'rgba(186,26,26,0.08)', color: '#ba1a1a' },
  CANCELLED: { bg: 'rgba(61,74,66,0.1)',   color: '#3d4a42' },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'tools'>('tools');

  // Marketplace state
  const [stats, setStats]     = useState<OrderStats | null>(null);
  const [orders, setOrders]   = useState<Order[]>([]);
  const [meta, setMeta]       = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // Tool orders state
  const [toolStats, setToolStats]   = useState<ToolOrderStats | null>(null);
  const [toolOrders, setToolOrders] = useState<ToolOrder[]>([]);
  const [toolTotal, setToolTotal]   = useState(0);
  const [toolTotalPages, setToolTotalPages] = useState(1);
  const [toolPage, setToolPage]     = useState(1);
  const [toolSearch, setToolSearch] = useState('');
  const [toolSearchInput, setToolSearchInput] = useState('');
  const [toolStatus, setToolStatus] = useState('');
  const [toolLoading, setToolLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/orders/stats`)
      .then(r => r.json())
      .then(res => { if (res.success) setStats(res.data); })
      .catch(console.error);
  }, []);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: '20',
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });
    fetch(`${API_BASE}/orders?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) { setOrders(res.data); setMeta(res.meta); }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Tool orders fetch
  const fetchToolOrders = useCallback(() => {
    setToolLoading(true);
    const p = new URLSearchParams({ page: String(toolPage), limit: '50' });
    if (toolSearch) p.set('search', toolSearch);
    if (toolStatus) p.set('status', toolStatus);
    Promise.all([
      fetch(`${API_BASE}/tool-orders?${p}`).then(r => r.json()),
      fetch(`${API_BASE}/tool-orders/stats`).then(r => r.json()),
    ]).then(([ordRes, stRes]) => {
      if (ordRes.success) { setToolOrders(ordRes.data); setToolTotal(ordRes.meta?.total ?? 0); setToolTotalPages(ordRes.meta?.totalPages ?? 1); }
      if (stRes.success) setToolStats(stRes.data);
    }).catch(console.error).finally(() => setToolLoading(false));
  }, [toolPage, toolSearch, toolStatus]);

  useEffect(() => { if (activeTab === 'tools') fetchToolOrders(); }, [fetchToolOrders, activeTab]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus as Order['status'] } : o));
        if (detailOrder?.orderId === orderId) setDetailOrder(d => d ? { ...d, status: newStatus as Order['status'] } : d);
      }
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const statCards = [
    { label: 'Total Orders',    value: stats?.totalOrders.toLocaleString()    ?? '—', icon: 'receipt_long',  bg: 'rgba(3,105,161,0.1)',   color: '#0369a1' },
    { label: 'Pending',         value: stats?.pendingOrders.toLocaleString()  ?? '—', icon: 'pending',       bg: 'rgba(245,124,0,0.1)',   color: '#f57c00' },
    { label: 'Delivered',       value: stats?.deliveredOrders.toLocaleString()?? '—', icon: 'local_shipping',bg: 'rgba(0,105,72,0.1)',    color: '#006948' },
    { label: 'Total Revenue',   value: stats ? fmtMoney(stats.totalRevenue)   : '—',  icon: 'payments',      bg: 'rgba(14,155,109,0.1)',  color: '#0e9b6d' },
  ];

  const totalPages = meta.totalPages;

  return (
    <AdminLayout title="Orders" subtitle="Track and manage orders across marketplace and all Toolera products." activeItem="Orders">

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
        {([['tools', 'Tool Subscriptions', 'workspace_premium'], ['marketplace', 'Marketplace Orders', 'storefront']] as const).map(([tab, label, icon]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', border: 'none', borderBottom: activeTab === tab ? '2px solid #006948' : '2px solid transparent', background: 'none', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: activeTab === tab ? '#006948' : '#6d7a72', cursor: 'pointer', marginBottom: '-1px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ─── Tool Subscriptions Tab ─── */}
      {activeTab === 'tools' && (<>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Orders',   value: toolStats?.total ?? '—',                        icon: 'receipt_long',      bg: 'rgba(3,105,161,0.1)',   color: '#0369a1' },
            { label: 'Active',         value: toolStats?.active ?? '—',                       icon: 'check_circle',      bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
            { label: 'Expired',        value: toolStats?.expired ?? '—',                      icon: 'schedule',          bg: 'rgba(186,26,26,0.08)', color: '#ba1a1a' },
            { label: 'Total Revenue',  value: toolStats ? `৳${toolStats.totalRevenue.toLocaleString()}` : '—', icon: 'payments', bg: 'rgba(0,105,72,0.1)', color: '#006948' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#9ca3af' }}>search</span>
              <input value={toolSearchInput} onChange={e => setToolSearchInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setToolSearch(toolSearchInput); setToolPage(1); } }} placeholder="Search by email or name..." style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {(['', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as const).map(s => (
              <button key={s || 'ALL'} onClick={() => { setToolStatus(s); setToolPage(1); }} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderColor: toolStatus === s ? '#006948' : '#e2e8f0', background: toolStatus === s ? '#006948' : '#fff', color: toolStatus === s ? '#fff' : '#3d4a42' }}>{s || 'All'}</button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Product', 'User', 'Plan', 'Amount', 'Method', 'Status', 'Starts', 'Expires'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#6d7a72', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {toolLoading ? (
                  <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Loading...</td></tr>
                ) : toolOrders.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42' }}>No tool orders found.</td></tr>
                ) : toolOrders.map(o => {
                  const planStyle = PLAN_COLORS[o.plan] ?? { bg: '#f0f4f0', color: '#3d4a42' };
                  const statStyle = TOOL_STATUS_COLORS[o.status] ?? { bg: '#f0f4f0', color: '#3d4a42' };
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f0f4f0' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#006948', background: 'rgba(0,105,72,0.08)', padding: '3px 8px', borderRadius: '6px' }}>{o.product.replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0b1c30' }}>{o.userName ?? 'Unknown'}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af' }}>{o.userEmail}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, fontFamily: 'Inter, sans-serif', background: planStyle.bg, color: planStyle.color }}>{o.plan}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: 700, color: '#0b1c30', whiteSpace: 'nowrap' }}>৳{o.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', textTransform: 'capitalize' }}>{o.method}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: statStyle.bg, color: statStyle.color }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />{o.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', whiteSpace: 'nowrap' }}>{fmtDate(o.startsAt)}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: new Date(o.expiresAt) < new Date() ? '#ba1a1a' : '#3d4a42', whiteSpace: 'nowrap' }}>{fmtDate(o.expiresAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6d7a72' }}>{toolTotal > 0 ? `${toolTotal} orders` : 'No orders'}</span>
            {toolTotalPages > 1 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button disabled={toolPage <= 1} onClick={() => setToolPage(p => p - 1)} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '12px', cursor: toolPage <= 1 ? 'not-allowed' : 'pointer', opacity: toolPage <= 1 ? 0.5 : 1 }}>Prev</button>
                <button disabled={toolPage >= toolTotalPages} onClick={() => setToolPage(p => p + 1)} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '12px', cursor: toolPage >= toolTotalPages ? 'not-allowed' : 'pointer', opacity: toolPage >= toolTotalPages ? 0.5 : 1 }}>Next</button>
              </div>
            )}
          </div>
        </div>
      </>)}

      {/* ─── Marketplace Orders Tab ─── */}
      {activeTab === 'marketplace' && (<>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '26px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3d4a42', fontSize: '18px' }}>search</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); setSearch(searchInput); } }}
              placeholder="Search order # or customer..."
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['', ...ORDER_STATUSES].map(st => (
              <button
                key={st || 'ALL'}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  borderColor: statusFilter === st ? '#006948' : '#e2e8f0',
                  background:  statusFilter === st ? '#006948' : '#fff',
                  color:       statusFilter === st ? '#fff'    : '#3d4a42',
                }}
              >{st || 'All'}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Order #', 'Customer', 'Seller', 'Grand Total', 'Payment', 'Order Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Actions' ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42' }}>No orders found.</td></tr>
              ) : orders.map(order => {
                const os = ORDER_STATUS_STYLE[order.status]      ?? { bg: '#f0f0f0', color: '#666' };
                const ps = PAYMENT_STATUS_STYLE[order.paymentStatus] ?? { bg: '#f0f0f0', color: '#666' };
                return (
                  <tr key={order.orderId} style={{ borderBottom: '1px solid #f0f4ff' }}>
                    <td style={{ padding: '13px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#006948', whiteSpace: 'nowrap' }}>{order.orderNumber}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0b1c30' }}>{order.customerName ?? '—'}</div>
                      {order.customerPhone && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af' }}>{order.customerPhone}</div>}
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.sellerGoogleId}</td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#0b1c30', whiteSpace: 'nowrap' }}>{fmtMoney(order.grandTotal)}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: ps.bg, color: ps.color, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', whiteSpace: 'nowrap' }}>{fmtDate(order.orderDate)}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: os.bg, color: os.color, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => setDetailOrder(order)}
                        style={{ color: '#0e9b6d', border: '1px solid #0e9b6d', padding: '5px 10px', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, background: '#fff', cursor: 'pointer' }}
                      >View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>
            {meta.total > 0 ? `Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total.toLocaleString()} orders` : 'No orders'}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}>Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} style={{ padding: '4px 10px', border: '1px solid', borderColor: p === page ? '#006948' : '#e2e8f0', borderRadius: '6px', background: p === page ? '#006948' : '#fff', color: p === page ? '#fff' : '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: 'pointer' }}>{p}</button>;
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      </div>

      </>)}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDetailOrder(null)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{detailOrder.orderNumber}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42', margin: '4px 0 0' }}>{fmtDate(detailOrder.orderDate)}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4a42' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Customer */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Customer</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0b1c30', margin: 0 }}>{detailOrder.customerName ?? '—'}</p>
                {detailOrder.customerPhone && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42', margin: 0 }}>{detailOrder.customerPhone}</p>}
                {detailOrder.customerEmail && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42', margin: 0 }}>{detailOrder.customerEmail}</p>}
              </div>

              {/* Amounts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Subtotal',  value: fmtMoney(detailOrder.subtotal) },
                  { label: 'Discount',  value: fmtMoney(detailOrder.discountAmount) },
                  { label: 'VAT',       value: fmtMoney(detailOrder.vatAmount) },
                  { label: 'Grand Total', value: fmtMoney(detailOrder.grandTotal) },
                ].map(r => (
                  <div key={r.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px 16px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', margin: 0 }}>{r.label}</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0b1c30', margin: '4px 0 0' }}>{r.value}</p>
                  </div>
                ))}
              </div>

              {/* Payment + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', margin: '0 0 6px' }}>Payment</p>
                  {(() => { const ps = PAYMENT_STATUS_STYLE[detailOrder.paymentStatus] ?? { bg: '#f0f0f0', color: '#666' }; return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: ps.bg, color: ps.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />{detailOrder.paymentStatus}
                    </span>
                  ); })()}
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', margin: '0 0 6px' }}>Update Status</p>
                  <select
                    value={detailOrder.status}
                    disabled={updatingId === detailOrder.orderId}
                    onChange={e => handleStatusUpdate(detailOrder.orderId, e.target.value)}
                    style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', background: '#fff', color: '#0b1c30', cursor: 'pointer', width: '100%' }}
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {detailOrder.notes && (
                <div style={{ background: '#fffbf0', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#92400e', textTransform: 'uppercase', margin: '0 0 4px' }}>Notes</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#78350f', margin: 0 }}>{detailOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
