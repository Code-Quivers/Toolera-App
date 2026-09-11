'use client';

import React from 'react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({ placeholder = 'Search...', value, onChange }: SearchInputProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <span
        className="material-symbols-outlined"
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '20px',
          color: '#94a3b8',
          pointerEvents: 'none',
        }}
      >
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px 10px 40px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          color: '#0b1c30',
          background: '#ffffff',
          outline: 'none',
          lineHeight: '24px',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0e9b6d';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,155,109,0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
