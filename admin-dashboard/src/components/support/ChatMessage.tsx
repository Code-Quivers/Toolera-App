'use client';

import React from 'react';

interface Attachment {
  name: string;
  size: string;
}

interface ChatMessageProps {
  sender: string;
  time: string;
  content: string;
  isOwn: boolean;
  avatar: React.ReactNode;
  attachments?: Attachment[];
}

export function ChatMessage({
  sender,
  time,
  content,
  isOwn,
  avatar,
  attachments = [],
}: ChatMessageProps) {
  return (
    <div
      className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">{avatar}</div>

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender + Time */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0b1c30',
            }}
          >
            {sender}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#6d7a72',
            }}
          >
            {time}
          </span>
        </div>

        {/* Bubble */}
        <div
          className="shadow-sm"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: isOwn ? '16px 0 16px 16px' : '0 16px 16px 16px',
            padding: '16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#3d4a42',
            lineHeight: '1.5',
          }}
        >
          {content}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '20px', color: '#6d7a72' }}
                  >
                    attach_file
                  </span>
                  <div className="flex flex-col">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#0b1c30',
                      }}
                    >
                      {att.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        color: '#6d7a72',
                      }}
                    >
                      {att.size}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
