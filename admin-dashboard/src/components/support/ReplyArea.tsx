'use client';

import React, { useState } from 'react';

interface ReplyAreaProps {
  onSend: (message: string) => Promise<void>;
}

export function ReplyArea({ onSend }: ReplyAreaProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await onSend(message.trim());
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{ border: '1px solid #e2e8f0', borderRadius: '12px', margin: '12px' }}
      onFocus={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#006948'; }}
      onBlur={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; }}
    >
      {/* Formatting toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '6px 12px', borderBottom: '1px solid #e2e8f0' }}>
        {['format_bold', 'format_italic', 'link'].map(icon => (
          <button key={icon} style={{ padding: '6px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#6d7a72', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
          </button>
        ))}
        <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 4px' }} />
        {['attach_file', 'image'].map(icon => (
          <button key={icon} style={{ padding: '6px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#6d7a72', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(); }}
        placeholder="Type your response... (Ctrl+Enter to send)"
        rows={3}
        style={{ width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#3d4a42', padding: '12px 16px', background: 'transparent', border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box', minHeight: '72px' }}
      />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 12px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', background: '#006948', color: '#fff', border: '1px solid #006948', cursor: !message.trim() || sending ? 'not-allowed' : 'pointer', opacity: !message.trim() || sending ? 0.6 : 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
          {sending ? 'Sending...' : 'Send Reply'}
        </button>
      </div>
    </div>
  );
}
