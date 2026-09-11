'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ReplyArea } from './ReplyArea';

const API_BASE = 'http://localhost:7500/backend/api/v1';

interface TicketDetailProps {
  ticketId: string | null;
  onTicketUpdated?: () => void;
}

interface Ticket {
  ticketId: string;
  ticketNumber: string;
  sellerName: string | null;
  sellerEmail: string | null;
  sellerGoogleId: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  createdAt: string;
}

interface Reply {
  replyId: string;
  ticketId: string;
  authorId: string | null;
  authorType: string;
  message: string;
  createdAt: string;
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  URGENT: { bg: '#ffdad6', color: '#93000a' },
  HIGH:   { bg: '#ffdad6', color: '#93000a' },
  MEDIUM: { bg: '#dce9ff', color: '#0369a1' },
  LOW:    { bg: '#f0f4f0', color: '#3d4a42' },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  OPEN:        { bg: '#dce9ff', color: '#0369a1' },
  IN_PROGRESS: { bg: 'rgba(245,124,0,0.1)', color: '#f57c00' },
  RESOLVED:    { bg: 'rgba(14,155,109,0.1)', color: '#0e9b6d' },
  CLOSED:      { bg: '#f0f4f0', color: '#3d4a42' },
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function initials(name: string | null, email: string | null) {
  const src = name ?? email ?? '?';
  return src.split(/[\s@]/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function TicketDetail({ ticketId, onTicketUpdated }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ticketId) { setTicket(null); setReplies([]); return; }
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/support-tickets/${ticketId}`).then(r => r.json()),
      fetch(`${API_BASE}/support-tickets/${ticketId}/replies`).then(r => r.json()),
    ])
      .then(([t, r]) => {
        if (t.success) setTicket(t.data);
        if (r.success) setReplies(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const handleSendReply = async (message: string) => {
    if (!ticketId || !message.trim()) return;
    const res = await fetch(`${API_BASE}/support-tickets/${ticketId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim(), authorType: 'admin' }),
    });
    const data = await res.json();
    if (data.success) {
      setReplies(prev => [...prev, data.data]);
      // update local status to IN_PROGRESS if was OPEN
      setTicket(prev => prev && prev.status === 'OPEN' ? { ...prev, status: 'IN_PROGRESS' } : prev);
      onTicketUpdated?.();
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId || !ticket) return;
    setUpdating(true);
    const res = await fetch(`${API_BASE}/support-tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) { setTicket(data.data); onTicketUpdated?.(); }
    setUpdating(false);
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticketId || !ticket) return;
    setUpdating(true);
    const res = await fetch(`${API_BASE}/support-tickets/${ticketId}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPriority }),
    });
    const data = await res.json();
    if (data.success) setTicket(data.data);
    setUpdating(false);
  };

  if (!ticketId) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginLeft: '16px' }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>support_agent</span>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Select a ticket to view details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginLeft: '16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#9ca3af' }}>Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) return null;

  const pr = PRIORITY_STYLE[ticket.priority] ?? PRIORITY_STYLE.MEDIUM;
  const st = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.OPEN;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginLeft: '16px' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, background: 'rgba(0,133,92,0.12)', color: '#006948', padding: '3px 10px', borderRadius: '9999px' }}>{ticket.ticketNumber}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, background: pr.bg, color: pr.color, padding: '3px 10px', borderRadius: '9999px' }}>{ticket.priority}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, background: st.bg, color: st.color, padding: '3px 10px', borderRadius: '9999px' }}>{ticket.status.replace('_', ' ')}</span>
        </div>

        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#0b1c30', margin: '0 0 14px' }}>{ticket.subject}</h1>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Priority select */}
          <select
            value={ticket.priority}
            disabled={updating}
            onChange={e => handlePriorityChange(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', background: '#fff', color: '#3d4a42', cursor: 'pointer' }}
          >
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Status buttons */}
          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('RESOLVED')}
              style={{ padding: '6px 14px', border: '1px solid #0e9b6d', borderRadius: '8px', background: '#0e9b6d', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: updating ? 0.6 : 1 }}
            >Resolve Ticket</button>
          )}
          {ticket.status === 'RESOLVED' && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('CLOSED')}
              style={{ padding: '6px 14px', border: '1px solid #006948', borderRadius: '8px', background: '#006948', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: updating ? 0.6 : 1 }}
            >Close Ticket</button>
          )}
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('OPEN')}
              style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', color: '#3d4a42', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: updating ? 0.6 : 1 }}
            >Reopen</button>
          )}
        </div>
      </div>

      {/* Seller bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 24px', background: '#f8f9ff', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dce9ff', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700 }}>
            {initials(ticket.sellerName, ticket.sellerEmail)}
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0b1c30' }}>{ticket.sellerName ?? 'Unknown Seller'}</span>
        </div>
        {ticket.sellerEmail && (
          <>
            <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6d7a72' }}>{ticket.sellerEmail}</span>
          </>
        )}
        <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d4a42' }}>
          Opened: <span style={{ fontWeight: 600 }}>{fmtTime(ticket.createdAt)}</span>
        </span>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Original message */}
        <ChatMessage
          sender={ticket.sellerName ?? ticket.sellerEmail ?? 'Seller'}
          time={fmtTime(ticket.createdAt)}
          content={ticket.message}
          isOwn={false}
          avatar={
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dce9ff', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
              {initials(ticket.sellerName, ticket.sellerEmail)}
            </div>
          }
          attachments={[]}
        />

        {/* Replies */}
        {replies.map(reply => {
          const isAdmin = reply.authorType === 'admin';
          return (
            <ChatMessage
              key={reply.replyId}
              sender={isAdmin ? 'Support Admin' : (ticket.sellerName ?? 'Seller')}
              time={fmtTime(reply.createdAt)}
              content={reply.message}
              isOwn={isAdmin}
              avatar={
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isAdmin ? '#d9e6dd' : '#dce9ff', color: isAdmin ? '#006948' : '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                  {isAdmin ? 'AD' : initials(ticket.sellerName, ticket.sellerEmail)}
                </div>
              }
              attachments={[]}
            />
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Reply area */}
      {ticket.status !== 'CLOSED' && (
        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          <ReplyArea onSend={handleSendReply} />
        </div>
      )}
      {ticket.status === 'CLOSED' && (
        <div style={{ padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#9ca3af' }}>
          This ticket is closed. Reopen to reply.
        </div>
      )}
    </div>
  );
}
