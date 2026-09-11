'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';

const API_BASE = 'http://localhost:7500/backend/api/v1';

interface DashboardStats {
  sellers: { total: number; active: number };
  revenue: { total: number };
  subscriptions: {
    total: number;
    active: number;
    newThisWeek: number;
    expiringThisWeek: number;
    cancelledThisMonth: number;
  };
  support: { openTickets: number };
}

interface RecentSub {
  subscriptionId: string;
  sellerGoogleId: string;
  packageId: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  packageName: string | null;
  packagePrice: number | null;
  currency: string | null;
  platformName: string | null;
  sellerName: string | null;
  storeName: string | null;
  sellerEmail: string | null;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:   { bg: 'rgba(14,155,109,0.1)',  color: '#0e9b6d' },
  EXPIRED:  { bg: 'rgba(186,26,26,0.1)',   color: '#ba1a1a' },
  CANCELED: { bg: 'rgba(245,124,0,0.1)',   color: '#f57c00' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMoney(amount: number | null, currency: string | null) {
  if (amount === null) return '—';
  const sym = (currency ?? 'BDT') === 'BDT' ? '৳' : (currency ?? '');
  return `${sym}${amount.toLocaleString()}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSubs, setRecentSubs] = useState<RecentSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/dashboard/stats`).then((r) => r.json()),
      fetch(`${API_BASE}/dashboard/recent-subscriptions?limit=5`).then((r) => r.json()),
    ])
      .then(([statsRes, subsRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (subsRes.success) setRecentSubs(subsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Revenue', value: `৳${(stats.revenue.total / 100).toLocaleString()}`, icon: 'payments', iconBg: 'rgba(14,155,109,0.1)', iconColor: '#0e9b6d' },
        { label: 'Active Sellers', value: stats.sellers.active.toLocaleString(), icon: 'storefront', iconBg: 'rgba(3,105,161,0.1)', iconColor: '#0369a1' },
        { label: 'Total Sellers', value: stats.sellers.total.toLocaleString(), icon: 'local_shipping', iconBg: 'rgba(0,105,72,0.1)', iconColor: '#006948' },
        { label: 'Support Tickets', value: stats.support.openTickets.toLocaleString(), icon: 'support_agent', iconBg: 'rgba(186,26,26,0.1)', iconColor: '#ba1a1a' },
      ]
    : [
        { label: 'Total Revenue', value: '—', icon: 'payments', iconBg: 'rgba(14,155,109,0.1)', iconColor: '#0e9b6d' },
        { label: 'Active Sellers', value: '—', icon: 'storefront', iconBg: 'rgba(3,105,161,0.1)', iconColor: '#0369a1' },
        { label: 'Total Sellers', value: '—', icon: 'local_shipping', iconBg: 'rgba(0,105,72,0.1)', iconColor: '#006948' },
        { label: 'Support Tickets', value: '—', icon: 'support_agent', iconBg: 'rgba(186,26,26,0.1)', iconColor: '#ba1a1a' },
      ];

  const overviewRows = stats
    ? [
        { label: 'Total Subscriptions', value: stats.subscriptions.total.toLocaleString(), icon: 'group', color: '#006948', bg: 'rgba(0,105,72,0.08)' },
        { label: 'Active Subscriptions', value: stats.subscriptions.active.toLocaleString(), icon: 'check_circle', color: '#0369a1', bg: 'rgba(3,105,161,0.08)' },
        { label: 'New This Week', value: stats.subscriptions.newThisWeek.toLocaleString(), icon: 'trending_up', color: '#0e9b6d', bg: 'rgba(14,155,109,0.08)' },
        { label: 'Expiring This Week', value: stats.subscriptions.expiringThisWeek.toLocaleString(), icon: 'schedule', color: '#f57c00', bg: 'rgba(245,124,0,0.08)' },
        { label: 'Cancelled This Month', value: stats.subscriptions.cancelledThisMonth.toLocaleString(), icon: 'cancel', color: '#ba1a1a', bg: 'rgba(186,26,26,0.08)' },
      ]
    : [];

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back, Admin. Here's what's happening today." activeItem="Dashboard">

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconBg={s.iconBg} iconColor={s.iconColor} />
        ))}
      </div>

      {/* Recent Subscriptions + Subscription Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>

        {/* Recent Subscriptions */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#006948', fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0b1c30' }}>Recent Subscriptions</span>
            </div>
            <a href="/packages" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0e9b6d', textDecoration: 'none' }}>View all →</a>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Seller', 'Package', 'Amount', 'Date', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#3d4a42', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Loading...</td></tr>
              ) : recentSubs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>No subscriptions yet</td></tr>
              ) : recentSubs.map((sub) => {
                const sc = STATUS_STYLE[sub.status] ?? { bg: '#f0f0f0', color: '#666' };
                return (
                  <tr key={sub.subscriptionId} style={{ borderBottom: '1px solid #f0f4ff' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0b1c30' }}>{sub.storeName ?? sub.sellerName ?? sub.sellerEmail ?? sub.sellerGoogleId}</div>
                      {sub.platformName && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af' }}>{sub.platformName}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>{sub.packageName ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#0b1c30' }}>{fmtMoney(sub.packagePrice, sub.currency)}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42' }}>{fmtDate(sub.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', background: sc.bg, color: sc.color }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Subscription Overview */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#006948', fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0b1c30' }}>Subscription Overview</span>
          </div>
          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '13px', padding: '16px 0' }}>Loading...</div>
            ) : overviewRows.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f4f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: item.color, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#3d4a42' }}>{item.label}</span>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#0b1c30' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
