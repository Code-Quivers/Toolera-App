'use client';

import React from 'react';

interface PaginationProps {
  total: number;
  current: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ total, current, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (current - 1) * perPage + 1;
  const end = Math.min(current * perPage, total);

  const buttonBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    background: '#ffffff',
    color: '#3d4a42',
    lineHeight: '20px',
  };

  const activeStyle: React.CSSProperties = {
    ...buttonBase,
    background: '#00855c',
    color: '#ffffff',
    borderColor: '#00855c',
  };

  const disabledStyle: React.CSSProperties = {
    ...buttonBase,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        color: '#3d4a42',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <span>
        Showing {start} to {end} of {total} entries
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => current > 1 && onPageChange(current - 1)}
          disabled={current <= 1}
          style={current <= 1 ? disabledStyle : buttonBase}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={page === current ? activeStyle : buttonBase}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => current < totalPages && onPageChange(current + 1)}
          disabled={current >= totalPages}
          style={current >= totalPages ? disabledStyle : buttonBase}
        >
          Next
        </button>
      </div>
    </div>
  );
}
