'use client';

const purchases = [
  {
    icon: 'upgrade',
    title: 'StyleHub Upgraded to Professional',
    time: 'Today 10:45 AM',
    amount: '+৳99',
  },
  {
    icon: 'sync',
    title: 'Gadget Bazaar Renewal',
    time: 'Yesterday 02:15 PM',
    amount: '+৳299',
  },
  {
    icon: 'add_circle',
    title: 'New Sub: Organic Foods BD',
    time: 'Oct 10 09:30 AM',
    amount: '+৳99',
  },
];

export function RecentPurchases() {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e2e8f0]">
        <span className="material-symbols-outlined text-[#0e9b6d]">
          receipt_long
        </span>
        <h2 className="text-lg font-semibold font-[Inter] text-[#1a1a2e]">
          Recent Purchases
        </h2>
      </div>

      {/* Items */}
      <div className="h-[500px] overflow-y-auto">
        <div className="divide-y divide-[#e2e8f0]">
          {purchases.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-[#eff4ff] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#0e9b6d]">
                  {item.icon}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a1a2e] font-[Inter] truncate">
                  {item.title}
                </p>
                <p className="text-xs text-[#545f73] font-[Inter]">
                  {item.time}
                </p>
              </div>

              {/* Amount */}
              <span className="text-sm font-semibold text-[#0e9b6d] font-[Inter] flex-shrink-0">
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#e2e8f0]">
        <button className="w-full py-2.5 text-sm font-medium text-[#006948] font-[Inter] hover:bg-[#f8fafc] rounded-lg transition-colors">
          View All Transactions
        </button>
      </div>
    </div>
  );
}
