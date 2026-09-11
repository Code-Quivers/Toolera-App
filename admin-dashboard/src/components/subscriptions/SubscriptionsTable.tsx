'use client';

import { useState } from 'react';

const subscriptions = [
  {
    name: 'TechMart BD',
    initials: 'TM',
    plan: 'Professional',
    cycle: 'Oct 1 - Nov 1, 2023',
    status: 'Paid',
    statusColor: 'bg-[#1e8e3e]',
    statusTextColor: 'text-[#1e8e3e]',
  },
  {
    name: 'Fashion Express',
    initials: 'FE',
    plan: 'Starter Plan',
    cycle: 'Sep 15 - Oct 15, 2023',
    status: 'Pending',
    statusColor: 'bg-[#f57c00]',
    statusTextColor: 'text-[#f57c00]',
  },
  {
    name: 'Gadget Bazaar',
    initials: 'GB',
    plan: 'Business Max',
    cycle: 'Oct 5 - Nov 5, 2023',
    status: 'Paid',
    statusColor: 'bg-[#1e8e3e]',
    statusTextColor: 'text-[#1e8e3e]',
  },
  {
    name: 'Local Delights',
    initials: 'LD',
    plan: 'Professional',
    cycle: 'Sep 28 - Oct 28, 2023',
    status: 'Overdue',
    statusColor: 'bg-[#d93025]',
    statusTextColor: 'text-[#d93025]',
  },
];

const filters = ['All Plans', 'Professional', 'Starter'];

export function SubscriptionsTable() {
  const [activeFilter, setActiveFilter] = useState('All Plans');

  const filtered =
    activeFilter === 'All Plans'
      ? subscriptions
      : subscriptions.filter((s) =>
          s.plan.toLowerCase().includes(activeFilter.toLowerCase())
        );

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0e9b6d]">
            group
          </span>
          <h2 className="text-lg font-semibold font-[Inter] text-[#1a1a2e]">
            Active Subscriptions
          </h2>
        </div>
        <select
          className="text-sm font-[Inter] text-[#545f73] border border-[#e2e8f0] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0e9b6d]"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          {filters.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs font-medium text-[#545f73] uppercase tracking-wider font-[Inter]">
              <th className="px-6 py-3">Seller</th>
              <th className="px-6 py-3">Plan Type</th>
              <th className="px-6 py-3">Cycle</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub, i) => (
              <tr
                key={i}
                className="border-t border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d3e4fe] flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#006948] font-[Inter]">
                        {sub.initials}
                      </span>
                    </div>
                    <span className="font-medium text-[#1a1a2e] font-[Inter] text-sm">
                      {sub.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#3d4a42] font-[Inter]">
                  {sub.plan}
                </td>
                <td className="px-6 py-4 text-sm text-[#545f73] font-[Inter]">
                  {sub.cycle}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-[Inter] ${sub.statusTextColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.statusColor}`} />
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#545f73] hover:text-[#1a1a2e] transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
