'use client';

import { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TicketList } from '@/components/support/TicketList';
import { TicketDetail } from '@/components/support/TicketDetail';

export default function SupportPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketUpdated = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <AdminLayout title="Support" subtitle="Manage support tickets and assist sellers." activeItem="Support">
      <style>{`body { overflow: hidden; }`}</style>
      <div style={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        <TicketList
          key={refreshKey}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
        />
        <TicketDetail
          ticketId={selectedTicketId}
          onTicketUpdated={handleTicketUpdated}
        />
      </div>
    </AdminLayout>
  );
}
