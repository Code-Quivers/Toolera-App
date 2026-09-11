'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Sellers', href: '/sellers', icon: 'storefront' },
  { label: 'Business Categories', href: '/categories', icon: 'category' },
  { label: 'Orders', href: '/orders', icon: 'local_shipping' },
  { label: 'Financials', href: '/financials', icon: 'payments', disabled: true },
  { label: 'Marketing', href: '/marketing', icon: 'campaign', disabled: true },
  { label: 'Support', href: '/support', icon: 'support_agent' },
  { label: 'Packages', href: '/packages', icon: 'inventory_2' },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'group' },
  { label: 'Logs', href: '/logs', icon: 'receipt_long' },
  { label: 'Employees', href: '/employees', icon: 'badge' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

interface SidebarProps {
  activeItem?: string;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ activeItem, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, label: string) =>
    pathname === href || activeItem === label;

  return (
    <aside
      className="hidden md:flex flex-col bg-surface-base border-r border-border-light h-full flex-shrink-0 z-50"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? '68px' : '256px',
        transition: 'width 0.22s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo + toggle */}
      <div
        className="flex items-center border-b border-border-light flex-shrink-0"
        style={{ height: '64px', padding: collapsed ? '0 10px' : '0 16px', justifyContent: collapsed ? 'center' : 'space-between' }}
      >
        {!collapsed && (
          <img
            src="/logo.png"
            alt="Toolera"
            style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
          />
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
          style={{ padding: '6px', flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {collapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2" style={{ padding: collapsed ? '8px 6px' : '8px 8px' }}>
        {navItems.map((item) => {
          const active = isActive(item.href, item.label);

          if (item.disabled) {
            return (
              <div
                key={item.label}
                title={collapsed ? item.label : 'Coming soon'}
                className="flex items-center rounded-lg my-1"
                style={{
                  gap: collapsed ? 0 : '12px',
                  padding: collapsed ? '10px 0' : '10px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#b0bec5',
                  cursor: 'not-allowed',
                  opacity: 0.55,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg my-1 transition-all duration-200 ${
                active
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
              style={{
                gap: collapsed ? 0 : '12px',
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: active ? 700 : 600,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', flexShrink: 0, fontVariationSettings: active ? "'FILL' 1" : undefined }}
              >
                {item.icon}
              </span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="border-t border-border-light flex-shrink-0" style={{ padding: collapsed ? '8px 6px' : '8px 8px' }}>
        <Link
          href="/login"
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all duration-200"
          style={{
            gap: collapsed ? 0 : '12px',
            padding: collapsed ? '10px 0' : '10px 16px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>logout</span>
          {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
