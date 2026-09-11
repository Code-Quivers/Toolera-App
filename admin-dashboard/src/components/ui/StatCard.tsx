'use client';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export function StatCard({ label, value, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: '#3d4a42',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#0b1c30',
            marginTop: '4px',
          }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: iconBg,
          color: iconColor,
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
    </div>
  );
}
