'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  activeItem?: string;
}

export function AdminLayout({ children, title, subtitle, activeItem }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 68 : 256;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar
        activeItem={activeItem}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-[70]">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: `${sidebarWidth}px`, transition: 'margin-left 0.22s ease' }}
      >
        <TopNav
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
        />
        <div
          className="flex-1 p-4 md:p-8 mx-auto w-full"
          style={{ maxWidth: '1280px' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
