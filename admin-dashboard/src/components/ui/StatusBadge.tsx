'use client';

import React from 'react';

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  showDot?: boolean;
}

const variantStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  success: {
    bg: 'rgba(14,155,109,0.1)',
    text: '#00855c',
    border: 'rgba(102,220,168,0.5)',
    dot: '#00855c',
  },
  warning: {
    bg: 'rgba(245,124,0,0.1)',
    text: '#f57c00',
    border: 'rgba(245,124,0,0.3)',
    dot: '#f57c00',
  },
  error: {
    bg: 'rgba(186,26,26,0.1)',
    text: '#93000a',
    border: 'rgba(186,26,26,0.3)',
    dot: '#93000a',
  },
  info: {
    bg: 'rgba(3,105,161,0.1)',
    text: '#0369a1',
    border: 'rgba(3,105,161,0.3)',
    dot: '#0369a1',
  },
  default: {
    bg: '#dce9ff',
    text: '#3d4a42',
    border: '#e2e8f0',
    dot: '#3d4a42',
  },
};

export function StatusBadge({ label, variant = 'default', showDot = false }: StatusBadgeProps) {
  const styles = variantStyles[variant] ?? variantStyles.default;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 10px',
        borderRadius: '9999px',
        background: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '20px',
        whiteSpace: 'nowrap',
      }}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: styles.dot,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
}
