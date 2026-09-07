'use client';

import React, { useEffect, useState, useCallback } from 'react';

const API_BASE = 'http://localhost:7500/backend/api/v1';

interface TicketListProps {
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
}

interface Ticket {
  ticketId: string;
  ticketNumber: string;
  sellerName: string | null;
  sellerEmail: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  URGENT: { bg: '#ffdad6', color: '#93000a', label: 'URGENT' },
  HIGH:   { bg: '#ffdad6', color: '#93000a', label: 'HIGH' },
  MEDIUM: { bg: '#dce9ff', color: '#0369a1', label: 'MEDIUM' },
  LOW:    { bg: '#f0f4f0', color: '#3d4a42', label: 'LOW' },
};

const STATUS_TABS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string | null, email: string | null) {
  const src = name ?? email ?? '?';
  return src.split(/[\s@]/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function TicketList({ selectedTicketId, onSelectTicket }: TicketListProps) {
  const [activeTab, setActiveTab] = useState<string>('OPEN');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCount, setOpenCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ status: activeTab, limit: '50', ...(search ? { search } : {}) });
    fetch(`${API_BASE}/support-tickets?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setTickets(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    fetch(`${API_BASE}/support-tickets/stats`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setOpenCount(res.data.OPEN ?? 0);
          setInProgressCount(res.data.IN_PROGRESS ?? 0);
        }
      })
      .catch(console.error);
  }, [tickets]); // re-fetch counts when list changes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', minWidth: '320px', maxWidth: '360px', flexShrink: 0 }}>

      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: '0 0 12px' }}>Support Tickets</h2>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '16px' }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            style={{ width: '100%', paddingLeft: '30px', paddingRight: '10px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '5px 10px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: '1px solid', borderColor: activeTab === tab ? '#00855c' : '#e2e8f0', background: activeTab === tab ? '#00855c' : '#f8f9ff', color: activeTab === tab ? '#fff' : '#3d4a42' }}
            >
              {tab === 'OPEN' ? `Open (${openCount})` : tab === 'IN_PROGRESS' ? `In Progress (${inProgressCount})` : tab === 'RESOLVED' ? 'Resolved' : 'Closed'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>No tickets</div>
        ) : tickets.map(ticket => {
          const isSelected = selectedTicketId === ticket.ticketId;
          const pr = PRIORITY_STYLE[ticket.priority] ?? PRIORITY_STYLE.MEDIUM;
          return (
            <button
              key={ticket.ticketId}
              onClick={() => onSelectTicket(ticket.ticketId)}
              style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: isSelected ? '#f0fdf9' : '#fff', border: '1px solid #e2e8f0', borderLeft: `4px solid ${isSelected ? '#0e9b6d' : 'transparent'}` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#006948' }}>{ticket.ticketNumber}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af' }}>{timeAgo(ticket.createdAt)}</span>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', background: pr.bg, color: pr.color, padding: '2px 8px', borderRadius: '9999px' }}>{pr.label}</span>
              </div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0b1c30', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6d7a72', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.message}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dce9ff', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700, flexShrink: 0 }}>
                  {initials(ticket.sellerName, ticket.sellerEmail)}
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42' }}>{ticket.sellerName ?? ticket.sellerEmail ?? 'Unknown'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
