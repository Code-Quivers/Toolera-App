'use client';

interface TopNavProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
}

export function TopNav({ title, subtitle, onMenuClick, sidebarCollapsed }: TopNavProps) {
  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-surface-base border-b border-border-light shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-on-surface-variant p-2 -ml-2 rounded-lg hover:bg-surface-container-low active:opacity-80"
            onClick={onMenuClick}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1
            className="text-primary"
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 700,
            }}
          >
            Toolera
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-on-surface-variant p-2 rounded-lg hover:bg-surface-container-low active:opacity-80"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center overflow-hidden">
            <span
              className="text-on-primary-container"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              A
            </span>
          </div>
        </div>
      </header>

      {/* Desktop header */}
      <header
        className="hidden md:flex items-center justify-between px-8 h-16 bg-surface-base border-b border-border-light shadow-sm flex-shrink-0 z-10"
        style={{ position: 'sticky', top: 0 }}
      >
        <div>
          {sidebarCollapsed && (
            <img
              src="/logo.png"
              alt="Toolera"
              style={{ height: '26px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-primary hover:bg-surface-container-low transition-colors rounded-full"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>
    </>
  );
}
